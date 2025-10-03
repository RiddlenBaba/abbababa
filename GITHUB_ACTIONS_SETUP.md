# GitHub Actions Setup for Secure AI Chat

## 🎯 What This Does
- Deploys your site with **full AI chat functionality**
- Keeps API keys **secure in GitHub Secrets**
- Automatically restores AI chat on every deployment
- Works with your custom domain (abbababa.com)

## 🔧 Setup Steps

### 1. Add Secrets to GitHub Repository

Go to your GitHub repo: https://github.com/RiddlenBaba/abbababa

1. Click **Settings** → **Secrets and variables** → **Actions**
2. Click **New repository secret** for each of these:

#### Required Secrets:
```
Name: OPENAI_API_KEY
Value: [Your OpenAI API key from _config.private.yml]

Name: CLAUDE_API_KEY
Value: [Your Claude API key from _config.private.yml]

Name: GOOGLE_ANALYTICS
Value: G-Y2BYSM8WBT

Name: GOOGLE_TAG_MANAGER
Value: G-Y2BYSM8WBT
```

**📋 Get your API keys from your local `_config.private.yml` file**

### 2. Enable GitHub Actions for Pages

1. Go to **Settings** → **Pages**
2. Under **Source**, select **GitHub Actions**
3. Save the settings

### 3. Deploy

After you push the workflow file, GitHub Actions will automatically:
- ✅ Build your site with AI chat enabled
- ✅ Use your secure API keys from secrets
- ✅ Deploy to abbababa.com with full functionality

## 🔒 Security Benefits

- **API keys never appear in code** - Stored securely in GitHub
- **No keys in git history** - Clean repository
- **Automatic deployment** - Push code, site updates with AI
- **Full functionality** - Real OpenAI/Claude integration on live site

## 🚀 What You Get

After setup, your live site will have:
- **Working AI chat** with real OpenAI responses
- **Secure API key management**
- **Automatic deployments** on every push
- **Professional production setup**

## 📝 Next Steps

1. Add the secrets to GitHub (see above)
2. Enable GitHub Actions for Pages
3. Push the workflow file
4. Watch your site deploy with full AI functionality!

Your AI chat will work exactly like it does locally, but securely on the live site! 🎉