-- =========================================================
-- ZAFIROO GOURMET CAFE & CLOUD KITCHEN DATABASE SCHEMA
-- PostgreSQL / Supabase Schema (Prepared for future DB configuration)
-- =========================================================

-- Enable uuid-ossp if needed
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- 1. Customers Table
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

-- 4. Orders Table
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

-- Indexes for lightning fast queries
CREATE INDEX IF NOT EXISTS idx_orders_token_id ON orders(token_id);
CREATE INDEX IF NOT EXISTS idx_orders_tracking_code ON orders(tracking_code);
CREATE INDEX IF NOT EXISTS idx_orders_customer_phone ON orders(customer_phone);
CREATE INDEX IF NOT EXISTS idx_orders_status ON orders(status);
CREATE INDEX IF NOT EXISTS idx_orders_created_at ON orders(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_sos_alerts_status ON sos_alerts(status);
CREATE INDEX IF NOT EXISTS idx_delivery_agents_phone ON delivery_agents(phone);

-- Function and trigger to update modtime
CREATE OR REPLACE FUNCTION update_modtime_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

CREATE OR REPLACE TRIGGER update_customers_modtime BEFORE UPDATE ON customers FOR EACH ROW EXECUTE PROCEDURE update_modtime_column();
CREATE OR REPLACE TRIGGER update_delivery_agents_modtime BEFORE UPDATE ON delivery_agents FOR EACH ROW EXECUTE PROCEDURE update_modtime_column();
CREATE OR REPLACE TRIGGER update_menu_items_modtime BEFORE UPDATE ON menu_items FOR EACH ROW EXECUTE PROCEDURE update_modtime_column();
CREATE OR REPLACE TRIGGER update_orders_modtime BEFORE UPDATE ON orders FOR EACH ROW EXECUTE PROCEDURE update_modtime_column();
CREATE OR REPLACE TRIGGER update_sos_alerts_modtime BEFORE UPDATE ON sos_alerts FOR EACH ROW EXECUTE PROCEDURE update_modtime_column();

-- Function for automated 10-day retention purge
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
