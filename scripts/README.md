# Abba Baba Site Scripts

This directory contains utility scripts for the Abba Baba Jekyll site.

## Public Scripts

### `generate_category_pages.py`
Local utility for generating missing blog category pages.

**Usage:**
```bash
python3 scripts/generate_category_pages.py
```

**Note:** This functionality is also automated via GitHub Actions in `.github/workflows/auto-generate-categories.yml`

## GitHub Actions Automation

The site uses automated workflows for maintenance:

- **Auto-generate category pages** - Runs on blog post changes
- **Blog maintenance** - Weekly comprehensive maintenance
- **Jekyll build and deploy** - Automatic on push to main

## Development Notes

- All content generation tools are kept in private repositories
- API keys and sensitive tools are not included in this public repo
- Site-specific utilities that benefit the open source community are included here

## Contributing

If you create additional site utilities, please:
1. Ensure no API keys or sensitive data are included
2. Add documentation to this README
3. Follow the existing code style and patterns