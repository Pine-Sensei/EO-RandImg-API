// EdgeOne Pages Function export
export function onRequest(context) {
  return handleRequest(context);
}

async function handleRequest(context) {
  const url = new URL(context.request.url);
  const raw = await my_kv.get('visitCount');
  const visitCount = Number.isFinite(Number(raw)) ? Number(raw) : 0;
  const res = JSON.stringify({
    visitCount: visitCount,
  });

  return new Response(res, {
    status: 200,
    headers: {
      'Content-Type': 'application/json; charset=UTF-8',
      'Access-Control-Allow-Origin': '*',
    },
  });
}
