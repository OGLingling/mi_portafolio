document.addEventListener('DOMContentLoaded', () => {
    // Set current year in footer
    document.getElementById('year').textContent = new Date().getFullYear();

    const form = document.getElementById('add-project-form');
    const projectsGrid = document.getElementById('projects-grid');
    const secretTrigger = document.getElementById('secret-trigger');

    // Handle Edit Mode
    let isEditMode = localStorage.getItem('portfolio_edit_mode') === 'true';
    if(isEditMode) document.body.classList.add('edit-mode');

    let clickCount = 0;
    let clickTimeout = null;

    secretTrigger.addEventListener('click', () => {
        clickCount++;
        
        if (clickCount === 3) {
            toggleEditMode();
            clickCount = 0;
            clearTimeout(clickTimeout);
        } else {
            clearTimeout(clickTimeout);
            clickTimeout = setTimeout(() => {
                clickCount = 0;
            }, 600);
        }
    });

    function toggleEditMode() {
        isEditMode = !isEditMode;
        localStorage.setItem('portfolio_edit_mode', isEditMode);
        if (isEditMode) {
            document.body.classList.add('edit-mode');
        } else {
            document.body.classList.remove('edit-mode');
        }
    }

    // Scroll Reveal Animation Observer
    const revealElements = document.querySelectorAll('.reveal');
    const revealOptions = {
        threshold: 0.15,
        rootMargin: "0px 0px -50px 0px"
    };

    const revealObserver = new IntersectionObserver(function(entries, observer) {
        entries.forEach(entry => {
            if (!entry.isIntersecting) {
                return;
            }
            entry.target.classList.add('active');
            observer.unobserve(entry.target);
        });
    }, revealOptions);

    // Initial observe
    revealElements.forEach(el => {
        revealObserver.observe(el);
    });

    // Load Projects
    loadProjects();

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
        renderProject(newProject, true); // true to add animation
        
        form.reset();
    });

    function saveProject(project) {
        let projects = getProjects();
        projects.push(project);
        localStorage.setItem('portfolio_projects', JSON.stringify(projects));
    }

    function getProjects() {
        let projects;
        if(localStorage.getItem('portfolio_projects') === null) {
            projects = [];
            if (projects.length === 0) {
                 const defaultProject = {
                    id: '1',
                    title: 'Automated Scripting Tool',
                    description: 'Herramienta de automatización desarrollada para reducir tiempos de despliegue y tareas repetitivas en servidores locales usando contenedores.',
                    url: '#',
                    technologies: ['Python', 'Bash', 'Docker']
                 };
                 const defaultProject2 = {
                    id: '2',
                    title: 'API Gateway Microservicio',
                    description: 'Servicio centralizado para enrutamiento y rate-limiting de un ecosistema de aplicaciones distribuidas.',
                    url: '#',
                    technologies: ['Node.js', 'Redis', 'Express']
                 };
                 projects.push(defaultProject, defaultProject2);
                 localStorage.setItem('portfolio_projects', JSON.stringify(projects));
            }
        } else {
            projects = JSON.parse(localStorage.getItem('portfolio_projects'));
        }
        return projects;
    }

    function loadProjects() {
        projectsGrid.innerHTML = '';
        const projects = getProjects();
        projects.forEach(project => renderProject(project, false));
    }

    function renderProject(project, animateNew = false) {
        const card = document.createElement('div');
        card.classList.add('project-card');
        
        if (animateNew) {
            card.style.animation = 'scaleIn 0.5s ease-out forwards';
        } else {
            card.classList.add('reveal');
            revealObserver.observe(card);
        }
        
        card.dataset.id = project.id;

        let techHTML = '';
        project.technologies.forEach(tech => {
            techHTML += `<span class="tech-tag">${tech}</span>`;
        });

        let linkHTML = project.url ? `<a href="${project.url}" target="_blank" class="btn-outline">Ver Repositorio</a>` : '';

        card.innerHTML = `
            <button class="delete-btn admin-only" onclick="deleteProject('${project.id}')" title="Eliminar proyecto"><i class="fas fa-trash"></i></button>
            <h3>${project.title}</h3>
            <p>${project.description}</p>
            <div class="project-tech">
                ${techHTML}
            </div>
            ${linkHTML}
        `;

        projectsGrid.appendChild(card);
    }

    window.deleteProject = function(id) {
        if(confirm('¿Eliminar registro del proyecto?')) {
            let projects = getProjects();
            projects = projects.filter(project => project.id !== id);
            localStorage.setItem('portfolio_projects', JSON.stringify(projects));
            
            // Add disappearing animation
            const card = document.querySelector(`.project-card[data-id="${id}"]`);
            if(card) {
                card.style.transform = 'scale(0.8)';
                card.style.opacity = '0';
                setTimeout(() => {
                    loadProjects(); 
                }, 300);
            } else {
                loadProjects();
            }
        }
    };
});
