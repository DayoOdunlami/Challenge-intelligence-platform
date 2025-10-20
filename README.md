# Challenge Intelligence Platform

The UK Infrastructure Innovation Exchange - A visual intelligence system that maps the UK infrastructure innovation landscape, revealing cross-sector patterns and opportunities that traditionally remain hidden.

## Overview

The Challenge Intelligence Platform proves that infrastructure challenges cluster across sectors, enabling one innovation to serve multiple buyers and demonstrating why evidence transfer matters. The core thesis: Infrastructure challenges are siloed by sector, hiding cross-sector patterns that could accelerate innovation adoption.

## Key Features

- **Interactive Network Visualization**: Force-directed graph showing challenge relationships and cross-sector patterns
- **Multiple Visualization Types**: Chord diagrams, sunburst charts, heatmaps, and Sankey flows
- **Smart Filtering**: Filter by sector, problem type, budget, and deadline
- **Challenge Intelligence**: AI-powered similarity detection revealing hidden connections
- **Reviewer Response System**: Comprehensive response to stakeholder feedback with animations and evidence

## Getting Started

First, run the development server:

```bash
npm run dev
# or
yarn dev
# or
pnpm dev
# or
bun dev
```

Open [http://localhost:3000](http://localhost:3000) with your browser to see the result.

## Navigation

- **Home**: Main landing page with overview
- **For Reviewers**: Comprehensive response to stakeholder feedback (NEW)
- **Pitch Deck**: Executive presentation of the concept
- **Buyer/SME Profiles**: User journey examples
- **Visualizations**: Network graph, heatmap, chord diagram, sunburst chart, Sankey flow

## Technology Stack

- **Framework**: Next.js 15 with TypeScript and App Router
- **Styling**: Tailwind CSS with CPC brand theme
- **Visualizations**: D3.js, Nivo charts, React Force Graph
- **Animations**: Framer Motion for scroll-triggered animations
- **UI Components**: shadcn/ui component library

## Learn More

To learn more about Next.js, take a look at the following resources:

- [Next.js Documentation](https://nextjs.org/docs) - learn about Next.js features and API.
- [Learn Next.js](https://nextjs.org/learn) - an interactive Next.js tutorial.

You can check out [the Next.js GitHub repository](https://github.com/vercel/next.js) - your feedback and contributions are welcome!

## Deploy on Vercel

The easiest way to deploy your Next.js app is to use the [Vercel Platform](https://vercel.com/new?utm_medium=default-template&filter=next.js&utm_source=create-next-app&utm_campaign=create-next-app-readme) from the creators of Next.js.

Check out our [Next.js deployment documentation](https://nextjs.org/docs/app/building-your-application/deploying) for more details.
