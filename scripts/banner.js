function setupTopBanner(apiKey, containerId, token, options = {}) {
  const { authError } = options;

  if (!apiKey) {
    renderBanner("❌ Error: API key is missing.");
    return;
  }

  if (!containerId) {
    renderBanner("❌ Error: Container ID is missing.");
    return;
  }

  if (!token) {
    renderBanner("❌ Error: User token is missing.");
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
