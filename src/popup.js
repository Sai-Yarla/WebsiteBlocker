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
    overflow-y: auto;
  `;

  const confirmBox = document.createElement('div');
  confirmBox.style.cssText = `
    background: white;
    padding: 30px;
    border-radius: 12px;
    max-width: 450px;
    box-shadow: 0 10px 40px rgba(0, 0, 0, 0.3);
    text-align: center;
    margin: 20px;
  `;

  const title = document.createElement('h2');
  title.textContent = '⚠️ HOLD UP! ⚠️';
  title.style.cssText = 'color: #ff6b6b; margin: 0 0 15px 0; font-size: 22px;';

  const message = document.createElement('p');
  message.textContent = `You REALLY want to unblock "${domain}"? Complete ALL 10 tasks below to prove you're serious:`;
  message.style.cssText = 'color: #666; margin: 0 0 20px 0; line-height: 1.6; font-weight: bold;';

  const tasksContainer = document.createElement('div');
  tasksContainer.style.cssText = 'text-align: left; background: #f9f9f9; padding: 15px; border-radius: 8px; margin-bottom: 20px; max-height: 300px; overflow-y: auto;';

  const tasks = [
    { text: 'Type "I WANT TO PROCRASTINATE"', type: 'text', validate: (v) => v === 'I WANT TO PROCRASTINATE' },
    { text: 'Solve: 15 × 3 = ?', type: 'math', validate: (v) => v === '45' },
    { text: 'Click the button that says "Nope"', type: 'button', options: ['Yes', 'Nope', 'Maybe'], correct: 1 },
    { text: 'Enter: page + blocker + extension', type: 'text', validate: (v) => v.toLowerCase() === 'pageblockerextension' },
    { text: 'What color is the sad face page?', type: 'select', options: ['Red', 'Blue & Purple', 'Green', 'Yellow'], correct: 1 },
    { text: 'Solve: 200 ÷ 4 = ?', type: 'math', validate: (v) => v === '50' },
    { text: 'Type "I PROMISE I WILL FOCUS"', type: 'text', validate: (v) => v === 'I PROMISE I WILL FOCUS' },
    { text: 'Click the button that says "Keep It"', type: 'button', options: ['Remove It', 'Keep It', 'Maybe Later'], correct: 1 },
    { text: 'Solve: 7 × 8 = ?', type: 'math', validate: (v) => v === '56' },
    { text: 'Type "STAY FOCUSED"', type: 'text', validate: (v) => v === 'STAY FOCUSED' }
  ];

  let completedTasks = 0;
  const taskInputs = [];

  tasks.forEach((task, idx) => {
    const taskDiv = document.createElement('div');
    taskDiv.style.cssText = `
      margin-bottom: 12px;
      padding: 12px;
      background: white;
      border-left: 4px solid #ddd;
      border-radius: 4px;
    `;

    const taskLabel = document.createElement('div');
    taskLabel.textContent = `${idx + 1}. ${task.text}`;
    taskLabel.style.cssText = 'font-size: 13px; font-weight: bold; color: #333; margin-bottom: 8px;';
    taskDiv.appendChild(taskLabel);

    let input;
    if (task.type === 'text' || task.type === 'math') {
      input = document.createElement('input');
      input.type = 'text';
      input.placeholder = 'Enter answer...';
      input.style.cssText = `
        width: 100%;
        padding: 6px 10px;
        border: 1px solid #ddd;
        border-radius: 4px;
        font-size: 12px;
        box-sizing: border-box;
      `;
      input.addEventListener('input', () => checkAllTasks());
      taskDiv.appendChild(input);
    } else if (task.type === 'button') {
      const buttonGroup = document.createElement('div');
      buttonGroup.style.cssText = 'display: flex; gap: 8px;';
      task.options.forEach((option, optIdx) => {
        const btn = document.createElement('button');
        btn.textContent = option;
        btn.style.cssText = `
          flex: 1;
          padding: 8px;
          background: #f0f0f0;
          border: 1px solid #ddd;
          border-radius: 4px;
          cursor: pointer;
          font-size: 12px;
          transition: all 0.2s;
        `;
        btn.addEventListener('click', () => {
          if (optIdx === task.correct) {
            btn.style.background = '#90ee90';
            btn.style.borderColor = '#22aa22';
          } else {
            btn.style.background = '#ffcccc';
            btn.style.borderColor = '#ff0000';
          }
          checkAllTasks();
        });
        buttonGroup.appendChild(btn);
      });
      taskDiv.appendChild(buttonGroup);
      input = { value: null, dataset: { correct: false } };
    } else if (task.type === 'select') {
      const select = document.createElement('select');
      select.style.cssText = `
        width: 100%;
        padding: 6px 10px;
        border: 1px solid #ddd;
        border-radius: 4px;
        font-size: 12px;
        box-sizing: border-box;
      `;
      select.innerHTML = '<option value="">-- Choose --</option>';
      task.options.forEach((option, optIdx) => {
        const opt = document.createElement('option');
        opt.value = optIdx;
        opt.textContent = option;
        select.appendChild(opt);
      });
      select.addEventListener('change', () => checkAllTasks());
      taskDiv.appendChild(select);
      input = select;
    }

    taskInputs.push({ input, task });
    tasksContainer.appendChild(taskDiv);
  });

  function checkAllTasks() {
    let allComplete = true;
    taskInputs.forEach(({ input, task }) => {
      let isComplete = false;
      
      if (task.type === 'text' || task.type === 'math') {
        isComplete = task.validate(input.value);
      } else if (task.type === 'button') {
        isComplete = input.dataset.correct === 'true';
      } else if (task.type === 'select') {
        isComplete = parseInt(input.value) === task.correct;
      }
      
      if (!isComplete) allComplete = false;
    });

    removeBtn.disabled = !allComplete;
    removeBtn.style.opacity = allComplete ? '1' : '0.5';
    removeBtn.style.cursor = allComplete ? 'pointer' : 'not-allowed';
  }

  const removeBtn = document.createElement('button');
  removeBtn.textContent = '✅ YES, UNBLOCK IT! (Complete all tasks first)';
  removeBtn.disabled = true;
  removeBtn.style.cssText = `
    padding: 12px 15px;
    background: #ff6b6b;
    color: white;
    border: none;
    border-radius: 6px;
    cursor: not-allowed;
    font-size: 14px;
    font-weight: bold;
    width: 100%;
    margin-bottom: 10px;
    opacity: 0.5;
    transition: all 0.2s;
  `;

  removeBtn.addEventListener('mouseover', () => {
    if (!removeBtn.disabled) removeBtn.style.background = '#ff5252';
  });

  removeBtn.addEventListener('mouseout', () => {
    if (!removeBtn.disabled) removeBtn.style.background = '#ff6b6b';
  });

  removeBtn.addEventListener('click', () => {
    modal.remove();
    actuallyRemoveUrl(index);
    showStatus('You unblocked it! 😅 Hope it was worth it...', 'success');
    loadBlockedUrls();
  });

  const cancelBtn = document.createElement('button');
  cancelBtn.textContent = 'Nevermind! Keep it blocked (Smart choice 🧠)';
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
    showStatus('Excellent! Staying focused. 💪', 'success');
  });

  confirmBox.appendChild(title);
  confirmBox.appendChild(message);
  confirmBox.appendChild(tasksContainer);
  confirmBox.appendChild(removeBtn);
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
