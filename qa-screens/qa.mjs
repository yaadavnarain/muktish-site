// QA screenshot + checks harness (redesign-motion). Run: node qa-screens/qa.mjs
import { chromium } from "playwright";
import { mkdirSync } from "fs";

const BASE = "http://localhost:3100";
const OUT = "qa-screens";
mkdirSync(OUT, { recursive: true });

const viewports = [
  { name: "375", width: 375, height: 812 },
  { name: "390", width: 390, height: 844 },
  { name: "1440", width: 1440, height: 900 },
  { name: "1920", width: 1920, height: 1080 },
];

const browser = await chromium.launch();
const issues = [];
const info = [];

for (const vp of viewports) {
  const ctx = await browser.newContext({
    viewport: { width: vp.width, height: vp.height },
  });
  const page = await ctx.newPage();
  const errors = [];
  page.on("console", (m) => m.type() === "error" && errors.push(m.text()));
  page.on("pageerror", (e) => errors.push(String(e)));

  await page.goto(BASE, { waitUntil: "networkidle" });
  await page.waitForTimeout(1200); // let entrance animations land

  // Above-the-fold screenshot
  await page.screenshot({ path: `${OUT}/hero-${vp.name}.png` });

  // Pre-scroll through the page so whileInView entrances fire before the
  // fullPage capture (otherwise below-fold content screenshots at opacity 0).
  await page.evaluate(async () => {
    const step = window.innerHeight / 2;
    for (let y = 0; y <= document.body.scrollHeight; y += step) {
      window.scrollTo(0, y);
      await new Promise((r) => setTimeout(r, 120));
    }
    window.scrollTo(0, 0);
  });
  await page.waitForTimeout(900);

  // Full page screenshot
  await page.screenshot({ path: `${OUT}/full-${vp.name}.png`, fullPage: true });

  // Horizontal overflow check
  const overflow = await page.evaluate(
    () => document.documentElement.scrollWidth - document.documentElement.clientWidth,
  );
  if (overflow > 0) issues.push(`[${vp.name}] horizontal overflow: ${overflow}px`);

  // Hero above-fold check: stats band bottom must be within the viewport
  const heroFit = await page.evaluate(() => {
    const hero = document.querySelector("main section");
    if (!hero) return { ok: false, why: "no hero section" };
    const r = hero.getBoundingClientRect();
    return { ok: r.bottom <= window.innerHeight + 2, bottom: r.bottom, vh: window.innerHeight };
  });
  if (!heroFit.ok)
    issues.push(`[${vp.name}] hero exceeds fold: bottom=${heroFit.bottom} vh=${heroFit.vh}`);

  if (errors.length) issues.push(`[${vp.name}] console errors: ${errors.join(" | ")}`);
  await ctx.close();
}

// Link audit + section anchors (desktop)
{
  const ctx = await browser.newContext({ viewport: { width: 1440, height: 900 } });
  const page = await ctx.newPage();
  await page.goto(BASE, { waitUntil: "networkidle" });

  const links = await page.evaluate(() =>
    [...document.querySelectorAll("a[href]")].map((a) => a.getAttribute("href")),
  );
  const wa = links.filter((h) => h.startsWith("https://wa.me/"));
  const badWa = wa.filter((h) => h !== "https://wa.me/23055111364");
  if (badWa.length) issues.push(`malformed WhatsApp links: ${badWa.join(", ")}`);
  info.push(`whatsapp links: ${wa.length}; mailto: ${links.filter((h) => h.startsWith("mailto:")).length}; yealth: ${links.filter((h) => h.includes("yealth.mu")).length}; hash-placeholder: ${links.filter((h) => h === "#").length}`);

  for (const id of ["about", "pathways", "content", "contact"]) {
    const found = await page.evaluate((i) => !!document.getElementById(i), id);
    if (!found) issues.push(`missing anchor target #${id}`);
  }

  // Sticky cards sanity on mobile: ensure projects cards don't overlap badly at 375
  await ctx.close();
}

// Reduced-motion emulation
{
  const ctx = await browser.newContext({
    viewport: { width: 1440, height: 900 },
    reducedMotion: "reduce",
  });
  const page = await ctx.newPage();
  const errors = [];
  page.on("pageerror", (e) => errors.push(String(e)));
  await page.goto(BASE, { waitUntil: "networkidle" });
  await page.waitForTimeout(600);
  await page.screenshot({ path: `${OUT}/reduced-motion-1440.png`, fullPage: true });

  // All key copy must be visible (opacity 1) without motion
  const visible = await page.evaluate(() => {
    const texts = ["HI, I", "PATHWAYS", "PROJECTS", "ABOUT ME"];
    const all = [...document.querySelectorAll("h1,h2,h3,p")];
    return texts.map((t) => {
      const el = all.find((e) => e.textContent.toUpperCase().includes(t));
      if (!el) return { t, ok: false, why: "not found" };
      const cs = getComputedStyle(el);
      const r = el.getBoundingClientRect();
      return { t, ok: +cs.opacity > 0.9 && r.height > 0, opacity: cs.opacity };
    });
  });
  for (const v of visible)
    if (!v.ok) issues.push(`[reduced-motion] "${v.t}" not visible: ${JSON.stringify(v)}`);
  if (errors.length) issues.push(`[reduced-motion] page errors: ${errors.join(" | ")}`);
}

await browser.close();

console.log("INFO:");
for (const i of info) console.log("  " + i);
if (issues.length) {
  console.log("ISSUES:");
  for (const i of issues) console.log("  ✗ " + i);
  process.exit(1);
} else {
  console.log("ALL CHECKS PASSED");
}
