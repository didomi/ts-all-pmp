require("dotenv").config();

const { test } = require("@playwright/test");

const { buildTestUrl } = require("./buildTestUrl");
const { runDidomiTest } = require("./runDidomiTest");

const API_KEY = process.env.API_KEY;
const CONTAINER_ID = process.env.CONTAINER_ID;
const TOKEN = process.env.TOKEN;

test.describe("Widget + didomiConfig behavior", () => {
  test.beforeEach(async ({ page }) => {
    page.on("console", (msg) => {
      if (msg.type() === "error") {
        const text = msg.text() || "";
        throw new Error(`Console error detected: ${text}`);
      }
    });
  });

  test("widget should be visible when config explicitly applied (valid base64)", async ({
    page,
  }) => {
    const customConf = { components: { version: 2 }, widgets: [] };
    const url = buildTestUrl({
      apiKey: API_KEY,
      containerId: CONTAINER_ID,
      token: TOKEN,
      apply_conf: "1",
      config: Buffer.from(JSON.stringify(customConf)).toString("base64"),
    });
    await runDidomiTest(page, url, true, {
      hasApiKey: true,
      hasContainerId: true,
      hasToken: true,
    });
  });

  test("widget should be visible if config param is invalid base64 (ignored)", async ({
    page,
  }) => {
    const url = buildTestUrl({
      apiKey: API_KEY,
      containerId: CONTAINER_ID,
      token: TOKEN,
      apply_conf: "1",
      config: "invalid-base64",
    });
    await runDidomiTest(page, url, true, {
      hasApiKey: true,
      hasContainerId: true,
      hasToken: true,
    });
  });

  test("widget should be visible and should ignore config if toggle apply_conf=0", async ({
    page,
  }) => {
    const url = buildTestUrl({
      apiKey: API_KEY,
      containerId: CONTAINER_ID,
      token: TOKEN,
      config: Buffer.from(JSON.stringify({ some: "override" })).toString(
        "base64",
      ),
      apply_conf: "0",
    });
    await runDidomiTest(page, url, true, {
      hasApiKey: true,
      hasContainerId: true,
      hasToken: true,
    });
  });
});
