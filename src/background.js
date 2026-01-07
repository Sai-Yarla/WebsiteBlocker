// Initialize blocked URLs list
chrome.runtime.onInstalled.addListener(() => {
  chrome.storage.local.get(['blockedUrls'], (result) => {
    if (!result.blockedUrls) {
      chrome.storage.local.set({ blockedUrls: [] });
    }
  });
});

// Listen for tab updates to check if URL is blocked
chrome.tabs.onUpdated.addListener((tabId, changeInfo, tab) => {
  if (changeInfo.status === 'complete' && tab.url) {
    checkAndBlockUrl(tabId, tab.url);
  }
});

// Check if URL matches any blocked patterns
function isUrlBlocked(url, blockedUrls) {
  return blockedUrls.some(blockedUrl => {
    // Handle both exact domain matches and pattern matches
    const blockedDomain = new URL(blockedUrl).hostname.replace(/^www\./, '');
    const currentDomain = new URL(url).hostname.replace(/^www\./, '');
    return currentDomain === blockedDomain;
  });
}

// Check and block URL
function checkAndBlockUrl(tabId, url) {
  chrome.storage.local.get(['blockedUrls'], (result) => {
    const blockedUrls = result.blockedUrls || [];
    
    if (isUrlBlocked(url, blockedUrls)) {
      // Inject content script to block the page
      chrome.scripting.executeScript({
        target: { tabId: tabId },
        files: ['src/content.js']
      }).catch((error) => {
        console.log('Could not inject script:', error);
      });
    }
  });
}
