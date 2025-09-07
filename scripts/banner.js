function setupTopBanner(apiKey, containerId, token, options = {}) {
  const { authError } = options;

  const missing = [];
  if (!apiKey) missing.push("API key");
  if (!containerId) missing.push("Container ID");
  if (!token) missing.push("User token");

  if (missing.length > 0) {
    let msg;

    if (missing.length === 3) {
      msg = "❌ Error: API key, container ID and user token are all missing.";
    } else if (missing.length === 2) {
      // Lowercase everything after the first element
      msg =
        "❌ Error: " +
        missing
          .map((field, idx) =>
            idx === 0
              ? field
              : field.replace(/^([A-Z])/, (m) => m.toLowerCase()),
          )
          .join(" and ") +
        " are missing.";
    } else {
      msg = `❌ Error: ${missing[0]} is missing.`; // single one keeps natural casing
    }

    renderBanner(msg);
    return;
  }

  if (authError === 401) {
    renderBanner("❌ Error: User token is either invalid or has expired.");
    return;
  }

  if (authError === 403) {
    renderBanner("❌ Error: Access is denied.");
    return;
  }
}

function renderBanner(content) {
  if (!content) return;

  const banner = document.createElement("div");
  banner.id = "top-banner";
  banner.classList.add("visible");

  banner.innerHTML = content;
  document.body.insertBefore(banner, document.body.firstChild);

  const bannerHeight = banner.offsetHeight;
  document.body.style.paddingTop = `${bannerHeight}px`;
}
