# ContextIQ

**Your AI always knows what you're working on.**

ContextIQ is a Chrome extension that automatically captures your active work context across tabs and apps, organizes it into projects, and feeds AI tools with ready-to-use context.

## Features

- **Background Activity Capture** - Tracks open tabs, URLs, document titles
- **Project Auto-Inference** - Groups tabs and activities into projects using keyword clustering
- **Context Panel** - Shows current project, recent items, clickable links to jump back
- **AI Context Injection** - Inserts project summary into ChatGPT, Claude, Gemini, Notion AI
- **Resume Project** - One-click reopens last active tabs for a project
- **Manual Tagging** - Edit project titles, tag items, correct AI-inferred context
- **Privacy Controls** - Toggle tracking on/off, local storage only by default
- **Lightweight Summaries** - Auto-generated project summaries for better AI output

## Installation (Development)

1. Clone this repository
2. Open Chrome and go to `chrome://extensions/`
3. Enable "Developer mode" (top right)
4. Click "Load unpacked" and select the project directory
5. The ContextIQ icon will appear in your extensions bar

## Architecture

```
src/
  background/       # Service worker for tab tracking and messaging
  content/          # Content scripts for AI tool injection
  popup/            # Extension popup UI
  options/          # Settings page
  onboarding/       # First-install onboarding flow
  lib/              # Shared modules
    constants.js    # App-wide constants
    storage.js      # Chrome storage abstraction
    utils.js        # Utility functions
    project-inference.js  # AI clustering engine
    summarizer.js   # Project summarization
  icons/            # Extension icons
```

## Supported AI Tools

- ChatGPT (chat.openai.com / chatgpt.com)
- Google Gemini (gemini.google.com)
- Claude (claude.ai)
- Notion AI (notion.so)

## Privacy

All data is stored locally in Chrome's local storage by default. No data is sent to any external server unless you explicitly enable cloud sync (Phase 2 feature).
