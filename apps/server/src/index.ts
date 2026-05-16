import { createServer } from "node:http";
import { createApp } from "./app.js";
import { config } from "./config.js";
import { createSocketServer } from "./socket.js";

const app = createApp();
const httpServer = createServer(app);
createSocketServer(httpServer);

httpServer.listen(config.port, () => {
  console.log(`[server] listening on http://localhost:${config.port}`);
  console.log(`[server] allowed client origins: ${config.clientOrigins.join(", ")}`);
});
