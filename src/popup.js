// Load blocked URLs on popup open
document.addEventListener('DOMContentLoaded', loadBlockedUrls);

// Add URL button
document.getElementById('addBtn').addEventListener('click', addUrl);

// Add URL on Enter key
document.getElementById('urlInput').addEventListener('keypress', (e) => {
  if (e.key === 'Enter') {
    addUrl();
  }
});

// Load and display blocked URLs
function loadBlockedUrls() {
  chrome.storage.local.get(['blockedUrls'], (result) => {
    const blockedUrls = result.blockedUrls || [];
    const container = document.getElementById('blockedContainer');
    const count = document.getElementById('count');

    count.textContent = blockedUrls.length;

    if (blockedUrls.length === 0) {
      container.innerHTML = `
        <div class="empty-state">
          <div class="empty-state-icon">🌐</div>
          <p>No websites blocked yet.<br>Add one to get started!</p>
        </div>
      `;
      return;
    }

    container.innerHTML = '';
    const ul = document.createElement('ul');
    ul.className = 'blocked-list';

    blockedUrls.forEach((url, index) => {
      const li = document.createElement('li');
      li.className = 'blocked-item';
      
      // Extract domain from URL
      let domain = url;
      try {
        domain = new URL(url.startsWith('http') ? url : `https://${url}`).hostname;
      } catch (e) {
        domain = url;
      }

      li.innerHTML = `
        <div class="blocked-item-url">${domain}</div>
        <button class="remove-btn" data-index="${index}">Remove</button>
      `;

      li.querySelector('.remove-btn').addEventListener('click', () => {
        removeUrl(index);
      });

      ul.appendChild(li);
    });

    container.appendChild(ul);
  });
}

// Add a new blocked URL
function addUrl() {
  const input = document.getElementById('urlInput');
  let url = input.value.trim();

  if (!url) {
    showStatus('Please enter a URL', 'error');
    return;
  }

  // Validate URL
  if (!isValidUrl(url)) {
    showStatus('Invalid URL format', 'error');
    return;
  }

  // Normalize URL
  if (!url.startsWith('http://') && !url.startsWith('https://')) {
    url = 'https://' + url;
  }

  chrome.storage.local.get(['blockedUrls'], (result) => {
    const blockedUrls = result.blockedUrls || [];

    // Extract domain
    let domain;
    try {
      domain = new URL(url).hostname;
    } catch (e) {
      showStatus('Invalid URL', 'error');
      return;
    }

    // Check if already blocked
    const isDuplicate = blockedUrls.some(blocked => {
      try {
        return new URL(blocked.startsWith('http') ? blocked : `https://${blocked}`).hostname === domain;
      } catch {
        return false;
      }
    });

    if (isDuplicate) {
      showStatus('This website is already blocked', 'error');
      return;
    }

    // Add new URL
    blockedUrls.push(url);
    chrome.storage.local.set({ blockedUrls: blockedUrls }, () => {
      input.value = '';
      showStatus('Website blocked successfully!', 'success');
      loadBlockedUrls();
    });
  });
}

// Remove a blocked URL
function removeUrl(index) {
  chrome.storage.local.get(['blockedUrls'], (result) => {
    const blockedUrls = result.blockedUrls || [];
    blockedUrls.splice(index, 1);
    chrome.storage.local.set({ blockedUrls: blockedUrls }, () => {
      showStatus('Website unblocked successfully!', 'success');
      loadBlockedUrls();
    });
  });
}

// Validate URL format
function isValidUrl(url) {
  try {
    // If URL doesn't start with protocol, add https://
    const testUrl = url.startsWith('http') ? url : `https://${url}`;
    new URL(testUrl);
    return true;
  } catch {
    return false;
  }
}

// Show status message
function showStatus(message, type) {
  const statusEl = document.getElementById('statusMessage');
  statusEl.textContent = message;
  statusEl.className = `status-message ${type}`;

  // Auto-hide after 3 seconds
  setTimeout(() => {
    statusEl.className = 'status-message';
  }, 3000);
}
