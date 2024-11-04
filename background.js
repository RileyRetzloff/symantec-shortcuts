// Send message from the background script to the content script when keystroke is triggered
chrome.commands.onCommand.addListener((command) => {
    chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
        const tab = tabs[0];
        if (
            tab &&
            tab.url &&
            tab.url.includes("https://dlpconsole-ha.iglbh.tiaa-cref.org/")
        ) {
            let action = "";

            if (command === "click_back_button") {
                action = "click_back_button";
            } else if (command === "next_incident") {
                action = "next_incident";
            } else if (command === "previous_incident") {
                action = "previous_incident";
            } else if (command === "download_all_files") {
                action = "download_all_files";
            }

            if (action) {
                chrome.tabs.sendMessage(tab.id, { action: action });
            }
        } else {
            console.error(
                "Tab URL does not match the expected Symantec base URL."
            );
        }
    });
});

// Open shortcuts.html in new tab when the extension is first installed
chrome.runtime.onInstalled.addListener((details) => {
    if (details.reason === "install") {
        chrome.tabs.create({ url: chrome.runtime.getURL("shortcuts.html") });
    }
});
