import type { Schema } from "hono";

import type { AppBindings, AppOpenAPI } from "./types";
import { serveStatic } from "@hono/node-server/serve-static";
import { OpenAPIHono } from "@hono/zod-openapi";

import { requestId } from "hono/request-id";
import { notFound } from "@/middlewares/not-found";
import { onError } from "@/middlewares/on-error";
import { pinoLogger } from "@/middlewares/pino-logger";
import { responseTime } from "@/middlewares/response-time";

export function createRouter() {
  return new OpenAPIHono<AppBindings>({
    strict: false,
    defaultHook: (result, _c) => {
      if (!result.success) {
        throw result.error;
      }
    },
  });
}

export default function createApp() {
  const app = createRouter();

  app.all("/favicon.ico", serveStatic({ path: "./public/favicon.ico" }));

  app.use(requestId())
    .use(pinoLogger())
    .use(responseTime);

  app.notFound(notFound);
  app.onError(onError);
  return app;
}

export function createTestApp<S extends Schema>(router: AppOpenAPI<S>) {
  return createApp().route("/", router);
}
