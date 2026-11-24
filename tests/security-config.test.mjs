import test from "node:test";
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";

const backend = readFileSync(new URL("../src/Backend/main.bal", import.meta.url), "utf8");
const config = readFileSync(new URL("../src/Backend/example.config.toml", import.meta.url), "utf8");
const readme = readFileSync(new URL("../README.md", import.meta.url), "utf8");

test("all HTTP services use the configured frontend origin for CORS", () => {
  assert.doesNotMatch(backend, /allowOrigins\s*:\s*\[\s*["']\*["']\s*\]/);
  assert.equal((backend.match(/allowOrigins:\s*\[frontendOrigin\]/g) || []).length, 2);
});

test("example configuration includes explicit OAuth and admin placeholders", () => {
  assert.match(config, /clientId\s*=\s*"YOUR_GOOGLE_OAUTH_CLIENT_ID"/);
  assert.match(config, /clientSecret\s*=\s*"YOUR_GOOGLE_OAUTH_CLIENT_SECRET"/);
  assert.match(config, /frontendOrigin\s*=/);
  assert.match(config, /adminEmails\s*=/);
});

test("documentation warns against production use of shared in-memory sessions", () => {
  assert.match(readme, /process-wide mutable variables/);
  assert.match(readme, /not a safe multi-user session implementation/);
  assert.match(readme, /local academic prototype only/);
});
