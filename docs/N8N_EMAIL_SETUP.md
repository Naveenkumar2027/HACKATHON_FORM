# n8n – Send email after registration

After a team registers successfully, the API calls an n8n webhook. Use that webhook to send a confirmation email to the team lead.

## Option A: Import the ready-made workflow

1. In n8n, open the **⋯** menu (top right of the editor) → **Import from File...**.
2. Select `HACKATHON_FORM/docs/registration-email-workflow.json` from this repo.
3. In the **Send Email** node, use a **Gmail** credential only (do not use SMTP). Choose or create a Gmail account and set **From** to that address.
4. Open the **Webhook** node and copy the **Production Webhook URL** (e.g. `http://localhost:5678/webhook/...`).
5. In Vercel, set `N8N_WEBHOOK_URL` to that URL (use your public n8n URL if not local), then **Save** and **Activate** the workflow.

## Option B: Use the workflow you already started

You already have a new workflow with a **Webhook** node. Finish it like this:

1. **Webhook node**
   - Set **HTTP Method** to **POST** (or add option **Allow Multiple HTTP Methods** so both GET and POST work).
   - Copy the **Production Webhook URL** (switch to “Production URL” in the node) and use it as `N8N_WEBHOOK_URL` in Vercel.
2. **Add Email node**
   - Click the **+** on the right of the Webhook node (or press **Tab** and search “Email”).
   - Add **Send Email**. Connect it after the Webhook. Set **Credential** to **Gmail** (not SMTP). To add Gmail: **Credentials** → **Create** → **Gmail OAuth2**, then select it in the Send Email node.
   - **To:** `{{ $json.registration.leadEmail }}`
   - **Subject:** `Wired Weekend – Registration confirmed for {{ $json.registration.teamName }}`
   - **Message:** use `{{ $json.registration.leadName }}`, `{{ $json.registration.teamName }}` as needed.
3. Create an email credential in n8n if you don’t have one (Credentials → Create → **Gmail OAuth2** only (do not use SMTP)).
4. **Save** and **Activate** the workflow. (Use a **Gmail** credential in the Send Email node, not SMTP.)

## 1. Environment variable

- **Backend (Vercel):** In your project → **Settings → Environment Variables**, add:
  - **Name:** `N8N_WEBHOOK_URL`
  - **Value:** Your n8n Webhook URL (e.g. `http://localhost:5678/webhook/cdb6a9c7-6046-4c96-a35f-2b8fa4e71beb` for local, or `https://your-n8n.com/webhook/...` for hosted n8n)
- Apply to **Production** (and **Preview** if you use it), then **Redeploy**.

If `N8N_WEBHOOK_URL` is empty, registration still works; the webhook is simply not called.

## 2. Webhook payload

The API sends a `POST` request with JSON body:

```json
{
  "event": "registration.completed",
  "registration": {
    "teamName": "...",
    "leadName": "...",
    "leadUSN": "...",
    "leadPhone": "...",
    "leadEmail": "team.lead@example.com",
    "members": [
      { "name": "...", "usn": "..." }
    ],
    "createdAt": "2025-03-05T..."
  },
  "blobId": "..."
}
```

- **Recipient:** `registration.leadEmail`
- **Subject/body:** Use `registration.teamName`, `registration.leadName`, etc. as needed.

## 3. n8n workflow

1. **Webhook** node  
   - Method: POST  
   - Path: e.g. `/registration-confirmation`  
   - Copy the **Production Webhook URL** and set it as `N8N_WEBHOOK_URL` in Vercel.

2. **Email** node — use **Gmail only** (not SMTP): select a Gmail OAuth2 credential in the node.  
   - **To:** `{{ $json.registration.leadEmail }}`  
   - **Subject:** e.g. `Wired Weekend – Registration confirmed for {{ $json.registration.teamName }}`  
   - **Body:** Use `{{ $json.registration.teamName }}`, `{{ $json.registration.leadName }}`, etc.

3. Save and activate the workflow.

## 4. Flow summary

```
User submits form (with email) → POST /api/register
  → Validate & save to Vercel Blob
  → POST to N8N_WEBHOOK_URL with registration payload (fire-and-forget)
  → Return 201 to frontend
n8n receives webhook → sends email to registration.leadEmail
```

No response from n8n is required; the API does not wait for the webhook to finish.

## Test the webhook (send a test email)

1. In n8n, open your workflow and **click the Webhook node** (first node).
2. In the right panel, switch to **Production URL** and **copy the full URL** (e.g. `http://localhost:5678/webhook/xxxxxxxx-xxxx-xxxx-xxxx-xxxxxxxxxxxx`).
3. From the project root run:
   ```bash
   node HACKATHON_FORM/scripts/test-n8n-webhook.js "PASTE_YOUR_WEBHOOK_URL_HERE"
   ```
4. Check **m.naveenkumar6360@gmail.com** (or the email you put in the script) for the confirmation email.

**If you get 404:** The workflow must be **Active**. In n8n, open the workflow and turn **ON** the toggle in the top-right (it should say “Active” / “Deactivate”). Production webhooks only work when the workflow is active.

**If you get "This webhook is not registered for POST requests":** The Webhook node is set to **GET** only. Fix it:
1. In n8n, click the **Webhook** node and open its settings (right panel).
2. Find **HTTP Method** and change it from **GET** to **POST** (click the field, choose POST from the list).
3. **Save** the workflow (Ctrl+S or the Save button). The production URL will then accept POST.
4. Run the test script again.

**Google OAuth "redirect_uri_mismatch":** When connecting the Gmail OAuth2 credential, n8n shows an **OAuth Redirect URL** in the credential dialog (e.g. `http://localhost:5678/rest/oauth2-credential/callback`). In [Google Cloud Console](https://console.cloud.google.com/) → **APIs & Services** → **Credentials** → your **OAuth 2.0 Client ID** → **Authorized redirect URIs**, add that exact URL and save. Then try **Connect** / **Sign in with Google** again in n8n.

**Use Gmail only (not SMTP):** The Send Email node must use a **Gmail** credential. In the browser:
1. Open your workflow in n8n → **click the second node** (“Send Email”) on the canvas so the right panel shows its settings.
2. In the right panel, find **Credential**. If it shows an SMTP account, open the dropdown → **Create New** → **Gmail OAuth2** → sign in with the Gmail you want to send from (e.g. `roboticsclub.ds@gmail.com`) → then select that Gmail credential in the dropdown.
3. Set **To** = `{{ $json.registration.leadEmail }}`, **Subject** = `Wired Weekend – Registration confirmed for {{ $json.registration.teamName }}`, and use `{{ $json.registration.leadName }}` / `{{ $json.registration.teamName }}` in the message. **Save** the workflow (Ctrl+S).

**Webhook returns 200 but no email / Executions show "Error":** The workflow runs but the **Send Email** node is failing. In n8n: open the workflow → **Executions** tab → click the failed run (e.g. "Error in 1.3s") → note which node is red and the error message. Common fixes:
1. **Credential:** Send Email must have a valid **Gmail OAuth2** (or SMTP) credential selected. Create one under **Credentials** if needed.
2. **To / Subject / Message:** Use the exact expressions from the webhook body: **To** = `{{ $json.registration.leadEmail }}`, **Subject** = `Wired Weekend – Registration confirmed for {{ $json.registration.teamName }}`, and in the message use `{{ $json.registration.leadName }}`, `{{ $json.registration.teamName }}`. If your Webhook node wraps the body (e.g. in `body`), use `$json.body.registration.leadEmail` instead of `$json.registration.leadEmail`.
3. **Save** the workflow and run the test script again.
