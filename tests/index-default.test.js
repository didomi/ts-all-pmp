require("dotenv").config();

const { test } = require("@playwright/test");
const { buildTestUrl } = require("./buildTestUrl");
const { runDidomiTest } = require("./runDidomiTest");

const API_KEY = process.env.API_KEY;
const CONTAINER_ID = process.env.CONTAINER_ID;
const TOKEN = process.env.TOKEN;

const INVALID_TOKEN = process.env.INVALID_TOKEN;

test.describe("Visibility tests - widget only", () => {
  test.beforeEach(async ({ page }) => {
    page.on("console", (msg) => {
      if (msg.type() === "error") {
        const text = msg.text() || "";
        if (!text.includes("401") && !text.includes("403")) {
          throw new Error(`Console error detected: ${text}`);
        }
      }
    });
  });

  test("widget should NOT be visible when no query parameters are set", async ({
    page,
  }) => {
    const url = buildTestUrl({});
    await runDidomiTest(page, url, false, {
      expectedText:
        "Error: API key, container ID and user token are all missing.",
    });
  });

  test("widget should NOT be visible when API key and container ID are missing", async ({
    page,
  }) => {
    const url = buildTestUrl({ token: TOKEN });
    await runDidomiTest(page, url, false, {
      expectedText: "Error: API key and container ID are missing.",
      hasToken: true,
    });
  });

  test("widget should NOT be visible when API key and user token are missing", async ({
    page,
  }) => {
    const url = buildTestUrl({ containerId: CONTAINER_ID });
    await runDidomiTest(page, url, false, {
      expectedText: "Error: API key and user token are missing.",
      hasContainerId: true,
    });
  });

  test("widget should NOT be visible when container ID and user token are missing", async ({
    page,
  }) => {
    const url = buildTestUrl({ apiKey: API_KEY });
    await runDidomiTest(page, url, false, {
      expectedText: "Error: Container ID and user token are missing.",
      hasApiKey: true,
    });
  });

  test("widget should NOT be visible with missing API key", async ({
    page,
  }) => {
    const url = buildTestUrl({ containerId: CONTAINER_ID, token: TOKEN });
    await runDidomiTest(page, url, false, {
      expectedText: "Error: API key is missing.",
      hasContainerId: true,
      hasToken: true,
    });
  });

  test("widget should NOT be visible with missing container ID", async ({
    page,
  }) => {
    const url = buildTestUrl({ apiKey: API_KEY, token: TOKEN });
    await runDidomiTest(page, url, false, {
      expectedText: "Error: Container ID is missing.",
      hasApiKey: true,
      hasToken: true,
    });
  });

  test("widget should NOT be visible with missing token", async ({ page }) => {
    const url = buildTestUrl({ apiKey: API_KEY, containerId: CONTAINER_ID });
    await runDidomiTest(page, url, false, {
      expectedText: "Error: User token is missing.",
      hasApiKey: true,
      hasContainerId: true,
    });
  });

  test("widget should NOT be visible when apiKey is empty string", async ({
    page,
  }) => {
    const url = buildTestUrl({
      apiKey: "",
      containerId: CONTAINER_ID,
      token: TOKEN,
    });
    await runDidomiTest(page, url, false, {
      expectedText: "Error: API key is missing.",
      hasContainerId: true,
      hasToken: true,
    });
  });

  test("widget should NOT be visible when containerId is empty string", async ({
    page,
  }) => {
    const url = buildTestUrl({
      apiKey: API_KEY,
      containerId: "",
      token: TOKEN,
    });
    await runDidomiTest(page, url, false, {
      expectedText: "Error: Container ID is missing.",
      hasApiKey: true,
      hasToken: true,
    });
  });

  test("widget should NOT be visible when apiKey looks malformed", async ({
    page,
  }) => {
    const url = buildTestUrl({
      apiKey: "bad",
      containerId: CONTAINER_ID,
      token: TOKEN,
    });
    await runDidomiTest(page, url, false, {
      expectedText: "Error: Access is denied.",
      hasApiKey: true,
      hasContainerId: true,
      hasToken: true,
    });
  });

  test("widget should NOT be visible when containerId looks malformed", async ({
    page,
  }) => {
    const url = buildTestUrl({
      apiKey: API_KEY,
      containerId: "not-a-real-id",
      token: TOKEN,
    });
    await runDidomiTest(page, url, false, {
      expectedText: "Error: Access is denied.",
      hasApiKey: true,
      hasContainerId: true,
      hasToken: true,
    });
  });

  test("widget should NOT be visible when auth call returns 401 (invalid or expired token)", async ({
    page,
  }) => {
    const url = buildTestUrl({
      apiKey: API_KEY,
      containerId: CONTAINER_ID,
      token: INVALID_TOKEN,
    });
    await runDidomiTest(page, url, false, {
      expectedText: "Error: User token is either invalid or has expired.",
      hasApiKey: true,
      hasContainerId: true,
      hasToken: true,
    });
  });

  test("widget should be visible with default config (apiKey + containerId + token)", async ({
    page,
  }) => {
    const url = buildTestUrl({
      apiKey: API_KEY,
      containerId: CONTAINER_ID,
      token: TOKEN,
    });
    await runDidomiTest(page, url, true, {
      hasApiKey: true,
      hasContainerId: true,
      hasToken: true,
    });
  });

  test("widget should be visible when token exists in localStorage (no token in URL)", async ({
    page,
  }) => {
    // Save a valid token in localStorage so it's available when the page starts
    await page.addInitScript(
      ([key, val]) => {
        try {
          localStorage.setItem(key, val);
        } catch {}
      },
      ["didomi_auth_token", TOKEN],
    );

    const url = buildTestUrl({ apiKey: API_KEY, containerId: CONTAINER_ID });
    await runDidomiTest(page, url, true, {
      hasApiKey: true,
      hasContainerId: true,
      hasToken: true,
    });
  });
});
