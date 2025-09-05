let bannerNotified = false;
function notifyBanner(opts) {
  if (bannerNotified) return;
  bannerNotified = true;
  setupTopBanner(apiKey, containerId, token, opts);
}

function watchAuthFailures() {
  const origFetch = window.fetch;
  window.fetch = async function (input, init) {
    try {
      const res = await origFetch(input, init);
      try {
        const url = typeof input === "string" ? input : input.url;
        if (res && (res.status === 401 || res.status === 403)) {
          const looksLikeAuth = /privacy-center\.org/i.test(url);
          if (looksLikeAuth) {
            notifyBanner({ authError: res.status });
          }
        }
      } catch {}
      return res;
    } catch (e) {
      throw e;
    }
  };

  const OrigXHR = window.XMLHttpRequest;
  function PatchedXHR() {
    const xhr = new OrigXHR();
    xhr.addEventListener("load", function () {
      try {
        if (xhr.status === 401 || xhr.status === 403) {
          const url = xhr.responseURL || "";
          const looksLikeAuth = /privacy-center\.org/i.test(url);
          if (looksLikeAuth) {
            notifyBanner({ authError: xhr.status });
          }
        }
      } catch {}
    });
    return xhr;
  }
  window.XMLHttpRequest = PatchedXHR;
}
