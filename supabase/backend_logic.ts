
/**
 * Example Backend Logic using Supabase JS Client.
 * This code simulates how you would implement critical business logic in Supabase Edge Functions or a Node.js backend.
 */

import { createClient } from '@supabase/supabase-js';

declare var require: any;

// Initialize client (SERVER-SIDE ONLY - Uses Service Role Key for administrative tasks)
// WARNING: Never expose SERVICE_ROLE_KEY in the frontend.
const supabase = createClient(
  process.env.SUPABASE_URL || '',
  process.env.SUPABASE_SERVICE_ROLE_KEY || ''
);

/**
 * 1. UPLOAD FLOWCHART ASSET
 * Uploads a local file to Supabase Storage and records it in the 'assets' table.
 */
async function uploadSystemFlowchart(localPath: string, uploaderId: string) {
  const fs = require('fs'); // Node.js only
  const fileBuffer = fs.readFileSync(localPath);
  const fileName = 'system-flowchart.png';

  // 1. Upload to Storage Bucket 'platform-assets'
  const { data: storageData, error: storageError } = await supabase
    .storage
    .from('platform-assets')
    .upload(`docs/${fileName}`, fileBuffer, {
      contentType: 'image/png',
      upsert: true
    });

  if (storageError) throw storageError;

  // 2. Get Public URL
  const { data: { publicUrl } } = supabase
    .storage
    .from('platform-assets')
    .getPublicUrl(`docs/${fileName}`);

  // 3. Insert into Assets Table
  const { data: assetData, error: dbError } = await supabase
    .from('assets')
    .insert({
      key: `docs/${fileName}`,
      url: publicUrl,
      mime_type: 'image/png',
      uploaded_by: uploaderId
    })
    .select()
    .single();

  if (dbError) throw dbError;
  return assetData;
}

/**
 * 2. CREATE EXAM FROM PATTERN
 * Generates a new exam by randomly selecting questions that match the pattern criteria.
 */
async function createExamFromPattern(patternId: string, title: string, scheduledAt: Date) {
  // 1. Fetch Pattern
  const { data: pattern } = await supabase.from('exam_patterns').select('*').eq('id', patternId).single();
  
  if (!pattern) throw new Error("Pattern not found");

  // 2. Create Draft Exam
  const { data: exam, error: examError } = await supabase
    .from('exams')
    .insert({
      pattern_id: patternId,
      title: title,
      scheduled_at: scheduledAt.toISOString(),
      status: 'draft'
    })
    .select()
    .single();

  if (examError) throw examError;

  // 3. Select Questions based on sections (Simplified logic)
  const selectedQuestionIds: string[] = [];
  
  // Iterate over sections defined in pattern.sections (assuming json structure)
  // e.g. [{ count: 5, type: 'mcq' }]
  for (const section of pattern.sections) {
     // Use RPC or complex query to get random questions
     const { data: questions } = await supabase
        .from('question_bank')
        .select('id')
        .eq('type', section.type)
        .limit(section.count); // In production, use .order('random()') via RPC
     
     if (questions) {
         questions.forEach(q => selectedQuestionIds.push(q.id));
     }
  }

  // 4. Link Questions to Exam
  const examQuestions = selectedQuestionIds.map(qId => ({
      exam_id: exam.id,
      question_id: qId,
      weight: 1 // simplified
  }));

  const { error: linkError } = await supabase.from('exam_questions').insert(examQuestions);
  if (linkError) throw linkError;

  return exam;
}

/**
 * 3. SUBMIT RESPONSE & AUTO-GRADE
 * Submits a student's exam and calculates the score immediately for MCQs.
 */
async function submitExamResponse(examId: string, userId: string, answers: Record<string, any>) {
  // 1. Fetch Answer Keys for the exam
  const { data: questions } = await supabase
    .from('exam_questions')
    .select('question_id, weight, question_bank(id, answer_key)')
    .eq('exam_id', examId);

  let totalScore = 0;
  let totalPossible = 0;

  const responsesToInsert = [];

  // 2. Calculate Score
  for (const q of questions || []) {
      const qId = q.question_id;
      const studentAnswer = answers[qId]; // e.g. { selected_index: 1 }
      const correctKey = q.question_bank.answer_key; // e.g. { correct_index: 1 }
      
      let isCorrect = false;
      if (studentAnswer && correctKey && studentAnswer.selected_index === correctKey.correct_index) {
          isCorrect = true;
          totalScore += q.weight;
      }
      totalPossible += q.weight;

      responsesToInsert.push({
          exam_id: examId,
          question_id: qId,
          user_id: userId,
          answer: studentAnswer,
          submitted_at: new Date().toISOString()
      });
  }

  // 3. Save Responses
  await supabase.from('responses').insert(responsesToInsert);

  // 4. Save Grade
  const { data: grade } = await supabase
    .from('grades')
    .insert({
        exam_id: examId,
        user_id: userId,
        score: totalScore,
        total_marks: totalPossible,
        graded_by: 'system' // System auto-grading
    })
    .select()
    .single();

  return grade;
}

/**
 * 4. UPDATE ANALYTICS
 * Re-calculates item difficulty stats.
 */
async function updateAnalytics(examId: string) {
    // RPC call to a Postgres function usually best here, but simulating in JS:
    const { data: stats } = await supabase
        .from('responses')
        .select('question_id, question_bank(answer_key), answer');
    
    const itemStats: Record<string, { attempts: number, correct: number }> = {};

    stats?.forEach(r => {
        const qId = r.question_id;
        if (!itemStats[qId]) itemStats[qId] = { attempts: 0, correct: 0 };
        
        itemStats[qId].attempts++;
        // logic to check correctness again
        if (r.answer?.selected_index === r.question_bank.answer_key.correct_index) {
            itemStats[qId].correct++;
        }
    });

    // Upsert into analytics table
    for (const [qId, stat] of Object.entries(itemStats)) {
        await supabase.from('analytics_item_stats').upsert({
            question_id: qId,
            exam_id: examId,
            attempts: stat.attempts,
            correct_count: stat.correct,
            difficulty_est: stat.correct / stat.attempts // p-value
        });
    }
}

// --- Execution Example (Commented out) ---
// (async () => {
//    await uploadSystemFlowchart('/mnt/data/flow chat.PNG', 'admin-uuid');
//    const exam = await createExamFromPattern('pattern-uuid', 'Mid-Term 2024', new Date());
//    console.log('Exam created:', exam.id);
// })();