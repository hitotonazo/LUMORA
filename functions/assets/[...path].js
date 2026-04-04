export async function onRequestGet(context) {
  const { env, params } = context;
  const pathParts = Array.isArray(params.path) ? params.path : [params.path].filter(Boolean);
  const key = `arg-assets/${pathParts.join("/")}`;

  const bucket = env.ASSETS_BUCKET || env.ARG_ASSETS_BUCKET;
  if (!bucket) {
    return new Response("R2 bucket binding not found. Bind ASSETS_BUCKET or ARG_ASSETS_BUCKET.", { status: 500 });
  }

  const object = await bucket.get(key);
  if (!object) {
    return new Response("Not Found", { status: 404 });
  }

  const headers = new Headers();
  object.writeHttpMetadata(headers);
  headers.set("etag", object.httpEtag);
  headers.set("cache-control", "public, max-age=3600");

  return new Response(object.body, { headers });
}
