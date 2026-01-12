const LETTER_STRIKE_ORIGIN = "https://letter-strike.itsjoekent.workers.dev";

export const onRequest: PagesFunction = async (context) => {
  const url = new URL(context.request.url);
  
  // Remove the /letter-strike prefix and proxy to the origin
  const proxyPath = url.pathname.replace(/^\/letter-strike/, "") || "/";
  const proxyUrl = new URL(proxyPath, LETTER_STRIKE_ORIGIN);
  proxyUrl.search = url.search;

  const proxyRequest = new Request(proxyUrl.toString(), {
    method: context.request.method,
    headers: context.request.headers,
    body: context.request.body,
    redirect: "manual",
  });

  return await fetch(proxyRequest);
};
