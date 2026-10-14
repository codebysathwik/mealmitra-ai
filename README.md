# 🍲 MealMitra AI — Rescue Food. Reduce Waste. Feed Lives.

> **AI-powered surplus food redistribution platform** connecting restaurants, college canteens, hostels, caterers, and event organizers with verified NGOs, community kitchens, and shelters—coordinated seamlessly by volunteer couriers.

[![Vite](https://img.shields.io/badge/Vite-6.x-646CFF?logo=vite&logoColor=white)](https://vitejs.dev/)
[![React](https://img.shields.io/badge/React-19.x-61DAFB?logo=react&logoColor=black)](https://react.dev/)
[![TailwindCSS](https://img.shields.io/badge/TailwindCSS-v4-06B6D4?logo=tailwindcss&logoColor=white)](https://tailwindcss.com/)
[![Supabase](https://img.shields.io/badge/Supabase-Ready-3ECF8E?logo=supabase&logoColor=white)](https://supabase.com/)

---

## 🌟 Key Capabilities

### 1. Complete Authentication & Role-Based Access Control (RBAC)
- **Role Isolation**: Accounts are strictly segmented into **Donor**, **Recipient**, and **Volunteer** roles.
- **Route Guards**: Client-side state tampering and unauthorized direct URL routing (e.g. Recipient visiting `/donor`) are blocked with a dedicated **403 Access Restricted** recovery screen.
- **Persistent Sessions**: Sessions persist across browser reloads.
- **Dual-Mode Backend**:
  - **🛡️ Local Storage Demo Mode**: Runs immediately out of the box with zero external setup, supporting full registration, login, and password validation.
  - **⚡ Supabase Cloud Mode**: Seamlessly switches to live Supabase Auth and PostgreSQL persistence when `.env.local` credentials are provided.

### 2. Role-Dedicated Dashboards
- **🏢 Donor Dashboard (`/donor`)**:
  - Organization profile overview (type, city, verified badge).
  - Derived application metrics: Active listings, available food quantity (servings), pending requests, and food rescued.
  - "Create Donation" workflow with allergen and storage condition tracking.
  - Filterable listings (`All`, `Active/Listed`, `Requested`, `Completed`, `Cancelled`).
  - Incoming NGO request management with one-click **Accept** (auto-assigns courier) or **Reject** (restores inventory).
  - Upcoming pickup schedule and permanent donation history.
- **🤝 Recipient NGO Dashboard (`/recipient`)**:
  - NGO profile with daily feeding capacity, dietary preference (`Veg` / `Non-Veg`), and location.
  - **Smart Rescue AI** recommendations ranking available food surplus tailored to the NGO's capacity and dietary preferences.
  - 5-stage request pipeline tabs: `All Active`, `Requested (Pending)`, `Accepted & In Transit`, `Completed Deliveries`, and `Rejected / Cancelled`.
  - Delivery receipt confirmation allowing recipient organizations to directly verify completed handovers.
- **🚚 Volunteer Courier Hub (`/volunteer`)**:
  - Route cards with Step 1 (Pickup from Donor with authorized contact) and Step 2 (Deliver to NGO with location and capacity).
  - Open opportunity board to claim unassigned pickups.
  - Strict privacy protections preventing volunteers from accessing unrelated contact information.
  - Handover workflow (`Mark as Collected` ➔ `Mark as Delivered ✓`).

### 3. Smart Rescue AI Matching Engine
- **Deterministic Multi-Factor Scoring**:
  - **Proximity (30%)**: Geolocation distance match.
  - **Capacity (25%)**: Listing quantity vs NGO daily feeding capacity.
  - **Urgency (25%)**: Proximity to food expiration/pickup deadline.
  - **Dietary Preference (20%)**: Dietary preference alignment (`Veg` / `Non-Veg`).
- **Explainability**: Clear visual breakdown percentages for every recommended match.

---

## 🎨 Design System

MealMitra AI features a responsive design adhering to the brand palette:

| Color | Hex | Role |
|---|---|---|
| **Forest Green** | `#174C3C` | Primary branding, header, key titles, solid accents |
| **Fresh Green** | `#2F8057` | Primary action buttons, verified status badges, active states |
| **Warm Cream** | `#F5F2E9` | Main page background (`bg-cream-100`), soft container fills |
| **Gold / Amber** | `#E8B65A` | AI match score badges, pending indicators, urgency warnings |
| **Pure White** | `#FFFFFF` | Elevated cards, dialog modals, input fields |

---

## 🚀 Getting Started

### Prerequisites
- [Node.js](https://nodejs.org/) (v18.0.0 or higher recommended)
- `npm` (comes with Node.js)

### Installation
1. Clone or navigate to the repository:
   ```bash
   cd c:/ANTIGRAVITY/mealmitra
   ```

2. Install dependencies:
   ```bash
   npm install
   ```

3. Launch development server:
   ```bash
   npm run dev
   ```
   Open [http://localhost:5173](http://localhost:5173) in your browser.

4. Build for production:
   ```bash
   npm run build
   ```

5. Run automated test suite:
   ```bash
   npm test
   ```
   *Runs 22 unit tests covering RBAC, Smart Rescue AI matching, and food inventory workflows.*

---

## 🔑 Demo Test Credentials

You can use the one-click demo presets on the **Login Page** or enter the following credentials:

| Role | Email | Password | Organization Profile |
|---|---|---|---|
| **Donor** | `ravi@example.com` | `Password123!` | Hotel Srinivasa Grand (Restaurant, Vijayawada) |
| **Recipient** | `mary@example.com` | `Password123!` | Grace Home Trust (NGO, Capacity: 50) |
| **Volunteer** | `suresh@example.com` | `Password123!` | Suresh Vol (Courier Hero) |

*You can also register a brand new account with custom organization details via the **Sign-Up Page**.*

---

## 🗄️ Database & Supabase Cloud Setup (Optional)

The application operates without cloud dependencies in Demo Mode. To connect a live Supabase PostgreSQL database:

1. Create a project at [supabase.com](https://supabase.com).
2. Copy `.env.example` to `.env.local`:
   ```bash
   cp .env.example .env.local
   ```
3. Populate with your project keys:
   ```env
   VITE_SUPABASE_URL=https://your-project.supabase.co
   VITE_SUPABASE_ANON_KEY=your-anon-public-key
   ```
4. Run the SQL migration script located at:
   ```
   supabase/migrations/20261014_init_mealmitra.sql
   ```
   in your Supabase SQL Editor. This script creates the `profiles`, `listings`, `requests`, `assignments`, and `donations` tables with Row Level Security (RLS) policies.

---

## 📁 Project Structure

```
mealmitra/
├── dist/                      # Production build output
├── public/                    # Static assets
├── src/
│   ├── assets/                # Logos and graphics
│   ├── components/
│   │   ├── Header.jsx         # Role-aware navigation & profile dropdown menu
│   │   ├── Footer.jsx         # Global footer
│   │   └── ui.jsx             # Design system components & DemoBanner
│   ├── context/
│   │   ├── AuthContext.jsx    # Dual-mode authentication & session persistence
│   │   └── AppContext.jsx     # Centralized state (listings, requests, assignments)
│   ├── data/
│   │   └── demoData.js        # Seed demo users, organizations, and listings
│   ├── lib/
│   │   ├── matching.js        # Rule-based Smart Rescue AI algorithm
│   │   └── supabase.js        # Supabase client initialization
│   ├── pages/
│   │   ├── Landing.jsx        # Public home & hero page
│   │   ├── Login.jsx          # Sign-in with password toggle & demo presets
│   │   ├── Signup.jsx         # Registration with role cards & org details
│   │   ├── ForgotPassword.jsx # Password recovery initiation
│   │   ├── ResetPassword.jsx  # New password setup
│   │   ├── AccessDenied.jsx   # 403 role violation recovery page
│   │   ├── DonorDashboard.jsx # Donor metrics, listings, and request approval
│   │   ├── RecipientDashboard.jsx # NGO recommendations, tabs, and receipt confirmation
│   │   ├── VolunteerDashboard.jsx # Courier missions & handover workflow
│   │   ├── AddEditListing.jsx # Food surplus listing creation
│   │   ├── FindFood.jsx       # Public surplus browsing with filters
│   │   ├── AIMatching.jsx     # Smart Rescue AI matchmaking view
│   │   ├── ImpactDashboard.jsx# Real-time environmental impact metrics
│   │   └── FoodSafety.jsx     # Food safety and hygiene guidelines
│   ├── App.jsx                # Routing table & route protection guards
│   ├── index.css              # Tailwind v4 theme & brand tokens
│   └── main.jsx               # React DOM entry point
├── supabase/
│   └── migrations/
│       └── 20261014_init_mealmitra.sql # PostgreSQL schema & RLS policies
├── .env.example               # Template environment variables
├── package.json               # Dependencies and build scripts
├── vite.config.js             # Vite configuration with Tailwind v4 & React
└── README.md                  # Project documentation
```

---

## 📜 Food Safety Compliance

MealMitra AI enforces food safety by:
- Requiring donors to specify preparation timestamps, storage conditions, and allergens.
- Implementing automatic countdowns and expiring listings after their pickup deadline.
- Mandating a Food Safety Charter acknowledgment during user sign-up.

---

## 🏆 Hackathon Details
Developed for **PromptWars 2026** at VVITU.
Rescue Food. Reduce Waste. Feed Lives.
