import { pinoLogger as pLogger } from "hono-pino";

import { logger } from "@/lib/logger";

export function pinoLogger() {
  return pLogger({
    pino: logger,
  });
}
