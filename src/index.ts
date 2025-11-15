import fs from "node:fs";
import path, { dirname } from "node:path";

import { fileURLToPath } from "node:url";

import { serve } from "@hono/node-server";

import app from "@/app";

import env from "@/env";
import { logger } from "@/lib/logger";

serve({
  fetch: app.fetch,
  port: env.PORT,
}, (info) => {
  logger.info(`Server is running on http://localhost:${info.port}`);
  if (env.NODE_ENV !== "production") {
    logger.info(`Server OpenAPI UI is available at http://localhost:${info.port}/reference`);
  }
  const __filename = fileURLToPath(import.meta.url);
  const __dirname = dirname(__filename);
  const faviconPath = path.join(__dirname, "public", "favicon.ico");
  if (!fs.existsSync(faviconPath)) {
    logger.warn("Favicon not found at public/favicon.ico");
  }
});
