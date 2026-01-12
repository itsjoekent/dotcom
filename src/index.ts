const LETTER_STRIKE_ORIGIN = "https://letter-strike.itsjoekent.workers.dev";

export default {
  async fetch(request: Request): Promise<Response> {
    const url = new URL(request.url);

    // Proxy /letter-strike requests
    if (url.pathname.startsWith("/letter-strike")) {
      // Remove the /letter-strike prefix and proxy to the origin
      const proxyPath = url.pathname.replace(/^\/letter-strike/, "") || "/";
      const proxyUrl = new URL(proxyPath, LETTER_STRIKE_ORIGIN);
      proxyUrl.search = url.search;

      const proxyRequest = new Request(proxyUrl.toString(), {
        method: request.method,
        headers: request.headers,
        body: request.body,
        redirect: "manual",
      });

      const response = await fetch(proxyRequest);

      // Return the proxied response with CORS headers if needed
      return new Response(response.body, {
        status: response.status,
        statusText: response.statusText,
        headers: response.headers,
      });
    }

    // For all other requests, let the static assets handler take over
    // This is handled automatically by Cloudflare's assets configuration
    return new Response("Not Found", { status: 404 });
  },
};
