require("dotenv").config();

const { test } = require("@playwright/test");

const { buildTestUrl } = require("./buildTestUrl");
const { runDidomiTest } = require("./runDidomiTest");

const API_KEY = process.env.API_KEY;
const CONTAINER_ID = process.env.CONTAINER_ID;
const TOKEN = process.env.TOKEN;

const COMMIT_HASH = process.env.COMMIT_HASH;

const STAGING_API_KEY = process.env.STAGING_API_KEY;
const STAGING_CONTAINER_ID = process.env.STAGING_CONTAINER_ID;
const STAGING_TOKEN = process.env.STAGING_TOKEN;

test.describe("Visibility tests - widget + dev", () => {
  test.beforeEach(async ({ page }) => {
    let currentUrl = "";
    page.on("request", (request) => {
      const url = request.url();
      if (!currentUrl) currentUrl = url;
    });

    page.on("console", (msg) => {
      if (msg.type() === "error") {
        const text = msg.text() || "";
        throw new Error(`Console error detected: ${text}`);
      }
    });
  });

  test("widget should NOT be visible on staging when containerId is missing", async ({
    page,
  }) => {
    const url = buildTestUrl({
      apiKey: STAGING_API_KEY,
      token: STAGING_TOKEN,
      staging: "1",
    });
    await runDidomiTest(page, url, false, {
      expectedText: "Error: Container ID is missing.",
      hasApiKey: true,
      hasToken: true,
    });
  });

  test("widget should be visible on staging with staging apiKey + containerId + token", async ({
    page,
  }) => {
    const url = buildTestUrl({
      apiKey: STAGING_API_KEY,
      containerId: STAGING_CONTAINER_ID,
      token: STAGING_TOKEN,
      staging: "1",
    });
    await runDidomiTest(page, url, true, {
      hasApiKey: true,
      hasContainerId: true,
      hasToken: true,
    });
  });

  test("widget should be visible when loading from preprod environment", async ({
    page,
  }) => {
    const url = buildTestUrl({
      apiKey: API_KEY,
      containerId: CONTAINER_ID,
      token: TOKEN,
      preprod: "1",
    });
    await runDidomiTest(page, url, true, {
      hasApiKey: true,
      hasContainerId: true,
      hasToken: true,
    });
  });

  test("widget should be visible with a valid commit hash only and no config", async ({
    page,
  }) => {
    const url = buildTestUrl({
      apiKey: API_KEY,
      containerId: CONTAINER_ID,
      token: TOKEN,
      commit_hash: COMMIT_HASH,
    });
    await runDidomiTest(page, url, true, {
      hasApiKey: true,
      hasContainerId: true,
      hasToken: true,
      commitHash: COMMIT_HASH,
    });
  });

  test("widget should be visible with a valid commit hash set in didomiConfig via `apply_conf=1`", async ({
    page,
  }) => {
    const url = buildTestUrl({
      apiKey: API_KEY,
      containerId: CONTAINER_ID,
      token: TOKEN,
      apply_conf: "1",
      config: Buffer.from(
        JSON.stringify({
          app: { sdkVersion: COMMIT_HASH },
        }),
      ).toString("base64"),
    });
    await runDidomiTest(page, url, true, {
      hasApiKey: true,
      hasContainerId: true,
      hasToken: true,
      commitHash: COMMIT_HASH,
    });
  });

  test("widget should be visible with an invalid commit hash set in didomiConfig", async ({
    page,
  }) => {
    const url = buildTestUrl({
      apiKey: API_KEY,
      containerId: CONTAINER_ID,
      token: TOKEN,
      apply_conf: "1",
      config: Buffer.from(
        JSON.stringify({
          app: { sdkVersion: "invalid_commit_hash" },
        }),
      ).toString("base64"),
    });
    await runDidomiTest(page, url, true, {
      hasApiKey: true,
      hasContainerId: true,
      hasToken: true,
    });
  });
});
