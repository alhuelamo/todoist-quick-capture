# Todoist Quick Capture

A minimal Chrome and Firefox extension to instantly add the current page to your Todoist Inbox. Click the toolbar button (or press `Alt+T`) and the task is created — no popup, no delay.

The task content is formatted as `[Page Title](url)`.

## Requirements

- A [Todoist](https://todoist.com) account
- A Todoist API token — find it at **Settings → Integrations → Developer**
- Chrome 88+ or Firefox 109+

## Installation

This extension is not published to any store. Load it manually as an unpacked extension.

### Chrome

1. Open `chrome://extensions`
2. Enable **Developer mode** (top-right toggle)
3. Click **Load unpacked** and select this repo's directory

### Firefox

1. Open `about:debugging`
2. Click **This Firefox**
3. Click **Load Temporary Add-on** and select `manifest.json` from this repo

> Note: Firefox removes temporary add-ons on restart. To make it permanent you'd need to sign it via [Mozilla Add-on Hub](https://addons.mozilla.org/developers/).

## Setup

On first click, the extension opens the settings page. Paste your Todoist API token and click **Save**.

To reopen settings later: right-click the toolbar icon → **Options** (Chrome) or **Manage Extension → Preferences** (Firefox).

## Rules

Rules let you automatically assign a **project** and/or **label** to a task based on the URL of the page being captured.

Open the settings page and scroll to the **Rules** section. Each rule has three fields:

| Field | Description |
|---|---|
| URL contains | A substring matched against the full URL (e.g. `github.com`, `notion.so`) |
| Project | The Todoist project to assign the task to. Leave blank for Inbox. |
| Label | A label to apply. Leave blank for none. |

Rules are evaluated top to bottom — the **first match wins**. Rows with an empty URL field are ignored.

Projects and labels are loaded from your Todoist account when the settings page opens (requires a valid API token to be saved first).

## Development

```sh
yarn install
yarn test
```
