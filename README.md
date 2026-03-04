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

## MongoDB (for registration data)

Registration submissions are stored in MongoDB. To fix `querySrv ENOTFOUND _mongodb._tcp.cluster.mongodb.net`:

1. Go to [MongoDB Atlas](https://cloud.mongodb.com) and sign in (or create an account).
2. Create a project and a **free M0 cluster** if you don’t have one.
3. Create a **database user** (Database Access → Add New) and note the username and password.
4. In **Network Access**, add your IP (or `0.0.0.0/0` to allow from anywhere).
5. In the Atlas UI, open your **cluster** → **Connect** → **Drivers** → copy the connection string.
6. The URI should look like: `mongodb+srv://USER:PASSWORD@cluster0.xxxxx.mongodb.net/` (the host must be your real cluster, e.g. `cluster0.abc12.mongodb.net`, not `cluster.mongodb.net`).
7. Copy `.env.example` to `.env` and set `MONGODB_URI` to that string (with your real user and password). For **Vercel**, set `MONGODB_URI` in Project → Settings → Environment Variables.
