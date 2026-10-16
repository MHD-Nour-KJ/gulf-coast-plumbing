# Gulf Coast Plumbing LLC — Website

Official multi-page website for **Gulf Coast Plumbing LLC**, serving St. Petersburg, Tampa, Clearwater, and the greater Tampa Bay area.

## Key Features

- **Multi-Page Layout**: Dedicated pages for Home, About, Services, Projects, Before & After Transformations, and Contact.
- **Glassmorphism Navigation**: Floating navigation header with quick drawer access for emergency dispatch.
- **Interactive Before & After**: Sliders showcasing cast-iron repipes, whole-home filtration, and water heater installs.
- **Quote & Booking Modal**: Direct quote request flow with dynamic service selection and instant validation.
- **Interactive Diagnostics**: Hairline vector diagnostic tools (`hairline-plumbing.html`, `hairline-purifier.html`, `hairline-filter.html`).
- **Responsive Design**: Tested and calibrated across mobile (375px), tablet (768px), laptop (1024px), and wide desktop (1440px+).
- **Fast & Dependency-Free**: Pure HTML5, modern CSS3, and vanilla JavaScript with zero framework overhead.

## Site Structure

```
├── index.html              # Homepage
├── about.html              # Company background, credentials, and team
├── services.html           # Full plumbing service catalog
├── projects.html           # Featured residential and commercial work
├── transformations.html    # Before & after comparison showcase
├── contact.html            # Contact info, map, and dispatch request
├── styles.css              # Global styles, variables, layout, and animations
├── app.js                  # Global application script (modals, sliders, nav)
├── assets/                 # SVGs, optimized images, and icons
└── vercel.json             # Vercel deployment and clean URL routing
```

## Deployment to Vercel

This repository is ready to deploy on Vercel out of the box:

1. Import this repository into your Vercel account.
2. Vercel automatically detects the project as a static site.
3. Keep default settings (no build command needed).
4. Click **Deploy**.

`vercel.json` automatically enables clean URLs, meaning routes like `/about`, `/services`, and `/contact` resolve cleanly without requiring `.html` in the browser address bar.

## Local Development

Open `index.html` directly in any browser, or run a local static file server:

```bash
npx serve .
```
or with Python:
```bash
python -m http.server 3000
```
