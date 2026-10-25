#!/usr/bin/env node
// keyboard-tests.mjs — scripted keyboard / focus / reflow tests for the demo
// chat UI and the transcripts page (Playwright). Also captures ariaSnapshot()
// accessibility-tree fallbacks (Guidepup/VoiceOver automation is not functional
// on macOS 27 — verified directly at build time; no screen-reader testing is
// claimed).
//
// Usage: npm run test:keyboard   (from the repo root)
import { chromium } from "playwright";
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const repoRoot = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..", "..");
const snapDir = path.join(repoRoot, "eval", "tests", "aria-snapshots");
fs.mkdirSync(snapDir, { recursive: true });

const BASE = "http://127.0.0.1:8931";
let passed = 0, failed = 0;
const failures = [];

function check(name, cond, detail) {
  if (cond) { passed++; console.log(`  PASS  ${name}`); }
  else { failed++; failures.push(name + (detail ? ` — ${detail}` : "")); console.log(`  FAIL  ${name}${detail ? " — " + detail : ""}`); }
}

// tiny static server (demo fetches in tests go to a closed local port — never
// to a real provider; tests make no external network calls)
import { createServer } from "node:http";
const types = { ".html": "text/html", ".css": "text/css", ".js": "text/javascript", ".png": "image/png", ".svg": "image/svg+xml" };
const server = createServer((req, res) => {
  let p = decodeURIComponent(new URL(req.url, "http://x").pathname);
  if (p.endsWith("/")) p += "index.html";
  let fp = path.join(path.join(repoRoot, "docs"), p);
  try {
    const data = fs.readFileSync(fp);
    res.writeHead(200, { "content-type": types[path.extname(fp)] || "application/octet-stream" });
    res.end(data);
  } catch {
    res.writeHead(404); res.end("not found");
  }
});
await new Promise((r) => server.listen(8931, "127.0.0.1", r));

const browser = await chromium.launch();

// ---------- transcripts page ----------
{
  console.log("\n== transcripts page ==");
  const page = await browser.newPage({ viewport: { width: 1280, height: 900 } });
  await page.goto(`${BASE}/transcripts/index.html`);
  check("one h1", (await page.locator("h1").count()) === 1);
  check("skip link present", await page.locator(".skip-link").count() === 1);
  await page.keyboard.press("Tab");
  const focused = await page.evaluate(() => document.activeElement.className);
  check("first Tab lands on skip link", focused.includes("skip-link"));
  await page.keyboard.press("Enter");
  check("skip link activates to #main", await page.evaluate(() => document.activeElement.id === "main" || location.hash === "#main").catch(() => false) || (await page.evaluate(() => window.location.hash)).includes("main"));
  // keyboard reachability of the main nav links
  await page.keyboard.press("Shift+Tab");
  const navReachable = await page.evaluate(() => document.activeElement.tagName === "A");
  check("nav links keyboard reachable", navReachable);
  // pending notice present
  check("pending notice present", (await page.locator("text=Example transcripts coming soon").count()) >= 1);
  // 320px reflow
  await page.setViewportSize({ width: 320, height: 700 });
  const overflow = await page.evaluate(() => document.documentElement.scrollWidth - document.documentElement.clientWidth);
  check("reflow at 320px (no horizontal scroll)", overflow <= 0, `overflow=${overflow}px`);
  await page.locator("main").ariaSnapshot({ ref: false }).then(
    (s) => fs.writeFileSync(path.join(snapDir, "transcripts.yaml"), s),
    () => {}
  );
  await page.close();
}

// ---------- demo: accessibility structure + key panel ----------
{
  console.log("\n== demo: structure and key panel ==");
  const page = await browser.newPage({ viewport: { width: 1280, height: 900 } });
  await page.goto(`${BASE}/demo/index.html`);

  check("log has role=log", (await page.locator("#log[role='log']").count()) === 1);
  check("log aria-live=polite", (await page.getAttribute("#log", "aria-live")) === "polite");
  check("typing status is a polite live region", (await page.getAttribute("#typing-status", "aria-live")) === "polite");
  const inputLabeled = await page.getAttribute("#chat-input", "id").then(async (id) =>
    (await page.locator(`label[for='${id}']`).count()) === 1);
  check("textarea has a <label>", inputLabeled);
  const keyLabelled = (await page.locator("label[for='api-key']").count()) === 1;
  check("api key field has a <label>", keyLabelled);
  check("api key field is password-masked", (await page.getAttribute("#api-key", "type")) === "password");
  check("chat disabled before key", await page.locator("#chat-input").isDisabled());
  check("security warning present", (await page.locator("text=restricted key with a spending limit").count()) >= 1);
  check("in-memory-only statement present", (await page.locator("text=in memory only").count()) >= 1);

  // tab order reaches: base url -> model -> key -> connect -> clear
  await page.locator("#base-url").focus();
  await page.keyboard.press("Tab");
  check("tab: base-url -> model-name", await page.evaluate(() => document.activeElement.id === "model-name"));
  await page.keyboard.press("Tab");
  check("tab: model-name -> api-key", await page.evaluate(() => document.activeElement.id === "api-key"));
  await page.keyboard.press("Tab");
  check("tab: api-key -> connect button", await page.evaluate(() => document.activeElement.id === "connect-btn"));

  // connect (no real endpoint; chat requests in this test go to a closed local port)
  await page.fill("#base-url", "http://127.0.0.1:9/v1");
  await page.fill("#model-name", "test-model");
  await page.fill("#api-key", "test-key-not-real");
  await page.click("#connect-btn");
  check("status announces connected", (await page.textContent("#key-status")).includes("Connected"));
  check("chat enabled after connect", !(await page.locator("#chat-input").isDisabled()));
  check("focus moved to chat input after connect", await page.evaluate(() => document.activeElement.id === "chat-input"));
  check("key input is wiped from the field after connect", (await page.inputValue("#api-key")) === "");

  // clear key
  await page.click("#clear-key-btn");
  check("clear key disables chat", await page.locator("#chat-input").isDisabled());
  check("clear key announces", (await page.textContent("#key-status")).includes("cleared"));

  await page.close();
}

// ---------- demo: typing, Enter/Shift+Enter, focus, start over ----------
{
  console.log("\n== demo: chat interaction ==");
  const page = await browser.newPage({ viewport: { width: 1280, height: 900 } });
  await page.goto(`${BASE}/demo/index.html`);
  await page.fill("#base-url", "http://127.0.0.1:9/v1");
  await page.fill("#model-name", "test-model");
  await page.fill("#api-key", "test-key-not-real");
  await page.click("#connect-btn");

  // Shift+Enter inserts a newline, does not send
  await page.fill("#chat-input", "line one");
  await page.keyboard.press("Shift+Enter");
  await page.keyboard.type("line two");
  const val = await page.inputValue("#chat-input");
  check("Shift+Enter adds newline, no send", val.includes("\n") && (await page.locator("#log .msg").count()) === 0);

  // Enter sends; user message appears with text speaker label; typing announced;
  // focus stays in the input even after the (locally failing) provider call.
  // The route below delays the request so the "Tutor is typing…" status — which
  // correctly clears the moment the provider responds/fails — is observable.
  await page.route("**/chat/completions", async (route) => {
    await new Promise((r) => setTimeout(r, 400));
    await route.abort("connectionrefused");
  });
  await page.keyboard.press("Enter");
  check("Enter sends message", (await page.locator("#log .msg.user").count()) === 1);
  const userText = await page.textContent("#log .msg.user");
  check("speaker label 'You:' present in text", userText.includes("You:"));
  check("typing status announced", (await page.textContent("#typing-status")).includes("typing"));
  check("input cleared after send", (await page.inputValue("#chat-input")) === "");
  check("focus stays in input after send", await page.evaluate(() => document.activeElement.id === "chat-input"));
  await page.waitForSelector("#log .msg.error", { timeout: 5000 }).catch(() => {});
  check("provider failure surfaced in log", (await page.locator("#log .msg.error").count()) === 1);
  check("focus remains in input after error", await page.evaluate(() => document.activeElement.id === "chat-input"));
  check("typing status cleared after error", (await page.textContent("#typing-status")) === "");

  // Start over
  await page.click("#reset-btn");
  check("Start over empties the log", (await page.locator("#log .msg").count()) === 0);
  check("Start over keeps focus usable (input enabled)", !(await page.locator("#chat-input").isDisabled()));

  // message content is text (plain-text math)
  await page.fill("#chat-input", "3x + 5 = 20");
  await page.keyboard.press("Enter");
  const last = await page.textContent("#log .msg.user");
  check("plain-text math preserved", last.includes("3x + 5 = 20"));

  // 320px reflow
  await page.setViewportSize({ width: 320, height: 700 });
  const overflow = await page.evaluate(() => document.documentElement.scrollWidth - document.documentElement.clientWidth);
  check("reflow at 320px (no horizontal scroll)", overflow <= 0, `overflow=${overflow}px`);

  // aria snapshot fallback (screen-reader tree capture, not a screen-reader test)
  await page.setViewportSize({ width: 1280, height: 900 });
  await page.locator("main").ariaSnapshot({ ref: false }).then(
    (s) => fs.writeFileSync(path.join(snapDir, "demo.yaml"), s),
    () => {}
  );
  await page.close();
}

await browser.close();
server.close();

console.log(`\nKeyboard tests: ${passed} passed, ${failed} failed`);
if (failures.length) {
  console.log("Failures:\n - " + failures.join("\n - "));
  process.exit(1);
}
