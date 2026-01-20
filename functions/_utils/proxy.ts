type ProxyConfig = {
  origin: string;
  stripPrefix: string;
};

export function createProxyHandler(config: ProxyConfig): PagesFunction {
  return async (context) => {
    const url = new URL(context.request.url);

    // Remove the prefix and ensure we have at least "/"
    const proxyPath = url.pathname.replace(new RegExp(`^${config.stripPrefix}`), "") || "/";
    const proxyUrl = new URL(proxyPath, config.origin);
    proxyUrl.search = url.search;

    const proxyRequest = new Request(proxyUrl.toString(), {
      method: context.request.method,
      headers: context.request.headers,
      body: context.request.body,
      redirect: "manual",
    });

    return await fetch(proxyRequest);
  };
}
