const TODOIST_API_URL = "https://api.todoist.com/api/v1/tasks";
const BADGE_CLEAR_DELAY_MS = 2000;

chrome.action.onClicked.addListener(handleActionClick);

async function handleActionClick(tab) {
  const { token, rules } = await loadSettings();
  if (!token) {
    chrome.runtime.openOptionsPage();
    return;
  }
  await captureTab(tab, token, rules);
}

async function loadSettings() {
  const { apiToken, rules } = await chrome.storage.local.get(["apiToken", "rules"]);
  return { token: apiToken || null, rules: rules || [] };
}

function applyRule(url, rules) {
  const match = rules.find((r) => url.includes(r.urlSubstring));
  if (!match) return {};
  const extras = {};
  if (match.projectId) extras.project_id = match.projectId;
  if (match.label) extras.labels = [match.label];
  return extras;
}

async function captureTab(tab, token, rules) {
  const content = `[${tab.title}](${tab.url})`;
  const extras = applyRule(tab.url, rules);
  try {
    const response = await fetch(TODOIST_API_URL, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${token}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ content, ...extras }),
    });
    if (!response.ok) throw new Error(`HTTP ${response.status}`);
    showBadge(tab.id, "✓", "#22c55e");
  } catch {
    showBadge(tab.id, "!", "#ef4444");
  }
}

function showBadge(tabId, text, color) {
  chrome.action.setBadgeText({ text, tabId });
  chrome.action.setBadgeBackgroundColor({ color, tabId });
  setTimeout(() => chrome.action.setBadgeText({ text: "", tabId }), BADGE_CLEAR_DELAY_MS);
}

if (typeof module !== "undefined") module.exports = { applyRule };
