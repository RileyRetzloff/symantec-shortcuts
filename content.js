// Listening for messages from background script
chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
    if (request.action === "dismiss_and_advance") {
        dismissAndAdvance();
    } else if (request.action === "download_all_files") {
        downloadAllFiles();
    } else if (request.action === "click_back_button") {
        clickBackButton();
    } else if (request.action === "openShortcutMenu") {
        openShortcutMenu();
    }
});

// Automating "Next Incident" button click
function nextIncident() {
    const nextIncidentButton = document.querySelector("a#nextIncidentButton");

    if (nextIncidentButton) {
        nextIncidentButton.click();
        console.log("Next Incident button clicked!");
    } else {
        console.log("Next Incident button not found.");
    }
}

// Automating "Previous Incident" button click
function previousIncident() {
    const previousIncidentButton = document.querySelector(
        "a#previousIncidentButton"
    );

    if (previousIncidentButton) {
        previousIncidentButton.click();
        console.log("Previous Incident button clicked!");
    } else {
        console.log("Previous Incident button not found.");
    }
}

// Automating the download of all files in the list with error handling
function downloadAllFiles() {
    const fileLinks = document.querySelectorAll("a[download]");

    if (fileLinks.length > 0) {
        fileLinks.forEach((fileLink) => {
            const fileName = fileLink.title || fileLink.innerText;

            if (fileName.includes("'") || fileName.includes(",")) {
                console.warn(
                    `Warning: File "${fileName}" contains a single quote or comma, which may cause the download to fail.`
                );
                alert(
                    `The file "${fileName}" contains a single quote or comma and may not download correctly. Please download it manually if needed.`
                );
            }

            try {
                fileLink.click();
                console.log(`Downloading file: ${fileName}`);
            } catch (error) {
                console.error(`Failed to download file: ${fileName}`, error);
                alert(
                    `Failed to download the file "${fileName}". Please download it manually.`
                );
            }
        });
    } else {
        console.log("No files found for download.");
    }
}

// Function to set incident status to "Dismissed"
function setDismissed() {
    const statusDropdown = document.querySelector(
        ".ng-tns-c97-3.incident-snapshot-header-dropdown.ui-multiselect"
    );

    if (!statusDropdown) {
        console.log("Status dropdown not found");
        return false;
    }

    statusDropdown.click();
    console.log("Clicked status dropdown");

    return new Promise((resolve) => {
        setTimeout(() => {
            const dismissOption = document.querySelector(
                'div[title="Dismissed"]'
            );

            if (!dismissOption) {
                console.log("Dismiss option not found");
                resolve(false);
                return;
            }

            const dismissListItem = dismissOption.previousElementSibling;

            if (!dismissListItem) {
                console.log("Dismiss list item not found");
                resolve(false);
                return;
            }

            dismissListItem.click();
            console.log("Clicked Dismiss option");
            resolve(true);
        }, 500);
    });
}

// Dismiss current incident and advance
async function dismissAndAdvance() {
    const statusUpdated = await setDismissed();

    if (!statusUpdated) {
        console.error("Failed to update status to Dismissed");
        return;
    }

    setTimeout(() => {
        localStorage.setItem("runDownloadOnLoad", "true");
        nextIncident();
    }, 1000);
}

// Checking if download should run on page load
window.addEventListener("load", () => {
    const shouldRunDownload = localStorage.getItem("runDownloadOnLoad");

    if (shouldRunDownload === "true") {
        localStorage.removeItem("runDownloadOnLoad");
        console.log("Running downloadAllFiles after page load");
        downloadAllFiles();
    }
});

// Automating "Back" button click
function clickBackButton() {
    const backButton = document.querySelector("a.back-button");

    if (backButton) {
        backButton.click();
        console.log("Back button clicked!");
    } else {
        console.log("Back button not found.");
    }
}

// Function to create and display the "More Shortcuts" menu overlay
function openShortcutMenu() {
    console.log(
        "Shortcut menu activated. Press a number key to choose an action."
    );

    // Create overlay container
    const overlay = document.createElement("div");
    overlay.style.position = "fixed";
    overlay.style.top = "0";
    overlay.style.left = "0";
    overlay.style.width = "100%";
    overlay.style.height = "100%";
    overlay.style.backgroundColor = "rgba(0, 0, 0, 0.5)";
    overlay.style.display = "flex";
    overlay.style.alignItems = "center";
    overlay.style.justifyContent = "center";
    overlay.style.zIndex = "1000";

    // Create menu box
    const menuBox = document.createElement("div");
    menuBox.style.backgroundColor = "#f5f5f5";
    menuBox.style.padding = "20px";
    menuBox.style.borderRadius = "8px";
    menuBox.style.boxShadow = "0 4px 8px rgba(0, 0, 0, 0.2)";
    menuBox.style.fontFamily = "'IBM Plex Mono', monospace";
    menuBox.style.minWidth = "300px";
    menuBox.style.position = "relative";

    // Title
    const title = document.createElement("h2");
    title.innerText = "More Shortcuts";
    title.style.color = "#4a4057";
    title.style.marginBottom = "16px";
    menuBox.appendChild(title);

    // Instructional Text
    const instructions = document.createElement("p");
    instructions.innerText = "Press a number key or Escape to close";
    instructions.style.color = "#888";
    instructions.style.fontSize = "12px";
    instructions.style.fontStyle = "italic";
    instructions.style.marginBottom = "16px";
    menuBox.appendChild(instructions);

    // Close button (X)
    const closeButton = document.createElement("span");
    closeButton.innerText = "X";
    closeButton.style.position = "absolute";
    closeButton.style.top = "10px";
    closeButton.style.right = "10px";
    closeButton.style.cursor = "pointer";
    closeButton.style.color = "#666";
    closeButton.style.fontSize = "14px";
    closeButton.onclick = () => closeMenu();
    menuBox.appendChild(closeButton);

    // Shortcut rows
    const shortcuts = [
        { key: "1", description: "Next Incident" },
        { key: "2", description: "Previous Incident" },
        { key: "3", description: "Placeholder Action" },
    ];

    shortcuts.forEach((shortcut) => {
        const row = document.createElement("div");
        row.className = "shortcut-row";
        row.style.display = "flex";
        row.style.alignItems = "center";
        row.style.marginBottom = "12px";

        const keyElem = document.createElement("span");
        keyElem.className = "key character";
        keyElem.innerText = shortcut.key;
        keyElem.style.background =
            "linear-gradient(to bottom, #c2b5dd 0%, #b3a4d4 100%)";
        keyElem.style.color = "#4a4057";
        keyElem.style.marginRight = "8px";
        keyElem.style.padding = "6px 10px";
        keyElem.style.borderRadius = "4px";
        keyElem.style.fontWeight = "500";

        const descriptionElem = document.createElement("span");
        descriptionElem.innerText = shortcut.description;
        descriptionElem.style.color = "#444";

        row.appendChild(keyElem);
        row.appendChild(descriptionElem);
        menuBox.appendChild(row);
    });

    // Append menuBox to overlay
    overlay.appendChild(menuBox);
    document.body.appendChild(overlay);

    // Function to close the menu
    function closeMenu() {
        document.body.removeChild(overlay);
        window.removeEventListener("keydown", handleMenuShortcut);
        window.removeEventListener("keydown", closeOnEscape);
    }

    // Close menu on Escape key
    function closeOnEscape(event) {
        if (event.key === "Escape") {
            closeMenu();
        }
    }

    window.addEventListener("keydown", closeOnEscape);

    // Handle number key shortcuts for menu actions
    function handleMenuShortcut(event) {
        switch (event.key) {
            case "1":
                nextIncident();
                break;
            case "2":
                previousIncident();
                break;
            case "3":
                console.log("Placeholder action triggered");
                break;
            default:
                console.log("No action assigned to this key.");
        }
        closeMenu();
    }

    // Listen for a number key press to trigger an action
    window.addEventListener("keydown", handleMenuShortcut);
}
