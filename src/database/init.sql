-- SAPS Case Docket System Database Initialization

-- Users table
CREATE TABLE IF NOT EXISTS users (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  username VARCHAR(255) UNIQUE NOT NULL,
  email VARCHAR(255) UNIQUE NOT NULL,
  password_hash VARCHAR(255) NOT NULL,
  first_name VARCHAR(255),
  last_name VARCHAR(255),
  role VARCHAR(50) NOT NULL,
  station VARCHAR(255),
  status VARCHAR(50) DEFAULT 'active',
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  last_login TIMESTAMP
);

-- Cases table
CREATE TABLE IF NOT EXISTS cases (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  cas_number VARCHAR(50) UNIQUE NOT NULL,
  offence_details TEXT NOT NULL,
  reported_date TIMESTAMP NOT NULL,
  station VARCHAR(255) NOT NULL,
  complainant_name VARCHAR(255),
  complainant_contact VARCHAR(255),
  status VARCHAR(50) DEFAULT 'registered',
  registered_by UUID REFERENCES users(id),
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Dockets table
CREATE TABLE IF NOT EXISTS dockets (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  case_id UUID NOT NULL REFERENCES cases(id),
  docket_reference VARCHAR(100) UNIQUE NOT NULL,
  current_holder UUID REFERENCES users(id),
  current_location VARCHAR(255),
  status VARCHAR(50) DEFAULT 'active',
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Assignments table
CREATE TABLE IF NOT EXISTS assignments (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  docket_id UUID NOT NULL REFERENCES dockets(id),
  assigned_to UUID NOT NULL REFERENCES users(id),
  assigned_by UUID NOT NULL REFERENCES users(id),
  assigned_at TIMESTAMP NOT NULL,
  status VARCHAR(50) DEFAULT 'active'
);

-- Access events table
CREATE TABLE IF NOT EXISTS access_events (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  case_id UUID NOT NULL REFERENCES cases(id),
  docket_id UUID REFERENCES dockets(id),
  accessed_by UUID NOT NULL REFERENCES users(id),
  access_type VARCHAR(50) NOT NULL,
  accessed_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  ip_address VARCHAR(45),
  user_agent TEXT
);

-- Transfer events table
CREATE TABLE IF NOT EXISTS transfer_events (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  docket_id UUID NOT NULL REFERENCES dockets(id),
  transferred_from UUID NOT NULL REFERENCES users(id),
  transferred_to UUID NOT NULL REFERENCES users(id),
  transferred_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  acknowledged_at TIMESTAMP,
  acknowledged_by UUID REFERENCES users(id),
  notes TEXT
);

-- Status updates table
CREATE TABLE IF NOT EXISTS status_updates (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  case_id UUID NOT NULL REFERENCES cases(id),
  previous_status VARCHAR(50),
  new_status VARCHAR(50) NOT NULL,
  updated_by UUID NOT NULL REFERENCES users(id),
  updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  reason TEXT
);

-- Complaints table
CREATE TABLE IF NOT EXISTS complaints (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  complaint_reference VARCHAR(100) UNIQUE NOT NULL,
  case_id UUID REFERENCES cases(id),
  filed_by VARCHAR(255),
  complaint_description TEXT NOT NULL,
  filed_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  status VARCHAR(50) DEFAULT 'open',
  resolved_at TIMESTAMP,
  resolution_notes TEXT
);

-- Resolutions table
CREATE TABLE IF NOT EXISTS resolutions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  case_id UUID NOT NULL REFERENCES cases(id),
  outcome VARCHAR(50) NOT NULL,
  resolved_date TIMESTAMP NOT NULL,
  resolved_by UUID NOT NULL REFERENCES users(id),
  resolution_details TEXT,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Audit log table
CREATE TABLE IF NOT EXISTS audit_log (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  action VARCHAR(255) NOT NULL,
  actor UUID REFERENCES users(id),
  actor_name VARCHAR(255),
  case_id UUID REFERENCES cases(id),
  docket_id UUID REFERENCES dockets(id),
  resource_type VARCHAR(50),
  resource_id VARCHAR(100),
  before_state JSONB,
  after_state JSONB,
  timestamp TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  ip_address VARCHAR(45),
  user_agent TEXT
);

-- Create indexes for performance
CREATE INDEX idx_cases_station ON cases(station);
CREATE INDEX idx_cases_status ON cases(status);
CREATE INDEX idx_cases_created ON cases(created_at);
CREATE INDEX idx_dockets_case ON dockets(case_id);
CREATE INDEX idx_access_events_case ON access_events(case_id);
CREATE INDEX idx_access_events_accessed_at ON access_events(accessed_at);
CREATE INDEX idx_audit_log_case ON audit_log(case_id);
CREATE INDEX idx_audit_log_timestamp ON audit_log(timestamp);
CREATE INDEX idx_transfer_events_docket ON transfer_events(docket_id);
CREATE INDEX idx_users_role ON users(role);

-- Create audit log trigger function
CREATE OR REPLACE FUNCTION log_audit_event() RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO audit_log (action, resource_type, resource_id, after_state, timestamp)
  VALUES (TG_OP, TG_TABLE_NAME, NEW.id, row_to_json(NEW), CURRENT_TIMESTAMP);
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;
