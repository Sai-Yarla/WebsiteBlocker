// Listen for messages from background script
chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
  if (request.action === 'blockPage') {
    blockPage();
    sendResponse({ status: 'blocked' });
  }
});

// Block the page and show sad face
function blockPage() {
  document.documentElement.innerHTML = `
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="UTF-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
      <title>Page Blocked</title>
      <style>
        body {
          margin: 0;
          padding: 0;
          display: flex;
          justify-content: center;
          align-items: center;
          min-height: 100vh;
          background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
          font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
        }
        .container {
          text-align: center;
          background: white;
          padding: 60px 40px;
          border-radius: 20px;
          box-shadow: 0 20px 60px rgba(0, 0, 0, 0.3);
          max-width: 500px;
        }
        .sad-face {
          font-size: 120px;
          margin-bottom: 20px;
          animation: bounce 2s infinite;
        }
        @keyframes bounce {
          0%, 100% { transform: translateY(0); }
          50% { transform: translateY(-10px); }
        }
        h1 {
          color: #333;
          margin: 0 0 15px 0;
          font-size: 32px;
        }
        p {
          color: #666;
          font-size: 16px;
          line-height: 1.6;
          margin: 0 0 30px 0;
        }
        .reason {
          color: #999;
          font-size: 14px;
          margin: 20px 0 0 0;
          padding-top: 20px;
          border-top: 1px solid #eee;
        }
      </style>
    </head>
    <body>
      <div class="container">
        <div class="sad-face">😢</div>
        <h1>Page Blocked</h1>
        <p>This site is blocked by Page Blocker extension.</p>
        <div class="reason">You can manage blocked sites in the extension settings.</div>
      </div>
    </body>
    </html>
  `;
  document.body.style.margin = '0';
  document.body.style.padding = '0';
}

// Run on page load
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', () => {
    // Check if page should be blocked on load
    checkPageOnLoad();
  });
} else {
  checkPageOnLoad();
}

function checkPageOnLoad() {
  chrome.runtime.sendMessage({ action: 'checkUrl', url: window.location.href }, (response) => {
    if (response && response.isBlocked) {
      blockPage();
    }
  });
}
