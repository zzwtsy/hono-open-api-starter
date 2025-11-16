# Hono Open API 模板(monorepo)

使用 Hono 和 Open API 构建完整文档化类型安全 JSON API 的入门模板。

## 快速开始

克隆此模板（不包含 Git 历史记录）

```bash
pnpm dlx degit zzwtsy/hono-open-api-starter#monorepo my-api
cd my-api
```

创建 .env 文件

```bash
cp .env.example .env
```

安装依赖

```bash
pnpm install
```

启动开发服务器

```bash
pnpm dev
```

代码检查

```bash
pnpm lint
```

运行测试

```bash
pnpm test
```

## Routes 开发规范

应用结构

- **基础应用**: Hono 应用从 `src/app.ts` 导出
- **本地开发**: 使用 `src/index.ts` 中定义的 `@hono/node-server`
  - 更新此文件或创建新的入口点以使用您偏好的运行时
- **类型安全环境**: 在 `src/env.ts` 中定义
  - 在此处添加任何其他必需的环境变量。如果缺少任何必需的环境变量, 应用程序将无法启动

路由组示例

- **路由组示例**: 在 `src/routes/tasks/tasks.index.ts` 中创建
- **路由定义**: 在 `src/routes/tasks/tasks.routes.ts` 中定义
- **Hono请求处理器**: 在 `src/routes/tasks/tasks.handlers.ts` 中定义
- **单元测试**: 在 `src/routes/tasks/tasks.test.ts` 中定义组的单元测试

## 参考项目

[w3cj/hono-open-api-starter](https://github.com/w3cj/hono-open-api-starter)
