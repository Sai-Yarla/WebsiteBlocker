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
  const blockedUrls = [];
  chrome.storage.local.get(['blockedUrls'], (result) => {
    const allUrls = result.blockedUrls || [];
    const urlToRemove = allUrls[index];
    
    // Extract domain for display
    let domain = urlToRemove;
    try {
      domain = new URL(urlToRemove.startsWith('http') ? urlToRemove : `https://${urlToRemove}`).hostname;
    } catch (e) {
      domain = urlToRemove;
    }

    // Show annoying confirmation with quiz
    showRemovalConfirmation(domain, index);
  });
}

function showRemovalConfirmation(domain, index) {
  // Create modal overlay
  const modal = document.createElement('div');
  modal.style.cssText = `
    position: fixed;
    top: 0;
    left: 0;
    width: 100%;
    height: 100%;
    background: rgba(0, 0, 0, 0.7);
    display: flex;
    justify-content: center;
    align-items: center;
    z-index: 10000;
  `;

  const confirmBox = document.createElement('div');
  confirmBox.style.cssText = `
    background: white;
    padding: 30px;
    border-radius: 12px;
    max-width: 400px;
    box-shadow: 0 10px 40px rgba(0, 0, 0, 0.3);
    text-align: center;
  `;

  const title = document.createElement('h2');
  title.textContent = '⚠️ Are You Sure?';
  title.style.cssText = 'color: #ff6b6b; margin: 0 0 15px 0; font-size: 20px;';

  const message = document.createElement('p');
  message.textContent = `You're about to unblock "${domain}". This is a BIG decision! Answer the question below to confirm you really want to remove it.`;
  message.style.cssText = 'color: #666; margin: 0 0 20px 0; line-height: 1.6;';

  // Generate random quiz questions
  const questions = [
    {
      q: 'How many seconds of temporary access do you get per 2 hours?',
      a: '60',
      options: ['30', '60', '120', '45']
    },
    {
      q: 'What color is the "Go Back" button?',
      a: 'Blue',
      options: ['Red', 'Blue', 'Green', 'Purple']
    },
    {
      q: 'How often does the temporary access reset?',
      a: '2 hours',
      options: ['1 hour', '30 minutes', '2 hours', '3 hours']
    },
    {
      q: 'What emoji shows on the blocked page?',
      a: '😢',
      options: ['😠', '😢', '😴', '😤']
    }
  ];

  const quiz = questions[Math.floor(Math.random() * questions.length)];
  const shuffledOptions = quiz.options.sort(() => Math.random() - 0.5);

  const question = document.createElement('p');
  question.textContent = quiz.q;
  question.style.cssText = 'color: #333; font-weight: bold; margin: 0 0 15px 0;';

  // Create answer buttons
  const answerContainer = document.createElement('div');
  answerContainer.style.cssText = 'display: flex; flex-direction: column; gap: 10px; margin-bottom: 20px;';

  const buttons = [];
  shuffledOptions.forEach((option) => {
    const btn = document.createElement('button');
    btn.textContent = option;
    btn.style.cssText = `
      padding: 10px 15px;
      background: #f0f0f0;
      border: 2px solid #ddd;
      border-radius: 6px;
      cursor: pointer;
      font-size: 14px;
      transition: all 0.2s;
    `;

    btn.addEventListener('mouseover', () => {
      btn.style.background = '#e0e0e0';
    });

    btn.addEventListener('mouseout', () => {
      btn.style.background = '#f0f0f0';
    });

    btn.addEventListener('click', () => {
      if (option === quiz.a) {
        // Correct answer - proceed with removal
        modal.remove();
        actuallyRemoveUrl(index);
        showStatus('Website unblocked successfully!', 'success');
        loadBlockedUrls();
      } else {
        // Wrong answer - show error
        btn.style.background = '#ff9999';
        btn.textContent = '❌ Wrong!';
        btn.disabled = true;
        setTimeout(() => {
          showStatus('Nice try! Wrong answer. The website stays blocked. 😏', 'error');
          modal.remove();
        }, 1500);
      }
    });

    buttons.push(btn);
    answerContainer.appendChild(btn);
  });

  const cancelBtn = document.createElement('button');
  cancelBtn.textContent = 'Never mind, keep it blocked';
  cancelBtn.style.cssText = `
    padding: 10px 15px;
    background: #667eea;
    color: white;
    border: none;
    border-radius: 6px;
    cursor: pointer;
    font-size: 14px;
    width: 100%;
    transition: background 0.2s;
  `;

  cancelBtn.addEventListener('mouseover', () => {
    cancelBtn.style.background = '#764ba2';
  });

  cancelBtn.addEventListener('mouseout', () => {
    cancelBtn.style.background = '#667eea';
  });

  cancelBtn.addEventListener('click', () => {
    modal.remove();
    showStatus('Good choice! Staying focused. 💪', 'success');
  });

  confirmBox.appendChild(title);
  confirmBox.appendChild(message);
  confirmBox.appendChild(question);
  confirmBox.appendChild(answerContainer);
  confirmBox.appendChild(cancelBtn);

  modal.appendChild(confirmBox);
  document.body.appendChild(modal);
}

function actuallyRemoveUrl(index) {
  chrome.storage.local.get(['blockedUrls'], (result) => {
    const blockedUrls = result.blockedUrls || [];
    blockedUrls.splice(index, 1);
    chrome.storage.local.set({ blockedUrls: blockedUrls });
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
