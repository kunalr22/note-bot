# NoteBot

Upload a lecture recording and get back structured notes, flashcards, and a full transcript — powered by an AI pipeline.

No accounts. No friction. Share results with just a link.

---

## How it works

1. Drop an audio or video file onto the upload page
2. The file goes directly to Cloudflare R2 via a presigned URL
3. A FastAPI worker polls for new uploads, runs ffmpeg + Whisper + an LLM, and writes the results back to the database
4. The notes page is shareable — anyone with the link can view the output

## Stack

| Layer | Tech |
|---|---|
| Frontend | Next.js 16, Tailwind CSS, shadcn/ui |
| Storage | Cloudflare R2 |
| Database | Supabase (Postgres) |
| AI worker | FastAPI (Python) — separate repo |

## Supported file types

`mp3` `mp4` `m4a` `wav` `webm`

## Output

Each upload produces three views:

- **Notes** — markdown with LaTeX for equations, rendered in the browser
- **Flashcards** — click to reveal Q&A pairs
- **Transcript** — raw transcript from the audio

## Running locally

### Prerequisites

- Node.js 18+
- A Supabase project with an `uploads` table
- A Cloudflare R2 bucket with CORS configured for `http://localhost:3000`

### Setup

```bash
npm install
```

Create a `.env.local` file:

```env
NEXT_PUBLIC_SUPABASE_URL=your_supabase_url
SUPABASE_SERVICE_ROLE_KEY=your_service_role_key

R2_ACCESS_KEY_ID=your_r2_access_key
R2_SECRET_ACCESS_KEY=your_r2_secret_key
R2_BUCKET_NAME=your_bucket_name
R2_PUBLIC_URL=https://<account_id>.r2.cloudflarestorage.com
```

```bash
npm run dev
```

### Supabase table

```sql
create table uploads (
  id uuid primary key default gen_random_uuid(),
  filename text,
  mime_type text,
  file_path text,
  status text default 'uploading',
  notes text,
  flashcards jsonb,
  transcript text,
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);
```

### R2 CORS policy

```json
[
  {
    "AllowedOrigins": ["http://localhost:3000"],
    "AllowedMethods": ["PUT"],
    "AllowedHeaders": ["Content-Type"],
    "MaxAgeSeconds": 3600
  }
]
```

## Upload status lifecycle

```
uploading → pending → processing → complete
```

- `uploading` — file is being transferred to R2
- `pending` — upload finished, waiting for the AI worker to pick it up
- `processing` — worker is actively generating notes
- `complete` — notes, flashcards, and transcript are ready
