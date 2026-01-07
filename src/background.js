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
      // Send message to content script to check temporary access
      chrome.tabs.sendMessage(tabId, { action: 'checkTempAccess' }).then((response) => {
        if (!response || !response.hasAccess) {
          // Redirect to blocked page
          chrome.tabs.update(tabId, {
            url: chrome.runtime.getURL('src/blocked.html?blocked=' + encodeURIComponent(url))
          });
        }
      }).catch(() => {
        // If messaging fails, redirect to blocked page
        chrome.tabs.update(tabId, {
          url: chrome.runtime.getURL('src/blocked.html?blocked=' + encodeURIComponent(url))
        });
      });
    }
  });
}

// Function to check if temporary access is valid (runs in content script context)
function checkTempAccess(domain) {
  const STORAGE_KEY = 'tempAccessData';
  const RESET_INTERVAL = 2 * 60 * 60 * 1000; // 2 hours
  
  try {
    const data = JSON.parse(localStorage.getItem(STORAGE_KEY) || '{}');
    if (data[domain]) {
      const domainData = data[domain];
      
      // Check if access has expired
      if (domainData.accessExpires && Date.now() < domainData.accessExpires) {
        return { hasAccess: true };
      }
      
      // Check if we need to reset the 2-hour timer
      const timeSinceReset = Date.now() - domainData.lastReset;
      if (timeSinceReset > RESET_INTERVAL) {
        domainData.lastReset = Date.now();
        domainData.used = false;
        domainData.accessExpires = null;
        localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
      }
    }
  } catch (e) {
    console.error('Error checking temp access:', e);
  }
  
  return { hasAccess: false };
}
