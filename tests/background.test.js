const { chrome } = global;

let onClickedCallback;

beforeEach(() => {
  jest.resetModules();
  jest.clearAllMocks();
  chrome.action.onClicked.addListener.mockImplementation((cb) => {
    onClickedCallback = cb;
  });
});

function loadBackground() {
  require("../background");
}

const TOKEN = "test-token-abc";
const TAB = { id: 42, title: "My Page", url: "https://example.com/page" };
const EXPECTED_CONTENT = "[My Page](https://example.com/page)";

describe("no API token stored", () => {
  beforeEach(() => {
    chrome.storage.local.get.mockResolvedValue({});
    loadBackground();
  });

  it("opens options page", async () => {
    await onClickedCallback(TAB);
    expect(chrome.runtime.openOptionsPage).toHaveBeenCalled();
  });

  it("does not call fetch", async () => {
    global.fetch = jest.fn();
    await onClickedCallback(TAB);
    expect(global.fetch).not.toHaveBeenCalled();
  });
});

describe("token stored, successful API response", () => {
  beforeEach(() => {
    chrome.storage.local.get.mockResolvedValue({ apiToken: TOKEN });
    global.fetch = jest.fn().mockResolvedValue({ ok: true });
    loadBackground();
  });

  it("posts to Todoist API with correct body", async () => {
    await onClickedCallback(TAB);
    expect(global.fetch).toHaveBeenCalledWith(
      "https://api.todoist.com/api/v1/tasks",
      expect.objectContaining({
        method: "POST",
        body: JSON.stringify({ content: EXPECTED_CONTENT }),
      })
    );
  });

  it("sends correct Authorization header", async () => {
    await onClickedCallback(TAB);
    const [, options] = global.fetch.mock.calls[0];
    expect(options.headers["Authorization"]).toBe(`Bearer ${TOKEN}`);
  });

  it("shows success badge", async () => {
    await onClickedCallback(TAB);
    expect(chrome.action.setBadgeText).toHaveBeenCalledWith(
      expect.objectContaining({ text: "✓", tabId: TAB.id })
    );
  });

  it("shows green badge color", async () => {
    await onClickedCallback(TAB);
    expect(chrome.action.setBadgeBackgroundColor).toHaveBeenCalledWith(
      expect.objectContaining({ color: "#22c55e", tabId: TAB.id })
    );
  });
});

describe("token stored, non-ok API response", () => {
  beforeEach(() => {
    chrome.storage.local.get.mockResolvedValue({ apiToken: TOKEN });
    global.fetch = jest.fn().mockResolvedValue({ ok: false, status: 403 });
    loadBackground();
  });

  it("shows error badge", async () => {
    await onClickedCallback(TAB);
    expect(chrome.action.setBadgeText).toHaveBeenCalledWith(
      expect.objectContaining({ text: "!", tabId: TAB.id })
    );
  });

  it("shows red badge color", async () => {
    await onClickedCallback(TAB);
    expect(chrome.action.setBadgeBackgroundColor).toHaveBeenCalledWith(
      expect.objectContaining({ color: "#ef4444", tabId: TAB.id })
    );
  });
});

describe("token stored, network error", () => {
  beforeEach(() => {
    chrome.storage.local.get.mockResolvedValue({ apiToken: TOKEN });
    global.fetch = jest.fn().mockRejectedValue(new Error("Network failure"));
    loadBackground();
  });

  it("shows error badge", async () => {
    await onClickedCallback(TAB);
    expect(chrome.action.setBadgeText).toHaveBeenCalledWith(
      expect.objectContaining({ text: "!", tabId: TAB.id })
    );
  });

  it("shows red badge color", async () => {
    await onClickedCallback(TAB);
    expect(chrome.action.setBadgeBackgroundColor).toHaveBeenCalledWith(
      expect.objectContaining({ color: "#ef4444", tabId: TAB.id })
    );
  });
});
