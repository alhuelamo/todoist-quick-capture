const TODOIST_API_URL = "https://api.todoist.com/api/v1/tasks";
const BADGE_CLEAR_DELAY_MS = 2000;

chrome.action.onClicked.addListener(handleActionClick);

async function handleActionClick(tab) {
  const token = await loadToken();
  if (!token) {
    chrome.runtime.openOptionsPage();
    return;
  }
  await captureTab(tab, token);
}

async function loadToken() {
  const { apiToken } = await chrome.storage.sync.get("apiToken");
  return apiToken || null;
}

async function captureTab(tab, token) {
  const content = `[${tab.title}](${tab.url})`;
  try {
    const response = await fetch(TODOIST_API_URL, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${token}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ content }),
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
