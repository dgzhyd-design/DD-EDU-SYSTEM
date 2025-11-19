# Supabase Integration Guide

## Production Checklist
1.  **RLS Policies**: Ensure every table has `ALTER TABLE ... ENABLE ROW LEVEL SECURITY` and specific policies for SELECT, INSERT, UPDATE, DELETE.
2.  **Service Keys**: Never use `SUPABASE_SERVICE_ROLE_KEY` in the React frontend. Use it only in Supabase Edge Functions.
3.  **Backups**: Enable Point-in-Time Recovery (PITR) in Supabase dashboard.
4.  **Secrets**: Store sensitive keys (e.g., AI API Keys) in Supabase Vault or Environment Variables, not in the database tables.
5.  **Audit Logs**: Consider creating a trigger to log sensitive changes to an `audit_logs` table.

## API Examples

### 1. Submit a Response (via cURL)

This example assumes you have an Edge Function or a Backend route handling the submission to keep the grading logic secure.

```bash
curl -X POST 'https://<PROJECT_REF>.supabase.co/functions/v1/submit-exam' \
  -H 'Authorization: Bearer <USER_ACCESS_TOKEN>' \
  -H 'Content-Type: application/json' \
  -d '{
    "exam_id": "ed0eebc9-9c0b-4ef8-bb6d-6bb9bd380123",
    "answers": {
        "q1_uuid": { "selected_index": 1 },
        "q2_uuid": { "selected_index": 3 }
    }
  }'
```

### 2. Upload Asset (Client-side JS)

While the logic file shows a server-side upload, clients can upload directly if RLS on `storage.objects` allows it.

```javascript
const { data, error } = await supabase
  .storage
  .from('platform-assets')
  .upload('user_uploads/avatar.png', fileObj, {
    cacheControl: '3600',
    upsert: false
  })
```

## Asset Information
The system flowchart has been logically mapped to `/mnt/data/flow chat.PNG`. In a real deployment, run the `uploadSystemFlowchart` function provided in `backend_logic.ts` to push this file to the storage bucket.
