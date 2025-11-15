import path from "node:path";
import { env } from "node:process";
import pino from "pino";
import pretty from "pino-pretty";
import { createStream } from "rotating-file-stream";
import packageJSON from "../../package.json" with { type: "json" };

// 直接从 env 读取，避免循环依赖
const LOG_LEVEL = env.LOG_LEVEL ?? "info";
const NODE_ENV = env.NODE_ENV ?? "production";
const APP_NAME = packageJSON.name;

// 创建轮转文件流（按天轮转）
const fileStream = createStream(`${APP_NAME}.log`, {
  interval: "1d",
  // eslint-disable-next-line node/prefer-global/process
  path: path.join(process.cwd(), "logs"),
  compress: "gzip",
  maxFiles: 30,
});

const streams = [
  {
    level: LOG_LEVEL,
    stream: NODE_ENV === "production"
      // eslint-disable-next-line node/prefer-global/process
      ? process.stdout
    // 1 = stdout
      : pretty(),
  },
  {
    level: LOG_LEVEL,
    stream: fileStream,
  },
];

export const logger = pino({
  level: LOG_LEVEL,
}, pino.multistream(streams));
