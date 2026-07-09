-- Create the organization table
CREATE TABLE organization (
    organization_id SERIAL PRIMARY KEY,
    name VARCHAR(150) NOT NULL,
    description TEXT NOT NULL,
    contact_email VARCHAR(255) NOT NULL,
    logo_filename VARCHAR(255) NOT NULL
);

-- Insert sample organizations
INSERT INTO organization (name, description, contact_email, logo_filename)
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

-- Create the service_projects table
CREATE TABLE service_projects (
    project_id SERIAL PRIMARY KEY,
    organization_id INT NOT NULL,
    title VARCHAR(255) NOT NULL,
    description TEXT,
    location VARCHAR(255) NOT NULL,
    date DATE NOT NULL,
    FOREIGN KEY (organization_id) REFERENCES organizations(org_id)
);

-- Insert sample data (assuming 3 organizations with IDs 1, 2, 3)
INSERT INTO service_projects (organization_id, title, description, location, date)
VALUES 
    (1, 'Community Food Drive', 'Collecting non-perishable food items', 'Downtown Community Center', '2026-08-15'),
    (1, 'Park Cleanup Day', 'Cleaning and maintaining local park', 'Central Park', '2026-07-20'),
    (1, 'Senior Center Visit', 'Visiting and assisting elderly residents', 'Sunset Senior Living', '2026-09-05'),
    (1, 'School Supply Drive', 'Collecting school supplies for underprivileged students', 'City Hall', '2026-08-01'),
    (1, 'Animal Shelter Support', 'Volunteering at the local animal shelter', 'Happy Paws Shelter', '2026-07-28'),
    (2, 'Tree Planting Initiative', 'Planting trees in urban areas', 'Greenwood Neighborhood', '2026-08-10'),
    (2, 'Recycling Awareness', 'Educating community about recycling', 'Community Library', '2026-07-15'),
    (2, 'Community Garden', 'Building and maintaining a community garden', 'East Side Garden Plot', '2026-09-01'),
    (2, 'Clean Water Project', 'Providing clean water solutions', 'Riverside Community', '2026-08-20'),
    (2, 'Youth Mentorship', 'Mentoring at-risk youth', 'Youth Center', '2026-07-25'),
    (3, 'Disaster Relief Training', 'Training volunteers for disaster response', 'Red Cross Building', '2026-08-05'),
    (3, 'Medical Outreach', 'Providing medical services to underserved areas', 'Mobile Health Clinic', '2026-07-18'),
    (3, 'Educational Workshop', 'Free educational workshops for adults', 'Community College', '2026-09-10'),
    (3, 'Homeless Shelter Support', 'Volunteering at homeless shelter', 'Hope Shelter', '2026-08-25'),
    (3, 'Blood Donation Drive', 'Organizing community blood donation', 'Health Center', '2026-07-30');