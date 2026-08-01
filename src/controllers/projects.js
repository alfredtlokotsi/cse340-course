// ============================================
// Projects Controller
// ============================================

import { 
    getAllProjects, 
    getUpcomingProjects, 
    getProjectDetails,
    createProject,
    updateProject,
    registerVolunteer,
    formatDate,
    formatDateForInput
} from '../models/projects.js';
import { getAllOrganizations } from '../models/organizations.js';
import { body, validationResult } from 'express-validator';

const NUMBER_OF_UPCOMING_PROJECTS = 5;

const projectValidation = [
    body('title')
        .trim()
        .notEmpty()
        .withMessage('Project title is required')
        .isLength({ min: 3, max: 200 })
        .withMessage('Project title must be between 3 and 200 characters'),
    body('description')
        .trim()
        .notEmpty()
        .withMessage('Project description is required')
        .isLength({ max: 1000 })
        .withMessage('Project description cannot exceed 1000 characters'),
    body('location')
        .trim()
        .notEmpty()
        .withMessage('Project location is required')
        .isLength({ max: 200 })
        .withMessage('Location cannot exceed 200 characters'),
    body('date')
        .notEmpty()
        .withMessage('Project date is required')
        .isDate({ format: 'YYYY-MM-DD' })
        .withMessage('Please provide a valid date in YYYY-MM-DD format')
        .custom((value) => {
            const selectedDate = new Date(value);
            const today = new Date();
            today.setHours(0, 0, 0, 0);
            if (selectedDate < today) {
                throw new Error('Project date must be today or in the future');
            }
            return true;
        }),
    body('organizationId')
        .notEmpty()
        .withMessage('Please select an organization')
        .isInt({ min: 1 })
        .withMessage('Invalid organization selection')
];

const showProjectsPage = async (req, res, next) => {
    try {
        const projects = await getUpcomingProjects(NUMBER_OF_UPCOMING_PROJECTS);
        const title = 'Upcoming Service Projects';
        res.render('projects', { title, projects, formatDate: formatDate });
    } catch (error) {
        console.error('❌ Error in showProjectsPage:', error);
        next(error);
    }
};

const showProjectDetailsPage = async (req, res, next) => {
    try {
        const projectId = req.params.id;
        if (!/^\d+$/.test(projectId)) {
            const err = new Error('Invalid project ID');
            err.status = 400;
            return next(err);
        }
        const project = await getProjectDetails(projectId);
        if (!project) {
            const err = new Error('Project not found');
            err.status = 404;
            return next(err);
        }
        const title = project.title;
        res.render('project', { title, project, formatDate: formatDate });
    } catch (error) {
        console.error('❌ Error in showProjectDetailsPage:', error);
        next(error);
    }
};

const showNewProjectForm = async (req, res, next) => {
    try {
        const organizations = await getAllOrganizations();
        const title = 'Add New Service Project';
        res.render('new-project', { title, organizations });
    } catch (error) {
        console.error('❌ Error in showNewProjectForm:', error);
        next(error);
    }
};

const processNewProjectForm = async (req, res, next) => {
    try {
        const results = validationResult(req);
        if (!results.isEmpty()) {
            results.array().forEach((error) => {
                req.flash('error', error.msg);
            });
            return res.redirect('/new-project');
        }
        const { title, description, location, date, organizationId } = req.body;
        const projectId = await createProject(title, description, location, date, organizationId);
        req.flash('success', `Project "${title}" added successfully!`);
        res.redirect('/projects');
    } catch (error) {
        console.error('❌ Error processing new project form:', error);
        req.flash('error', 'Failed to create project. Please try again.');
        res.redirect('/new-project');
    }
};

const showEditProjectForm = async (req, res, next) => {
    try {
        const projectId = req.params.id;
        if (!/^\d+$/.test(projectId)) {
            const err = new Error('Invalid project ID');
            err.status = 400;
            return next(err);
        }
        const project = await getProjectDetails(projectId);
        if (!project) {
            const err = new Error('Project not found');
            err.status = 404;
            return next(err);
        }
        const organizations = await getAllOrganizations();
        const title = `Edit Project: ${project.title}`;
        const formattedDate = formatDateForInput(project.project_date);
        res.render('edit-project', {
            title,
            project,
            organizations,
            formattedDate,
            formatDate: formatDate
        });
    } catch (error) {
        console.error('❌ Error in showEditProjectForm:', error);
        next(error);
    }
};

const processEditProjectForm = async (req, res, next) => {
    try {
        const projectId = req.params.id;
        if (!/^\d+$/.test(projectId)) {
            const err = new Error('Invalid project ID');
            err.status = 400;
            return next(err);
        }
        const results = validationResult(req);
        if (!results.isEmpty()) {
            results.array().forEach((error) => {
                req.flash('error', error.msg);
            });
            return res.redirect(`/edit-project/${projectId}`);
        }
        const { 
            title, 
            description, 
            location, 
            date, 
            organizationId,
            status,
            maxVolunteers,
            currentVolunteers
        } = req.body;
        const updatedProject = await updateProject(
            projectId,
            title,
            description,
            location,
            date,
            organizationId,
            status || 'Upcoming',
            maxVolunteers || 0,
            currentVolunteers || 0
        );
        req.flash('success', `Project "${title}" updated successfully!`);
        res.redirect(`/project/${projectId}`);
    } catch (error) {
        console.error('❌ Error processing edit project form:', error);
        req.flash('error', 'Failed to update project. Please try again.');
        res.redirect(`/edit-project/${req.params.id}`);
    }
};

const registerVolunteerForProject = async (req, res, next) => {
    try {
        const projectId = req.params.id;
        if (!/^\d+$/.test(projectId)) {
            const err = new Error('Invalid project ID');
            err.status = 400;
            return next(err);
        }
        const updatedProject = await registerVolunteer(projectId);
        req.flash('success', `You have successfully registered for "${updatedProject.title}"!`);
        res.redirect(`/project/${projectId}`);
    } catch (error) {
        console.error('❌ Error registering volunteer:', error);
        req.flash('error', error.message || 'Failed to register for project. Please try again.');
        res.redirect(`/project/${req.params.id}`);
    }
};

const getProjectsJSON = async (req, res, next) => {
    try {
        const projects = await getAllProjects();
        res.json(projects);
    } catch (error) {
        console.error('❌ Error in getProjectsJSON:', error);
        next(error);
    }
};

export { 
    showProjectsPage, 
    showProjectDetailsPage,
    showNewProjectForm,
    processNewProjectForm,
    showEditProjectForm,
    processEditProjectForm,
    registerVolunteerForProject,
    projectValidation,
    getProjectsJSON
};