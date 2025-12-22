// EdgeOne Pages Function export
export function onRequest(context) {
  return handleRequest(context);
}

async function handleRequest(context) {
  try {
    let visitCount = 0;
    
    try {
      const visitCountStr = await context.env.my_kv.get('visitCount');
      visitCount = Number(visitCountStr) || 0;
    } catch (kvError) {
      console.warn('KV access error:', kvError);
      // KV 不可用时使用默认值
    }
    
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
  } catch (error) {
    console.error('API index error:', error);
    return new Response(
      JSON.stringify({
        error: "Internal server error",
        message: error?.message || String(error)
      }),
      {
        status: 500,
        headers: {
          'Content-Type': 'application/json; charset=UTF-8',
          'Access-Control-Allow-Origin': '*'
        }
      }
    );
  }
}
