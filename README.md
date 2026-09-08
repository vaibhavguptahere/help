# AWS Route 53 Clone

A full-stack clone of the AWS Route 53 DNS management console, built as part of the Scaler SDE Fullstack Assessment.

## Tech Stack

| Layer    | Technology                                      |
|----------|--------------------------------------------------|
| Frontend | Next.js 16, React 19, TypeScript, Lucide Icons  |
| Backend  | FastAPI, SQLAlchemy, Python-Jose (JWT)           |
| Database | SQLite                                           |

## Features Implemented

### Authentication
- User registration and login with JWT-based authentication
- Protected routes — unauthenticated users are redirected to login

### Hosted Zones (CRUD)
- **Create** hosted zone with domain name, description, and type (Public/Private)
- **List** all hosted zones in a table with name, type, record count
- **View** hosted zone details in a sidebar panel (zone name, ID, description, type, record count, name servers)
- **Delete** hosted zone with AWS-style confirmation modal (requires typing "delete")

### DNS Records (CRUD)
- **Create** DNS records (A, AAAA, CNAME, MX, TXT, NS, SOA)
- **List** records in a sortable table with columns: Name, Type, Value, TTL
- **View** record details in a right-hand sidebar panel with copy buttons
- **Edit** existing DNS records
- **Delete** records (apex NS and SOA records are protected from deletion)
- Auto-seeded NS and SOA records when a hosted zone is created

### UI/UX (AWS Console Replica)
- Pixel-accurate AWS console layout: dark top navbar, secondary breadcrumb bar, left sidebar navigation, content area, fixed footer
- Left sidebar with all Route 53 sections: Dashboard, Hosted zones, Health checks, Profiles, Global Resolver, VPC Resolver, Domains, IP-based routing, Traffic flow, DNS Firewall, Application Recovery Controller
- Split-view toggle button for detail sidebars
- Row selection with radio buttons and blue highlight borders
- AWS-style action buttons: orange primary, white secondary with border
- Toast notifications for placeholder features

### Pages
| Page | Route | Description |
|------|-------|-------------|
| Landing | `/` | AWS Route 53 product page with hero section, "How it works" video, pricing, and resources |
| Login | `/login` | JWT login and registration |
| Dashboard | `/dashboard` | Notifications table, "More resources" panel |
| Hosted Zones | `/hosted-zones` | List, create, delete hosted zones with detail sidebar |
| Zone Records | `/hosted-zones/[id]` | Collapsible zone details, records table, record detail sidebar |
| Health Checks | `/health-checks` | Health checks table with search, action buttons, "How it works" panel |

## Project Structure

```
├── backend/
│   ├── app/
│   │   ├── main.py              # FastAPI app entry point, CORS config
│   │   ├── database.py          # SQLAlchemy engine + session
│   │   ├── deps.py              # Auth dependency (JWT verification)
│   │   ├── auth/                # JWT token creation
│   │   ├── models/              # SQLAlchemy models (User, HostedZone, DNSRecord)
│   │   ├── schemas/             # Pydantic request/response schemas
│   │   └── routers/             # API routes (auth, hosted_zones, records)
│   ├── requirements.txt
│   └── route53.db               # SQLite database
│
├── frontend/
│   ├── app/
│   │   ├── page.tsx             # Landing page
│   │   ├── login/               # Login/Register page
│   │   ├── dashboard/           # Dashboard page
│   │   ├── hosted-zones/        # Hosted zones list + [id] detail page
│   │   ├── health-checks/       # Health checks page
│   │   └── profiles/            # Profiles page (placeholder)
│   ├── components/
│   │   └── Layout.tsx           # Shared layout (navbar, sidebar, footer)
│   ├── lib/
│   │   ├── api.ts               # Axios API base config
│   │   └── auth.ts              # Token get/set/remove helpers
│   └── public/                  # Static assets (AWS logo, images)
```

## API Endpoints

| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/auth/register` | Register a new user |
| POST | `/auth/login` | Login and receive JWT token |
| GET | `/hosted-zones` | List all hosted zones |
| POST | `/hosted-zones` | Create a new hosted zone |
| GET | `/hosted-zones/{id}` | Get hosted zone details |
| DELETE | `/hosted-zones/{id}` | Delete a hosted zone |
| GET | `/hosted-zones/{id}/records` | List DNS records for a zone |
| POST | `/hosted-zones/{id}/records` | Create a DNS record |
| PUT | `/hosted-zones/{id}/records/{record_id}` | Update a DNS record |
| DELETE | `/hosted-zones/{id}/records/{record_id}` | Delete a DNS record |

## Setup & Run

### Prerequisites
- Python 3.10+
- Node.js 18+

### Backend
```bash
cd backend
python -m venv venv
venv\Scripts\activate        # Windows
pip install -r requirements.txt
uvicorn app.main:app --reload
```
Backend runs at `http://localhost:8000`

### Frontend
```bash
cd frontend
npm install
npm run dev
```
Frontend runs at `http://localhost:3000`

### Environment
Create `frontend/.env.local`:
```
NEXT_PUBLIC_API_URL=http://localhost:8000
```
