/* eslint-disable import/first */
import type { MySql2Database } from "drizzle-orm/mysql2";
import env from "@/env";
import { logger } from "@/lib/logger";

// 慢查询阈值配置
const SLOW_QUERY = env.DB_SLOW_QUERY_THRESHOLD;
const VERY_SLOW_QUERY = env.DB_VERY_SLOW_QUERY_THRESHOLD;

function displayQueryLog(sql: string, params: any[], timeFloat: number) {
  const time = Math.floor(timeFloat);

  // 提取 SQL 语句类型
  const queryType = sql.trim().toUpperCase().split(" ")[0];

  // 构建结构化日志对象
  const logData = {
    component: "database",
    event: "query_execution",
    queryType,
    query: sql,
    parameters: params,
    duration: timeFloat,
    durationMs: time,
    severity: time >= VERY_SLOW_QUERY
      ? "very_slow"
      : time >= SLOW_QUERY ? "slow" : "normal",
    thresholds: {
      slow: SLOW_QUERY,
      verySlow: VERY_SLOW_QUERY,
    },
  };

  // 根据严重程度选择合适的日志级别
  if (time < SLOW_QUERY && env.LOG_LEVEL === "debug") {
    logger.debug(logData, "Query executed successfully");
  } else if (time < VERY_SLOW_QUERY) {
    logger.warn(logData, "Slow query detected");
  } else {
    logger.error(logData, "Very slow query detected");
  }
}
import { MySql2PreparedQuery } from "drizzle-orm/mysql2/session";

const originalAll = MySql2PreparedQuery.prototype.execute;
MySql2PreparedQuery.prototype.execute = async function (placeholderValues: Record<string, unknown> = {}) {
  const start = performance.now();
  const result = await originalAll.apply(this, [placeholderValues]);
  const diff = performance.now() - start;
  displayQueryLog((this as any).rawQuery.sql, (this as any).params, diff);
  return result;
};

import { drizzle } from "drizzle-orm/mysql2";
import mysql from "mysql2/promise";
import * as schemas from "./schemas";

// 创建连接池
const poolConnection = mysql.createPool({
  host: env.DB_HOST,
  port: env.DB_PORT,
  user: env.DB_USER,
  password: env.DB_PASSWORD,
  database: env.DB_NAME,
  waitForConnections: true,
  connectionLimit: 10,
  queueLimit: 100,
  enableKeepAlive: true,
});

// 创建 drizzle 实例
const db: MySql2Database<typeof schemas> = drizzle(poolConnection, {
  schema: schemas,
  mode: "default",
});

logger.info("Database query monitoring enabled");
logger.info(`Slow query threshold: ${SLOW_QUERY}ms | Very slow query threshold: ${VERY_SLOW_QUERY}ms`);

export default db;
