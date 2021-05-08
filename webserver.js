import { createServer } from "http";

export function init() {
  const server = createServer((req, res) => {
    res.writeHead(200);
    res.end("ok");
  });
  server.listen(3000);
}
