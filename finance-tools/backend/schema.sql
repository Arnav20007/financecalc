-- ============================================================
-- FinanceCalc — PostgreSQL Database Schema
-- Production-ready schema for future feature expansion
-- ============================================================

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- ─── Users ────────────────────────────────────────────────────
CREATE TABLE users (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    email VARCHAR(255) UNIQUE NOT NULL,
    password_hash VARCHAR(255) NOT NULL,
    full_name VARCHAR(150),
    is_premium BOOLEAN DEFAULT FALSE,
    is_verified BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    last_login TIMESTAMP WITH TIME ZONE,
    preferences JSONB DEFAULT '{}'::jsonb
);

CREATE INDEX idx_users_email ON users(email);

-- ─── Saved Calculations ──────────────────────────────────────
CREATE TABLE saved_calculations (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID REFERENCES users(id) ON DELETE CASCADE,
    calculator_type VARCHAR(50) NOT NULL, -- compound_interest, loan_payoff, retirement, inflation, debt_snowball
    title VARCHAR(255),
    inputs JSONB NOT NULL,
    results JSONB NOT NULL,
    is_favorite BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_calculations_user ON saved_calculations(user_id);
CREATE INDEX idx_calculations_type ON saved_calculations(calculator_type);
CREATE INDEX idx_calculations_created ON saved_calculations(created_at DESC);

-- ─── Calculation Scenarios (for compare feature) ─────────────
CREATE TABLE calculation_scenarios (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    calculation_id UUID REFERENCES saved_calculations(id) ON DELETE CASCADE,
    scenario_name VARCHAR(100) NOT NULL DEFAULT 'Scenario A',
    inputs JSONB NOT NULL,
    results JSONB NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_scenarios_calculation ON calculation_scenarios(calculation_id);

-- ─── Analytics / Page Views ──────────────────────────────────
CREATE TABLE page_views (
    id BIGSERIAL PRIMARY KEY,
    page_path VARCHAR(255) NOT NULL,
    user_agent TEXT,
    referrer TEXT,
    ip_hash VARCHAR(64), -- Hashed for privacy
    session_id VARCHAR(100),
    country_code VARCHAR(5),
    time_on_page INTEGER, -- seconds
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_pageviews_path ON page_views(page_path);
CREATE INDEX idx_pageviews_created ON page_views(created_at DESC);

-- ─── Calculator Usage Analytics ──────────────────────────────
CREATE TABLE calculator_usage (
    id BIGSERIAL PRIMARY KEY,
    calculator_type VARCHAR(50) NOT NULL,
    session_id VARCHAR(100),
    inputs_summary JSONB, -- Anonymized summary (ranges, not exact values)
    result_type VARCHAR(50), -- e.g., 'calculated', 'downloaded_pdf', 'shared'
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_usage_type ON calculator_usage(calculator_type);
CREATE INDEX idx_usage_created ON calculator_usage(created_at DESC);

-- ─── Premium Subscriptions ───────────────────────────────────
CREATE TABLE subscriptions (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID REFERENCES users(id) ON DELETE CASCADE,
    plan_type VARCHAR(50) NOT NULL DEFAULT 'free', -- free, pro, enterprise
    stripe_customer_id VARCHAR(100),
    stripe_subscription_id VARCHAR(100),
    status VARCHAR(30) DEFAULT 'active', -- active, canceled, past_due, trialing
    current_period_start TIMESTAMP WITH TIME ZONE,
    current_period_end TIMESTAMP WITH TIME ZONE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_subscriptions_user ON subscriptions(user_id);
CREATE INDEX idx_subscriptions_status ON subscriptions(status);

-- ─── Shared Results ──────────────────────────────────────────
CREATE TABLE shared_results (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    share_token VARCHAR(20) UNIQUE NOT NULL,
    calculator_type VARCHAR(50) NOT NULL,
    inputs JSONB NOT NULL,
    results JSONB NOT NULL,
    view_count INTEGER DEFAULT 0,
    expires_at TIMESTAMP WITH TIME ZONE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_shared_token ON shared_results(share_token);

-- ─── Contact Form Submissions ────────────────────────────────
CREATE TABLE contact_submissions (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name VARCHAR(150),
    email VARCHAR(255) NOT NULL,
    subject VARCHAR(255),
    message TEXT NOT NULL,
    status VARCHAR(30) DEFAULT 'new', -- new, read, replied, archived
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- ─── Newsletter Subscribers ─────────────────────────────────
CREATE TABLE newsletter_subscribers (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    email VARCHAR(255) UNIQUE NOT NULL,
    is_active BOOLEAN DEFAULT TRUE,
    subscribed_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    unsubscribed_at TIMESTAMP WITH TIME ZONE
);

CREATE INDEX idx_newsletter_email ON newsletter_subscribers(email);

-- ─── Updated Timestamp Trigger ───────────────────────────────
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = CURRENT_TIMESTAMP;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER update_users_updated_at
    BEFORE UPDATE ON users
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_calculations_updated_at
    BEFORE UPDATE ON saved_calculations
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_subscriptions_updated_at
    BEFORE UPDATE ON subscriptions
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
