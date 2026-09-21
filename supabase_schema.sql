-- =========================================================
-- ZAFIROO GOURMET CAFE & CLOUD KITCHEN DATABASE SCHEMA
-- PostgreSQL / Supabase Schema (Optimized for High Concurrency)
-- =========================================================

-- Enable pgcrypto and uuid-ossp
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- 1. Customers Table (Indexed by phone for instantaneous lookups)
CREATE TABLE IF NOT EXISTS customers (
    id VARCHAR(64) PRIMARY KEY,
    phone VARCHAR(20) UNIQUE NOT NULL,
    name VARCHAR(255) NOT NULL,
    email VARCHAR(255),
    address TEXT,
    unit VARCHAR(100),
    default_instructions TEXT,
    order_count INT DEFAULT 1,
    total_spent NUMERIC(10, 2) DEFAULT 0.00,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 2. Delivery Agents Table
CREATE TABLE IF NOT EXISTS delivery_agents (
    id VARCHAR(64) PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    phone VARCHAR(20) UNIQUE NOT NULL,
    status VARCHAR(32) DEFAULT 'active' CHECK (status IN ('active', 'inactive', 'on_delivery', 'off_duty')),
    vehicle_type VARCHAR(64) DEFAULT 'Motorcycle',
    orders_delivered_count INT DEFAULT 0,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 3. Menu Items Table
CREATE TABLE IF NOT EXISTS menu_items (
    id VARCHAR(64) PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    category VARCHAR(64) NOT NULL,
    description TEXT,
    detailed_description TEXT,
    price VARCHAR(32) NOT NULL,
    price_number NUMERIC(10, 2) NOT NULL,
    image TEXT,
    calories INT,
    dietary VARCHAR(32) DEFAULT 'veg' CHECK (dietary IN ('veg', 'non-veg', 'vegan', 'egg')),
    taste_notes TEXT[] DEFAULT '{}',
    featured BOOLEAN DEFAULT false,
    signature BOOLEAN DEFAULT false,
    prep_time VARCHAR(32) DEFAULT '15-20 min',
    customization_options JSONB DEFAULT '{}'::jsonb,
    is_available BOOLEAN DEFAULT true,
    display_order INT DEFAULT 0,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 4. Orders Table (Hardened with foreign key null fallback and comprehensive indexes)
CREATE TABLE IF NOT EXISTS orders (
    id VARCHAR(64) PRIMARY KEY,
    token_id VARCHAR(64) UNIQUE NOT NULL,
    tracking_code VARCHAR(64) UNIQUE NOT NULL,
    customer_id VARCHAR(64) REFERENCES customers(id) ON DELETE SET NULL,
    delivery_agent_id VARCHAR(64) REFERENCES delivery_agents(id) ON DELETE SET NULL,
    delivery_otp VARCHAR(6) NOT NULL,
    status VARCHAR(32) DEFAULT 'new' CHECK (status IN ('new', 'preparing', 'ready', 'delivering', 'completed', 'cancelled')),
    delivery_method VARCHAR(32) DEFAULT 'delivery' CHECK (delivery_method IN ('delivery', 'pickup')),
    customer_name VARCHAR(255) NOT NULL,
    customer_phone VARCHAR(20) NOT NULL,
    customer_email VARCHAR(255),
    customer_address TEXT NOT NULL,
    customer_unit VARCHAR(100),
    customer_instructions TEXT,
    items_json JSONB NOT NULL DEFAULT '[]'::jsonb,
    subtotal NUMERIC(10, 2) NOT NULL DEFAULT 0.00,
    delivery_fee NUMERIC(10, 2) NOT NULL DEFAULT 0.00,
    tax NUMERIC(10, 2) NOT NULL DEFAULT 0.00,
    tip NUMERIC(10, 2) NOT NULL DEFAULT 0.00,
    total NUMERIC(10, 2) NOT NULL DEFAULT 0.00,
    estimated_time VARCHAR(64) DEFAULT '25-35 min',
    payment_method VARCHAR(64) DEFAULT 'cod',
    payment_status VARCHAR(32) DEFAULT 'pending',
    rider_name VARCHAR(255),
    rider_phone VARCHAR(20),
    rating INT,
    feedback_tags TEXT[] DEFAULT '{}',
    feedback_note TEXT,
    delivered_at TIMESTAMPTZ,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 5. SOS Alerts Table
CREATE TABLE IF NOT EXISTS sos_alerts (
    id VARCHAR(64) PRIMARY KEY,
    agent_id VARCHAR(64) NOT NULL,
    agent_name VARCHAR(255) NOT NULL,
    agent_phone VARCHAR(20) NOT NULL,
    order_id VARCHAR(64),
    token_id VARCHAR(64),
    reason VARCHAR(64) NOT NULL,
    notes TEXT,
    lat DOUBLE PRECISION,
    lng DOUBLE PRECISION,
    location_address TEXT,
    status VARCHAR(32) DEFAULT 'active' CHECK (status IN ('active', 'resolved')),
    resolved_at TIMESTAMPTZ,
    resolved_by VARCHAR(255),
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 6. Admin Keys Table
CREATE TABLE IF NOT EXISTS admin_keys (
    id VARCHAR(64) PRIMARY KEY,
    key_name VARCHAR(255) NOT NULL,
    key_value VARCHAR(255) NOT NULL,
    key_hash VARCHAR(255),
    is_universal BOOLEAN DEFAULT false,
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 7. Memberships Table (1 Month Postpaid & 6 Months Prepaid)
CREATE TABLE IF NOT EXISTS memberships (
    id VARCHAR(64) PRIMARY KEY,
    phone VARCHAR(20) NOT NULL,
    customer_name VARCHAR(255) NOT NULL,
    customer_email VARCHAR(255),
    address TEXT,
    plan_type VARCHAR(32) NOT NULL CHECK (plan_type IN ('1_month', '6_months')),
    plan_name VARCHAR(64) NOT NULL,
    billing_type VARCHAR(32) NOT NULL CHECK (billing_type IN ('postpaid', 'prepaid')),
    price NUMERIC(10, 2) NOT NULL,
    status VARCHAR(32) DEFAULT 'active' CHECK (status IN ('active', 'expired', 'cancelled')),
    payment_status VARCHAR(32) DEFAULT 'pending',
    start_date TIMESTAMPTZ DEFAULT NOW(),
    end_date TIMESTAMPTZ NOT NULL,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- =========================================================
-- INDEXES OPTIMIZED FOR 10,000+ HIGH-CONCURRENCY WORKLOADS
-- =========================================================
CREATE INDEX IF NOT EXISTS idx_orders_token_id ON orders(token_id);
CREATE INDEX IF NOT EXISTS idx_orders_tracking_code ON orders(tracking_code);
CREATE INDEX IF NOT EXISTS idx_orders_customer_phone ON orders(customer_phone);
CREATE INDEX IF NOT EXISTS idx_orders_status ON orders(status);
CREATE INDEX IF NOT EXISTS idx_orders_created_at ON orders(created_at DESC);
-- Composite index for fast KDS dashboard queries under high order volume
CREATE INDEX IF NOT EXISTS idx_orders_status_created_at ON orders(status, created_at DESC);
-- Composite index for rider assigned deliveries query
CREATE INDEX IF NOT EXISTS idx_orders_agent_status ON orders(delivery_agent_id, status);
CREATE INDEX IF NOT EXISTS idx_orders_rider_phone ON orders(rider_phone);

CREATE INDEX IF NOT EXISTS idx_customers_phone ON customers(phone);
CREATE INDEX IF NOT EXISTS idx_delivery_agents_phone ON delivery_agents(phone);
CREATE INDEX IF NOT EXISTS idx_delivery_agents_status ON delivery_agents(status);
CREATE INDEX IF NOT EXISTS idx_sos_alerts_status ON sos_alerts(status);
CREATE INDEX IF NOT EXISTS idx_sos_alerts_created ON sos_alerts(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_memberships_phone ON memberships(phone);
CREATE INDEX IF NOT EXISTS idx_memberships_status ON memberships(status);

-- =========================================================
-- TRIGGERS FOR MODTIME
-- =========================================================
CREATE OR REPLACE FUNCTION update_modtime_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE 'plpgsql';

CREATE OR REPLACE TRIGGER update_customers_modtime BEFORE UPDATE ON customers FOR EACH ROW EXECUTE PROCEDURE update_modtime_column();
CREATE OR REPLACE TRIGGER update_delivery_agents_modtime BEFORE UPDATE ON delivery_agents FOR EACH ROW EXECUTE PROCEDURE update_modtime_column();
CREATE OR REPLACE TRIGGER update_menu_items_modtime BEFORE UPDATE ON menu_items FOR EACH ROW EXECUTE PROCEDURE update_modtime_column();
CREATE OR REPLACE TRIGGER update_orders_modtime BEFORE UPDATE ON orders FOR EACH ROW EXECUTE PROCEDURE update_modtime_column();
CREATE OR REPLACE TRIGGER update_sos_alerts_modtime BEFORE UPDATE ON sos_alerts FOR EACH ROW EXECUTE PROCEDURE update_modtime_column();

-- =========================================================
-- ATOMIC CONCURRENCY FUNCTION: UPSERT CUSTOMER ON ORDER
-- Safe against race conditions and lock contention during mass orders
-- =========================================================
CREATE OR REPLACE FUNCTION upsert_customer_from_order(
    p_phone VARCHAR,
    p_name VARCHAR,
    p_email VARCHAR,
    p_address TEXT,
    p_unit VARCHAR,
    p_instructions TEXT,
    p_total NUMERIC
) RETURNS VARCHAR AS $$
DECLARE
    v_cust_id VARCHAR(64);
BEGIN
    INSERT INTO customers (
        id, phone, name, email, address, unit, default_instructions, order_count, total_spent
    )
    VALUES (
        'CUST-' || substr(md5(random()::text || clock_timestamp()::text), 1, 10),
        p_phone,
        p_name,
        p_email,
        p_address,
        p_unit,
        p_instructions,
        1,
        COALESCE(p_total, 0.00)
    )
    ON CONFLICT (phone) DO UPDATE SET
        name = EXCLUDED.name,
        email = COALESCE(EXCLUDED.email, customers.email),
        address = EXCLUDED.address,
        unit = COALESCE(EXCLUDED.unit, customers.unit),
        default_instructions = COALESCE(EXCLUDED.default_instructions, customers.default_instructions),
        order_count = customers.order_count + 1,
        total_spent = customers.total_spent + EXCLUDED.total_spent,
        updated_at = NOW()
    RETURNING id INTO v_cust_id;

    RETURN v_cust_id;
END;
$$ LANGUAGE plpgsql;

-- Helper to atomically increment rider delivery count on order completion
CREATE OR REPLACE FUNCTION increment_agent_delivery_count(agent_id VARCHAR)
RETURNS VOID AS $$
BEGIN
    UPDATE delivery_agents
    SET orders_delivered_count = orders_delivered_count + 1,
        updated_at = NOW()
    WHERE id = agent_id;
END;
$$ LANGUAGE plpgsql;

-- Automated 10-day retention purge
CREATE OR REPLACE FUNCTION delete_orders_older_than_10_days()
RETURNS INT AS $$
DECLARE
    deleted_count INT;
BEGIN
    DELETE FROM orders
    WHERE created_at < NOW() - INTERVAL '10 days'
      AND status IN ('completed', 'cancelled');
    GET DIAGNOSTICS deleted_count = ROW_COUNT;
    RETURN deleted_count;
END;
$$ LANGUAGE plpgsql;

-- =========================================================
-- ROW LEVEL SECURITY (RLS) POLICIES
-- Enables seamless anon key reads/writes for Customer, Admin & Rider
-- =========================================================
ALTER TABLE orders ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "orders_public_all" ON orders;
CREATE POLICY "orders_public_all" ON orders FOR ALL USING (true) WITH CHECK (true);

ALTER TABLE customers ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "customers_public_all" ON customers;
CREATE POLICY "customers_public_all" ON customers FOR ALL USING (true) WITH CHECK (true);

ALTER TABLE delivery_agents ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "delivery_agents_public_all" ON delivery_agents;
CREATE POLICY "delivery_agents_public_all" ON delivery_agents FOR ALL USING (true) WITH CHECK (true);

ALTER TABLE sos_alerts ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "sos_alerts_public_all" ON sos_alerts;
CREATE POLICY "sos_alerts_public_all" ON sos_alerts FOR ALL USING (true) WITH CHECK (true);

ALTER TABLE menu_items ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "menu_items_public_all" ON menu_items;
CREATE POLICY "menu_items_public_all" ON menu_items FOR ALL USING (true) WITH CHECK (true);

ALTER TABLE admin_keys ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "admin_keys_public_all" ON admin_keys;
CREATE POLICY "admin_keys_public_all" ON admin_keys FOR ALL USING (true) WITH CHECK (true);

ALTER TABLE memberships ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "memberships_public_all" ON memberships;
CREATE POLICY "memberships_public_all" ON memberships FOR ALL USING (true) WITH CHECK (true);

-- =========================================================
-- SUPABASE REALTIME REPLICATION CONFIGURATION
-- Broadcasts instant order updates to Admin KDS and Customer Trackers
-- =========================================================
DO $$
BEGIN
    IF EXISTS (SELECT 1 FROM pg_publication WHERE pubname = 'supabase_realtime') THEN
        BEGIN
            ALTER PUBLICATION supabase_realtime ADD TABLE orders;
        EXCEPTION WHEN duplicate_object THEN
            NULL;
        END;
        BEGIN
            ALTER PUBLICATION supabase_realtime ADD TABLE sos_alerts;
        EXCEPTION WHEN duplicate_object THEN
            NULL;
        END;
        BEGIN
            ALTER PUBLICATION supabase_realtime ADD TABLE delivery_agents;
        EXCEPTION WHEN duplicate_object THEN
            NULL;
        END;
        BEGIN
            ALTER PUBLICATION supabase_realtime ADD TABLE memberships;
        EXCEPTION WHEN duplicate_object THEN
            NULL;
        END;
    END IF;
END $$;

-- =========================================================
-- SEED INITIAL DELIVERY AGENTS
-- Guarantees foreign key references never fail when assigning riders
-- =========================================================
INSERT INTO delivery_agents (id, name, phone, status, vehicle_type, orders_delivered_count)
VALUES
    ('AGT-9876-01', 'Aarav Sharma', '9876543201', 'active', 'Electric Eco-Van', 142),
    ('AGT-9876-02', 'Priya Nair', '9876543202', 'active', 'Insulated Farm Cargo Bike', 98),
    ('AGT-9876-03', 'Rahul Verma', '9876543203', 'active', 'Motorcycle', 215),
    ('AGT-9876-04', 'Vikram Singh', '9876543204', 'active', 'Refrigerated Scooter', 73)
ON CONFLICT (id) DO UPDATE SET
    name = EXCLUDED.name,
    phone = EXCLUDED.phone,
    vehicle_type = EXCLUDED.vehicle_type;

-- Seed Default Admin Master PIN and Kitchen PIN
INSERT INTO admin_keys (id, key_name, key_value, is_universal)
VALUES 
    ('adm_key_master', 'Universal Master Pin', '9019631104', true),
    ('kitchen_pin', 'Kitchen Pin', '1234', false)
ON CONFLICT (id) DO UPDATE SET
    key_value = EXCLUDED.key_value,
    is_universal = EXCLUDED.is_universal;
