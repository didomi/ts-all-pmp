const { expect } = require("@playwright/test");

const TIMEOUT = 5000;

/**
 * Reusable SDK readiness + widget visibility test
 *
 * @param {import('@playwright/test').Page} page
 * @param {string} testUrl
 * @param {boolean} expectVisible - should the widget render content?
 * @param {object} options
 * @param {string|null} options.expectedText - text expected in #top-banner (error/info)
 * @param {boolean} [options.hasApiKey=false] - if true, we wait for SDK readiness
 * @param {boolean} [options.hasContainerId=false] - if true, we also expect a didomi-container to be present
 * @param {boolean} [options.hasToken=false] - if true, we also expect a token to be present
 * @param {string} [options.commitHash] - if provided, verify window.didomiConfig.app.sdkVersion
 */
async function runDidomiTest(
  page,
  testUrl,
  expectVisible = true,
  options = {},
) {
  const {
    expectedText = null,
    hasApiKey = false,
    hasContainerId = false,
    hasToken = false,
    commitHash,
  } = options;
  console.log("Test URL:", testUrl);
  await page.goto(testUrl);

  const url = new URL(testUrl);
  const apiKey = url.searchParams.get("apiKey");
  const containerId = url.searchParams.get("containerId");
  const token = url.searchParams.get("token");

  // If we expect correct params, wait for SDK readiness
  if (hasApiKey && hasContainerId && hasToken) {
    // didomiOnReady (if present)
    await page.evaluate(
      () =>
        new Promise((resolve) => {
          window.didomiOnReady = window.didomiOnReady || [];
          window.didomiOnReady.push(() => resolve());
        }),
      { timeout: TIMEOUT },
    );

    // Ensure Didomi SDK is loaded
    await page.waitForFunction(
      () => typeof window.Didomi !== "undefined",
      null,
      {
        timeout: TIMEOUT,
      },
    );
  }

  // If a commit hash was provided, confirm it was applied to didomiConfig
  if (commitHash) {
    const applied = await page.evaluate(
      () => window.didomiConfig?.app?.sdkVersion || null,
    );
    expect(applied).toBe(commitHash);
  }

  // If we have an API key, a container ID and a token, ensure the <didomi-container> exists
  if (apiKey && containerId && token) {
    await page.waitForSelector(`didomi-container#${containerId}`, {
      state: "attached",
      timeout: TIMEOUT,
    });
  }

  // Helper to detect if widget has rendered content in the container
  async function containerHasContent() {
    if (!containerId) return false;
    return await page.evaluate((id) => {
      const el = document.getElementById(id);
      if (!el || el.tagName.toLowerCase() !== "didomi-container") return false;

      // Check both light DOM and Shadow DOM for rendered content
      const light = el.childElementCount > 0;
      const shadow = !!el.shadowRoot && el.shadowRoot.childElementCount > 0;
      return light || shadow;
    }, containerId);
  }

  if (expectVisible) {
    // Wait until the container shows content
    await page.waitForFunction(
      (id) => {
        const el = document.getElementById(id);
        if (!el || el.tagName.toLowerCase() !== "didomi-container")
          return false;
        const light = el.childElementCount > 0;
        const shadow = !!el.shadowRoot && el.shadowRoot.childElementCount > 0;
        return light || shadow;
      },
      containerId,
      { timeout: TIMEOUT },
    );
    expect(await containerHasContent()).toBe(true);
  } else {
    // Ensure no content is rendered
    let exists = false;
    try {
      exists = (await page.$(`didomi-container#${containerId}`)) !== null;
    } catch {
      exists = false;
    }
    if (exists) {
      await page.waitForTimeout(300);
      expect(await containerHasContent()).toBe(false);
    } else {
      expect(true).toBe(true); // container absent => not visible
    }
  }

  // Banner assertions (for error/info messages)
  const banner = page.locator("#top-banner");
  if (expectedText) {
    await expect(banner).toBeVisible({ timeout: TIMEOUT });
    const bannerText = await banner.innerText();
    expect(bannerText).toContain(expectedText);
  } else {
    await expect(banner).toHaveCount(0);
  }
}

module.exports = { runDidomiTest };
