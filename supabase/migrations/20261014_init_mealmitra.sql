-- ============================================================
-- MealMitra AI - Supabase Database Schema & Security Policies
-- ============================================================

-- 1. Profiles Table (Linked to Supabase auth.users)
CREATE TABLE IF NOT EXISTS public.profiles (
  id UUID REFERENCES auth.users(id) ON DELETE CASCADE PRIMARY KEY,
  role VARCHAR(20) NOT NULL CHECK (role IN ('donor', 'recipient', 'volunteer', 'admin')),
  display_name TEXT NOT NULL,
  organization_name TEXT,
  organization_type TEXT CHECK (organization_type IN ('restaurant', 'canteen', 'hostel', 'caterer', 'event_organizer', 'ngo', 'community_kitchen', 'other')),
  phone VARCHAR(20),
  location TEXT,
  lat FLOAT,
  lng FLOAT,
  capacity INT DEFAULT NULL,
  dietary_preferences TEXT[] DEFAULT '{}',
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 2. Food Listings
CREATE TABLE IF NOT EXISTS public.listings (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  donor_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE NOT NULL,
  name TEXT NOT NULL,
  description TEXT,
  quantity INT NOT NULL CHECK (quantity > 0),
  remaining_quantity INT NOT NULL CHECK (remaining_quantity >= 0),
  unit VARCHAR(20) DEFAULT 'servings',
  category VARCHAR(20) NOT NULL CHECK (category IN ('veg', 'non-veg')),
  allergens TEXT[] DEFAULT '{}',
  prep_time TIMESTAMPTZ,
  storage_conditions TEXT,
  location TEXT NOT NULL,
  lat FLOAT,
  lng FLOAT,
  pickup_deadline TIMESTAMPTZ NOT NULL,
  status VARCHAR(20) DEFAULT 'listed' CHECK (status IN ('draft', 'listed', 'requested', 'accepted', 'assigned', 'collected', 'completed', 'cancelled', 'expired')),
  image_url TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 3. Donation Requests
CREATE TABLE IF NOT EXISTS public.requests (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  listing_id UUID REFERENCES public.listings(id) ON DELETE CASCADE NOT NULL,
  recipient_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE NOT NULL,
  quantity INT NOT NULL CHECK (quantity > 0),
  status VARCHAR(20) DEFAULT 'requested' CHECK (status IN ('requested', 'accepted', 'rejected', 'assigned', 'collected', 'completed', 'cancelled')),
  notes TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 4. Pickup Assignments
CREATE TABLE IF NOT EXISTS public.assignments (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  listing_id UUID REFERENCES public.listings(id) ON DELETE CASCADE NOT NULL,
  request_id UUID REFERENCES public.requests(id) ON DELETE CASCADE NOT NULL,
  volunteer_id UUID REFERENCES public.profiles(id) ON DELETE SET NULL,
  status VARCHAR(20) DEFAULT 'assigned' CHECK (status IN ('assigned', 'collected', 'completed', 'cancelled')),
  pickup_time TIMESTAMPTZ,
  delivery_time TIMESTAMPTZ,
  notes TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 5. Impact Donations Ledger
CREATE TABLE IF NOT EXISTS public.donations (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  listing_id UUID REFERENCES public.listings(id) ON DELETE SET NULL,
  request_id UUID REFERENCES public.requests(id) ON DELETE SET NULL,
  assignment_id UUID REFERENCES public.assignments(id) ON DELETE SET NULL,
  donor_id UUID REFERENCES public.profiles(id) ON DELETE SET NULL,
  recipient_id UUID REFERENCES public.profiles(id) ON DELETE SET NULL,
  volunteer_id UUID REFERENCES public.profiles(id) ON DELETE SET NULL,
  quantity INT NOT NULL,
  unit VARCHAR(20) DEFAULT 'servings',
  category VARCHAR(20),
  donor_org TEXT,
  recipient_org TEXT,
  location TEXT,
  completed_at TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================================
-- Row Level Security (RLS) Policies
-- ============================================================

ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.listings ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.requests ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.assignments ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.donations ENABLE ROW LEVEL SECURITY;

-- Profiles:
-- Anyone authenticated can view public organization names & roles
CREATE POLICY "Public profiles can be viewed by authenticated users"
  ON public.profiles FOR SELECT
  TO authenticated
  USING (true);

-- Users can insert their own profile at sign-up
CREATE POLICY "Users can create their own profile"
  ON public.profiles FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = id);

-- Users can update their profile information but CANNOT elevate or change their role
CREATE POLICY "Users can update own profile except role"
  ON public.profiles FOR UPDATE
  TO authenticated
  USING (auth.uid() = id)
  WITH CHECK (
    auth.uid() = id AND
    role = (SELECT role FROM public.profiles WHERE id = auth.uid())
  );

-- Listings:
-- All authenticated users can view active listings
CREATE POLICY "Anyone can view active listings"
  ON public.listings FOR SELECT
  TO authenticated
  USING (status != 'draft' OR donor_id = auth.uid());

-- Donors can create and manage their own listings only
CREATE POLICY "Donors can insert their own listings"
  ON public.listings FOR INSERT
  TO authenticated
  WITH CHECK (
    auth.uid() = donor_id AND
    EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role IN ('donor', 'admin'))
  );

CREATE POLICY "Donors can update own listings"
  ON public.listings FOR UPDATE
  TO authenticated
  USING (auth.uid() = donor_id)
  WITH CHECK (auth.uid() = donor_id);

CREATE POLICY "Donors can delete own listings"
  ON public.listings FOR DELETE
  TO authenticated
  USING (auth.uid() = donor_id);

-- Requests:
-- Recipients can view their own requests
CREATE POLICY "Recipients view own requests"
  ON public.requests FOR SELECT
  TO authenticated
  USING (recipient_id = auth.uid());

-- Donors view incoming requests for their own listings only
CREATE POLICY "Donors view requests for their listings"
  ON public.requests FOR SELECT
  TO authenticated
  USING (
    listing_id IN (SELECT id FROM public.listings WHERE donor_id = auth.uid())
  );

-- Recipients can create requests
CREATE POLICY "Recipients create requests"
  ON public.requests FOR INSERT
  TO authenticated
  WITH CHECK (
    auth.uid() = recipient_id AND
    EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role IN ('recipient', 'admin'))
  );

-- Donors can update request status (accept / reject) on their listings
CREATE POLICY "Donors respond to requests"
  ON public.requests FOR UPDATE
  TO authenticated
  USING (
    listing_id IN (SELECT id FROM public.listings WHERE donor_id = auth.uid())
  );

-- Assignments:
-- Volunteers can only view assignments assigned to them
CREATE POLICY "Volunteers view assigned tasks"
  ON public.assignments FOR SELECT
  TO authenticated
  USING (
    volunteer_id = auth.uid()
    OR listing_id IN (SELECT id FROM public.listings WHERE donor_id = auth.uid())
    OR request_id IN (SELECT id FROM public.requests WHERE recipient_id = auth.uid())
  );

-- Volunteers can update status of their assigned tasks
CREATE POLICY "Volunteers update assigned status"
  ON public.assignments FOR UPDATE
  TO authenticated
  USING (volunteer_id = auth.uid());

-- Donations Ledger:
-- Read-only impact viewing for all authenticated users
CREATE POLICY "View completed donations"
  ON public.donations FOR SELECT
  TO authenticated
  USING (true);
