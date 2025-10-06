# Claude.md - Abba Baba Project Guide

## Project Overview

**Abba Baba** is a pioneering AI-human collaboration company that builds innovative solutions at the intersection of artificial intelligence and human expertise. Our name represents this partnership: Abba (AI) and Baba (Human) working together.

## Core Mission

We create, solve, explore, test, and expand the partnership between AI and humans through:
- Workflow automation that frees human time for high-value work
- Marketing and social engagement automation
- Cutting-edge AI validation systems
- Web3 and blockchain innovation

## Key Projects

### Riddlen
Our flagship web3 project featuring:
- Riddle game combining AI generation with human validation
- Human oracle network for AI data validation
- Cross-chain oracle setup for enterprise data validation
- Complete open-source, gasless crypto ecosystem

### Services
- **Workflow Automation**: Streamline business processes to reclaim time
- **Marketing Automation**: Automated social engagement and marketing campaigns
- **AI Integration**: Help companies discover creative AI applications
- **Cost Reduction**: Increase production efficiency while reducing operational costs

## Technical Stack

### Website (GitHub Pages + Jekyll)
- **Hosting**: GitHub Pages with auto-deployment
- **Generator**: Jekyll static site generator
- **Styling**: Custom SCSS with CSS custom properties for theming
- **Structure**: Professional marketing site with unified styled HTML approach

### Repository Structure
```
abbababa/
├── _config.yml           # Jekyll configuration
├── _layouts/             # Page templates (default.html, page.html, service.html)
├── _includes/            # Reusable components (cta-section.html, etc.)
├── _sass/               # Custom styling
│   ├── _variables.scss   # Color system and design tokens
│   └── _components.scss  # All component styles
├── assets/              # Images, CSS, JS
├── _services/           # Individual service pages
│   ├── workflow-automation.md
│   ├── marketing-automation.md
│   └── ai-integration.md
├── _posts/              # Blog posts (optional)
├── index.md             # Homepage (layout: default)
├── about.md             # About page (layout: page)
├── services.md          # Services overview (layout: page)
├── riddlen.md           # Riddlen project page (layout: page)
├── contact.md           # Contact form/info (layout: page)
├── blog.md              # Blog index (layout: page)
├── faq.md               # FAQ page (layout: page)
├── CLAUDE.md            # This file - project documentation
└── README.md            # Repository documentation
```

### Current Site Architecture (Updated October 2025)

#### **Unified Layout System**
All pages now use a standardized approach:

1. **Layout Hierarchy**:
   - `default.html` → Base layout with navigation and footer
   - `page.html` → Extends default with automatic hero section from front matter
   - All service pages use `layout: page` for consistency

2. **Hero Section System**:
   - Single hero per page generated from front matter (title/subtitle)
   - No duplicate hero sections in content
   - Centered layout with professional styling

3. **Styled HTML Components**:
   - All content uses styled HTML sections instead of markdown
   - Consistent component library with reusable CSS classes
   - Professional card-based layouts throughout

#### **CSS Architecture**

**File Structure**:
- `_variables.scss` - Design tokens, colors, spacing, typography
- `_components.scss` - All component styles and layouts

**Color System**:
```scss
// CSS Custom Properties for theming
:root {
  --bg-primary: #ffffff;      // Main background
  --bg-secondary: #f8fafc;    // Section backgrounds
  --bg-tertiary: #f1f5f9;     // Alternate sections
  --text-primary: #0f172a;    // Main text
  --text-secondary: #475569;  // Secondary text
  --text-muted: #64748b;      // Muted text
  --border-color: #e2e8f0;    // Borders
  --shadow-color: rgba(15, 23, 42, 0.1); // Shadows
}
```

**Component Classes**:
- `.section-header` - Centered section titles and descriptions
- `.process-steps` / `.process-step` - Numbered process flows
- `.automation-list` / `.automation-item` - Service/feature grids
- `.tech-grid` / `.tech-card` - Technology showcase cards
- `.results-grid` / `.result-card` - Results/outcomes cards
- `.timeline` / `.timeline-item` - Implementation timelines
- `.value-card` / `.values-grid` - Value propositions
- `.story-card` - Case studies and explanatory content

**Pagination System**:
- `.pagination-wrapper` - Container for pagination controls
- `.pagination-blog` / `.pagination-services` / `.pagination-search` - Content-specific styling
- `.pagination-minimal` / `.pagination-compact` / `.pagination-centered` - Layout variations
- `.pagination-simple` / `.pagination-numbers-only` - Behavior variations
- `.pagination-load-more` - Alternative "Load More" button pattern
- `.pagination-infinite-scroll` - Infinite scroll loading indicator

#### **Standard Page Template**

Every service page follows this structure:
```html
---
title: "Page Title"
subtitle: "Page description for hero section"
layout: page
---

<section class="service-intro">
    <div class="container">
        <div class="section-header">
            <h2>Section Title</h2>
            <p>Section description</p>
        </div>
    </div>
</section>

<section class="how-it-works">
    <div class="container">
        <div class="section-header">
            <h2>Process Title</h2>
            <p>Process description</p>
        </div>
        <div class="process-steps">
            <!-- 4 numbered process steps -->
        </div>
    </div>
</section>

<!-- Additional sections as needed -->
```

## Brand Voice & Messaging

### Tone
- **Professional yet approachable**: We know what we're doing but aren't stuffy
- **Innovation-focused**: Cutting-edge without being overly technical
- **Human-centric**: Technology serves people, not the other way around
- **Empowering**: We give time and freedom back to business owners

### Key Messages
1. "Get your time back" - Freedom through automation
2. "AI + Human = Innovation" - The power of collaboration
3. "Dream bigger" - Take your business where you only imagined
4. "Build to build" - We love creating solutions

## User Journey (Marketing Site)

### 1. Landing (Hero Section)
- Bold headline about AI-human collaboration
- Clear value proposition
- Primary CTA: "Explore How We Can Help"

### 2. Problem/Solution
- Pain points: Time constraints, repetitive tasks, missed opportunities
- Our solution: Intelligent automation that frees creative capacity

### 3. Services Showcase
- Workflow Automation
- Marketing Automation
- AI Integration
- Riddlen Platform (innovation showcase)

### 4. Social Proof
- Case studies or results
- Testimonials (when available)

### 5. Clear CTAs Throughout
- "Schedule a Consultation"
- "Learn More About [Service]"
- "See Riddlen in Action"

### 6. Contact
- Simple form or calendar booking
- Multiple contact methods

## Design Principles

### Visual Style
- **Clean**: Minimal clutter, focused messaging
- **Modern**: Contemporary design patterns
- **Professional**: Credible and trustworthy
- **Engaging**: Interactive elements where appropriate

### Color Palette Suggestions
- Primary: Deep blue/purple (trust, innovation)
- Accent: Bright cyan/teal (technology, future)
- Neutral: Clean whites and grays
- Highlight: Warm accent for CTAs (orange/coral)

### Typography
- **Headers**: Bold, modern sans-serif
- **Body**: Readable, professional font
- **Hierarchy**: Clear distinction between elements

## Content Guidelines

### Writing Style
- Active voice
- Clear, jargon-free language (explain when technical terms necessary)
- Benefit-focused (what user gains)
- Conversational but professional
- Short paragraphs for web readability

### SEO Keywords
- AI automation
- Workflow automation
- AI-human collaboration
- Marketing automation
- Web3 oracle network
- Business process automation
- AI integration services

## Development Guidelines

### Jekyll Best Practices
- Use liquid templating for reusable components
- Optimize images for web
- Mobile-first responsive design
- Fast load times (minimal dependencies)
- Clean URL structure

### Git Workflow
- Main branch for production (auto-deploys to GitHub Pages)
- Feature branches for new sections/updates
- Clear commit messages
- Regular backups

### Performance
- Compress images
- Minimize CSS/JS
- Use Jekyll's built-in minification
- Lazy load images where appropriate

## Content Sections Needed

### Homepage
- Hero with primary CTA
- Value proposition (3 key benefits)
- Services overview (cards/grid)
- Riddlen showcase
- Final CTA section

### About Page
- Origin story (Abba + Baba concept)
- Mission and values
- Team (when ready)
- What makes us different

### Services Pages
Individual pages or sections for:
- Workflow Automation
- Marketing Automation
- AI Integration Consulting
- Riddlen Platform

### Contact
- Contact form or booking calendar
- Email, social links
- Call-to-action reinforcement

## Riddlen Specific Details

When discussing Riddlen, emphasize:
- Innovation in AI validation
- Human oracle network concept
- Open-source commitment
- Gasless ecosystem (user-friendly)
- Cross-chain capability (enterprise-ready)
- Real-world validation combining AI generation with human verification

## Call-to-Action Examples

Primary CTAs:
- "Discover Your AI Potential"
- "Get Your Time Back"
- "Start Your Automation Journey"
- "Schedule a Free Consultation"

Secondary CTAs:
- "Learn More"
- "See How It Works"
- "Explore Riddlen"
- "Read Case Studies"

## Technical Notes for Claude

### Security & Privacy Guidelines
**CRITICAL: DO NOT READ OR ACCESS PRIVATE FILES**
- Never read `_config.private.yml` - contains sensitive API keys
- Never read any files matching `*.private.*` pattern
- Never access `.env` files or similar private configuration
- Never display, copy, or provide actual API key values
- Never include real API keys in documentation or instructions
- If you need to reference private config structure, refer to the setup documentation instead
- Respect gitignored files - they are private for security reasons
- ALWAYS use placeholders like [Your API Key] instead of actual keys
- Direct users to get keys from their local files, never provide them

## Technology Philosophy & Preferences

### Core Technology Values
**Abba Baba** strongly prefers custom, in-house solutions over third-party SaaS platforms:

#### **✅ Preferred Technologies**:
- **Claude & Claude Code** - Primary AI development platform
- **Custom API Integrations** - Direct connections without middleman services
- **In-House Solutions** - Proprietary systems we own and control
- **Open Source Tools** - When external dependencies are needed
- **Cloud Infrastructure** - For scalability and reliability

#### **❌ Avoid When Possible**:
- **Zapier, Make.com, n8n** - Prefer custom automation solutions
- **Third-party SaaS platforms** - Unless absolutely necessary
- **Recurring subscription services** - Build ownership instead
- **Template-based solutions** - Custom-built for each client

#### **Business Rationale**:
- **No Recurring Fees** - Clients own their solutions outright
- **Full Control** - No dependency on external services
- **Custom Fit** - Solutions tailored to specific business needs
- **AI-Powered** - Leverage Claude's capabilities for intelligent automation
- **Future-Proof** - Solutions that evolve with business needs

### Development Standards

#### **Site Architecture Rules**
1. **Single Layout System**: All pages use `layout: page` for consistency
2. **Styled HTML Only**: No mixing markdown and HTML - use styled sections
3. **Component Reuse**: Use established CSS classes for all new content
4. **Hero Section**: One per page, generated from front matter
5. **Mobile-First**: All components must be responsive
6. **Performance**: Optimize images, minimize dependencies

#### **Content Guidelines**
1. **Authentic Claims Only**: No fabricated statistics or fake testimonials
2. **Capability-Focused**: Showcase what we can build, not false achievements
3. **Technology Honest**: Emphasize custom solutions and Claude integration
4. **Human-Centric**: AI enhances humans, doesn't replace them
5. **Professional Tone**: Innovative but approachable, never overly technical

#### **CSS Standards**
1. **Use CSS Custom Properties**: `var(--text-primary)` not hardcoded colors
2. **Consistent Components**: Follow established patterns for new sections
3. **Proper Contrast**: All text must meet accessibility standards
4. **Hover Effects**: Consistent interaction patterns across components
5. **Grid Layouts**: Use CSS Grid for responsive card layouts

### When Working on This Project
1. **Maintain brand voice**: Professional, innovative, human-centric
2. **Focus on benefits**: Always translate features to user value
3. **Keep it clean**: Avoid over-complicating the design or copy
4. **Mobile-first**: Ensure responsive design in all additions
5. **Performance matters**: Optimize everything for fast loading
6. **Clear CTAs**: Every page should guide users to action
7. **SEO awareness**: Use semantic HTML, proper headings, meta descriptions
8. **Security first**: Never expose or log sensitive information
9. **Technology alignment**: Emphasize custom solutions and Claude integration
10. **Consistency**: Use established component patterns and CSS classes

### File Organization
- Keep layouts modular and reusable
- Use includes for repeated elements (header, footer, CTA sections)
- Organize assets logically (images by section, etc.)
- Comment code for future maintainability

### Configuration Priorities
- Set up proper baseurl for GitHub Pages
- Configure SEO plugin if using one
- Set up analytics (Google Analytics or alternative)
- Enable contact form (Formspree, Netlify Forms, or similar)

## Adding New Service Pages

### Creating a New Service Page

1. **Create the file**: `_services/service-name.md`
2. **Use the standard template**:
```yaml
---
title: "Service Name"
subtitle: "Brief description for hero section"
layout: page
benefits:
  - "Benefit 1"
  - "Benefit 2"
  - "Benefit 3"
  - "Benefit 4"
---
```

3. **Follow the standard section structure**:
   - Service Intro (with section-header)
   - How It Works/Our Approach (with process-steps)
   - Services/Solutions (with automation-list)
   - Technology Section (with tech-grid)
   - Results Section (with results-grid)
   - Implementation Timeline (with timeline)
   - Story/Why Choose (with value-card or story-card)

4. **Update services.md**: Add new service to the main services grid

5. **Technology Focus**: Always emphasize:
   - Claude & Claude Code integration
   - Custom in-house solutions
   - No recurring fees or SaaS dependencies
   - Direct API integrations
   - AI-powered automation

### Pagination Usage

#### **Using the Pagination Include**
```liquid
{% include pagination.html
   type="blog"
   style="default"
   current_page=2
   total_pages=5
   total_items=23
   per_page=5
   base_url="/blog"
%}
```

#### **Available Pagination Options**:
- **Types**: `blog`, `services`, `search` (adds contextual icons and styling)
- **Styles**: `default`, `minimal`, `compact`, `centered`, `simple`, `numbers-only`
- **Alternative Patterns**: Load more buttons, infinite scroll indicators

#### **Jekyll Pagination Setup**:
- Plugin: `jekyll-paginate` (installed)
- Configuration: 5 posts per page at `/blog/page:num/`
- Requirements: Must use `index.html` file (not `.md`) for pagination to work

### Maintenance Guidelines

#### **Regular Updates**
- Review content quarterly for accuracy
- Update technology mentions to reflect current tools
- Ensure all CTAs work and lead to appropriate pages
- Test mobile responsiveness on new content
- Validate contrast ratios and accessibility
- Test pagination on different screen sizes

#### **Content Consistency**
- All statistics should be capability-focused, not fabricated
- Technology sections should emphasize custom solutions
- Process timelines should be realistic and achievable
- Benefits should be specific and measurable

#### **Design System Maintenance**
- New components should extend existing CSS classes
- Color changes should be made in `_variables.scss`
- Component updates should be made in `_components.scss`
- Test changes across all service pages for consistency

## Questions to Consider

When expanding the site or adding features, ask:
1. Does this add value to the user journey?
2. Is the message clear and benefit-focused?
3. Does it maintain our brand voice?
4. Is it optimized for performance?
5. Does it include appropriate CTAs?
6. Is it accessible and responsive?
7. Does it emphasize our custom/in-house approach?
8. Are we avoiding third-party platform dependencies?

## Future Enhancements

Consider adding:
- Additional service pages for specialized offerings
- Interactive demos or calculators
- Resource center (guides, whitepapers)
- Client portal/dashboard demos
- Enhanced Riddlen integration showcase
- Performance case studies (without fabricated data)
- Technology comparison guides (custom vs SaaS)

---

**Remember**: Abba Baba is about empowering humans through AI collaboration. Every decision should serve that mission and make it easier for potential clients to understand how we can transform their business.