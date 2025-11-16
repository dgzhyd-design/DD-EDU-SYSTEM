
import { GoogleGenAI, Type } from "@google/genai";
import { Difficulty, QuestionType, Question } from "../types";

// Ensure the API key is available from environment variables
if (!process.env.API_KEY) {
  throw new Error("API_KEY environment variable not set");
}

const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });

// Define the expected JSON schema for a single question
const questionSchema = {
  type: Type.OBJECT,
  properties: {
    stem: {
      type: Type.STRING,
      description: "The main body of the question. For 'Fill in the Blank', use '___' for the blank.",
    },
    options: {
      type: Type.ARRAY,
      description: "An array of 2 to 4 possible answers.",
      items: { type: Type.STRING },
    },
    correctAnswerIndex: {
      type: Type.INTEGER,
      description: "The 0-based index of the correct answer in the 'options' array.",
    },
    explanation: {
        type: Type.STRING,
        description: "A brief explanation for why the correct answer is right."
    },
    topic: {
        type: Type.STRING,
        description: "The specific topic of the generated question, derived from the input document."
    },
    marks: {
        type: Type.INTEGER,
        description: "The marks for this question, typically 1 or 2."
    },
    type: {
      type: Type.STRING,
      description: "The type of question.",
      enum: Object.values(QuestionType),
    }
  },
  required: ["stem", "options", "correctAnswerIndex", "explanation", "topic", "marks", "type"],
};

// Define the schema for a full exam paper (an array of questions)
const examPaperSchema = {
    type: Type.ARRAY,
    items: questionSchema
};

const validateQuestion = (q: any) => {
    const hasOptions = Array.isArray(q.options) && q.options.length > 0;
    if (
        !q.stem || 
        !hasOptions ||
        typeof q.correctAnswerIndex !== 'number' ||
        q.correctAnswerIndex < 0 ||
        q.correctAnswerIndex >= q.options.length ||
        !q.topic ||
        typeof q.marks !== 'number' || q.marks <= 0 ||
        !q.type || !Object.values(QuestionType).includes(q.type)
    ) {
        console.error('Invalid question object:', q);
        throw new Error("AI response did not match the required format for a question.");
    }
    if (q.type === QuestionType.MCQ && q.options.length !== 4) {
        throw new Error(`MCQ question must have 4 options, but got ${q.options.length}.`);
    }
    if (q.type === QuestionType.TF && q.options.length !== 2) {
        throw new Error(`True/False question must have 2 options, but got ${q.options.length}.`);
    }
};

const parseAndValidateExamPaperResponse = (jsonText: string): any => {
    if (!jsonText) {
        throw new Error("Received an empty response from the AI.");
    }
    const parsedResponse = JSON.parse(jsonText);

    if (!Array.isArray(parsedResponse) || parsedResponse.length === 0) {
        throw new Error("AI response was not an array of questions or was empty.");
    }
    parsedResponse.forEach(validateQuestion);
    
    return parsedResponse;
};

const parseAndValidateSingleQuestionResponse = (jsonText: string): any => {
    if (!jsonText) {
        throw new Error("Received an empty response from the AI.");
    }
    const parsedResponse = JSON.parse(jsonText);
    validateQuestion(parsedResponse);
    return parsedResponse;
};


const handleApiError = (error: unknown) => {
    console.error("Error calling Gemini API:", error);
    if (error instanceof Error && error.message.includes('SAFETY')) {
        throw new Error("Could not generate content due to safety settings. Please try a different topic or document.");
    }
    throw new Error("Failed to generate content from AI. Please try again.");
}

/**
 * Generates a single question from a topic and/or PDF.
 * @param topic The topic for the question.
 * @param file An optional PDF file payload.
 * @returns A promise that resolves to a structured question object.
 */
export async function generateQuestion(
    topic: string,
    file?: { base64: string; mimeType: string }
): Promise<Omit<Question, 'id' | 'isAiGenerated' | 'isApproved' | 'difficulty'>> {
    const prompt = `Based on the provided PDF document, if any, or your general knowledge, generate a single 'Multiple Choice' question about "${topic}".
- The question must be suitable for an A1-level exam.
- You must provide the following in the specified JSON format:
    - "stem": The question text.
    - "options": An array of exactly 4 distinct possible answers.
    - "correctAnswerIndex": The 0-based index of the correct option.
    - "explanation": A brief explanation for the correct answer.
    - "topic": The specific topic of the question, which should be "${topic}" or a more specific sub-topic.
    - "marks": Assign 1 mark for this question.
    - "type": The type of question, which must be 'Multiple Choice'.`;

    const contentParts: ({ text: string; } | { inlineData: { data: string; mimeType: string; }; })[] = [{ text: prompt }];
    if (file) {
      contentParts.push({ inlineData: { data: file.base64, mimeType: file.mimeType } });
    }
    
    const contents = { parts: contentParts };

    try {
        const response = await ai.models.generateContent({
            model: "gemini-2.5-flash",
            contents,
            config: {
                responseMimeType: "application/json",
                responseSchema: questionSchema,
                temperature: 0.5,
            },
        });

        const question = parseAndValidateSingleQuestionResponse(response.text.trim());
        return question;
    } catch (error) {
        handleApiError(error);
    }
}


/**
 * Generates a full exam paper from a PDF.
 * @param file The PDF file payload.
 * @param numberOfQuestions The desired total number of questions for the exam.
 * @param numberOfMcqs The desired number of MCQ questions.
 * @param difficulty The desired difficulty level.
 * @returns A promise that resolves to an array of structured question objects.
 */
export async function generateExamPaper(
    file: { base64: string; mimeType: string },
    numberOfQuestions: number,
    numberOfMcqs: number,
    difficulty: Difficulty
): Promise<Omit<Question, 'id' | 'isAiGenerated' | 'isApproved'>[]> {
    const otherQuestionsCount = numberOfQuestions - numberOfMcqs;
    const prompt = `Your task is to create a well-balanced A1-level exam paper based on the provided PDF document.
1. First, analyze the entire document to identify the main chapters or distinct topics.
2. Then, generate a total of ${numberOfQuestions} questions, ensuring they are randomly and evenly distributed across the chapters you identified. This is crucial for a fair exam that covers the whole syllabus.
3. The question set must contain exactly ${numberOfMcqs} 'Multiple Choice' questions.
4. The remaining ${otherQuestionsCount} questions should be a mix of 'True/False' and 'Fill in the Blank' questions.
5. The overall difficulty of the questions should be '${difficulty}'.
6. For EACH question, you must provide the following in the specified JSON format:
    - "stem": The question text. For 'Fill in the Blank', use '___' to indicate the blank.
    - "options": An array of possible answers.
        - For 'Multiple Choice', provide 4 distinct options.
        - For 'True/False', provide exactly two options: ["True", "False"].
        - For 'Fill in the Blank', provide 4 possible words or short phrases that could fit in the blank.
    - "correctAnswerIndex": The 0-based index of the correct option.
    - "explanation": A brief explanation for the correct answer.
    - "topic": The specific chapter or topic the question is from.
    - "marks": Assign appropriate marks (e.g., 1 or 2).
    - "type": The type of question, which must be one of: 'Multiple Choice', 'True/False', or 'Fill in the Blank'.
- Ensure the topics are diverse and cover the content of the document.`;

    const contents = { parts: [{ text: prompt }, { inlineData: { data: file.base64, mimeType: file.mimeType } }] };
    
    try {
        const response = await ai.models.generateContent({
            model: "gemini-2.5-flash",
            contents,
            config: {
                responseMimeType: "application/json",
                responseSchema: examPaperSchema,
                temperature: 0.7,
            },
        });

        const questions = parseAndValidateExamPaperResponse(response.text.trim());

        // Add difficulty to each question and return
        return questions.map((q: any) => ({ ...q, difficulty }));
        
    } catch (error) {
        handleApiError(error);
    }
}

/**
 * Generates a worksheet from a PDF.
 * @param file The PDF file payload.
 * @param numberOfQuestions The desired total number of questions for the worksheet.
 * @returns A promise that resolves to an array of structured question objects.
 */
export async function generateWorksheet(
    file: { base64: string; mimeType: string },
    numberOfQuestions: number,
): Promise<Omit<Question, 'id' | 'isAiGenerated' | 'isApproved' | 'difficulty'>[]> {
    const prompt = `Your task is to create an A1-level student worksheet from the provided PDF document.
1. Generate a total of ${numberOfQuestions} questions.
2. The questions should test comprehension and knowledge of the key concepts in the document.
3. Create a mix of 'Multiple Choice', 'True/False', and 'Fill in the Blank' questions.
4. Ensure the questions cover various topics from the document.
5. For EACH question, you must provide the following in the specified JSON format:
    - "stem": The question text. For 'Fill in the Blank', use '___' to indicate the blank.
    - "options": An array of possible answers.
        - For 'Multiple Choice', provide 4 distinct options.
        - For 'True/False', provide exactly two options: ["True", "False"].
        - For 'Fill in the Blank', provide 4 possible words or short phrases that could fit in the blank.
    - "correctAnswerIndex": The 0-based index of the correct option.
    - "explanation": A brief explanation for the correct answer.
    - "topic": The specific chapter or topic the question is from.
    - "marks": Assign 1 mark for each question.
    - "type": The type of question, which must be one of: 'Multiple Choice', 'True/False', or 'Fill in the Blank'.`;

    const contents = { parts: [{ text: prompt }, { inlineData: { data: file.base64, mimeType: file.mimeType } }] };
    
    try {
        const response = await ai.models.generateContent({
            model: "gemini-2.5-flash",
            contents,
            config: {
                responseMimeType: "application/json",
                responseSchema: examPaperSchema,
                temperature: 0.6,
            },
        });

        const questions = parseAndValidateExamPaperResponse(response.text.trim());

        // Add default difficulty and return
        return questions.map((q: any) => ({ ...q, difficulty: Difficulty.MEDIUM }));
        
    } catch (error) {
        handleApiError(error);
    }
}
