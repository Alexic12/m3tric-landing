// Release gate for public configuration (fail-closed). Rules live in scripts/lib/release-config.mjs.
import { loadReleaseEnv, validate } from "./lib/release-config.mjs";

const problems = validate(loadReleaseEnv());

if (problems.length > 0) {
  console.error("check:config FALLÓ / FAILED");
  for (const p of problems) console.error(`  - ${p}`);
  process.exit(1);
}
console.log("check:config OK");
