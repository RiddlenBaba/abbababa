# Local Development Notes

## AI Chat Integration (SAVED LOCALLY)

### Backup Files Created:
- `_layouts/default-with-ai.html.backup` - Full AI chat with OpenAI/Claude API integration
- `_config.private.yml` - Contains API keys (gitignored)

### To Restore AI Chat Locally:
1. Copy backup to main layout:
   ```bash
   cp _layouts/default-with-ai.html.backup _layouts/default.html
   ```

2. Run Jekyll with private config:
   ```bash
   bundle exec jekyll serve --config _config.yml,_config.private.yml
   ```

3. AI chat will be live at http://localhost:4000 with OpenAI API

### Current Production Version:
- AI chat uses contextual responses only (no API keys exposed)
- Safe for GitHub Pages deployment
- All pages and blog functionality working

### Scripts Directory:
- Content generation scripts are working
- No API keys exposed in scripts
- Ready for GitHub Pages

### Security:
- API keys are safely stored in gitignored files
- Production version has no sensitive data
- AI chat falls back to smart contextual responses

## Next Steps:
- Deploy current version to GitHub Pages
- AI chat will work with fallback responses
- Can restore full API integration anytime for local development