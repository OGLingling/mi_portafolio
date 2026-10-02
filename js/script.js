document.addEventListener('DOMContentLoaded', () => {
    // Set current year in footer
    document.getElementById('year').textContent = new Date().getFullYear();

    const form = document.getElementById('add-project-form');
    const projectsGrid = document.getElementById('projects-grid');

    // Load projects from localStorage on page load
    loadProjects();

    // Handle form submission
    form.addEventListener('submit', (e) => {
        e.preventDefault();

        const title = document.getElementById('project-title').value;
        const desc = document.getElementById('project-desc').value;
        const url = document.getElementById('project-url').value;
        const techString = document.getElementById('project-tech').value;
        
        const technologies = techString.split(',').map(tech => tech.trim()).filter(tech => tech !== '');

        const newProject = {
            id: Date.now().toString(),
            title: title,
            description: desc,
            url: url,
            technologies: technologies
        };

        saveProject(newProject);
        renderProject(newProject);
        
        // Reset form
        form.reset();
        alert('¡Proyecto agregado con éxito!');
    });

    // Save project to localStorage
    function saveProject(project) {
        let projects = getProjects();
        projects.push(project);
        localStorage.setItem('portfolio_projects', JSON.stringify(projects));
    }

    // Get projects from localStorage
    function getProjects() {
        let projects;
        if(localStorage.getItem('portfolio_projects') === null) {
            projects = [];
            // Add a default project if empty
            if (projects.length === 0) {
                 const defaultProject = {
                    id: '1',
                    title: 'Ejemplo de Proyecto',
                    description: 'Esta es una descripción de ejemplo para tu primer proyecto. Puedes eliminarlo y agregar los tuyos.',
                    url: '#',
                    technologies: ['HTML', 'CSS', 'JavaScript']
                 };
                 projects.push(defaultProject);
                 localStorage.setItem('portfolio_projects', JSON.stringify(projects));
            }
        } else {
            projects = JSON.parse(localStorage.getItem('portfolio_projects'));
        }
        return projects;
    }

    // Load and render all projects
    function loadProjects() {
        projectsGrid.innerHTML = '';
        const projects = getProjects();
        projects.forEach(project => renderProject(project));
    }

    // Render a single project card
    function renderProject(project) {
        const card = document.createElement('div');
        card.classList.add('project-card');
        card.dataset.id = project.id;

        let techHTML = '';
        project.technologies.forEach(tech => {
            techHTML += `<span class="tech-tag">${tech}</span>`;
        });

        let linkHTML = project.url ? `<a href="${project.url}" target="_blank" class="btn">Ver Proyecto</a>` : '';

        card.innerHTML = `
            <button class="delete-btn" onclick="deleteProject('${project.id}')" title="Eliminar proyecto"><i class="fas fa-trash"></i></button>
            <h3>${project.title}</h3>
            <p>${project.description}</p>
            <div class="project-tech">
                ${techHTML}
            </div>
            ${linkHTML}
        `;

        projectsGrid.appendChild(card);
    }

    // Make deleteProject globally available
    window.deleteProject = function(id) {
        if(confirm('¿Estás seguro de que deseas eliminar este proyecto?')) {
            let projects = getProjects();
            projects = projects.filter(project => project.id !== id);
            localStorage.setItem('portfolio_projects', JSON.stringify(projects));
            loadProjects(); // Reload the grid
        }
    };
});
