const params = new URL(document.location.href).searchParams;
const textArea = document.getElementsByTagName("textarea")[0];

const token = params.get("token");
const apiKey = params.get("apiKey");
const containerId = params.get("containerId");
const config = params.get("config");

const preprod = Boolean(parseInt(params.get("preprod")));
const staging = Boolean(parseInt(params.get("staging")));
const commitHash = params.get("commit_hash");

const panel = document.getElementById("container");
const launcher = document.getElementById("launcher");
const closeBtn = document.getElementById("close-panel");

const PANEL_HIDDEN_KEY = "pmp_panel_hidden";

/* Panel visibility helpers */
function showPanel() {
  panel.classList.remove("hidden");
  launcher.style.display = "none";
  try {
    localStorage.setItem(PANEL_HIDDEN_KEY, "0");
  } catch {}
}
function hidePanel() {
  panel.classList.add("hidden");
  launcher.style.display = "flex";
  try {
    localStorage.setItem(PANEL_HIDDEN_KEY, "1");
  } catch {}
}
launcher.addEventListener("click", showPanel);
closeBtn.addEventListener("click", hidePanel);

/* ESC closes the panel if focused */
document.addEventListener("keydown", (e) => {
  if (e.key === "Escape") hidePanel();
});

/**
 * Ensure a <didomi-container> node exists in the DOM with the given id.
 * Must be appended before loading the SDK.
 */
function ensureDidomiContainer(id) {
  if (!id) return null;

  // reuse if already present
  const existing = document.getElementById(id);
  if (existing && existing.tagName.toLowerCase() === "didomi-container") {
    return existing;
  }
  if (existing) existing.remove();

  const el = document.createElement("didomi-container");
  el.id = id;
  document.body.appendChild(el);
  return el;
}

/* Build SDK URL based on env flags (staging / preprod) */
function getSdkBaseHost() {
  if (preprod) return "https://sdk-preprod.privacy-center.org";
  if (staging) return "https://sdk.staging.privacy-center.org";
  return "https://sdk.privacy-center.org";
}
function getSdkUrl() {
  return `${getSdkBaseHost()}/v2/loader.js`;
}

function setCheckedStatus(el) {
  const toggleContainer = el.closest(".toggle_container");
  if (toggleContainer) {
    toggleContainer.setAttribute("data-checked", el.checked ? "true" : "false");
  }
}

Array.from(document.querySelectorAll("input")).forEach((input) => {
  input.addEventListener("keyup", updateUrl);
  input.addEventListener("change", (e) => {
    setCheckedStatus(e.target);
    updateUrl();
  });
});

if (textArea) {
  textArea.addEventListener("keyup", () => {
    updateUrl();
    if (isJSONvalid(textArea.value)) {
      textArea.classList.remove("invalid");
    } else {
      textArea.classList.add("invalid");
    }
  });
}

function updateUrl() {
  let qp = Array.from(document.querySelectorAll('[type="text"][data-qp]'))
    .map(
      (el) => el.getAttribute("data-qp") + "=" + encodeURIComponent(el.value),
    )
    .join("&");

  qp +=
    "&" +
    Array.from(document.querySelectorAll('[type="checkbox"][data-qp]'))
      .map((el) => el.getAttribute("data-qp") + "=" + (el.checked ? "1" : "0"))
      .join("&");

  if (textArea && isJSONvalid(textArea.value)) {
    let jsonStr = textArea.value.replace(/\s\s+/g, " ");
    qp += "&config=" + btoa(jsonStr);
  }

  const newurl =
    window.location.protocol +
    "//" +
    window.location.host +
    window.location.pathname +
    "?" +
    qp;
  window.history.pushState({ path: newurl }, "", newurl);
}

function isValidBase64(str) {
  if (typeof str !== "string") return false;
  if (str.length % 4 !== 0) return false;
  return /^[A-Za-z0-9+/]+={0,2}$/.test(str);
}

function updateInputs() {
  Array.from(document.querySelectorAll('[type="text"][data-qp]')).forEach(
    (input) => {
      input.value =
        new URL(document.location.href).searchParams.get(
          input.getAttribute("data-qp"),
        ) || "";
    },
  );

  Array.from(document.querySelectorAll('[type="checkbox"][data-qp]')).forEach(
    (input) => {
      input.checked = Boolean(
        parseInt(
          new URL(document.location.href).searchParams.get(
            input.getAttribute("data-qp"),
          ),
        ),
      );
      setCheckedStatus(input);
    },
  );

  if (config && isValidBase64(config) && textArea) {
    textArea.value = atob(config);
    prettyPrint();
  }
}

/* Custom JSON */
function prettyPrint() {
  const ugly = textArea.value;
  const obj = JSON.parse(ugly);
  textArea.value = JSON.stringify(obj, undefined, 2);
}

function isJSONvalid(text) {
  try {
    JSON.parse(text);
    return true;
  } catch {
    return false;
  }
}

window.onload = function () {
  const isHidden = localStorage.getItem(PANEL_HIDDEN_KEY) === "1";

  if (isHidden) {
    launcher.style.display = "flex";
  } else {
    panel.classList.remove("hidden");
    launcher.style.display = "none";
  }

  if (config && parseInt(params.get("apply_conf")) && isValidBase64(config)) {
    window.didomiConfig = JSON.parse(atob(config));
  }

  if (apiKey && containerId && token) {
    updateInputs();

    window.didomiConfig = window.didomiConfig || {};
    window.didomiConfig.apiKey = apiKey;
    window.didomiConfig.app = {
      ...(window.didomiConfig.app || {}),
      apiKey,
    };

    if (commitHash) {
      window.didomiConfig.app.sdkVersion = commitHash;
    }

    window.didomiConfig.components = { version: 2 };
    window.didomiConfig.widgets = [];

    // PMP user token
    try {
      if (token) localStorage.setItem("didomi_auth_token", token);
    } catch {}

    // Ensure container exists before loading the SDK
    ensureDidomiContainer(containerId);

    // Load Didomi SDK from correct env
    if (!document.getElementById("didomi-loader")) {
      const script = document.createElement("script");
      script.id = "didomi-loader";
      script.type = "text/javascript";
      script.async = true;
      script.charset = "utf-8";
      script.src = getSdkUrl();
      document.body.appendChild(script);
    }

    watchAuthFailures();
  }

  Array.from(document.querySelectorAll('[type="checkbox"][data-qp]')).forEach(
    setCheckedStatus,
  );

  setupTopBanner(apiKey, containerId, token);
};
