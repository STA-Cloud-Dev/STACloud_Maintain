import { createServer } from "node:http";
import { createReadStream, statSync } from "node:fs";
import { extname, join, normalize } from "node:path";
import { fileURLToPath } from "node:url";

const root = fileURLToPath(new URL(".", import.meta.url));
const explicitPort = Boolean(process.env.PORT);
const preferredPort = Number.parseInt(process.env.PORT || "8080", 10);
const maxPortAttempts = 20;

const contentTypes = {
  ".css": "text/css; charset=utf-8",
  ".html": "text/html; charset=utf-8",
  ".js": "text/javascript; charset=utf-8",
  ".png": "image/png",
  ".ico": "image/x-icon",
  ".svg": "image/svg+xml"
};

listen(preferredPort, 0);

function createAppServer() {
  return createServer((request, response) => {
  const url = new URL(request.url || "/", `http://${request.headers.host || "localhost"}`);
  const pathname = decodeURIComponent(url.pathname);
  const filePath = resolveFile(pathname);

  if (!filePath) {
    response.writeHead(404, { "Content-Type": "text/plain; charset=utf-8" });
    response.end("Not found");
    return;
  }

  response.writeHead(200, {
    "Cache-Control": pathname === "/" ? "no-store" : "public, max-age=300",
    "Content-Type": contentTypes[extname(filePath)] || "application/octet-stream",
    "X-Content-Type-Options": "nosniff"
  });
  createReadStream(filePath).pipe(response);
  });
}

function listen(port, attempt) {
  const server = createAppServer();

  server.once("error", (error) => {
    if (error.code === "EADDRINUSE" && !explicitPort && attempt < maxPortAttempts) {
      const nextPort = port + 1;
      console.warn(`Port ${port} is busy, trying ${nextPort}...`);
      listen(nextPort, attempt + 1);
      return;
    }

    if (error.code === "EADDRINUSE") {
      console.error(`Port ${port} is already in use. Set PORT to another value and run again.`);
      process.exitCode = 1;
      return;
    }

    throw error;
  });

  server.listen(port, () => {
    console.log(`STACloud maintenance page is available at http://localhost:${port}`);
  });
}

function resolveFile(pathname) {
  const candidate = pathname === "/" || pathname === "/index.html"
    ? join(root, "public", "index.html")
    : pathname.startsWith("/assets/")
      ? join(root, "public", pathname)
      : pathname.startsWith("/logo/")
        ? join(root, pathname)
        : "";

  if (!candidate) {
    return "";
  }

  const normalized = normalize(candidate);
  if (!normalized.startsWith(root)) {
    return "";
  }

  try {
    return statSync(normalized).isFile() ? normalized : "";
  } catch {
    return "";
  }
}
