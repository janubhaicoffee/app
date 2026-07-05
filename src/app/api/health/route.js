export async function GET() {
  const health = {
    status: 'ok',
    timestamp: new Date().toISOString(),
    uptime: process.uptime(),
    memory: process.memoryUsage(),
    node: process.version,
  };

  return Response.json(health, {
    status: 200,
    headers: {
      'Cache-Control': 'no-store',
    },
  });
}
