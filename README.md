# Page Blocker - Chrome Extension

A fast and effective Chrome extension that instantly blocks specific websites. When you try to access a blocked URL, you'll see a friendly sad face instead—no loading time!

## Features

- ⚡ **Instant Blocking** - Blocks pages before they even load
- ✨ **Easy to Use** - Simple popup interface
- 😢 **Sad Face Display** - Blocked pages show a cute animated sad face
- 🚫 **Quick Management** - Add and remove blocked sites anytime
- 💾 **Persistent** - Your blocked list is saved automatically
- 🔒 **Lightweight** - Minimal performance impact

## Installation

1. Clone or download this repository
2. Open Chrome and go to `chrome://extensions/`
3. Enable **Developer mode** (toggle in top right)
4. Click **Load unpacked** and select the extension folder
5. The Page Blocker extension will appear in your toolbar

## Usage

### Adding a Website to Block

1. Click the **Page Blocker** icon in your toolbar
2. Enter the website URL (e.g., `example.com` or `https://example.com`)
3. Click **Add** or press Enter
4. The website is now blocked!

### Removing a Blocked Website

1. Click the **Page Blocker** icon in your toolbar
2. Find the website you want to unblock
3. Click **Remove** next to it
4. The website is now unblocked

### What Happens When You Visit a Blocked Site?

When you try to access a blocked website, the page is instantly blocked before it even loads. You'll see:
- A sad face emoji (😢)
- "Page Blocked" message
- Information about the extension

## How It Works

- **Manifest V3** - Modern Chrome extension architecture
- **Web Request API** - Intercepts requests before pages load for instant blocking
- **Background Service Worker** - Monitors navigation events
- **Content Scripts** - Injects blocking UI when needed
- **Chrome Storage API** - Saves your blocked list locally
- **Domain Matching** - Blocks all pages under a domain (ignores www variations)

## Technical Details

- **Browser Compatibility**: Chrome 88+
- **Permissions Used**:
  - `storage` - Store blocked URLs list
  - `tabs` - Monitor page navigation
  - `scripting` - Inject content scripts
  - `webRequest` - Intercept page requests for instant blocking

## Files

```
Page Blocker/
├── manifest.json       # Extension configuration
├── src/
│   ├── background.js   # Background service worker
│   ├── content.js      # Content script for page blocking
│   ├── popup.html      # Popup UI
│   └── popup.js        # Popup functionality
└── README.md           # This file
```

## License

This extension is provided as-is for personal use.

## Support

For issues or feature requests, feel free to modify the code according to your needs!
