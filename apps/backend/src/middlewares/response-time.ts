import type { MiddlewareHandler } from "hono";
import { logger } from "@/lib/logger";

export const responseTime: MiddlewareHandler = async (c, next) => {
  const start = Date.now();
  const requestId = c.get("requestId") || crypto.randomUUID();

  // 添加到上下文，供后续使用
  c.set("requestId", requestId);

  await next();

  const duration = Date.now() - start;
  const responseTime = `${duration}ms`;

  // 记录响应时间
  logger.info({
    requestId,
    event: "response_time",
    method: c.req.method,
    path: c.req.path,
    status: c.res.status,
    responseTime,
    duration,
  }, `Response time: ${responseTime}`);
};
