// Listening for messages from background script
chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
    if (request.action === "dismiss_advance_download") {
        dismissAdvanceDownload();
    } else if (request.action === "download_all_files") {
        downloadAllFiles();
    } else if (request.action === "click_back_button") {
        clickBackButton();
    } else if (request.action === "next_incident") {
        nextIncident();
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

// Automating the download of all files in the list with error handling
function downloadAllFiles() {
    const fileLinks = document.querySelectorAll("a[download]");

    if (fileLinks.length > 0) {
        fileLinks.forEach((fileLink) => {
            const fileName = fileLink.title || fileLink.innerText;

            if (fileName.includes("'") || fileName.includes(",")) {
                console.warn(
                    `Warning: File "${fileName}" contains a single quote (') or comma (,), which may cause the download to fail.`
                );
                alert(
                    `The file "${fileName}" contains a single quote (') or comma (,) and may not download correctly. Please download it manually if needed.`
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

// Dismiss current incident, advance to next, & begin downloading attachments
async function dismissAdvanceDownload() {
    const statusUpdated = await setDismissed();

    if (!statusUpdated) {
        console.error("Failed to update status to Dismissed");
        return;
    }

    setTimeout(() => {
        localStorage.setItem("runDownloadOnLoad", "true");
        nextIncident();
    }, 500);
}

// Checking if download should run on page load with a delay
window.addEventListener("load", () => {
    const shouldRunDownload = localStorage.getItem("runDownloadOnLoad");

    if (shouldRunDownload === "true") {
        localStorage.removeItem("runDownloadOnLoad");
        console.log("Waiting briefly before running downloadAllFiles...");

        setTimeout(() => {
            downloadAllFiles();
        }, 1000); // Adjust the delay time if necessary
    }
});
