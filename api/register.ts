import { put } from '@vercel/blob';
import { getDb, type RegistrationDoc } from './_db';

const jsonHeaders = {
  'Content-Type': 'application/json',
  'Access-Control-Allow-Origin': '*',
};

export async function POST(request: Request): Promise<Response> {
  if (request.method !== 'POST') {
    return new Response(JSON.stringify({ error: 'Method not allowed' }), {
      status: 405,
      headers: jsonHeaders,
    });
  }

  try {
    let body: Record<string, unknown>;
    try {
      body = (await request.json()) as Record<string, unknown>;
    } catch {
      return new Response(JSON.stringify({ error: 'Invalid JSON body' }), {
        status: 400,
        headers: jsonHeaders,
      });
    }
    const { teamName, leadName, leadUSN, leadPhone, members } = body;

    if (
      !String(teamName ?? '').trim() ||
      !String(leadName ?? '').trim() ||
      !String(leadUSN ?? '').trim() ||
      !String(leadPhone ?? '').trim()
    ) {
      return new Response(
        JSON.stringify({ error: 'Missing required fields: teamName, leadName, leadUSN, leadPhone' }),
        { status: 400, headers: jsonHeaders }
      );
    }

    const doc: RegistrationDoc = {
      teamName: String(teamName).trim(),
      leadName: String(leadName).trim(),
      leadUSN: String(leadUSN).trim(),
      leadPhone: String(leadPhone).trim(),
      members: Array.isArray(members)
        ? members
            .filter((m: { name?: string; usn?: string }) => m && (m.name?.trim() || m.usn?.trim()))
            .map((m: { name?: string; usn?: string }) => ({
              name: String(m?.name ?? '').trim(),
              usn: String(m?.usn ?? '').trim(),
            }))
        : [],
      createdAt: new Date(),
    };

    const safeName = (doc.teamName || 'team').replace(/[^a-zA-Z0-9-_]/g, '_').slice(0, 30);
    const blobPath = `registrations/${Date.now()}-${safeName}.json`;

    // 1) Try MongoDB if MONGODB_URI is set
    const hasMongo = (process.env.MONGODB_URI || '').trim().length > 0;
    if (hasMongo) {
      try {
        const db = await getDb();
        const collection = db.collection<RegistrationDoc>('registrations');
        const result = await collection.insertOne(doc);
        return new Response(
          JSON.stringify({
            ok: true,
            id: result.insertedId.toString(),
            message: 'Registration saved',
          }),
          { status: 201, headers: jsonHeaders }
        );
      } catch (mongoErr) {
        console.error('MongoDB register error:', mongoErr);
        // Fall through to Blob if available
      }
    }

    // 2) Fallback: Vercel Blob (no MongoDB or MongoDB failed)
    if (process.env.BLOB_READ_WRITE_TOKEN) {
      try {
        const blob = await put(blobPath, JSON.stringify(doc, null, 2), {
          access: 'public',
          addRandomSuffix: true,
        });
        return new Response(
          JSON.stringify({
            ok: true,
            id: blob.url?.split('/').pop() || blobPath,
            message: 'Registration saved (Blob)',
          }),
          { status: 201, headers: jsonHeaders }
        );
      } catch (blobErr) {
        console.error('Blob register error:', blobErr);
      }
    }

    // 3) Neither worked
    const hint = hasMongo
      ? 'MongoDB failed. Add Vercel Blob (Dashboard → Storage → Create Blob) and set BLOB_READ_WRITE_TOKEN, or fix MongoDB (Atlas → Network Access → allow 0.0.0.0/0).'
      : 'Set MONGODB_URI in Vercel env, or add Vercel Blob (Dashboard → Storage → Create Blob) for BLOB_READ_WRITE_TOKEN.';
    return new Response(JSON.stringify({ error: `Server not configured. ${hint}` }), {
      status: 503,
      headers: jsonHeaders,
    });
  } catch (err) {
    console.error('Register API error:', err);
    const message = err instanceof Error ? err.message : 'Server error';
    return new Response(JSON.stringify({ error: message }), {
      status: 500,
      headers: jsonHeaders,
    });
  }
}
