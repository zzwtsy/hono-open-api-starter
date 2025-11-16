import type { SQL } from "drizzle-orm";
import type { MySqlTable } from "drizzle-orm/mysql-core";
import { getTableColumns, sql } from "drizzle-orm";
import z from "zod";
import { apiPageResultSchema, apiResultSchema } from "./types";

export function createApiPageResult<T extends z.ZodTypeAny>(itemSchema: T) {
  return apiResultSchema.extend({
    data: apiPageResultSchema.extend({
      list: z.array(itemSchema).openapi({ description: "列表数据", example: [] }),
    }).openapi({ description: "数据" }),
  });
}

export function createApiResult<T extends z.ZodTypeAny>(dataSchema: T) {
  return apiResultSchema.extend({
    data: dataSchema.openapi({ description: "数据" }),
  });
}

/**
 * 构建包含指定列的冲突更新映射
 *
 * 用于 ON DUPLICATE KEY UPDATE 场景，当插入数据发生冲突时，
 * 只更新指定的列，其他列保持不变
 *
 * @param table - Drizzle ORM 表实例，包含表结构和元数据
 * @param columns - 需要更新的列名数组
 * @returns 返回列名到 SQL 表达式的映射对象，格式为 {列名: sql`values(列值)`}
 *
 * @example
 * // 假设 users 表有 id, name, email 列
 * const updateColumns = buildConflictUpdateColumns(users, ['name', 'email']);
 * // 结果: { name: sql`values(name)`, email: sql`values(email)` }
 *
 * // 在插入语句中使用
 * await db.insert(users).values({id: 1, name: 'John', email: 'john@example.com'})
 *   .onDuplicateKeyUpdate({ set: updateColumns });
 */
export function buildConflictUpdateColumns<T extends MySqlTable, Q extends keyof T["_"]["columns"]>(table: T, columns: Q[]) {
  const cls = getTableColumns(table);
  return columns.reduce((acc, column) => {
    acc[column] = sql`values(${cls[column]})`;
    return acc;
  }, {} as Record<Q, SQL>);
}

/**
 * 构建排除指定列的冲突更新映射
 *
 * 用于 ON DUPLICATE KEY UPDATE 场景，当插入数据发生冲突时，
 * 更新除指定列外的所有其他列
 *
 * @param table - Drizzle ORM 表实例，包含表结构和元数据
 * @param columns - 需要排除的列名数组（这些列不会被更新）
 * @returns 返回列名到 SQL 表达式的映射对象，格式为 {列名: sql`values(列值)`}
 *
 * @example
 * // 假设 users 表有 id, name, email, createdAt, updatedAt 列
 * const updateColumns = buildConflictUpdateColumnsExclude(users, ['id', 'createdAt']);
 * // 结果: { name: sql`values(name)`, email: sql`values(email)`, updatedAt: sql`values(updatedAt)` }
 *
 * // 在插入语句中使用
 * await db.insert(users).values({id: 1, name: 'John', email: 'john@example.com', createdAt: new Date()})
 *   .onDuplicateKeyUpdate({ set: updateColumns });
 */
export function buildConflictUpdateColumnsExclude<T extends MySqlTable, Q extends keyof T["_"]["columns"]>(table: T, columns: Q[]) {
  const cls = getTableColumns(table);

  return Object.keys(cls).filter(c => !columns.includes(c as Q)).reduce((acc, column) => {
    acc[column as Q] = sql`values(${cls[column as Q]})`;
    return acc;
  }, {} as Record<Q, SQL>);
}
