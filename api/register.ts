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
  } catch (err) {
    console.error('Register API error:', err);
    const message = err instanceof Error ? err.message : 'Database error';
    const isConfigError =
      typeof message === 'string' &&
      (message.includes('MONGODB_URI') || message.includes('placeholder') || message.includes('Atlas'));
    return new Response(JSON.stringify({ error: message }), {
      status: isConfigError ? 503 : 500,
      headers: jsonHeaders,
    });
  }
}
