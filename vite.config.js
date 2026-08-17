import { defineConfig, loadEnv } from "vite";
import react from "@vitejs/plugin-react";
import tailwindcss from "@tailwindcss/vite";

// `vite dev` does not run the functions in api/, so /api/gemini-token would 404
// during local development. This serves the very same handler through Vite's
// middleware so `npm run dev` behaves like production.
function geminiTokenDevServer(env) {
  return {
    name: "gemini-token-dev-server",
    apply: "serve",
    configureServer(server) {
      server.middlewares.use("/api/gemini-token", async (req, res, next) => {
        if (!req.url.startsWith("/") && req.originalUrl !== "/api/gemini-token") return next();

        // The handler is written against Vercel's response helpers, so add the
        // few methods it uses on top of the plain Node response.
        res.status = (code) => { res.statusCode = code; return res; };
        res.json = (body) => {
          res.setHeader("Content-Type", "application/json");
          res.end(JSON.stringify(body));
          return res;
        };

        // Guard the assignment: `process.env.X = undefined` stores the *string*
        // "undefined", which is truthy and would sail past the handler's own
        // missing-key check and get sent to Google as a real key.
        if (!process.env.GEMINI_API_KEY && env.GEMINI_API_KEY) {
          process.env.GEMINI_API_KEY = env.GEMINI_API_KEY;
        }

        try {
          const { default: handler } = await server.ssrLoadModule("/api/gemini-token.js");
          await handler(req, res);
        } catch (err) {
          server.config.logger.error(`[gemini-token dev] ${err?.message || err}`);
          res.status(500).json({ error: "Dev token handler failed" });
        }
      });
    },
  };
}

export default defineConfig(({ mode }) => {
  // Third argument "" loads every variable, not just the VITE_ prefixed ones.
  // GEMINI_API_KEY is deliberately unprefixed so Vite never inlines it into the
  // client bundle.
  const env = loadEnv(mode, process.cwd(), "");

  return {
    plugins: [react(), tailwindcss(), geminiTokenDevServer(env)],
  };
});
