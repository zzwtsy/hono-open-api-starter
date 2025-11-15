import { z } from "@hono/zod-openapi";
import { config } from "dotenv";
import { expand } from "dotenv-expand";

expand(config());

const EnvSchema = z.object({
  NODE_ENV: z.enum(["development", "test", "production"]).default("production"),
  PORT: z.coerce.number().default(3000),
  LOG_LEVEL: z.enum(["fatal", "error", "warn", "info", "debug", "trace", "silent"]).default("info"),
  DB_HOST: z.string(),
  DB_PORT: z.coerce.number(),
  DB_NAME: z.string(),
  DB_USER: z.string(),
  DB_PASSWORD: z.string(),
  CORS_ORIGINS: z.string().transform(v => v.split(",").map(s => s.trim()).filter(Boolean)).default([]),
}).superRefine((inout, ctx) => {
  if (!inout.DB_HOST || inout.DB_HOST === "") {
    ctx.addIssue({
      path: ["DB_HOST"],
      code: "custom",
      message: "DB_HOST is required",
    });
  }
  if (!inout.DB_PORT) {
    ctx.addIssue({
      path: ["DB_PORT"],
      code: "custom",
      message: "DB_PORT is required",
    });
  }
  if (!inout.DB_NAME || inout.DB_NAME === "") {
    ctx.addIssue({
      path: ["DB_NAME"],
      code: "custom",
      message: "DB_NAME is required",
    });
  }
  if (!inout.DB_USER || inout.DB_USER === "") {
    ctx.addIssue({
      path: ["DB_USER"],
      code: "custom",
      message: "DB_USER is required",
    });
  }
  if (!inout.DB_PASSWORD || inout.DB_PASSWORD === "") {
    ctx.addIssue({
      path: ["DB_PASSWORD"],
      code: "custom",
      message: "DB_PASSWORD is required",
    });
  }
});

export type Env = z.infer<typeof EnvSchema>;

// eslint-disable-next-line node/prefer-global/process
const { data: env, error } = EnvSchema.safeParse(process.env);

if (error) {
  console.error("❌ Invalid env:");
  console.error(JSON.stringify(z.treeifyError(error).properties, null, 2));
  // eslint-disable-next-line node/prefer-global/process
  process.exit(1);
}

export default env!;
