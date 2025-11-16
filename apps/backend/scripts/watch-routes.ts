import fs from "node:fs/promises";
import path from "node:path";
import { watch } from "chokidar";

const routesDir = "./src/routes";

// 确保 routes 目录存在
async function ensureRoutesDir() {
  try {
    await fs.access(routesDir);
  } catch {
    await fs.mkdir(routesDir, { recursive: true });
    console.log("📁 创建 routes 目录");
  }
}

// 将连字符转换为驼峰命名（用于变量名）
function toCamelCase(str: string): string {
  return str.replace(/-([a-z])/g, (match, letter) => letter.toUpperCase());
}

// 将连字符转换为帕斯卡命名（用于类型名）
function toPascalCase(str: string): string {
  const camelCase = toCamelCase(str);
  return camelCase.charAt(0).toUpperCase() + camelCase.slice(1);
}

// 模板生成函数
function generateTemplates(folderName: string) {
  const camelCaseName = toCamelCase(folderName);
  const pascalCaseName = toPascalCase(folderName);

  const templates = {
    [`${folderName}.index.ts`]: `import { createRouter } from "@/lib/create-app";
import * as handlers from "./${folderName}.handlers";
import * as routes from "./${folderName}.routes";

const router = createRouter()
  .basePath("/${folderName}")
  .openapi(routes.query${pascalCaseName}Route, handlers.query${pascalCaseName})
  .openapi(routes.insert${pascalCaseName}Route, handlers.insert${pascalCaseName})
  .openapi(routes.delete${pascalCaseName}Route, handlers.delete${pascalCaseName});

export default router;
`,

    [`${folderName}.handlers.ts`]: `import type { Query${pascalCaseName}Route, Insert${pascalCaseName}Route, Delete${pascalCaseName}Route } from "./${folderName}.routes";
import type { AppRouteHandler } from "@/lib/types";
import { eq, inArray } from "drizzle-orm";
import db from "@/db";
import { ${camelCaseName}Info } from "@/db/schemas/index";
import { HTTPCodes } from "@/lib/http-codes";
import { logger } from "@/lib/logger";
import { buildConflictUpdateColumnsExclude } from "@/lib/utils";

export const query${pascalCaseName}: AppRouteHandler<Query${pascalCaseName}Route> = async (c) => {
  const { page, pageSize } = c.req.valid("query");

  const list = await db.query.${camelCaseName}Info.findMany({
    limit: pageSize,
    offset: (page - 1) * pageSize,
    orderBy: (fields, { desc }) => [desc(fields.createdAt)],
  });
  const total = await db.$count(${camelCaseName}Info);

  return c.json({
    success: true,
    data: {
      page,
      pageSize,
      list,
      total,
    },
  }, HTTPCodes.OK.code);
};

export const insert${pascalCaseName}: AppRouteHandler<Insert${pascalCaseName}Route> = async (c) => {
  const values = c.req.valid("json");

  const result = await db.transaction(async (tx) => {
    const insertIds = (await tx.insert(${camelCaseName}Info).values(values).onDuplicateKeyUpdate({
      set: buildConflictUpdateColumnsExclude(${camelCaseName}Info, ["id", "createdAt"]),
    }).$returningId()).map(r => r.id);
    return await tx.select().from(${camelCaseName}Info).where(inArray(${camelCaseName}Info.id, insertIds));
  }).catch((err) => {
    logger.error(\`insert${pascalCaseName} error: \${err}\`);
    throw new Error(err);
  });

  return c.json({
    success: true,
    data: result,
  }, HTTPCodes.OK.code);
};

export const delete${pascalCaseName}: AppRouteHandler<Delete${pascalCaseName}Route> = async (c) => {
  const { id } = c.req.valid("query");

  await db.transaction(async (tx) => {
    await tx.delete(${camelCaseName}Info).where(eq(${camelCaseName}Info.id, id));
  }).catch((err) => {
    logger.error(\`delete${pascalCaseName} error: \${err}\`);
    throw new Error(err);
  });

  return c.json({
    success: true,
    data: {},
  }, HTTPCodes.OK.code);
};
`,

    [`${folderName}.routes.ts`]: `import { createRoute, z } from "@hono/zod-openapi";
import { HTTPCodes } from "@/lib/http-codes";
import { createApiPageResult, createApiResult } from "@/lib/utils";

const tags = ["${folderName}"];

export const query${pascalCaseName}Route = createRoute({
  path: "/",
  method: "get",
  tags,
  request: {
    query: z.object({
      page: z.coerce.number()
        .min(1, { message: "页码必须大于等于1" })
        .default(1)
        .openapi({ description: "页码", example: 1 }),
      pageSize: z.coerce.number()
        .min(1, { message: "每页数量必须大于等于1" })
        .max(100, { message: "每页数量必须小于等于100" })
        .default(10)
        .openapi({ description: "每页数量", example: 10 }),
    }),
  },
  responses: {
    [HTTPCodes.OK.code]: {
      description: "获取${folderName}信息成功",
      content: {
        "application/json": {
          schema: createApiPageResult(z.object({})),
        },
      },
    },
  },
});

export const insert${pascalCaseName}Route = createRoute({
  path: "/",
  method: "post",
  tags,
  request: {
    body: {
      content: {
        "application/json": {
          schema: z.object({}),
        },
      },
    },
  },
  responses: {
    [HTTPCodes.OK.code]: {
      description: "创建${folderName}信息成功",
      content: {
        "application/json": {
          schema: createApiResult(z.object({})),
        },
      },
    },
  },
});

export const delete${pascalCaseName}Route = createRoute({
  path: "/",
  method: "delete",
  tags,
  request: {
    query: z.object({
      id: z.coerce.number().openapi({ description: "${folderName}ID" }),
    }),
  },
  responses: {
    [HTTPCodes.OK.code]: {
      description: "删除${folderName}信息成功",
      content: {
        "application/json": {
          schema: createApiResult(z.object({})),
        },
      },
    },
  },
});

export type Query${pascalCaseName}Route = typeof query${pascalCaseName}Route;
export type Insert${pascalCaseName}Route = typeof insert${pascalCaseName}Route;
export type Delete${pascalCaseName}Route = typeof delete${pascalCaseName}Route;
`,
  };

  return templates;
}

// 监听目录变化
async function startWatching() {
  try {
    await ensureRoutesDir();

    console.log("👀 开始监听 src/routes 目录...");

    const watcher = watch(routesDir, {
      ignored: /^\./, // 忽略隐藏文件
      persistent: true,
      ignoreInitial: true,
    });

    // 监听目录创建事件
    watcher.on("addDir", async (dirPath) => {
      const relativePath = path.relative(routesDir, dirPath);

      // 只处理直接在 routes 目录下的新文件夹
      if (relativePath && !relativePath.includes(path.sep)) {
        const folderName = relativePath;
        console.log(`📁 检测到新文件夹: ${folderName}`);

        const templates = generateTemplates(folderName);

        for (const [filename, content] of Object.entries(templates)) {
          const filePath = path.join(dirPath, filename);

          try {
            await fs.writeFile(filePath, content, "utf8");
            console.log(`✅ 创建文件: ${filename}`);
          } catch (error) {
            console.error(`❌ 创建 ${filename} 失败:`, error);
          }
        }

        console.log(`🎉 完成为 ${folderName} 创建模板文件`);
      }
    });

    // 监听错误
    watcher.on("error", (error) => {
      console.error("❌ 监听错误:", error);
    });
  } catch (error) {
    console.error("❌ 监听初始化失败:", error);
  }
}

// 启动监听
startWatching();
