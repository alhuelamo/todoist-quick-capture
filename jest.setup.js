Object.assign(global, require("jest-chrome"));

global.chrome.action = {
  onClicked: {
    addListener: jest.fn(),
  },
  setBadgeText: jest.fn(),
  setBadgeBackgroundColor: jest.fn(),
};
