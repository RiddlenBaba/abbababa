#!/usr/bin/env python3
"""
Automatically generate blog category pages for any categories used in posts
but missing corresponding category pages.
"""

import os
import re
import yaml
from pathlib import Path

def extract_categories_from_posts(posts_dir):
    """Extract all categories used in blog posts."""
    categories = set()
    posts_path = Path(posts_dir)

    for post_file in posts_path.glob("*.md"):
        try:
            with open(post_file, 'r', encoding='utf-8') as f:
                content = f.read()

            # Extract front matter
            if content.startswith('---'):
                end_idx = content.find('---', 3)
                if end_idx != -1:
                    front_matter = content[3:end_idx]
                    try:
                        data = yaml.safe_load(front_matter)
                        if 'categories' in data and data['categories']:
                            # Handle both list and string formats
                            if isinstance(data['categories'], list):
                                categories.update(data['categories'])
                            elif isinstance(data['categories'], str):
                                # Handle bracketed format like [ai-security, enterprise-strategy]
                                cat_str = data['categories'].strip('[]')
                                cats = [c.strip() for c in cat_str.split(',')]
                                categories.update(cats)
                    except yaml.YAMLError:
                        print(f"Warning: Could not parse YAML in {post_file}")

        except Exception as e:
            print(f"Error processing {post_file}: {e}")

    return categories

def get_existing_categories(category_dir):
    """Get list of existing category page slugs."""
    existing = set()
    category_path = Path(category_dir)

    if category_path.exists():
        for cat_file in category_path.glob("*.md"):
            existing.add(cat_file.stem)

    return existing

def generate_category_title(slug):
    """Convert category slug to a nice title."""
    # Handle common patterns
    title_map = {
        'ai-security': 'AI Security',
        'ai-workflow': 'AI Workflow',
        'ai-architecture': 'AI Architecture',
        'ai-automation': 'AI Automation',
        'enterprise-strategy': 'Enterprise Strategy',
        'document-processing': 'Document Processing',
        'open-source': 'Open Source',
        'business-strategy': 'Business Strategy',
        'data-integration': 'Data Integration',
        'data-migration': 'Data Migration',
        'thought-leadership': 'Thought Leadership',
        'mycelium': 'Mycelium',
        'riddlen': 'Riddlen',
        'innovation': 'Innovation',
        'automation': 'Automation',
        'web3': 'Web3'
    }

    if slug in title_map:
        return title_map[slug]

    # Default: title case with spaces
    return slug.replace('-', ' ').title()

def generate_category_subtitle(slug):
    """Generate appropriate subtitle for category."""
    subtitle_map = {
        'ai-security': 'Enterprise AI security challenges, solutions, and best practices',
        'ai-workflow': 'AI-powered workflows, automation, and process optimization',
        'ai-architecture': 'AI system design, architecture patterns, and implementation strategies',
        'ai-automation': 'Intelligent automation, AI agents, and workflow optimization',
        'enterprise-strategy': 'Strategic insights for enterprise AI adoption and business transformation',
        'document-processing': 'Intelligent document processing, OCR, and automation workflows',
        'open-source': 'Open source AI solutions, technologies, and implementation strategies',
        'business-strategy': 'Strategic insights for business transformation and growth',
        'data-integration': 'Data integration patterns, solutions, and best practices',
        'data-migration': 'Data migration strategies, tools, and transformation approaches',
        'thought-leadership': 'Industry insights and thought leadership on AI and automation',
        'mycelium': 'Living AI networks and distributed intelligence systems',
        'riddlen': 'Web3 AI validation platform and human-AI collaboration',
        'innovation': 'Innovation in AI, automation, and human-computer collaboration',
        'automation': 'Business process automation and intelligent workflow solutions',
        'web3': 'Web3 technologies, blockchain integration, and decentralized systems'
    }

    if slug in subtitle_map:
        return subtitle_map[slug]

    # Default subtitle
    return f"Insights and analysis on {slug.replace('-', ' ')}"

def create_category_page(category_dir, slug):
    """Create a category page for the given slug."""
    category_path = Path(category_dir)
    category_path.mkdir(parents=True, exist_ok=True)

    title = generate_category_title(slug)
    subtitle = generate_category_subtitle(slug)

    content = f"""---
layout: category
title: "{title}"
subtitle: "{subtitle}"
category: {slug}
---"""

    file_path = category_path / f"{slug}.md"
    with open(file_path, 'w', encoding='utf-8') as f:
        f.write(content)

    print(f"Created category page: {file_path}")
    return file_path

def main():
    """Main function to generate missing category pages."""
    # Get the project root directory
    script_dir = Path(__file__).parent
    project_dir = script_dir.parent

    posts_dir = project_dir / "_posts"
    category_dir = project_dir / "blog" / "category"

    print("Scanning blog posts for categories...")
    all_categories = extract_categories_from_posts(posts_dir)
    print(f"Found categories: {sorted(all_categories)}")

    print("Checking existing category pages...")
    existing_categories = get_existing_categories(category_dir)
    print(f"Existing categories: {sorted(existing_categories)}")

    missing_categories = all_categories - existing_categories

    if missing_categories:
        print(f"\nCreating {len(missing_categories)} missing category pages...")
        created_files = []

        for category in sorted(missing_categories):
            if category:  # Skip empty categories
                file_path = create_category_page(category_dir, category)
                created_files.append(file_path)

        print(f"\nSuccessfully created {len(created_files)} category pages:")
        for file_path in created_files:
            print(f"  - {file_path}")

        print("\nNext steps:")
        print("1. Review the generated category pages")
        print("2. Commit and push the changes:")
        print("   git add blog/category/")
        print("   git commit -m 'Auto-generate missing blog category pages'")
        print("   git push")
    else:
        print("\nAll category pages exist. No action needed.")

if __name__ == "__main__":
    main()