# PMP Widget Debugger

The website [https://didomi.github.io/ts-all-pmp](https://didomi.github.io/ts-all-pmp) lets you test, share, and troubleshoot **Didomi PMP widgets**.

## 🔧 How to Use

1. Open the page with the required query parameters in the URL:
2. Modify the inputs or JSON config directly in the floating settings panel.
3. The URL updates automatically — copy & share it to reproduce your setup.
4. Use the ⚙️ launcher button to reopen the settings panel at any time.

## 🌐 Supported Query Parameters

| Parameter     | Description                                                                 |
| ------------- | --------------------------------------------------------------------------- |
| `apiKey`      | **Required.** Public API key used for the Didomi SDK                        |
| `containerId` | **Required.** ID of the `<didomi-container>` where the PMP widget is loaded |
| `token`       | **Required.** User token, persisted to `localStorage`                       |
| `commit_hash` | Git commit hash, used for debugging or testing purposes                     |
| `staging`     | If set to `1`, loads the SDK from the staging environment                   |
| `preprod`     | If set to `1`, loads the SDK from the pre-production environment            |
| `config`      | Base64-encoded JSON used for the `didomiConfig`                             |
| `apply_conf`  | If set to `1`, applies the decoded `didomiConfig` on page load              |

## 📦 Example

```
https://didomi.github.io/ts-all-pmp/?apiKey=7dd8ec4e-xxx-yyyy-a610-xxxxx&containerId=xxxx&token=user-token-123
```
