export async function POST(request) {
  try {
    const metric = await request.json();
    // In production, forward to your analytics service
    console.log('[Web Vitals]', metric.name, metric.value);
    return Response.json({ ok: true });
  } catch {
    return Response.json({ ok: false }, { status: 400 });
  }
}
