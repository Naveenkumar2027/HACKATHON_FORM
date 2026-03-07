# Export registrations (Vercel Blob) to Google Sheets

Your app URL: **https://hackathon-form-roan.vercel.app/**

## Export via API (after deploy)

1. **Deploy the export route**  
   Commit and push `api/export-registrations.ts` (and this doc), then let Vercel redeploy.

2. **Set env on Vercel**  
   In Vercel → your project → Settings → Environment Variables, ensure `BLOB_READ_WRITE_TOKEN` is set.

3. **Download CSV**  
   Open: **https://hackathon-form-roan.vercel.app/api/export-registrations**  
   You get a CSV file (or plain CSV in the browser). Select all (Ctrl+A), copy (Ctrl+C).

4. **Paste into Google Sheets**  
   Open [Google Sheets](https://sheets.google.com), click cell **A1**, paste (Ctrl+V). Columns will align.

## Export locally (if you have the blob token)

1. Add `BLOB_READ_WRITE_TOKEN` to `HACKATHON_FORM/.env` (from Vercel project env).
2. Run:
   ```bash
   cd HACKATHON_FORM
   node scripts/export-registrations-from-blob.js
   ```
3. Copy the CSV from the terminal and paste into Google Sheets at A1.

## CSV columns

Team Name, Lead Name, Lead USN, Lead Phone, Lead Email, Members, Created At  
(Members: `Name1 (USN1); Name2 (USN2)`.)
