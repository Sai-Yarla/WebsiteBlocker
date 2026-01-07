// Initialize blocked URLs list
chrome.runtime.onInstalled.addListener(() => {
  chrome.storage.local.get(['blockedUrls'], (result) => {
    if (!result.blockedUrls) {
      chrome.storage.local.set({ blockedUrls: [] });
    }
  });
});

// Listen for tab updates and check immediately when page starts loading
chrome.tabs.onUpdated.addListener((tabId, changeInfo, tab) => {
  // Check as soon as the tab starts loading, not when it completes
  if (changeInfo.status === 'loading' && tab.url) {
    checkAndBlockUrl(tabId, tab.url);
  }
});

// Also check on tab activation (switching tabs)
chrome.tabs.onActivated.addListener((activeInfo) => {
  chrome.tabs.get(activeInfo.tabId, (tab) => {
    if (tab && tab.url) {
      checkAndBlockUrl(activeInfo.tabId, tab.url);
    }
  });
});

// Check if URL matches any blocked patterns
function isUrlBlocked(url, blockedUrls) {
  try {
    const blockedDomain = new URL(url).hostname.replace(/^www\./, '');
    return blockedUrls.some(blockedUrl => {
      try {
        const blocked = new URL(blockedUrl.startsWith('http') ? blockedUrl : `https://${blockedUrl}`);
        return blocked.hostname.replace(/^www\./, '') === blockedDomain;
      } catch {
        return false;
      }
    });
  } catch {
    return false;
  }
}

// Check and block URL
function checkAndBlockUrl(tabId, url) {
  chrome.storage.local.get(['blockedUrls'], (result) => {
    const blockedUrls = result.blockedUrls || [];
    
    if (isUrlBlocked(url, blockedUrls)) {
      // Redirect to blocked page immediately
      chrome.tabs.update(tabId, {
        url: chrome.runtime.getURL('src/blocked.html?blocked=' + encodeURIComponent(url))
      });
    }
  });
}
