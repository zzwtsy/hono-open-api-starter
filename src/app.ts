import env from "@/env";
import configureOpenAPI from "@/lib/configure-open-api";
import createApp from "@/lib/create-app";

const app = createApp();

if (env.NODE_ENV !== "production") {
  configureOpenAPI(app);
}

const routes = [] as const;

routes.forEach((route) => {
  app.route("/api", route);
});

export type AppType = typeof routes[number];

export default app;
