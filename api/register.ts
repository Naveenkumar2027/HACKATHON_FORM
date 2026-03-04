import { put } from '@vercel/blob';

const jsonHeaders = {
  'Content-Type': 'application/json',
  'Access-Control-Allow-Origin': '*',
};

type RegistrationDoc = {
  teamName: string;
  leadName: string;
  leadUSN: string;
  leadPhone: string;
  members: Array<{ name: string; usn: string }>;
  createdAt: string;
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
      createdAt: new Date().toISOString(),
    };

    const safeName = (doc.teamName || 'team').replace(/[^a-zA-Z0-9-_]/g, '_').slice(0, 30);
    const blobPath = `wiredweekend-form/registrations/${Date.now()}-${safeName}.json`;

    if (!process.env.BLOB_READ_WRITE_TOKEN) {
      return new Response(
        JSON.stringify({
          error:
            'Blob not configured. Link the wiredweekend-form-blob store in Vercel (Storage) and set BLOB_READ_WRITE_TOKEN, then redeploy.',
        }),
        { status: 503, headers: jsonHeaders }
      );
    }

    const blob = await put(blobPath, JSON.stringify(doc, null, 2), {
      access: 'public',
      addRandomSuffix: true,
    });

    return new Response(
      JSON.stringify({
        ok: true,
        id: blob.url?.split('/').pop() || blobPath,
        message: 'Registration saved',
      }),
      { status: 201, headers: jsonHeaders }
    );
  } catch (err) {
    console.error('Register API error:', err);
    const message = err instanceof Error ? err.message : 'Server error';
    return new Response(JSON.stringify({ error: message }), {
      status: 500,
      headers: jsonHeaders,
    });
  }
}
