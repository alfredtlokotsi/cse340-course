// ============================================
// Form Validation Scripts
// ============================================

document.addEventListener('DOMContentLoaded', function() {
    // ============================================
    // Organization Form Validation
    // ============================================
    
    const orgForms = document.querySelectorAll('.organization-form');
    orgForms.forEach(form => {
        const nameInput = form.querySelector('#name');
        const descriptionInput = form.querySelector('#description');
        const emailInput = form.querySelector('#contactEmail');
        const logoInput = form.querySelector('#logoFilename');
        const charCount = form.querySelector('#charCount');

        if (descriptionInput && charCount) {
            descriptionInput.addEventListener('input', function() {
                const count = this.value.length;
                charCount.textContent = count;
                charCount.style.color = count > 500 ? '#e74c3c' : '#6c757d';
            });
        }

        function validateName(input) {
            const errorEl = document.getElementById('nameError');
            if (!errorEl) return true;
            const value = input.value.trim();
            if (value.length === 0) {
                input.classList.add('error');
                errorEl.textContent = 'Organization name is required';
                errorEl.classList.add('show');
                return false;
            } else if (value.length < 3) {
                input.classList.add('error');
                errorEl.textContent = 'Name must be at least 3 characters';
                errorEl.classList.add('show');
                return false;
            } else if (value.length > 150) {
                input.classList.add('error');
                errorEl.textContent = 'Name cannot exceed 150 characters';
                errorEl.classList.add('show');
                return false;
            } else {
                input.classList.remove('error');
                errorEl.textContent = '';
                errorEl.classList.remove('show');
                return true;
            }
        }

        function validateDescription(input) {
            const errorEl = document.getElementById('descriptionError');
            if (!errorEl) return true;
            const value = input.value.trim();
            if (value.length === 0) {
                input.classList.add('error');
                errorEl.textContent = 'Description is required';
                errorEl.classList.add('show');
                return false;
            } else if (value.length > 500) {
                input.classList.add('error');
                errorEl.textContent = 'Description cannot exceed 500 characters';
                errorEl.classList.add('show');
                return false;
            } else {
                input.classList.remove('error');
                errorEl.textContent = '';
                errorEl.classList.remove('show');
                return true;
            }
        }

        function validateEmail(input) {
            const errorEl = document.getElementById('emailError');
            if (!errorEl) return true;
            const value = input.value.trim();
            const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
            if (value.length === 0) {
                input.classList.add('error');
                errorEl.textContent = 'Email is required';
                errorEl.classList.add('show');
                return false;
            } else if (!emailRegex.test(value)) {
                input.classList.add('error');
                errorEl.textContent = 'Please provide a valid email address';
                errorEl.classList.add('show');
                return false;
            } else {
                input.classList.remove('error');
                errorEl.textContent = '';
                errorEl.classList.remove('show');
                return true;
            }
        }

        function validateLogo(input) {
            const errorEl = document.getElementById('logoError');
            if (!errorEl) return true;
            const value = input.value.trim();
            if (value.length > 0 && !value.match(/^[a-zA-Z0-9_\-\.]+\.(png|jpg|jpeg|gif|svg)$/i)) {
                input.classList.add('error');
                errorEl.textContent = 'Please enter a valid image filename';
                errorEl.classList.add('show');
                return false;
            } else {
                input.classList.remove('error');
                errorEl.textContent = '';
                errorEl.classList.remove('show');
                return true;
            }
        }

        if (nameInput) {
            nameInput.addEventListener('blur', function() { validateName(this); });
            nameInput.addEventListener('input', function() {
                if (this.value.length > 0) validateName(this);
            });
        }

        if (descriptionInput) {
            descriptionInput.addEventListener('blur', function() { validateDescription(this); });
            descriptionInput.addEventListener('input', function() {
                if (this.value.length > 0) validateDescription(this);
            });
        }

        if (emailInput) {
            emailInput.addEventListener('blur', function() { validateEmail(this); });
            emailInput.addEventListener('input', function() {
                if (this.value.length > 0) validateEmail(this);
            });
        }

        if (logoInput) {
            logoInput.addEventListener('blur', function() { validateLogo(this); });
        }

        form.addEventListener('submit', function(e) {
            let isValid = true;
            if (nameInput && !validateName(nameInput)) isValid = false;
            if (descriptionInput && !validateDescription(descriptionInput)) isValid = false;
            if (emailInput && !validateEmail(emailInput)) isValid = false;
            if (logoInput && !validateLogo(logoInput)) isValid = false;
            if (!isValid) {
                e.preventDefault();
                const firstError = form.querySelector('.form-group input.error, .form-group textarea.error, .form-group select.error');
                if (firstError) firstError.focus();
            }
        });
    });

    // ============================================
    // Project Form Validation
    // ============================================

    const projectForms = document.querySelectorAll('.project-form');
    projectForms.forEach(form => {
        const orgSelect = form.querySelector('#organizationId');
        const titleInput = form.querySelector('#title');
        const descriptionInput = form.querySelector('#description');
        const locationInput = form.querySelector('#location');
        const dateInput = form.querySelector('#date');
        const charCount = form.querySelector('#charCount');

        if (descriptionInput && charCount) {
            descriptionInput.addEventListener('input', function() {
                const count = this.value.length;
                charCount.textContent = count;
                charCount.style.color = count > 1000 ? '#e74c3c' : '#6c757d';
            });
        }

        function validateOrg(input) {
            const errorEl = document.getElementById('orgError');
            if (!errorEl) return true;
            if (!input.value || input.value === '') {
                input.classList.add('error');
                errorEl.textContent = 'Please select an organization';
                errorEl.classList.add('show');
                return false;
            } else {
                input.classList.remove('error');
                errorEl.textContent = '';
                errorEl.classList.remove('show');
                return true;
            }
        }

        function validateTitle(input) {
            const errorEl = document.getElementById('titleError');
            if (!errorEl) return true;
            const value = input.value.trim();
            if (value.length === 0) {
                input.classList.add('error');
                errorEl.textContent = 'Title is required';
                errorEl.classList.add('show');
                return false;
            } else if (value.length < 3) {
                input.classList.add('error');
                errorEl.textContent = 'Title must be at least 3 characters';
                errorEl.classList.add('show');
                return false;
            } else if (value.length > 200) {
                input.classList.add('error');
                errorEl.textContent = 'Title cannot exceed 200 characters';
                errorEl.classList.add('show');
                return false;
            } else {
                input.classList.remove('error');
                errorEl.textContent = '';
                errorEl.classList.remove('show');
                return true;
            }
        }

        function validateDescription(input) {
            const errorEl = document.getElementById('descriptionError');
            if (!errorEl) return true;
            const value = input.value.trim();
            if (value.length === 0) {
                input.classList.add('error');
                errorEl.textContent = 'Description is required';
                errorEl.classList.add('show');
                return false;
            } else if (value.length > 1000) {
                input.classList.add('error');
                errorEl.textContent = 'Description cannot exceed 1000 characters';
                errorEl.classList.add('show');
                return false;
            } else {
                input.classList.remove('error');
                errorEl.textContent = '';
                errorEl.classList.remove('show');
                return true;
            }
        }

        function validateLocation(input) {
            const errorEl = document.getElementById('locationError');
            if (!errorEl) return true;
            const value = input.value.trim();
            if (value.length === 0) {
                input.classList.add('error');
                errorEl.textContent = 'Location is required';
                errorEl.classList.add('show');
                return false;
            } else if (value.length > 200) {
                input.classList.add('error');
                errorEl.textContent = 'Location cannot exceed 200 characters';
                errorEl.classList.add('show');
                return false;
            } else {
                input.classList.remove('error');
                errorEl.textContent = '';
                errorEl.classList.remove('show');
                return true;
            }
        }

        function validateDate(input) {
            const errorEl = document.getElementById('dateError');
            if (!errorEl) return true;
            if (!input.value) {
                input.classList.add('error');
                errorEl.textContent = 'Date is required';
                errorEl.classList.add('show');
                return false;
            } else {
                const selectedDate = new Date(input.value);
                const today = new Date();
                today.setHours(0, 0, 0, 0);
                if (selectedDate < today) {
                    input.classList.add('error');
                    errorEl.textContent = 'Date must be today or in the future';
                    errorEl.classList.add('show');
                    return false;
                } else {
                    input.classList.remove('error');
                    errorEl.textContent = '';
                    errorEl.classList.remove('show');
                    return true;
                }
            }
        }

        if (orgSelect) {
            orgSelect.addEventListener('change', function() { validateOrg(this); });
        }

        if (titleInput) {
            titleInput.addEventListener('blur', function() { validateTitle(this); });
            titleInput.addEventListener('input', function() {
                if (this.value.length > 0) validateTitle(this);
            });
        }

        if (descriptionInput) {
            descriptionInput.addEventListener('blur', function() { validateDescription(this); });
            descriptionInput.addEventListener('input', function() {
                if (this.value.length > 0) validateDescription(this);
            });
        }

        if (locationInput) {
            locationInput.addEventListener('blur', function() { validateLocation(this); });
            locationInput.addEventListener('input', function() {
                if (this.value.length > 0) validateLocation(this);
            });
        }

        if (dateInput) {
            dateInput.addEventListener('blur', function() { validateDate(this); });
            dateInput.addEventListener('change', function() { validateDate(this); });
        }

        form.addEventListener('submit', function(e) {
            let isValid = true;
            if (orgSelect && !validateOrg(orgSelect)) isValid = false;
            if (titleInput && !validateTitle(titleInput)) isValid = false;
            if (descriptionInput && !validateDescription(descriptionInput)) isValid = false;
            if (locationInput && !validateLocation(locationInput)) isValid = false;
            if (dateInput && !validateDate(dateInput)) isValid = false;
            if (!isValid) {
                e.preventDefault();
                const firstError = form.querySelector('.form-group input.error, .form-group textarea.error, .form-group select.error');
                if (firstError) firstError.focus();
            }
        });
    });

    // ============================================
    // Category Form Validation
    // ============================================

    const categoryForms = document.querySelectorAll('.category-form');
    categoryForms.forEach(form => {
        const nameInput = form.querySelector('#name');

        function validateCategoryName(input) {
            const errorEl = document.getElementById('nameError');
            if (!errorEl) return true;
            const value = input.value.trim();
            if (value.length === 0) {
                input.classList.add('error');
                errorEl.textContent = 'Category name is required';
                errorEl.classList.add('show');
                return false;
            } else if (value.length > 100) {
                input.classList.add('error');
                errorEl.textContent = 'Category name cannot exceed 100 characters';
                errorEl.classList.add('show');
                return false;
            } else if (!/^[a-zA-Z0-9\s\-&']+$/.test(value)) {
                input.classList.add('error');
                errorEl.textContent = 'Category name contains invalid characters';
                errorEl.classList.add('show');
                return false;
            } else {
                input.classList.remove('error');
                errorEl.textContent = '';
                errorEl.classList.remove('show');
                return true;
            }
        }

        if (nameInput) {
            nameInput.addEventListener('blur', function() { validateCategoryName(this); });
            nameInput.addEventListener('input', function() {
                if (this.value.length > 0) validateCategoryName(this);
            });
        }

        form.addEventListener('submit', function(e) {
            if (nameInput && !validateCategoryName(nameInput)) {
                e.preventDefault();
                nameInput.focus();
            }
        });
    });

    // ============================================
    // Flash Message Close Buttons
    // ============================================

    document.querySelectorAll('.alert-close').forEach(button => {
        button.addEventListener('click', function() {
            this.parentElement.style.display = 'none';
        });
    });
});