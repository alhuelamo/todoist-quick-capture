const TODOIST_API_BASE = "https://api.todoist.com/api/v1";

const tokenInput = document.getElementById("apiToken");
const saveTokenButton = document.getElementById("save-token");
const tokenStatus = document.getElementById("tokenStatus");
const rulesList = document.getElementById("rules-list");
const addRuleButton = document.getElementById("add-rule");
const saveRulesButton = document.getElementById("save-rules");
const rulesStatus = document.getElementById("rulesStatus");
const loadWarning = document.getElementById("load-warning");

let projects = [];
let labels = [];
let savedRules = [];

chrome.storage.local.get(["apiToken", "rules"]).then(({ apiToken, rules }) => {
  if (apiToken) {
    tokenInput.value = apiToken;
    loadProjectsAndLabels(apiToken).then(() => renderRules(rules || []));
  } else {
    savedRules = rules || [];
    loadWarning.textContent = "Save your API token first to load projects and labels.";
  }
});

saveTokenButton.addEventListener("click", saveToken);
addRuleButton.addEventListener("click", () => addRuleRow());
saveRulesButton.addEventListener("click", saveRules);

function saveToken() {
  const token = tokenInput.value.trim();
  if (!token) {
    showStatus(tokenStatus, "Token cannot be empty.", "#ef4444");
    return;
  }
  chrome.storage.local.set({ apiToken: token }).then(async () => {
    showStatus(tokenStatus, "Saved.", "#22c55e");
    await loadProjectsAndLabels(token);
    renderRules(savedRules);
  });
}

async function loadProjectsAndLabels(token) {
  try {
    const [projectsRes, labelsRes] = await Promise.all([
      fetch(`${TODOIST_API_BASE}/projects`, { headers: { Authorization: `Bearer ${token}` } }),
      fetch(`${TODOIST_API_BASE}/labels`, { headers: { Authorization: `Bearer ${token}` } }),
    ]);
    const projectsData = await projectsRes.json();
    const labelsData = await labelsRes.json();
    projects = Array.isArray(projectsData) ? projectsData : (projectsData.results || []);
    labels = Array.isArray(labelsData) ? labelsData : (labelsData.results || []);
    loadWarning.textContent = "";
  } catch {
    loadWarning.textContent = "Could not load projects/labels. Check your token.";
  }
}

function renderRules(rules) {
  savedRules = rules;
  rulesList.innerHTML = "";
  rules.forEach((rule) => addRuleRow(rule));
}

function addRuleRow(rule = {}) {
  const row = document.createElement("div");
  row.className = "rule-row";

  const urlInput = document.createElement("input");
  urlInput.type = "text";
  urlInput.placeholder = "e.g. github.com";
  urlInput.value = rule.urlSubstring || "";

  const projectSelect = buildSelect(
    [{ id: "", name: "— Inbox —" }, ...projects.map((p) => ({ id: p.id, name: p.name }))],
    rule.projectId || ""
  );

  const labelSelect = buildSelect(
    [{ id: "", name: "— None —" }, ...labels.map((l) => ({ id: l.name, name: l.name }))],
    rule.label || ""
  );

  const deleteButton = document.createElement("button");
  deleteButton.className = "danger";
  deleteButton.textContent = "×";
  deleteButton.addEventListener("click", () => row.remove());

  row.append(urlInput, projectSelect, labelSelect, deleteButton);
  rulesList.appendChild(row);
}

function buildSelect(options, selectedValue) {
  const select = document.createElement("select");
  options.forEach(({ id, name }) => {
    const opt = document.createElement("option");
    opt.value = id;
    opt.textContent = name;
    if (id === selectedValue) opt.selected = true;
    select.appendChild(opt);
  });
  return select;
}

function saveRules() {
  const rows = rulesList.querySelectorAll(".rule-row");
  const rules = Array.from(rows)
    .map((row) => {
      const [urlInput, projectSelect, labelSelect] = row.querySelectorAll("input, select");
      return {
        urlSubstring: urlInput.value.trim(),
        projectId: projectSelect.value,
        label: labelSelect.value,
      };
    })
    .filter((r) => r.urlSubstring);

  chrome.storage.local.set({ rules }).then(() =>
    showStatus(rulesStatus, "Rules saved.", "#22c55e")
  );
}

function showStatus(el, message, color) {
  el.textContent = message;
  el.style.color = color;
}
