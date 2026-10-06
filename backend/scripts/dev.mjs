import { spawn } from "node:child_process";
import { existsSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

const root = join(dirname(fileURLToPath(import.meta.url)), "..");
const dist = join(root, "dist");
const main = join(dist, "src/main.js");

const tsc = spawn("npx", ["tsc", "-p", "tsconfig.json", "--watch", "--preserveWatchOutput"], {
  cwd: root,
  stdio: "inherit",
  shell: true,
});

function waitForBuild() {
  return new Promise((resolve) => {
    const tick = () => (existsSync(main) ? resolve() : setTimeout(tick, 200));
    tick();
  });
}

await waitForBuild();

const api = spawn(process.execPath, ["--watch-path", dist, main], {
  cwd: root,
  stdio: "inherit",
});

function stop() {
  api.kill("SIGTERM");
  tsc.kill("SIGTERM");
  process.exit(0);
}

process.on("SIGINT", stop);
process.on("SIGTERM", stop);
api.on("exit", (code) => {
  tsc.kill("SIGTERM");
  process.exit(code ?? 0);
});
