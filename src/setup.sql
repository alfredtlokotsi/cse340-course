-- Drop tables if they exist (in correct order to handle foreign keys)
DROP TABLE IF EXISTS project_categories CASCADE;
DROP TABLE IF EXISTS categories CASCADE;
DROP TABLE IF EXISTS service_projects CASCADE;
DROP TABLE IF EXISTS organizations CASCADE;

-- Create organizations table (note: plural name)
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
    start_date DATE,
    end_date DATE,
    status VARCHAR(50) DEFAULT 'active',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (organization_id) REFERENCES organizations(organization_id) ON DELETE CASCADE
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

-- Insert sample service projects
INSERT INTO service_projects (organization_id, title, description, location, start_date, end_date, status) VALUES
(1, 'Community Housing Build', 'Building homes for low-income families in the downtown area', 'Downtown District', '2026-06-01', '2026-08-30', 'active'),
(1, 'Home Repair Program', 'Repairing homes for elderly and disabled residents', 'Various Locations', '2026-07-15', '2026-09-15', 'active'),
(2, 'Blood Drive Campaign', 'Organizing community blood donation events', 'Community Center', '2026-08-01', '2026-08-31', 'active'),
(2, 'Disaster Relief Training', 'Training volunteers for emergency response', 'Red Cross HQ', '2026-07-01', '2026-09-01', 'active'),
(3, 'Food Distribution Program', 'Weekly food distribution to families in need', 'Food Bank Warehouse', '2026-06-15', '2026-12-15', 'active'),
(3, 'Community Garden Project', 'Creating sustainable food sources in urban areas', 'City Gardens', '2026-07-01', '2026-10-01', 'active');

-- Insert categories
INSERT INTO categories (name, description) VALUES
('Housing', 'Projects focused on building, repairing, or providing housing'),
('Health & Wellness', 'Projects promoting health, wellness, and medical assistance'),
('Food Security', 'Projects addressing food access and nutrition'),
('Education & Training', 'Projects providing learning and skill development opportunities'),
('Environmental', 'Projects focused on environmental sustainability and conservation'),
('Emergency Response', 'Projects providing disaster relief and emergency assistance');

-- Associate projects with categories (many-to-many relationships)
INSERT INTO project_categories (project_id, category_id) VALUES
-- Community Housing Build
(1, 1), -- Housing
-- Home Repair Program
(2, 1), -- Housing
-- Blood Drive Campaign
(3, 2), -- Health & Wellness
-- Disaster Relief Training
(4, 6), -- Emergency Response
(4, 4), -- Education & Training
-- Food Distribution Program
(5, 3), -- Food Security
-- Community Garden Project
(6, 3), -- Food Security
(6, 5); -- Environmental

-- Verify the data
SELECT 'Organizations:' as Section;
SELECT * FROM organizations;

SELECT 'Service Projects:' as Section;
SELECT sp.*, o.name as organization_name 
FROM service_projects sp
JOIN organizations o ON sp.organization_id = o.organization_id;

SELECT 'Categories:' as Section;
SELECT * FROM categories;

SELECT 'Project Categories:' as Section;
SELECT pc.*, c.name as category_name, sp.title as project_title
FROM project_categories pc
JOIN categories c ON pc.category_id = c.category_id
JOIN service_projects sp ON pc.project_id = sp.project_id
ORDER BY sp.title, c.name;