<div align="center">
<img width="1200" height="475" alt="GHBanner" src="https://github.com/user-attachments/assets/0aa67016-6eaf-458a-adb2-6e31a0763ed6" />
</div>

# Run and deploy your AI Studio app

This contains everything you need to run your app locally.

View your app in AI Studio: https://ai.studio/apps/73019277-a71e-4806-a0aa-aee267136419

## Run Locally

**Prerequisites:**  Node.js


1. Install dependencies:
   `npm install`
2. Set the `GEMINI_API_KEY` in [.env.local](.env.local) to your Gemini API key
3. Run the app:
   `npm run dev`

## Registration storage (MongoDB or Vercel Blob)

Submissions use MongoDB if configured, or **Vercel Blob** as fallback. To fix `querySrv ENOTFOUND _mongodb._tcp.cluster.mongodb.net`:

1. Go to [MongoDB Atlas](https://cloud.mongodb.com) and sign in (or create an account).
2. Create a project and a **free M0 cluster** if you don’t have one.
3. Create a **database user** (Database Access → Add New) and note the username and password.
4. In **Network Access**, add `0.0.0.0/0`. Set `MONGODB_URI` and `MONGODB_DB_NAME` in Vercel env. Redeploy.

**Option A – Vercel Blob (no MongoDB):** Vercel Dashboard → Storage → Create Blob store. Redeploy. Registrations save to Blob.
