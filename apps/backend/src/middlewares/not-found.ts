import type { NotFoundHandler } from "hono";
import type z from "zod";
import type { ApiErrorResultSchema } from "@/lib/types";
import { HTTPCodes } from "@/lib/http-codes";

export const notFound: NotFoundHandler = (c) => {
  const notFoundJson: z.infer<typeof ApiErrorResultSchema> = {
    error: {
      code: HTTPCodes.NOT_FOUND.code,
      message: HTTPCodes.NOT_FOUND.message,
      details: undefined,
    },
  };
  return c.json(notFoundJson, HTTPCodes.NOT_FOUND.code);
};
