import assert from "node:assert/strict";
import fs from "node:fs";
import path from "node:path";
import { describe, it } from "node:test";
import { fileURLToPath } from "node:url";

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "../..");

describe("security headers", () => {
  it("denies framing and sets a CSP on every route", async () => {
    const config = await import("../../next.config.mjs");
    const loadHeaders = config.default.headers;
    assert.ok(loadHeaders);
    const routes = await loadHeaders();
    const headers = routes[0].headers as { key: string; value: string }[];
    const csp = headers.find((header) => header.key === "Content-Security-Policy");
    assert.equal(routes[0].source, "/:path*");
    assert.ok(csp?.value.includes("frame-ancestors 'none'"));
    assert.equal(
      headers.find((header) => header.key === "X-Frame-Options")?.value,
      "DENY"
    );
    assert.equal(
      headers.find((header) => header.key === "X-Content-Type-Options")?.value,
      "nosniff"
    );
  });
});

describe("CI action pins", () => {
  it("pins checkout and setup-node to commit SHAs", () => {
    const workflow = fs.readFileSync(
      path.join(root, ".github/workflows/ci.yml"),
      "utf8"
    );
    assert.match(workflow, /actions\/checkout@[0-9a-f]{40}/);
    assert.match(workflow, /actions\/setup-node@[0-9a-f]{40}/);
    assert.doesNotMatch(workflow, /actions\/checkout@v\d/);
    assert.doesNotMatch(workflow, /actions\/setup-node@v\d/);
  });
});
