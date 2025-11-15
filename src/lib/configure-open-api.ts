import type { AppOpenAPI } from "./types";

import { Scalar } from "@scalar/hono-api-reference";

import packageJSON from "../../package.json" with { type: "json" };

export default function configureOpenAPI(app: AppOpenAPI) {
  app.doc("/doc", {
    openapi: "3.0.0",
    info: {
      version: packageJSON.version,
      title: packageJSON.name,
      description: packageJSON.description,
    },
  });

  app.get(
    "/reference",
    Scalar({
      url: "/doc",
    }),
  );
}
