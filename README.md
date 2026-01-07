# Page Blocker - Chrome Extension

A fast and effective Chrome extension that instantly blocks specific websites to help you stay focused. When you try to access a blocked URL, you'll see a friendly sad face instead—no loading time!

## Features

- ⚡ **Instant Blocking** - Blocks pages before they even load
- ✨ **Easy to Use** - Simple popup interface
- 😢 **Sad Face Display** - Blocked pages show a cute animated sad face
- ⏱️ **Temporary Access** - Click to get 60 seconds of access (resets every 2 hours)
- 🔒 **Anti-Removal** - Annoying quiz confirmation when removing sites (to keep you focused!)
- 🚫 **Quick Management** - Add and remove blocked sites anytime
- 💾 **Persistent** - Your blocked list is saved automatically
- 🎯 **Lightweight** - Minimal performance impact

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

### Removing a Blocked Website (It's Intentionally Annoying!)

1. Click the **Page Blocker** icon in your toolbar
2. Find the website you want to unblock
3. Click **Remove** next to it
4. **Answer a random quiz question correctly** to confirm removal
5. Get it wrong? The site stays blocked! (Helps keep you focused 😏)

### Temporary Access (60 Seconds)

When you visit a blocked site:
1. You'll see the blocked page with sad face emoji
2. Click **Temporary Access (60s)** button
3. Get 60 seconds to use that website
4. After 60 seconds, it's blocked again
5. The button resets every 2 hours per domain

## How It Works

- **Manifest V3** - Modern Chrome extension architecture
- **Background Service Worker** - Monitors navigation events and checks temporary access
- **Content Scripts** - Runs on blocked sites to verify temporary access validity
- **Chrome Storage API** - Saves your blocked list and temporary access data locally
- **Domain Matching** - Blocks all pages under a domain (ignores www variations)
- **Quiz Confirmation** - Random quiz questions when removing sites to prevent accidental unblocking

## Technical Details

- **Browser Compatibility**: Chrome 88+
- **Permissions Used**:
  - `storage` - Store blocked URLs list and temporary access data
  - `tabs` - Monitor page navigation
  - `scripting` - Inject content scripts
  - `host_permissions` - Access all URLs for blocking

## Anti-Removal Feature

To keep you truly focused, removing a website requires answering a random quiz question:
- Questions cover extension features and blocked page details
- Wrong answer = site stays blocked (and you get called out! 😄)
- Right answer = you can unblock it
- This friction helps prevent impulsive unblocking

## Files

```
Page Blocker/
├── manifest.json       # Extension configuration
├── src/
│   ├── background.js   # Background service worker
│   ├── content.js      # Content script for temporary access verification
│   ├── popup.html      # Popup UI
│   ├── popup.js        # Popup functionality with anti-removal quiz
│   └── blocked.html    # Blocked page with temporary access button
└── README.md           # This file
```

## Tips for Maximum Focus

1. **Add sites at the start of work** - Don't add them mid-session when you're tempted
2. **Use Temporary Access wisely** - It's meant for legitimate breaks, not procrastination!
3. **Let the quiz deter you** - If you can't answer a basic question, maybe don't remove it yet
4. **Set realistic time goals** - Know when you'll remove these blocks (e.g., only on weekends)

## License

This extension is provided as-is for personal use.

## Support

For issues or feature requests, feel free to modify the code according to your needs!

Stay focused! 🎯
