// EdgeOne Pages Function export 
export function onRequest(context) {
  return handleRequest(context);
}

// 检测是否为移动设备
function isMobileDevice(userAgent) {
  if (!userAgent) return false;

  const mobileRegex = /android|webos|iphone|ipad|ipod|blackberry|iemobile|opera mini/i;
  return mobileRegex.test(userAgent);
}

// 图片重定向
function redirect(Url) {
  return new Response(null, {
    status: 302,
    headers: {
      'Location': Url,
      'Cache-Control': 'public, max-age=0', 
      'Access-Control-Allow-Origin': '*'
    }
  });
}

function generateRandomNumber(max) {
  return Math.floor(Math.random() * max) + 1;
}

// 增加访问计数
async function incrementCount() {
  const visitCount = await my_kv.get('visitCount');
  let visitCountInt = Number(visitCount);
  visitCountInt += 1;
  await my_kv.put('visitCount', visitCountInt.toString());
  return visitCountInt;
}

// 处理请求
async function handleRequest(context) {
  const userAgent = context.request.headers.get('User-Agent') || ''; 

  try {
    const url = new URL(context.request.url);
    const imgType = url.searchParams.get('img');
    const res = await fetch(
      new URL('/posts-meta.json', url.origin)
    );
    const data = await res.json();

    const maxHorizontalImageNumber = data.folders[`${context.params.id}/h`] ?? 0;
    const maxVerticalImageNumber = data.folders[`${context.params.id}/v`] ?? 0;

    switch (imgType) {
      case 'h':
        await incrementCount();
        return redirect(`/pictures/${context.params.id}/h/${generateRandomNumber(maxHorizontalImageNumber)}.webp`);

      case 'v':
        await incrementCount();
        return redirect(`/pictures/${context.params.id}/v/${generateRandomNumber(maxVerticalImageNumber)}.webp`);

      case 'auto':
        await incrementCount();
        const isMobile = isMobileDevice(userAgent);
        const randomImage = isMobile 
          ? generateRandomNumber(maxVerticalImageNumber)
          : generateRandomNumber(maxHorizontalImageNumber);
        const imageUrl = isMobile ? `/pictures/${context.params.id}/v/${randomImage}.webp` : `/pictures/${context.params.id}/h/${randomImage}.webp`;
        return redirect(imageUrl);

      default:
        const backurl = url.origin + '/api';
        return redirect(backurl);

    }

  } catch (error) {
    console.error(error);

    return new Response(
      JSON.stringify({
        error: "Internal error occurred while handling the request.",
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