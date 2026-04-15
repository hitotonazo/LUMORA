export async function onRequest(context) {
  const pathValue = context.params.path;
  const path = Array.isArray(pathValue)
    ? pathValue.join("/")
    : String(pathValue || "");

  const base = "https://pub-12f05472082049758097370dd8aaab52.r2.dev";
  const upstreamUrl = `${base}/${path.replace(/^\/+/, "")}`;

  const upstream = await fetch(upstreamUrl, {
    cf: { cacheEverything: true, cacheTtl: 3600 }
  });

  if (!upstream.ok) {
    return new Response(`R2 fetch failed: ${upstream.status} ${upstream.statusText}`, {
      status: upstream.status,
      headers: { "content-type": "text/plain; charset=utf-8" }
    });
  }

  const headers = new Headers(upstream.headers);
  headers.set("Cache-Control", "public, max-age=3600");
  headers.set("Access-Control-Allow-Origin", "*");

  return new Response(upstream.body, {
    status: upstream.status,
    headers
  });
}
