# Abba Baba - AI Human Collaboration Company

Welcome to the Abba Baba website repository. This Jekyll-powered site showcases our AI-human collaboration services and our flagship Riddlen platform.

## About Abba Baba

Abba Baba pioneers AI-human collaboration through:
- **Workflow Automation** - Streamline processes and reclaim time
- **Marketing Automation** - Scale authentic engagement
- **AI Integration** - Strategic AI implementation for business value
- **Riddlen Platform** - Web3 innovation with human oracle validation

## Website Structure

This is a Jekyll static site optimized for GitHub Pages deployment.

### Key Pages
- **Homepage** (`index.md`) - Hero section with value proposition
- **About** (`about.md`) - Company mission and story
- **Services** (`services.md`) - Automation solutions overview
- **Riddlen** (`riddlen.md`) - Web3 platform showcase
- **Contact** (`contact.md`) - Contact form and information

### Services Collection
Individual service pages in `_services/`:
- `workflow-automation.md`
- `marketing-automation.md`
- `ai-integration.md`

## Development

### Prerequisites
- Ruby 2.7+
- Bundler
- Jekyll 4.3+

### Local Development

1. **Clone the repository**
   ```bash
   git clone [repository-url]
   cd AbbaBaba
   ```

2. **Install dependencies**
   ```bash
   bundle install
   ```

3. **Serve locally**
   ```bash
   bundle exec jekyll serve
   ```

4. **View the site**
   Open `http://localhost:4000` in your browser

### File Structure

```
abbababa/
├── _config.yml           # Jekyll configuration
├── _layouts/             # Page templates
│   ├── default.html      # Base layout
│   ├── page.html         # Standard page layout
│   └── service.html      # Service page layout
├── _includes/            # Reusable components
│   ├── header.html       # Site navigation
│   ├── footer.html       # Site footer
│   └── cta-section.html  # Call-to-action component
├── _sass/               # Stylesheet partials
│   ├── _variables.scss   # Colors, fonts, spacing
│   ├── _base.scss        # Base styles and typography
│   ├── _layout.scss      # Layout components
│   ├── _components.scss  # UI components
│   └── _responsive.scss  # Mobile responsiveness
├── assets/              # Static assets
│   ├── css/main.scss     # Main stylesheet
│   └── js/main.js        # JavaScript functionality
├── _services/           # Service collection
├── index.md             # Homepage
├── about.md             # About page
├── services.md          # Services overview
├── riddlen.md           # Riddlen platform
├── contact.md           # Contact page
├── thank-you.md         # Form submission thank you
└── README.md            # This file
```

## Design System

### Colors
- **Primary**: Deep blue (#2563eb)
- **Secondary**: Darker blue (#1e40af)
- **Accent**: Bright cyan (#06b6d4)
- **Highlight**: Orange (#f97316) for CTAs

### Typography
- **Font**: Inter (fallback to system fonts)
- **Headings**: Bold, modern hierarchy
- **Body**: Readable, professional

### Components
- Responsive navigation with mobile menu
- Hero sections with gradients
- Card-based content layouts
- CTA sections with strong visual hierarchy
- Professional contact forms

## Content Guidelines

### Brand Voice
- Professional yet approachable
- Innovation-focused without being overly technical
- Human-centric - technology serves people
- Empowering - giving time and freedom back

### Key Messages
1. "Get your time back" - Freedom through automation
2. "AI + Human = Innovation" - Power of collaboration
3. "Dream bigger" - Take business where you imagined
4. "Build to build" - Love creating solutions

### SEO Keywords
- AI automation
- Workflow automation
- AI-human collaboration
- Marketing automation
- Web3 oracle network
- Business process automation
- AI integration services

## Deployment

### GitHub Pages (Recommended)

1. **Push to main branch**
   ```bash
   git add .
   git commit -m "Update website"
   git push origin main
   ```

2. **Enable GitHub Pages**
   - Go to repository Settings
   - Navigate to Pages section
   - Set source to "Deploy from a branch"
   - Select "main" branch
   - Site will be available at `https://[username].github.io/AbbaBaba`

### Custom Domain Setup

1. **Add CNAME file**
   ```bash
   echo "yourdomain.com" > CNAME
   ```

2. **Configure DNS**
   - Point your domain to GitHub Pages IP addresses
   - Add CNAME record for www subdomain

### Environment Variables

For production deployment, configure:
- **Formspree Form ID** in `contact.md` (replace `YOUR_FORM_ID`)
- **Google Analytics** tracking ID in `_config.yml`
- **Social media** usernames in `_config.yml`

## Customization

### Adding New Services

1. Create new file in `_services/` directory
2. Use front matter with required fields:
   ```yaml
   ---
   title: "Service Name"
   subtitle: "Brief description"
   benefits:
     - "Benefit one"
     - "Benefit two"
   ---
   ```

### Modifying Styles

1. Edit variables in `_sass/_variables.scss`
2. Add custom styles to appropriate SCSS files
3. Jekyll will automatically compile changes

### Form Configuration

1. Sign up for [Formspree](https://formspree.io/)
2. Replace `YOUR_FORM_ID` in contact form action
3. Configure thank you page redirect URL

## Performance

### Optimization Features
- Compressed CSS/JS
- Optimized images
- Minimal dependencies
- Mobile-first responsive design
- Fast loading times

### Monitoring
- Use Google PageSpeed Insights
- Monitor Core Web Vitals
- Test mobile responsiveness

## Support

### Issues and Bugs
- Report issues in the repository issue tracker
- Include browser version and steps to reproduce

### Feature Requests
- Submit feature requests with detailed descriptions
- Consider contributing code changes via pull requests

### Content Updates
- Content changes can be made directly in Markdown files
- No technical knowledge required for text updates

## Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Test thoroughly
5. Submit a pull request

## License

This website is proprietary to Abba Baba. All rights reserved.

---

**Abba Baba** - Pioneering AI-human collaboration through intelligent automation and innovation.

*For questions about this website or our services, contact us at {{ site.email }}*