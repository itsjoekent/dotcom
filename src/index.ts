const LETTER_STRIKE_ORIGIN = "https://letter-strike.itsjoekent.workers.dev";

interface Env {
  ASSETS: Fetcher;
}

export default {
  async fetch(request: Request, env: Env): Promise<Response> {
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

      return new Response(response.body, {
        status: response.status,
        statusText: response.statusText,
        headers: response.headers,
      });
    }

    // Serve static assets for all other requests
    return env.ASSETS.fetch(request);
  },
};
