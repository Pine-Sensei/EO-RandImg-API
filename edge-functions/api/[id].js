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
async function incrementCount(env) {
  try {
    const visitCount = await env.my_kv.get('visitCount');
    let visitCountInt = Number(visitCount) || 0;
    visitCountInt += 1;
    await env.my_kv.put('visitCount', visitCountInt.toString());
    return visitCountInt;
  } catch (error) {
    console.warn('Failed to increment visit count:', error);
    return 0; // 失败时返回默认值
  }
}

// 处理请求
async function handleRequest(context) {
  const userAgent = context.request.headers.get('User-Agent') || ''; 

  try {
    const url = new URL(context.request.url);
    const imgType = url.searchParams.get('img');
    const categoryId = context.params.id;

    // 验证分类ID
    if (!categoryId || typeof categoryId !== 'string') {
      return new Response(
        JSON.stringify({ error: "Invalid category ID" }),
        {
          status: 400,
          headers: {
            'Content-Type': 'application/json; charset=UTF-8',
            'Access-Control-Allow-Origin': '*'
          }
        }
      );
    }

    // 获取图片元数据
    let data;
    try {
      const res = await fetch(
        new URL('/posts-meta.json', url.origin)
      );
      if (!res.ok) {
        throw new Error(`Failed to fetch posts-meta.json: ${res.status}`);
      }
      data = await res.json();
    } catch (fetchError) {
      console.error('Failed to load metadata:', fetchError);
      return new Response(
        JSON.stringify({ 
          error: "Configuration not available",
          message: "Unable to load image metadata"
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

    const maxHorizontalImageNumber = data.folders[`${categoryId}/h`] ?? 0;
    const maxVerticalImageNumber = data.folders[`${categoryId}/v`] ?? 0;

    // 验证图片数量
    if (maxHorizontalImageNumber === 0 && maxVerticalImageNumber === 0) {
      return new Response(
        JSON.stringify({ 
          error: "Category not found",
          message: `No images found for category: ${categoryId}`
        }),
        {
          status: 404,
          headers: {
            'Content-Type': 'application/json; charset=UTF-8',
            'Access-Control-Allow-Origin': '*'
          }
        }
      );
    }

    switch (imgType) {
      case 'h':
        if (maxHorizontalImageNumber === 0) {
          return new Response(
            JSON.stringify({ 
              error: "No horizontal images available",
              message: `Category ${categoryId} has no horizontal images`
            }),
            {
              status: 404,
              headers: {
                'Content-Type': 'application/json; charset=UTF-8',
                'Access-Control-Allow-Origin': '*'
              }
            }
          );
        }
        await incrementCount(context.env);
        return redirect(`/pictures/${categoryId}/h/${generateRandomNumber(maxHorizontalImageNumber)}.webp`);

      case 'v':
        if (maxVerticalImageNumber === 0) {
          return new Response(
            JSON.stringify({ 
              error: "No vertical images available", 
              message: `Category ${categoryId} has no vertical images`
            }),
            {
              status: 404,
              headers: {
                'Content-Type': 'application/json; charset=UTF-8',
                'Access-Control-Allow-Origin': '*'
              }
            }
          );
        }
        await incrementCount(context.env);
        return redirect(`/pictures/${categoryId}/v/${generateRandomNumber(maxVerticalImageNumber)}.webp`);

      case 'auto':
        const isMobile = isMobileDevice(userAgent);
        const targetCount = isMobile ? maxVerticalImageNumber : maxHorizontalImageNumber;
        const targetType = isMobile ? 'v' : 'h';
        
        if (targetCount === 0) {
          // 如果首选方向没有图片，尝试另一个方向
          const fallbackCount = isMobile ? maxHorizontalImageNumber : maxVerticalImageNumber;
          const fallbackType = isMobile ? 'h' : 'v';
          
          if (fallbackCount === 0) {
            return new Response(
              JSON.stringify({ 
                error: "No images available",
                message: `Category ${categoryId} has no images`
              }),
              {
                status: 404,
                headers: {
                  'Content-Type': 'application/json; charset=UTF-8',
                  'Access-Control-Allow-Origin': '*'
                }
              }
            );
          }
          
          const fallbackImage = generateRandomNumber(fallbackCount);
          await incrementCount(context.env);
          return redirect(`/pictures/${categoryId}/${fallbackType}/${fallbackImage}.webp`);
        }
        
        const randomImage = generateRandomNumber(targetCount);
        await incrementCount(context.env);
        const imageUrl = `/pictures/${categoryId}/${targetType}/${randomImage}.webp`;
        return redirect(imageUrl);

      default:
        const backurl = url.origin + '/api';
        return redirect(backurl);

    }

  } catch (error) {
    console.error('API [id] error:', error);

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
