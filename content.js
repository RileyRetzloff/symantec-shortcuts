// Listening for messages from background script
chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
    if (request.action === "next_incident") {
        nextIncident();
    } else if (request.action === "previous_incident") {
        previousIncident();
    } else if (request.action === "download_all_files") {
        downloadAllFiles();
    } else if (request.action === "click_back_button") {
        clickBackButton();
    } else if (request.action === "dismiss_and_advance") {
        dismissAndAdvance();
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
    // Select all <a> elements that have the download attribute
    const fileLinks = document.querySelectorAll("a[download]");

    if (fileLinks.length > 0) {
        fileLinks.forEach((fileLink) => {
            const fileName = fileLink.title || fileLink.innerText;

            // Check if the file name contains problematic characters (', or ,)
            if (fileName.includes("'") || fileName.includes(",")) {
                console.warn(
                    `Warning: File "${fileName}" contains a single quote or comma, which may cause the download to fail.`
                );
                alert(
                    `The file "${fileName}" contains a single quote or comma and may not download correctly. Please download it manually if needed.`
                );
            }

            // Simulate a click on the file link to start the download
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

    // Waiting for the dropdown options to appear in the DOM
    return new Promise((resolve) => {
        // Giving dropdown time to open and render options
        setTimeout(() => {
            // Finding Dismiss option by looking for the title attribute
            const dismissOption = document.querySelector(
                'div[title="Dismissed"]'
            );

            if (!dismissOption) {
                console.log("Dismiss option not found");
                resolve(false);
                return;
            }

            // Finding clickable sibling element and clicking it
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

// 1. Calling setDismissed for current incident
// 2. Setting runDownloadOnLoad flag to "true"
// 3. Calling nextIncident to navigate to next incident
async function dismissAndAdvance() {
    const statusUpdated = await setDismissed();

    if (!statusUpdated) {
        console.error("Failed to update status to Dismissed");
        return;
    }

    setTimeout(() => {
        // Set a flag in local storage or a variable that persists through page reloads
        localStorage.setItem("runDownloadOnLoad", "true");
        nextIncident();
    }, 1000);
}

// Checking whether runDownloadOnLoad flag set to "true" on page load
window.addEventListener("load", () => {
    const shouldRunDownload = localStorage.getItem("runDownloadOnLoad");

    if (shouldRunDownload === "true") {
        // Clear the flag to avoid repeated downloads
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
