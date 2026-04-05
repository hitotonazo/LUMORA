export async function onRequest(context) {
  const { env, params } = context;

  // Cloudflare Pages Functions catch-all parameter.
  // Depending on routing, params.path may be undefined, a string, or an array.
  const raw = params?.path;
  const key = Array.isArray(raw)
    ? raw.join("/")
    : (typeof raw === "string" ? raw : "");

  if (!key) {
    return new Response("Not Found", { status: 404 });
  }

  const bucket = env.ASSETS_BUCKET;
  if (!bucket) {
    return new Response("R2 binding 'ASSETS_BUCKET' is not configured.", { status: 500 });
  }

  const object = await bucket.get(key);

  if (!object) {
    return new Response("Not Found", { status: 404 });
  }

  const headers = new Headers();
  object.writeHttpMetadata(headers);
  headers.set("etag", object.httpEtag);

  // Safe fallback content types
  if (!headers.get("content-type")) {
    if (key.endsWith(".png")) headers.set("content-type", "image/png");
    else if (key.endsWith(".jpg") || key.endsWith(".jpeg")) headers.set("content-type", "image/jpeg");
    else if (key.endsWith(".webp")) headers.set("content-type", "image/webp");
    else if (key.endsWith(".svg")) headers.set("content-type", "image/svg+xml");
    else if (key.endsWith(".mp3")) headers.set("content-type", "audio/mpeg");
    else if (key.endsWith(".wav")) headers.set("content-type", "audio/wav");
    else if (key.endsWith(".mp4")) headers.set("content-type", "video/mp4");
    else if (key.endsWith(".json")) headers.set("content-type", "application/json");
    else headers.set("content-type", "application/octet-stream");
  }

  headers.set("cache-control", "public, max-age=3600");

  return new Response(object.body, { headers });
}