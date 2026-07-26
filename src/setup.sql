-- ============================================
-- CSE 340 - Service Network Database Setup
-- Complete Database Schema
-- ============================================

-- ============================================
-- PART 1: Drop existing tables (if needed)
-- ============================================

DROP TABLE IF EXISTS project_categories CASCADE;
DROP TABLE IF EXISTS categories CASCADE;
DROP TABLE IF EXISTS service_projects CASCADE;
DROP TABLE IF EXISTS organization CASCADE;

-- ============================================
-- PART 2: Create Organizations Table
-- ============================================

CREATE TABLE organization (
    organization_id SERIAL PRIMARY KEY,
    name VARCHAR(150) NOT NULL,
    description TEXT NOT NULL,
    contact_email VARCHAR(255) NOT NULL,
    logo_filename VARCHAR(255) NOT NULL
);

-- ============================================
-- PART 3: Create Service Projects Table
-- ============================================

CREATE TABLE service_projects (
    project_id SERIAL PRIMARY KEY,
    organization_id INTEGER NOT NULL,
    title VARCHAR(200) NOT NULL,
    description TEXT NOT NULL,
    location VARCHAR(255) NOT NULL,
    project_date DATE NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    status VARCHAR(50) DEFAULT 'Upcoming',
    max_volunteers INTEGER,
    current_volunteers INTEGER DEFAULT 0,
    FOREIGN KEY (organization_id) REFERENCES organization(organization_id) ON DELETE CASCADE
);

-- ============================================
-- PART 4: Create Categories Table
-- ============================================

CREATE TABLE categories (
    category_id SERIAL PRIMARY KEY,
    name VARCHAR(100) NOT NULL UNIQUE,
    description TEXT,
    icon_class VARCHAR(50),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    is_active BOOLEAN DEFAULT TRUE
);

-- ============================================
-- PART 5: Create Junction Table (Many-to-Many)
-- ============================================

CREATE TABLE project_categories (
    project_id INTEGER NOT NULL,
    category_id INTEGER NOT NULL,
    PRIMARY KEY (project_id, category_id),
    FOREIGN KEY (project_id) REFERENCES service_projects(project_id) ON DELETE CASCADE,
    FOREIGN KEY (category_id) REFERENCES categories(category_id) ON DELETE CASCADE
);

-- ============================================
-- PART 6: Create Indexes for Performance
-- ============================================

CREATE INDEX idx_service_projects_organization_id ON service_projects(organization_id);
CREATE INDEX idx_service_projects_project_date ON service_projects(project_date);
CREATE INDEX idx_service_projects_status ON service_projects(status);
CREATE INDEX idx_categories_name ON categories(name);
CREATE INDEX idx_project_categories_project_id ON project_categories(project_id);
CREATE INDEX idx_project_categories_category_id ON project_categories(category_id);

-- ============================================
-- PART 7: Insert Sample Organizations
-- ============================================

INSERT INTO organization (name, description, contact_email, logo_filename)
VALUES 
    ('BrightFuture Builders', 'A nonprofit focused on improving community infrastructure through sustainable construction projects.', 'info@brightfuturebuilders.org', 'brightfuture-logo.png'),
    ('GreenHarvest Growers', 'An urban farming collective promoting food sustainability and education in local neighborhoods.', 'contact@greenharvest.org', 'greenharvest-logo.png'),
    ('UnityServe Volunteers', 'A volunteer coordination group supporting local charities and service initiatives.', 'hello@unityserve.org', 'unityserve-logo.png');

-- ============================================
-- PART 8: Insert Sample Service Projects
-- ============================================

-- BrightFuture Builders Projects (Organization ID: 1)
INSERT INTO service_projects (organization_id, title, description, location, project_date, status, max_volunteers)
VALUES 
    (1, 'Downtown Park Cleanup', 'Join us for a community-wide cleanup event at Central Park. We will be picking up trash, planting flowers, and beautifying the park for summer.', 'Central Park, 123 Main St', '2024-06-15', 'Upcoming', 50),
    (1, 'Community Garden Build', 'Help us build a new community garden in the East Side neighborhood. Volunteers will help with planting, building garden beds, and creating walking paths.', 'East Side Community Center, 456 Oak Ave', '2024-07-20', 'Upcoming', 30),
    (1, 'School Playground Renovation', 'Renovating the playground at Lincoln Elementary School. We need volunteers to help with painting, installing new equipment, and landscaping.', 'Lincoln Elementary, 789 Pine St', '2024-08-10', 'Planning', 40),
    (1, 'Senior Center Accessibility Project', 'Making the local senior center more accessible with ramps, handrails, and improved pathways.', 'Silver Springs Senior Center, 321 Maple Dr', '2024-09-05', 'Planning', 20),
    (1, 'Community Mural Project', 'Creating a large community mural on the side of the downtown library. Artists and volunteers needed!', 'Downtown Library, 555 Cedar Ave', '2024-10-12', 'Planning', 25);

-- GreenHarvest Growers Projects (Organization ID: 2)
INSERT INTO service_projects (organization_id, title, description, location, project_date, status, max_volunteers)
VALUES 
    (2, 'Urban Farm Volunteer Day', 'Join us for a day of urban farming! We will be planting vegetables, tending to existing crops, and learning about sustainable agriculture.', 'GreenHarvest Urban Farm, 100 Farm Ln', '2024-06-22', 'Upcoming', 25),
    (2, 'Community Cooking Workshop', 'Learn to cook healthy meals using fresh produce from our farm. This workshop is free for community members.', 'Community Kitchen, 200 Culinary St', '2024-07-13', 'Upcoming', 15),
    (2, 'Farmers Market Setup', 'Help us set up and run the weekly farmers market. Tasks include setting up booths, organizing produce, and assisting customers.', 'Downtown Farmers Market, 300 Market Sq', '2024-08-03', 'Upcoming', 20),
    (2, 'School Garden Education', 'Teach local elementary students about gardening, nutrition, and where food comes from.', 'Various Elementary Schools, 400 Education Blvd', '2024-09-15', 'Planning', 10),
    (2, 'Fall Harvest Festival', 'Help organize and run our annual Fall Harvest Festival with activities, food, and community celebration.', 'GreenHarvest Farm, 500 Harvest Rd', '2024-10-26', 'Planning', 35);

-- UnityServe Volunteers Projects (Organization ID: 3)
INSERT INTO service_projects (organization_id, title, description, location, project_date, status, max_volunteers)
VALUES 
    (3, 'Food Bank Volunteer Day', 'Help sort and distribute food to families in need at the local food bank.', 'Community Food Bank, 600 Hope St', '2024-06-08', 'Upcoming', 40),
    (3, 'After School Tutoring Program', 'Volunteer to tutor elementary and middle school students in math and reading after school.', 'Community Learning Center, 700 Education Dr', '2024-07-01', 'Upcoming', 15),
    (3, 'Senior Companion Program', 'Visit and spend time with seniors at the local assisted living facility. Activities include games, conversation, and light exercise.', 'Golden Years Assisted Living, 800 Comfort Ln', '2024-07-27', 'Upcoming', 20),
    (3, 'Youth Mentorship Workshop', 'Lead workshops for youth on leadership, career development, and life skills.', 'Youth Center, 900 Future Blvd', '2024-08-17', 'Planning', 12),
    (3, 'Holiday Gift Drive', 'Organize and distribute holiday gifts to families in need. Help with collection, wrapping, and delivery.', 'Community Center, 1000 Holiday Ln', '2024-12-14', 'Planning', 50);

-- ============================================
-- PART 9: Insert Categories
-- ============================================

INSERT INTO categories (name, description, icon_class, is_active)
VALUES 
    ('Environment', 'Projects focused on environmental conservation, sustainability, and green initiatives', 'fas fa-leaf', true),
    ('Community', 'Projects that strengthen communities through events, services, and neighborhood improvements', 'fas fa-users', true),
    ('Education', 'Projects that support learning, teaching, and educational development', 'fas fa-graduation-cap', true),
    ('Health & Wellness', 'Projects focused on health, fitness, and well-being', 'fas fa-heartbeat', true),
    ('Food & Hunger', 'Projects addressing food security, nutrition, and hunger relief', 'fas fa-utensils', true),
    ('Youth Development', 'Projects specifically designed to benefit and develop youth', 'fas fa-child', true),
    ('Senior Services', 'Projects supporting elderly populations and senior citizens', 'fas fa-aging', true),
    ('Construction & Infrastructure', 'Building and infrastructure improvement projects', 'fas fa-hard-hat', true),
    ('Arts & Culture', 'Projects promoting arts, culture, and creative expression', 'fas fa-palette', true);

-- ============================================
-- PART 10: Associate Projects with Categories
-- ============================================

-- BrightFuture Builders Projects (Project IDs: 1-5)
INSERT INTO project_categories (project_id, category_id) VALUES 
    (1, (SELECT category_id FROM categories WHERE name = 'Environment')),
    (1, (SELECT category_id FROM categories WHERE name = 'Community')),
    (2, (SELECT category_id FROM categories WHERE name = 'Environment')),
    (2, (SELECT category_id FROM categories WHERE name = 'Community')),
    (3, (SELECT category_id FROM categories WHERE name = 'Education')),
    (3, (SELECT category_id FROM categories WHERE name = 'Youth Development')),
    (3, (SELECT category_id FROM categories WHERE name = 'Construction & Infrastructure')),
    (4, (SELECT category_id FROM categories WHERE name = 'Senior Services')),
    (4, (SELECT category_id FROM categories WHERE name = 'Construction & Infrastructure')),
    (5, (SELECT category_id FROM categories WHERE name = 'Arts & Culture')),
    (5, (SELECT category_id FROM categories WHERE name = 'Community'));

-- GreenHarvest Growers Projects (Project IDs: 6-10)
INSERT INTO project_categories (project_id, category_id) VALUES 
    (6, (SELECT category_id FROM categories WHERE name = 'Environment')),
    (6, (SELECT category_id FROM categories WHERE name = 'Food & Hunger')),
    (6, (SELECT category_id FROM categories WHERE name = 'Community')),
    (7, (SELECT category_id FROM categories WHERE name = 'Food & Hunger')),
    (7, (SELECT category_id FROM categories WHERE name = 'Education')),
    (7, (SELECT category_id FROM categories WHERE name = 'Health & Wellness')),
    (8, (SELECT category_id FROM categories WHERE name = 'Community')),
    (8, (SELECT category_id FROM categories WHERE name = 'Food & Hunger')),
    (9, (SELECT category_id FROM categories WHERE name = 'Education')),
    (9, (SELECT category_id FROM categories WHERE name = 'Environment')),
    (9, (SELECT category_id FROM categories WHERE name = 'Youth Development')),
    (10, (SELECT category_id FROM categories WHERE name = 'Community')),
    (10, (SELECT category_id FROM categories WHERE name = 'Food & Hunger')),
    (10, (SELECT category_id FROM categories WHERE name = 'Arts & Culture'));

-- UnityServe Volunteers Projects (Project IDs: 11-15)
INSERT INTO project_categories (project_id, category_id) VALUES 
    (11, (SELECT category_id FROM categories WHERE name = 'Food & Hunger')),
    (11, (SELECT category_id FROM categories WHERE name = 'Community')),
    (12, (SELECT category_id FROM categories WHERE name = 'Education')),
    (12, (SELECT category_id FROM categories WHERE name = 'Youth Development')),
    (13, (SELECT category_id FROM categories WHERE name = 'Senior Services')),
    (13, (SELECT category_id FROM categories WHERE name = 'Health & Wellness')),
    (13, (SELECT category_id FROM categories WHERE name = 'Community')),
    (14, (SELECT category_id FROM categories WHERE name = 'Youth Development')),
    (14, (SELECT category_id FROM categories WHERE name = 'Education')),
    (14, (SELECT category_id FROM categories WHERE name = 'Community')),
    (15, (SELECT category_id FROM categories WHERE name = 'Community')),
    (15, (SELECT category_id FROM categories WHERE name = 'Youth Development'));

-- ============================================
-- PART 11: Verify Data Insertion
-- ============================================

-- Query to verify organizations
SELECT * FROM organization ORDER BY organization_id;

-- Query to verify projects with their organizations
SELECT 
    sp.project_id,
    sp.title AS project_title,
    o.name AS organization_name
FROM service_projects sp
INNER JOIN organization o ON sp.organization_id = o.organization_id
ORDER BY sp.project_date;

-- Query to verify projects with their categories
SELECT 
    sp.project_id,
    sp.title AS project_title,
    STRING_AGG(c.name, ', ' ORDER BY c.name) AS categories
FROM service_projects sp
LEFT JOIN project_categories pc ON sp.project_id = pc.project_id
LEFT JOIN categories c ON pc.category_id = c.category_id
GROUP BY sp.project_id, sp.title
ORDER BY sp.project_id;

-- Query to get category counts
SELECT 
    c.name AS category_name,
    COUNT(pc.project_id) AS project_count
FROM categories c
LEFT JOIN project_categories pc ON c.category_id = pc.category_id
GROUP BY c.category_id, c.name
ORDER BY project_count DESC;