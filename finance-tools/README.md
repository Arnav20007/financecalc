# FinanceCalc — Professional Financial Calculator Platform

Production-ready, SEO-optimized financial calculator platform built with React + Vite (frontend) and Flask (backend API).

## 🏗️ Architecture

```
finance-tools/
├── src/                          # React Frontend
│   ├── components/
│   │   ├── Layout/               # Header, Footer, Layout wrapper
│   │   └── common/               # AdSlot, FAQSection, SEOHead, etc.
│   ├── pages/                    # Route pages (calculators, legal)
│   ├── utils/                    # Calculation engine, formatters, PDF
│   ├── index.css                 # Complete design system
│   ├── App.jsx                   # Router & lazy loading
│   └── main.jsx                  # Entry point
├── public/                       # Static assets
│   ├── sitemap.xml
│   ├── robots.txt
│   └── favicon.svg
├── backend/                      # Flask API
│   ├── app.py                    # REST API endpoints
│   ├── schema.sql                # PostgreSQL database schema
│   └── requirements.txt          # Python dependencies
├── index.html                    # HTML shell with SEO markup
├── vite.config.js                # Vite configuration
└── package.json                  # Node dependencies
```

## 🚀 Quick Start

### Prerequisites
- **Node.js** 18+ and npm
- **Python** 3.9+ (for backend)
- **PostgreSQL** 15+ (optional, for future features)

### Frontend Setup

```bash
cd finance-tools

# Install dependencies
npm install

# Start development server
npm run dev
```

The frontend will be available at `http://localhost:5173`.

### Backend Setup (Optional)

```bash
cd finance-tools/backend

# Create virtual environment
python -m venv venv

# Activate (Windows)
venv\Scripts\activate

# Activate (macOS/Linux)
source venv/bin/activate

# Install dependencies
pip install -r requirements.txt

# Run development server
flask run --port 5000
```

### Database Setup (Optional)

```bash
# Create database
createdb financecalc

# Run schema
psql financecalc < schema.sql
```

## 📱 Features

### 5 Financial Calculators
1. **Compound Interest** — Growth projections with monthly contributions
2. **Loan Payoff** — Full amortization schedule and timeline
3. **Retirement** — Corpus projection and withdrawal estimates
4. **Inflation** — Purchasing power erosion visualization
5. **Debt Snowball** — Snowball vs Avalanche strategy comparison

### Each Calculator Includes
- ✅ Functional calculator logic
- ✅ Interactive Chart.js visualizations
- ✅ Year-by-year data tables
- ✅ PDF download of results
- ✅ Share results button
- ✅ Compare scenarios feature
- ✅ 1000+ words SEO content
- ✅ FAQ section with schema markup
- ✅ Internal linking to other calculators
- ✅ "Try Next Calculator" recommendations

### Legal Pages
- Privacy Policy
- Terms & Conditions
- Financial Disclaimer

## 🎨 Design System

Professional fintech UI with:
- **Navy/white/gray** neutral color palette
- **Inter** font family (Google Fonts)
- **Mobile-first** responsive design
- **Smooth animations** and transitions
- **Trust-focused** layout patterns

## 📈 SEO Features

- ✅ Dynamic meta titles and descriptions per page
- ✅ Open Graph tags for social sharing
- ✅ Schema.org FAQ structured data
- ✅ WebPage schema markup
- ✅ Organization schema
- ✅ XML Sitemap
- ✅ robots.txt
- ✅ Clean URL structure
- ✅ Semantic HTML (h1, h2, nav, main, section)
- ✅ Breadcrumb navigation
- ✅ Internal linking strategy

## 💰 AdSense Integration

### Ad Slot Placements
The application includes pre-built ad slot components at strategic positions:

1. **Header Ad** — Top of every page (728x90 leaderboard)
2. **Mid-Content Ad** — Between results and table (300x250 or responsive)
3. **Bottom Ad** — Before footer (728x90 or responsive)
4. **Multiplex Ad** — After SEO content (responsive grid)

### How to Integrate AdSense

1. **Get your AdSense publisher ID** (format: `ca-pub-XXXXXXXXXX`)

2. **Add the AdSense script** to `index.html`:
```html
<script async src="https://pagead2.googlesyndication.com/pagead/js/adsbygoogle.js?client=ca-pub-XXXXXXXXXX" crossorigin="anonymous"></script>
```

3. **Update the AdSlot component** (`src/components/common/AdSlot.jsx`):
```jsx
export default function AdSlot({ type }) {
  useEffect(() => {
    try {
      (window.adsbygoogle = window.adsbygoogle || []).push({});
    } catch (e) {}
  }, []);

  return (
    <div className={`ad-slot ad-slot--${type}`}>
      <ins className="adsbygoogle"
        style={{ display: 'block' }}
        data-ad-client="ca-pub-XXXXXXXXXX"
        data-ad-slot="YOUR_AD_SLOT_ID"
        data-ad-format="auto"
        data-full-width-responsive="true"
      />
    </div>
  );
}
```

4. **Create separate ad units** in your AdSense dashboard for each placement type (header, mid-content, bottom, multiplex).

### AdSense Best Practices for This Site
- Each calculator page has high word count (1000+) for ad approval
- Multiple ad placements without being intrusive
- Clean, professional design signals "quality content"
- Long time-on-page from interactive calculators helps earnings

## 🚢 Deployment

### Option 1: Vercel (Recommended for Frontend)

```bash
# Install Vercel CLI
npm install -g vercel

# Deploy
vercel
```

Create `vercel.json` for SPA routing:
```json
{
  "rewrites": [
    { "source": "/((?!api|sitemap|robots).*)", "destination": "/index.html" }
  ]
}
```

### Option 2: Netlify

```bash
# Build
npm run build

# Deploy dist/ folder
```

Create `public/_redirects`:
```
/* /index.html 200
```

### Option 3: Railway / Render (Full Stack)

For deploying both frontend and backend:

1. **Backend:** Deploy as a Python service with `gunicorn app:app`
2. **Frontend:** Build and serve static files or deploy separately

### Option 4: Docker

```dockerfile
# Frontend
FROM node:20-alpine AS build
WORKDIR /app
COPY package*.json ./
RUN npm ci
COPY . .
RUN npm run build

FROM nginx:alpine
COPY --from=build /app/dist /usr/share/nginx/html
COPY nginx.conf /etc/nginx/conf.d/default.conf
EXPOSE 80
```

### Backend Deployment

```bash
# With gunicorn (production)
gunicorn -w 4 -b 0.0.0.0:5000 app:app

# Environment variables needed:
# SECRET_KEY=your-production-secret
# DATABASE_URL=postgresql://user:pass@host:5432/financecalc
# FLASK_DEBUG=false
```

## 🗄️ Database Schema

The PostgreSQL schema includes tables for:
- **users** — User accounts with premium flags
- **saved_calculations** — Persisted calculation results
- **calculation_scenarios** — Compare feature data
- **page_views** — Privacy-respecting analytics
- **calculator_usage** — Anonymous usage tracking
- **subscriptions** — Stripe-ready premium subscriptions
- **shared_results** — Shareable calculation links
- **newsletter_subscribers** — Email list
- **contact_submissions** — Support form

## 🔧 Configuration

### Environment Variables

| Variable | Description | Default |
|----------|-------------|---------|
| `SECRET_KEY` | Flask secret key | `dev-secret-key` |
| `DATABASE_URL` | PostgreSQL connection string | `postgresql://localhost:5432/financecalc` |
| `FLASK_DEBUG` | Enable debug mode | `false` |
| `PORT` | Backend port | `5000` |

### Vite Config

The `vite.config.js` is configured for:
- React Fast Refresh
- Code splitting (lazy routes)
- Optimized production builds

## 📊 Performance

- ⚡ Lazy-loaded route pages for optimal initial load
- ⚡ CSS design tokens (no CSS-in-JS runtime)
- ⚡ SVG favicon (no extra HTTP request)
- ⚡ Minimal dependencies
- ⚡ Tree-shakeable Chart.js imports

## 🛣️ Roadmap

### Phase 2
- [ ] User authentication (JWT)
- [ ] Save/load calculations
- [ ] Shareable result links
- [ ] Email reports

### Phase 3
- [ ] Premium features (advanced calculators)
- [ ] Blog/guides section
- [ ] Newsletter integration
- [ ] API rate limiting

### Phase 4
- [ ] Mobile app (React Native)
- [ ] Advanced charting (scenario modeling)
- [ ] AI-powered insights
- [ ] Embeddable widgets

## 📄 License

This project is proprietary. All rights reserved.

---

**Built by FinanceCalc** — Making financial planning accessible to everyone.
