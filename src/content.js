// Check if temporary access is valid for this domain
const STORAGE_KEY = 'tempAccessData';
const RESET_INTERVAL = 2 * 60 * 60 * 1000; // 2 hours

function checkTemporaryAccess() {
  try {
    const domain = window.location.hostname.replace(/^www\./, '');
    const data = JSON.parse(localStorage.getItem(STORAGE_KEY) || '{}');
    
    if (data[domain]) {
      const domainData = data[domain];
      
      // Check if access has expired
      if (domainData.accessExpires && Date.now() < domainData.accessExpires) {
        return true; // Allow access
      }
      
      // Check if we need to reset the 2-hour timer
      const timeSinceReset = Date.now() - (domainData.lastReset || 0);
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
  
  return false; // Block access
}

// Listen for messages from background script
chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
  if (request.action === 'checkTempAccess') {
    sendResponse({ hasAccess: checkTemporaryAccess() });
  }
});
