// End-to-end smoke test for a locally running Comercial instance.
//
// Drives a real browser through registration, login, client creation,
// proposal creation and PDF download, then checks persistence and that a
// second user cannot read the first user's records. Uses synthetic data only.
//
// Usage (app already running, e.g. `npm run build && npm start`):
//   BASE_URL=http://localhost:3000 CHROME_PATH=/usr/bin/google-chrome npm run test:e2e
// Optional: SCREENSHOT_DIR=docs/screenshots to save page captures.
//
// CHROME_PATH must point to an installed Chrome/Chromium; if it is unset,
// the Chromium downloaded by `npx playwright-core install chromium` is used.

import fs from "node:fs";
import path from "node:path";
import { chromium } from "playwright-core";

const BASE = process.env.BASE_URL || "http://localhost:3000";
const SHOTS = process.env.SCREENSHOT_DIR || "";
const stamp = Date.now();
const userA = { name: "Alex Reviewer", company: "Example Studio", email: `alex.${stamp}@example.test`, password: "example-pass-123" };
const userB = { name: "Blake Other", company: "Other Example Co", email: `blake.${stamp}@example.test`, password: "example-pass-456" };

const results = [];
function check(name, ok, detail = "") {
  results.push({ name, ok });
  console.log(`${ok ? "PASS" : "FAIL"}  ${name}${detail ? `  (${detail})` : ""}`);
}
async function shot(page, name, fullPage = false) {
  if (!SHOTS) return;
  fs.mkdirSync(SHOTS, { recursive: true });
  await page.screenshot({ path: path.join(SHOTS, name), fullPage });
}
async function register(page, u) {
  await page.goto(`${BASE}/registro`);
  await page.fill("#name", u.name);
  await page.fill("#companyName", u.company);
  await page.fill("#email", u.email);
  await page.fill("#password", u.password);
}
async function login(page, u) {
  await page.goto(`${BASE}/login`);
  await page.fill("#email", u.email);
  await page.fill("#password", u.password);
  await page.click("button[type=submit]");
  await page.waitForURL("**/dashboard", { timeout: 20000 });
}

const browser = await chromium.launch({
  executablePath: process.env.CHROME_PATH || undefined,
  args: ["--no-sandbox"],
});
const options = { viewport: { width: 1440, height: 900 }, locale: "pt-BR" };

try {
  // Anonymous access
  {
    const ctx = await browser.newContext(options);
    const page = await ctx.newPage();
    await page.goto(`${BASE}/dashboard`);
    check("anonymous /dashboard redirects to /login", page.url().includes("/login"));
    const res = await ctx.request.get(`${BASE}/api/propostas/unknown/pdf`);
    check("anonymous PDF request returns 401", res.status() === 401, `status ${res.status()}`);
    await page.goto(`${BASE}/`);
    await page.waitForLoadState("networkidle");
    await shot(page, "01-landing.png");
    await page.goto(`${BASE}/login`);
    await shot(page, "03-login.png");
    await ctx.close();
  }

  // User A: register, log in, create client and proposal, download PDF
  const ctxA = await browser.newContext(options);
  const a = await ctxA.newPage();
  await register(a, userA);
  await shot(a, "02-register.png");
  await a.click("button[type=submit]");
  await a.waitForURL("**/login?registered=1", { timeout: 20000 });
  check("registration redirects to login", true);
  await login(a, userA);
  check("login reaches the dashboard", true);

  await a.goto(`${BASE}/clientes/novo`);
  await a.fill("#name", "Jordan Sample");
  await a.fill("#company", "Sample Bakery (fictional)");
  await a.fill("#email", "jordan@sample.example");
  await a.fill("#notes", "Synthetic demo client.");
  await a.click("button[type=submit]");
  await a.waitForURL(/\/clientes\/(?!novo)[^/]+$/, { timeout: 20000 });
  const clientUrl = a.url();
  check("client is created", true, clientUrl.split("/").pop());

  await a.goto(`${BASE}/propostas/nova`);
  await a.fill("#title", "Website refresh (synthetic example)");
  await a.fill("#notes", "Synthetic data for documentation screenshots.");
  const rows = a.locator("form .grid.grid-cols-12.items-center");
  await rows.nth(0).locator("input").nth(0).fill("Discovery workshop");
  await rows.nth(0).locator("input").nth(1).fill("1");
  await rows.nth(0).locator("input").nth(2).fill("1200");
  await a.click("text=Adicionar item");
  await rows.nth(1).locator("input").nth(0).fill("Page templates");
  await rows.nth(1).locator("input").nth(1).fill("3");
  await rows.nth(1).locator("input").nth(2).fill("450.50");
  const liveTotal = (await a.locator("form p.text-lg span").innerText()).replace(/\s/g, " ");
  check("form shows live total R$ 2.551,50", liveTotal.includes("2.551,50"), liveTotal);
  await shot(a, "06-new-proposal.png", true);
  await a.click("button:has-text('Salvar proposta')");
  await a.waitForURL(/\/propostas\/(?!nova)[^/]+$/, { timeout: 20000 });
  const proposalUrl = a.url();
  const proposalId = proposalUrl.split("/").pop();
  const detail = await a.locator("main").innerText();
  check("proposal detail shows saved items and total", detail.includes("Page templates") && detail.includes("2.551,50"));
  await shot(a, "07-proposal-detail.png", true);

  const pdf = await ctxA.request.get(`${BASE}/api/propostas/${proposalId}/pdf`);
  const bytes = Buffer.from(await pdf.body());
  check(
    "owner downloads a PDF",
    pdf.status() === 200 && pdf.headers()["content-type"] === "application/pdf" && bytes.subarray(0, 5).toString() === "%PDF-",
    `${bytes.length} bytes`,
  );
  if (SHOTS) fs.writeFileSync(path.join(SHOTS, "proposal-sample.pdf"), bytes);

  await a.goto(`${BASE}/clientes`);
  await shot(a, "05-clients.png");
  await a.goto(`${BASE}/dashboard`);
  await shot(a, "04-dashboard.png");

  // Persistence across a fresh session
  const ctxA2 = await browser.newContext(options);
  const a2 = await ctxA2.newPage();
  await login(a2, userA);
  await a2.goto(`${BASE}/propostas`);
  check("proposal persists after a fresh login", (await a2.locator("main").innerText()).includes("Website refresh (synthetic example)"));
  await ctxA2.close();

  // User scoping
  const ctxB = await browser.newContext(options);
  const b = await ctxB.newPage();
  await register(b, userB);
  await b.click("button[type=submit]");
  await b.waitForURL("**/login?registered=1", { timeout: 20000 });
  await login(b, userB);
  await b.goto(`${BASE}/propostas`);
  check("second user's list excludes the first user's proposal", !(await b.locator("main").innerText()).includes("Website refresh"));
  check("second user gets 404 on the proposal page", (await b.goto(proposalUrl)).status() === 404);
  check("second user gets 404 on the client page", (await b.goto(clientUrl)).status() === 404);
  check("second user gets 404 on the PDF", (await ctxB.request.get(`${BASE}/api/propostas/${proposalId}/pdf`)).status() === 404);
  await ctxB.close();
  await ctxA.close();
} catch (error) {
  check("smoke run completed without an exception", false, String(error));
} finally {
  await browser.close();
}

const failed = results.filter((r) => !r.ok).length;
console.log(`\n${results.length - failed}/${results.length} checks passed`);
process.exit(failed ? 1 : 0);
