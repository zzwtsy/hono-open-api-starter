import type { OpenAPIHono, RouteConfig, RouteHandler } from "@hono/zod-openapi";
import type { Schema } from "hono";
import type { PinoLogger } from "hono-pino";
import { z } from "@hono/zod-openapi";

export interface AppBindings {
  Variables: {
    logger: PinoLogger;
  };
};

// eslint-disable-next-line ts/no-empty-object-type
export type AppOpenAPI<S extends Schema = {}> = OpenAPIHono<AppBindings, S>;

export type AppRouteHandler<R extends RouteConfig> = RouteHandler<R, AppBindings>;

export const ApiErrorResultSchema = z.object({
  error: z.object({
    code: z.number().openapi({ description: "错误代码", example: 500 }),
    message: z.string().openapi({ description: "错误信息", example: "Internal Server Error" }),
    details: z.unknown().optional().openapi({ description: "错误详情, 仅开发环境返回", example: "Internal Server Error" }),
    requestId: z.string().optional().openapi({ description: "请求ID", example: "1234567890" }),
  }),
}).openapi("ApiErrorResult", {
  description: "接口错误结果",
});

export const apiResultSchema = z.object({
  success: z.boolean().openapi({ description: "是否成功", example: true }),
}).openapi("ApiResult", {
  description: "接口返回结果",
});

export const apiPageResultSchema = z.object({
  page: z.number().openapi({ description: "当前页码", example: 1 }),
  pageSize: z.number().openapi({ description: "每页数量", example: 10 }),
  list: z.array(z.unknown()).openapi({ description: "列表数据", example: [] }),
  total: z.number().openapi({ description: "总记录数", example: 1 }),
}).openapi("ApiPageResult", {
  description: "分页结果数据",
});
