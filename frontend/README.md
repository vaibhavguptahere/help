# AWS Route 53 Clone - Frontend

Next.js frontend recreating the AWS Route 53 DNS management console UI and workflows.

## Tech Stack
- **Framework**: Next.js 16 (App Router), React 19, TypeScript
- **Styling**: Vanilla CSS (AWS Console Design System)
- **Icons**: Lucide React
- **HTTP Client**: Axios

## Features Implemented
- **Landing Page (`/`)**: Route 53 product overview, hero section, interactive tabs, "How it works" architecture preview.
- **Authentication (`/login`)**: JWT-based login and registration with session token management.
- **Dashboard (`/dashboard`)**: Route 53 console dashboard with resource links and navigation overview.
- **Hosted Zones (`/hosted-zones`)**:
  - List hosted zones with domain type (Public/Private), record count, and search filter.
  - Create hosted zone with domain validation.
  - Delete hosted zone with AWS-style confirmation prompt (type "delete").
  - Split-screen hosted zone detail drawer.
- **DNS Records Management (`/hosted-zones/[id]`)**:
  - View all DNS records for a zone (A, AAAA, CNAME, MX, TXT, NS, SOA).
  - Create DNS records with TTL, type, and record values.
  - Edit and Delete DNS records (apex NS and SOA records protected).
  - Record details inspector sidebar with quick copy buttons.
- **Health Checks (`/health-checks`)**: Health checks monitoring list and "How it works" information panel.
- **Console Layout**: AWS top navigation bar with search, region selector, and Route 53 navigation sidebar.

## Setup & Running Locally

1. **Install dependencies**:
   ```bash
   npm install
   ```

2. **Environment Configuration**:
   Ensure `.env.local` contains:
   ```env
   NEXT_PUBLIC_API_URL=http://localhost:8000
   ```

3. **Start Development Server**:
   ```bash
   npm run dev
   ```
   Open [http://localhost:3000](http://localhost:3000) in your browser.
