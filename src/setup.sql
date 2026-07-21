-- ============================================
-- CSE 340 Database Setup Script
-- ============================================

-- ============================================
-- 1. DROP TABLES (in correct order for foreign keys)
-- ============================================
DROP TABLE IF EXISTS project_categories CASCADE;
DROP TABLE IF EXISTS categories CASCADE;
DROP TABLE IF EXISTS service_projects CASCADE;
DROP TABLE IF EXISTS organizations CASCADE;

-- ============================================
-- 2. CREATE TABLES
-- ============================================

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

-- ============================================
-- 3. INSERT SAMPLE ORGANIZATIONS
-- ============================================

INSERT INTO organizations (name, description, contact_email, logo_filename) 
VALUES 
    ('BrightFuture Builders', 
     'A nonprofit focused on improving community infrastructure through sustainable construction projects.', 
     'info@brightfuturebuilders.org', 
     'brightfuture-logo.png'),
    
    ('GreenHarvest Growers', 
     'An urban farming collective promoting food sustainability and education in local neighborhoods.', 
     'contact@greenharvest.org', 
     'greenharvest-logo.png'),
    
    ('UnityServe Volunteers', 
     'A volunteer coordination group supporting local charities and service initiatives.', 
     'hello@unityserve.org', 
     'unityserve-logo.png');

-- ============================================
-- 4. INSERT SERVICE PROJECTS
-- ============================================

INSERT INTO service_projects (organization_id, title, description, location, project_date, status) 
VALUES 
    -- BrightFuture Builders projects (6 projects)
    (1, 'Downtown Community Housing', 
     'Building affordable housing units in the downtown area', 
     'Downtown District', '2026-06-15', 'active'),
    
    (1, 'Senior Home Repair Program', 
     'Providing free home repairs for elderly residents', 
     'Various Locations', '2026-07-01', 'active'),
    
    (1, 'Community Center Renovation', 
     'Renovating the local community center', 
     'Central Community Center', '2026-07-20', 'active'),
    
    (1, 'Park Improvement Project', 
     'Installing new playground equipment and walking paths', 
     'City Park', '2026-08-10', 'planning'),
    
    (1, 'Affordable Housing Initiative', 
     'Building new affordable housing complex', 
     'East Side', '2026-09-01', 'planning'),
    
    (1, 'School Playground Build', 
     'Constructing new playground for local elementary school', 
     'Sunrise Elementary', '2026-06-05', 'completed'),
    
    -- GreenHarvest Growers projects (5 projects)
    (2, 'Urban Farm Expansion', 
     'Expanding urban farming operations to new neighborhoods', 
     'Westside District', '2026-06-20', 'active'),
    
    (2, 'Community Garden Workshop', 
     'Teaching sustainable gardening techniques', 
     'Community Gardens', '2026-07-15', 'active'),
    
    (2, 'Food Bank Partnership', 
     'Providing fresh produce to local food banks', 
     'Citywide', '2026-08-01', 'active'),
    
    (2, 'School Garden Program', 
     'Creating gardens at local schools for education', 
     'Multiple Schools', '2026-09-10', 'planning'),
    
    (2, 'Farmers Market Initiative', 
     'Supporting local farmers markets in underserved areas', 
     'Various Locations', '2026-06-10', 'completed'),
    
    -- UnityServe Volunteers projects (5 projects)
    (3, 'Volunteer Training Program', 
     'Training new volunteers for community service', 
     'Volunteer Center', '2026-07-01', 'active'),
    
    (3, 'Food Drive Coordination', 
     'Organizing citywide food drives for families in need', 
     'Citywide', '2026-08-15', 'active'),
    
    (3, 'Community Cleanup Day', 
     'Organizing neighborhood cleanup events', 
     'Various Neighborhoods', '2026-09-05', 'planning'),
    
    (3, 'Mentorship Program', 
     'Connecting volunteers with youth mentoring opportunities', 
     'Community Centers', '2026-06-25', 'active'),
    
    (3, 'Holiday Gift Drive', 
     'Organizing gift collection for families during holidays', 
     'Citywide', '2026-12-01', 'planning');

-- ============================================
-- 5. INSERT CATEGORIES
-- ============================================

INSERT INTO categories (name, description) 
VALUES 
    ('Housing', 'Projects focused on building, repairing, or providing housing for communities in need'),
    ('Food Security', 'Projects addressing food access, nutrition, and sustainable food systems'),
    ('Community Development', 'Projects focused on improving community infrastructure, education, and volunteer services'),
    ('Health & Wellness', 'Projects promoting health, wellness, and medical assistance'),
    ('Environmental', 'Projects focused on environmental sustainability and conservation'),
    ('Education & Training', 'Projects providing learning and skill development opportunities'),
    ('Emergency Response', 'Projects providing disaster relief and emergency assistance');

-- ============================================
-- 6. ASSIGN CATEGORIES TO PROJECTS
-- ============================================

INSERT INTO project_categories (project_id, category_id) 
VALUES
    -- BrightFuture Builders projects
    (1, 1), (1, 3),  -- Downtown Community Housing -> Housing, Community Development
    (2, 1), (2, 3),  -- Senior Home Repair Program -> Housing, Community Development
    (3, 3),          -- Community Center Renovation -> Community Development
    (4, 3),          -- Park Improvement Project -> Community Development
    (5, 1), (5, 3),  -- Affordable Housing Initiative -> Housing, Community Development
    (6, 3),          -- School Playground Build -> Community Development
    
    -- GreenHarvest Growers projects
    (7, 2), (7, 5),  -- Urban Farm Expansion -> Food Security, Environmental
    (8, 2), (8, 6),  -- Community Garden Workshop -> Food Security, Education & Training
    (9, 2),          -- Food Bank Partnership -> Food Security
    (10, 2), (10, 6), -- School Garden Program -> Food Security, Education & Training
    (11, 2), (11, 3), -- Farmers Market Initiative -> Food Security, Community Development
    
    -- UnityServe Volunteers projects
    (12, 6), (12, 3), -- Volunteer Training Program -> Education & Training, Community Development
    (13, 2), (13, 3), -- Food Drive Coordination -> Food Security, Community Development
    (14, 5), (14, 3), -- Community Cleanup Day -> Environmental, Community Development
    (15, 6), (15, 3), -- Mentorship Program -> Education & Training, Community Development
    (16, 3);          -- Holiday Gift Drive -> Community Development

-- ============================================
-- 7. VERIFY DATA
-- ============================================

-- Verify organizations
SELECT 'Organizations:' as Section;
SELECT * FROM organizations;

-- Verify service projects with organizations
SELECT 'Service Projects with Organizations:' as Section;
SELECT sp.*, o.name as organization_name 
FROM service_projects sp
JOIN organizations o ON sp.organization_id = o.organization_id
ORDER BY sp.project_date;

-- Verify categories
SELECT 'Categories:' as Section;
SELECT * FROM categories;

-- Verify project-category relationships
SELECT 'Project-Category Relationships:' as Section;
SELECT 
    sp.title as project_title,
    o.name as organization,
    c.name as category_name
FROM project_categories pc
JOIN service_projects sp ON pc.project_id = sp.project_id
JOIN organizations o ON sp.organization_id = o.organization_id
JOIN categories c ON pc.category_id = c.category_id
ORDER BY sp.title, c.name;

-- Count projects per category
SELECT 'Total Projects per Category:' as Section;
SELECT 
    c.name as category_name,
    COUNT(pc.project_id) as project_count
FROM categories c
LEFT JOIN project_categories pc ON c.category_id = pc.category_id
GROUP BY c.name
ORDER BY project_count DESC;