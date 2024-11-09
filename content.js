// Listening for messages from background script
chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
    if (request.action === "dismiss_advance_download") {
        dismissAdvanceDownload();
    } else if (request.action === "next_incident") {
        nextIncident();
    } else if (request.action === "download_all_files") {
        downloadAllFiles();
    } else if (request.action === "click_back_button") {
        clickBackButton();
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

// Optimized function automating download of all files in the incident with error handling
async function downloadAllFiles() {
    const fileLinks = Array.from(document.querySelectorAll("a[download]"));
    const problematicFiles = [];

    if (fileLinks.length > 0) {
        // Map each file download into a promise for simultaneous processing
        const downloadPromises = fileLinks.map((fileLink) => {
            const fileName = fileLink.title || fileLink.innerText;

            // Track problematic files for a single alert
            if (fileName.includes("'") || fileName.includes(",")) {
                problematicFiles.push(fileName);
            }

            return new Promise((resolve, reject) => {
                try {
                    fileLink.click();
                    console.log(`Downloading file: ${fileName}`);
                    resolve(fileName);
                } catch (error) {
                    console.error(
                        `Failed to download file: ${fileName}`,
                        error
                    );
                    reject(fileName);
                }
            });
        });

        // Wait for all downloads to attempt completion
        await Promise.allSettled(downloadPromises);

        // Show a single alert if there are problematic files
        if (problematicFiles.length > 0) {
            alert(
                `The following files contain single quotes or commas, which may cause download issues:\n\n${problematicFiles.join(
                    "\n"
                )}\n\nPlease download these manually if needed.`
            );
        }
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
