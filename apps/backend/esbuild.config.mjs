import { cpSync, existsSync, mkdirSync } from "node:fs";
import { build } from "esbuild";

const BUILD_OPTIONS = {
  entryPoints: ["src/index.ts"],
  bundle: true,
  platform: "node",
  outfile: "dist/server.js",
  format: "esm",
  minify: true,
  sourcemap: true,
  banner: {
    js: `
      import { createRequire } from 'module';
      const require = createRequire(import.meta.url);
    `,
  },
};

const PATHS = {
  public: {
    src: "public",
    dest: "dist/public",
  },
};

async function buildProject() {
  try {
    console.log("Building project...");
    await build(BUILD_OPTIONS);

    if (!existsSync("./dist")) {
      mkdirSync("./dist", { recursive: true });
    }

    console.log("Copying public directory...");
    if (existsSync(PATHS.public.src)) {
      if (!existsSync(PATHS.public.dest)) {
        mkdirSync(PATHS.public.dest, { recursive: true });
      }
      cpSync(PATHS.public.src, PATHS.public.dest, { recursive: true });
    } else {
      console.warn("`public` directory not found");
    }

    console.log("Build completed successfully!");
  } catch (error) {
    console.error("Build failed:", error.message);
    // eslint-disable-next-line node/prefer-global/process
    process.exit(1);
  }
}

buildProject();
