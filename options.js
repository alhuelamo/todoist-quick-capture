const tokenInput = document.getElementById("apiToken");
const saveButton = document.getElementById("save");
const statusEl = document.getElementById("status");

chrome.storage.local.get("apiToken").then(({ apiToken }) => {
  if (apiToken) tokenInput.value = apiToken;
});

saveButton.addEventListener("click", saveToken);

function saveToken() {
  const token = tokenInput.value.trim();
  if (!token) {
    showStatus("Token cannot be empty.", "#ef4444");
    return;
  }
  chrome.storage.local.set({ apiToken: token }).then(() => showStatus("Saved.", "#22c55e"));
}

function showStatus(message, color) {
  statusEl.textContent = message;
  statusEl.style.color = color;
}
