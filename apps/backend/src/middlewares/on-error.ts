import type { ErrorHandler } from "hono";

import type { ContentfulStatusCode } from "hono/utils/http-status";
import type z from "zod";
import type { ApiErrorResultSchema } from "@/lib/types";
import env from "@/env";
import { HTTPCodes } from "@/lib/http-codes";

const isProd = env.NODE_ENV === "production";

export const onError: ErrorHandler = (err, c) => {
  const currentStatus = "status" in err
    ? err.status
    : c.newResponse(null).status;
  const statusCode = currentStatus !== HTTPCodes.OK.code
    ? (currentStatus as ContentfulStatusCode)
    : HTTPCodes.INTERNAL_SERVER_ERROR.code;

  const errorJson: z.infer<typeof ApiErrorResultSchema> = {
    error: {
      code: statusCode,
      message: err.message,
      details: isProd ? undefined : err.stack,
    },
  };

  return c.json(
    errorJson,
    statusCode,
  );
};
