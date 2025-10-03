# 🤖 Abba AI Chat Widget Setup Guide

Your custom AI chat widget is ready! Here's how to configure it securely.

## 🔒 Security-First Setup

### 1. Private Configuration File
Your API keys are stored in `_config.private.yml` (already gitignored):

```yaml
# _config.private.yml
ai_provider: "openai"           # or "claude"
openai_api_key: "sk-..."        # Your OpenAI API key
claude_api_key: "sk-ant-..."    # Your Claude API key
```

### 2. Jekyll Build with Private Config
To run locally with private config:
```bash
bundle exec jekyll serve --config _config.yml,_config.private.yml
```

To build for production:
```bash
bundle exec jekyll build --config _config.yml,_config.private.yml
```

## 🚀 Current Features

### ✨ **Already Working:**
- Beautiful chat widget in bottom right corner
- Smart contextual responses about Abba Baba
- Quick question buttons for common topics
- Perfectly themed with your site design
- Mobile responsive

### 🧠 **AI-Powered Topics:**
- AI-human collaboration philosophy
- Abba Baba services and offerings
- Riddlen platform explanation
- Business automation benefits
- Contact and consultation info

## 🔧 To Enable Live AI

### Option 1: OpenAI API
1. Get API key from [OpenAI Platform](https://platform.openai.com/api-keys)
2. Add to `_config.private.yml`:
   ```yaml
   ai_provider: "openai"
   openai_api_key: "sk-your-key-here"
   ```

### Option 2: Claude API
1. Get API key from [Anthropic Console](https://console.anthropic.com/)
2. Add to `_config.private.yml`:
   ```yaml
   ai_provider: "claude"
   claude_api_key: "sk-ant-your-key-here"
   ```

## 🛡️ Security Features

✅ **Private config gitignored** - API keys never committed
✅ **Separate config files** - Public/private separation
✅ **Client-side fallback** - Works without API keys
✅ **Error handling** - Graceful degradation

## 🎨 Widget Features

- **Gradient Chat Button** - Electric cyan theme
- **Glassmorphism Design** - Backdrop blur effects
- **Smooth Animations** - Professional interactions
- **Smart Responses** - Contextual to your business
- **Mobile Optimized** - Fullscreen on mobile
- **Typing Indicators** - Realistic chat experience

## 📝 Customization

Edit the responses in `_layouts/default.html` in the `getContextualResponse()` function to modify the AI's knowledge base.

The widget is ready to use immediately and will work even better once you add your API keys! 🚀