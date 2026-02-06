'use server';

const originalFetch = global.fetch;

global.fetch = async (input, init) => {
    // @ts-ignore
  const url = typeof input === 'string' ? input : input.url;

  // Skip internal Next.js calls if you want
  if (url.includes('localhost') || url.includes('/_next')) {
    return originalFetch(input, init);
  }

  const start = performance.now();

  try {
    const response = await originalFetch(input, init);

    console.log('🌍 SERVER ACTION → 3RD PARTY', {
      url,
      method: init?.method ?? 'GET',
      status: response.status,
      cache: init?.cache,
      revalidate: init?.next?.revalidate,
      duration: `${Math.round(performance.now() - start)}ms`,
    });

    return response;
  } catch (err) {
    console.error('❌ SERVER ACTION API ERROR', {
      url,
      method: init?.method,
      error: err,
    });
    throw err;
  }
};
