-- Drop tables if they exist (in correct order to handle foreign keys)
DROP TABLE IF EXISTS project_categories CASCADE;
DROP TABLE IF EXISTS categories CASCADE;
DROP TABLE IF EXISTS service_projects CASCADE;
DROP TABLE IF EXISTS organizations CASCADE;

-- Create organizations table
CREATE TABLE organizations (
    organization_id SERIAL PRIMARY KEY,
    name VARCHAR(150) NOT NULL,
    description TEXT NOT NULL,
    contact_email VARCHAR(255) NOT NULL,
    logo_filename VARCHAR(255) NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Create service_projects table
CREATE TABLE service_projects (
    project_id SERIAL PRIMARY KEY,
    organization_id INTEGER NOT NULL,
    title VARCHAR(255) NOT NULL,
    description TEXT,
    location VARCHAR(255),
    project_date DATE NOT NULL,
    status VARCHAR(50) DEFAULT 'active',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT fk_organization 
        FOREIGN KEY (organization_id) 
        REFERENCES organizations(organization_id) 
        ON DELETE CASCADE
);

-- Create categories table
CREATE TABLE categories (
    category_id SERIAL PRIMARY KEY,
    name VARCHAR(100) NOT NULL UNIQUE,
    description TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Create junction table for many-to-many relationship
CREATE TABLE project_categories (
    project_id INTEGER NOT NULL,
    category_id INTEGER NOT NULL,
    PRIMARY KEY (project_id, category_id),
    FOREIGN KEY (project_id) REFERENCES service_projects(project_id) ON DELETE CASCADE,
    FOREIGN KEY (category_id) REFERENCES categories(category_id) ON DELETE CASCADE
);

-- Insert sample organizations
INSERT INTO organizations (name, description, contact_email, logo_filename) VALUES
('BrightFuture Builders', 'A nonprofit focused on improving community infrastructure through sustainable construction projects.', 'info@brightfuturebuilders.org', 'brightfuture-logo.png'),
('GreenHarvest Growers', 'An urban farming collective promoting food sustainability and education in local neighborhoods.', 'contact@greenharvest.org', 'greenharvest-logo.png'),
('UnityServe Volunteers', 'A volunteer coordination group supporting local charities and service initiatives.', 'hello@unityserve.org', 'unityserve-logo.png');

-- Insert service projects (at least 5 per organization = 15+ projects)
INSERT INTO service_projects (organization_id, title, description, location, project_date, status) VALUES
-- BrightFuture Builders projects (6 projects)
(1, 'Downtown Community Housing', 'Building affordable housing units in the downtown area', 'Downtown District', '2026-06-15', 'active'),
(1, 'Senior Home Repair Program', 'Providing free home repairs for elderly residents', 'Various Locations', '2026-07-01', 'active'),
(1, 'Community Center Renovation', 'Renovating the local community center', 'Central Community Center', '2026-07-20', 'active'),
(1, 'Park Improvement Project', 'Installing new playground equipment and walking paths', 'City Park', '2026-08-10', 'planning'),
(1, 'Affordable Housing Initiative', 'Building new affordable housing complex', 'East Side', '2026-09-01', 'planning'),
(1, 'School Playground Build', 'Constructing new playground for local elementary school', 'Sunrise Elementary', '2026-06-05', 'completed'),

-- GreenHarvest Growers projects (5 projects)
(2, 'Urban Farm Expansion', 'Expanding urban farming operations to new neighborhoods', 'Westside District', '2026-06-20', 'active'),
(2, 'Community Garden Workshop', 'Teaching sustainable gardening techniques', 'Community Gardens', '2026-07-15', 'active'),
(2, 'Food Bank Partnership', 'Providing fresh produce to local food banks', 'Citywide', '2026-08-01', 'active'),
(2, 'School Garden Program', 'Creating gardens at local schools for education', 'Multiple Schools', '2026-09-10', 'planning'),
(2, 'Farmers Market Initiative', 'Supporting local farmers markets in underserved areas', 'Various Locations', '2026-06-10', 'completed'),

-- UnityServe Volunteers projects (5 projects)
(3, 'Volunteer Training Program', 'Training new volunteers for community service', 'Volunteer Center', '2026-07-01', 'active'),
(3, 'Food Drive Coordination', 'Organizing citywide food drives for families in need', 'Citywide', '2026-08-15', 'active'),
(3, 'Community Cleanup Day', 'Organizing neighborhood cleanup events', 'Various Neighborhoods', '2026-09-05', 'planning'),
(3, 'Mentorship Program', 'Connecting volunteers with youth mentoring opportunities', 'Community Centers', '2026-06-25', 'active'),
(3, 'Holiday Gift Drive', 'Organizing gift collection for families during holidays', 'Citywide', '2026-12-01', 'planning');

-- Insert categories
INSERT INTO categories (name, description) VALUES
('Housing', 'Projects focused on building, repairing, or providing housing'),
('Health & Wellness', 'Projects promoting health, wellness, and medical assistance'),
('Food Security', 'Projects addressing food access and nutrition'),
('Education & Training', 'Projects providing learning and skill development opportunities'),
('Environmental', 'Projects focused on environmental sustainability and conservation'),
('Emergency Response', 'Projects providing disaster relief and emergency assistance'),
('Community Development', 'Projects focused on improving community infrastructure and services');

-- Associate projects with categories
INSERT INTO project_categories (project_id, category_id) VALUES
-- BrightFuture Builders
(1, 1), (1, 7),  -- Downtown Community Housing
(2, 1), (2, 7),  -- Senior Home Repair Program
(3, 7),          -- Community Center Renovation
(4, 7),          -- Park Improvement Project
(5, 1), (5, 7),  -- Affordable Housing Initiative
(6, 7),          -- School Playground Build

-- GreenHarvest Growers
(7, 3), (7, 5),  -- Urban Farm Expansion
(8, 3), (8, 4),  -- Community Garden Workshop
(9, 3),          -- Food Bank Partnership
(10, 3), (10, 4), -- School Garden Program
(11, 3), (11, 7), -- Farmers Market Initiative

-- UnityServe Volunteers
(12, 4),         -- Volunteer Training Program
(13, 3),         -- Food Drive Coordination
(14, 5), (14, 7), -- Community Cleanup Day
(15, 4), (15, 7), -- Mentorship Program
(16, 7);         -- Holiday Gift Drive

-- Verify the data
SELECT 'Organizations:' as Section;
SELECT * FROM organizations;

SELECT 'Service Projects with Organizations:' as Section;
SELECT sp.*, o.name as organization_name 
FROM service_projects sp
JOIN organizations o ON sp.organization_id = o.organization_id
ORDER BY sp.project_date;

SELECT 'Project Count by Organization:' as Section;
SELECT o.name, COUNT(sp.project_id) as project_count
FROM organizations o
LEFT JOIN service_projects sp ON o.organization_id = sp.organization_id
GROUP BY o.name
ORDER BY o.name;