// Initialize blocked URLs list
chrome.runtime.onInstalled.addListener(() => {
  chrome.storage.local.get(['blockedUrls'], (result) => {
    if (!result.blockedUrls) {
      chrome.storage.local.set({ blockedUrls: [] });
    }
  });
});

// Listen for tab updates
chrome.tabs.onUpdated.addListener((tabId, changeInfo, tab) => {
  if (changeInfo.status === 'loading' && tab.url) {
    checkAndBlockUrl(tabId, tab.url);
  }
});

// Also check on tab activation
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
  chrome.storage.local.get(['blockedUrls', 'tempAccess'], (result) => {
    const blockedUrls = result.blockedUrls || [];
    const tempAccess = result.tempAccess || {};
    
    if (isUrlBlocked(url, blockedUrls)) {
      const domain = new URL(url).hostname.replace(/^www\./, '');
      
      // Check if temporary access is still valid
      if (tempAccess[domain] && Date.now() < tempAccess[domain]) {
        console.log('Allowing access to', domain, '- temp access active until', new Date(tempAccess[domain]));
        return; // Allow access
      }
      
      // Clean up expired access
      if (tempAccess[domain] && Date.now() >= tempAccess[domain]) {
        delete tempAccess[domain];
        chrome.storage.local.set({ tempAccess });
      }
      
      // Redirect to blocked page
      chrome.tabs.update(tabId, {
        url: chrome.runtime.getURL('src/blocked.html?blocked=' + encodeURIComponent(url))
      });
    }
  });
}
