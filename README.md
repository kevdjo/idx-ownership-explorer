# IDX Ownership Explorer

> **🏆 Alibaba Cloud AI Championship 2026**
>
> This project is built with [Qwen Code](https://github.com/QwenLM/qwen-code) - an AI-powered coding assistant by Alibaba Cloud.
> Developed for the **Alibaba AI Championship** event, showcasing intelligent development workflows and modern web technologies.

![Alibaba Cloud AI Championship](https://img.shields.io/badge/Alibaba_AI_Championship-2026-orange?style=for-the-badge)
![Next.js](https://img.shields.io/badge/Next.js-14.2-black?style=for-the-badge&logo=next.js)
![TypeScript](https://img.shields.io/badge/TypeScript-5-blue?style=for-the-badge&logo=typescript)
![D3.js](https://img.shields.io/badge/D3.js-v7-orange?style=for-the-badge&logo=d3.js)

A Next.js web application for exploring and visualizing ownership data from the Indonesia Stock Exchange (IDX). This tool provides an interactive way to analyze shareholder structures, investor portfolios, and ownership relationships between companies and investors.

## Features

### 🔍 Search & Discovery
- **Dual Search Modes**: Toggle between searching by Company or Investor
- **Real-time Search**: Instant filtering as you type
- **Pagination**: Browse through 20 items per page with smooth navigation
- **Alphabetical Sorting**: Companies and investors sorted A-Z for easy browsing

### 📊 Company Analysis
- **Company Detail Pages** (`/company/[ticker]`): View complete shareholder structure for any listed company
- **Shareholder Table**: Detailed breakdown including:
  - Ownership percentage
  - Total shares held
  - Scrip vs. Scripless holdings
  - Number of shareholders
- **Top Shareholders Preview**: Quick view of top 3 shareholders on cards

### 👤 Investor Tracking
- **Investor Profile Pages** (`/investor/[name]`): See all companies owned by any investor
- **Portfolio Summary**: Total companies, shares, and average ownership percentage
- **Holdings Table**: Complete list of investments with ownership details

### 🕸️ Network Visualization
- **Interactive Graph**: D3.js force-directed graph showing ownership relationships
- **Company Network View**: Center company with connected investors (arrows point to company)
- **Investor Network View**: Center investor with connected portfolio companies (arrows point from investor)
- **Visual Encoding**:
  - 🔵 Blue nodes = Companies
  - 🟣 Purple nodes = Investors
  - 🟡 Gold border = Center/focus node
  - Arrow direction = Investment flow (investor → company)
- **Interactivity**:
  - Click nodes to navigate to detail pages
  - Drag nodes to reposition
  - Scroll to zoom in/out
  - Hover for highlight effect

### 🔗 Cross-Navigation
- **Clickable Shareholder Names**: Jump from company page to investor profile
- **Clickable Tickers**: Jump from investor page to company detail
- **Breadcrumb Navigation**: Easy return to home page

## Tech Stack

- **Framework**: Next.js 14.2 (App Router)
- **Language**: TypeScript
- **Styling**: Tailwind CSS
- **Visualization**: D3.js (force-directed graphs)
- **UI Components**: React 18

## Project Structure

```
idx-ownership-explorer/
├── public/
│   └── ownership.json          # Main ownership data source
├── src/
│   ├── app/
│   │   ├── company/
│   │   │   └── [ticker]/
│   │   │       └── page.tsx    # Company detail page
│   │   ├── investor/
│   │   │   └── [name]/
│   │   │       └── page.tsx    # Investor profile page
│   │   ├── network/
│   │   │   └── page.tsx        # Full network graph view
│   │   ├── fonts/              # Custom fonts
│   │   ├── globals.css         # Global styles
│   │   ├── layout.tsx          # Root layout
│   │   └── page.tsx            # Home page
│   └── components/
│       ├── CompanyCard.tsx     # Company card component
│       ├── CompanyDetail.tsx   # Company detail (legacy)
│       ├── NetworkGraph.tsx    # D3 network visualization
│       ├── SearchBar.tsx       # Search input (legacy)
│       └── SearchResults.tsx   # Search results (legacy)
├── package.json
├── tailwind.config.ts
└── tsconfig.json
```

## Getting Started

### Prerequisites

- Node.js 18+ installed
- npm, yarn, pnpm, or bun

### Installation

1. Clone the repository:
```bash
git clone <repository-url>
cd idx-ownership-explorer
```

2. Install dependencies:
```bash
npm install
```

3. Run the development server:
```bash
npm run dev
```

4. Open [http://localhost:3000](http://localhost:3000) in your browser

## Usage Guide

### Home Page
- Use the **Search by Company** tab to find companies by ticker or name
- Use the **Search by Investor** tab to find investors by name
- Browse the default view of 20 alphabetically sorted companies
- Use pagination controls to navigate through all results

### Company Page
- Access via `/company/[ticker]` (e.g., `/company/ADRO`)
- View complete shareholder structure in a table
- Click on any shareholder name to view their investor profile
- Explore the network graph to see ownership relationships

### Investor Page
- Access via `/investor/[name]` (e.g., `/investor/SARATOGA%20INVESTAMA%20SEDAYA%20TBK%20PT`)
- View all companies owned by the investor
- See portfolio statistics (total companies, shares, avg ownership)
- Click on any company ticker to view its detail page

### Network Graph
- Available on company and investor detail pages
- Shows relationships between the focus entity and connected nodes
- Click nodes to navigate
- Drag to reposition nodes
- Scroll to zoom in/out

## Data Source

The application uses `public/ownership.json` as its data source, which contains:

```typescript
interface Company {
  ticker: string;           // Stock ticker symbol
  company: string;          // Company name
  shareholders: Shareholder[];
}

interface Shareholder {
  name: string;                     // Shareholder/investor name
  percent: number;                  // Ownership percentage
  total_shares: number;             // Total shares held
  holding_scrip: number;            // Shares in physical certificate form
  holding_scrip_percentage: number; // Percentage in scrip form
  holding_scripless: number;        // Shares in electronic form
  holding_scripless_percentage: number; // Percentage in scripless form
}
```

## Available Scripts

| Command | Description |
|---------|-------------|
| `npm run dev` | Start development server on port 3000 |
| `npm run build` | Build for production |
| `npm start` | Start production server |
| `npm run lint` | Run ESLint for code quality |

## Component Documentation

### NetworkGraph
Reusable D3.js network visualization component.

**Props:**
- `companies`: Array of company data
- `centerNode`: Optional focus node (company or investor)
- `maxNodes`: Maximum nodes to display (default: 50)

**Features:**
- Force-directed layout with collision detection
- Zoom and pan support
- Draggable nodes
- Click navigation
- Arrow indicators showing investment direction

### CompanyCard
Card component for displaying company summaries.

**Props:**
- `company`: Company data object
- `searchQuery`: Current search term for highlighting

## Browser Support

- Chrome (latest)
- Firefox (latest)
- Safari (latest)
- Edge (latest)

## Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## License

This project is proprietary and confidential.

## Acknowledgments

- Data sourced from Indonesia Stock Exchange (IDX)
- Built with [Next.js](https://nextjs.org) and [D3.js](https://d3js.org)
- Styled with [Tailwind CSS](https://tailwindcss.com)
- Developed with [Qwen Code](https://github.com/QwenLM/qwen-code) for the **Alibaba AI Championship 2026**
