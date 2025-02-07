Bun.serve({
    async fetch(req: Request) {
        // Serve files in the build folder
        const reqURL : URL = new URL(req.url);

        if (reqURL.pathname == "/") {
            return await new Response("Specify specific file.");
        }

        if (await Bun.file(`../../../build${reqURL.pathname}`).exists()) {
            return await new Response(await Bun.file(`../../../build${reqURL.pathname}`));
        }

        return await new Response("404!");
    },
    port: 3000,
  });