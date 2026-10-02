document.addEventListener('DOMContentLoaded', () => {
    // Set current year in footer
    document.getElementById('year').textContent = new Date().getFullYear();

    const form = document.getElementById('add-project-form');
    const projectsGrid = document.getElementById('projects-grid');
    const secretTrigger = document.getElementById('secret-trigger');
    const terminalBody = document.getElementById('terminal-body');

    // 1. Manejo del Modo Admin - SIEMPRE inactivo al inicio
    let isEditMode = false;
    document.body.classList.remove('edit-mode'); 

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
        if (isEditMode) {
            document.body.classList.add('edit-mode');
        } else {
            document.body.classList.remove('edit-mode');
        }
    }

    // 2. Animación de Fondo - Canvas Partículas (Red neuronal)
    const canvas = document.getElementById('network-canvas');
    const ctx = canvas.getContext('2d');
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;

    let particlesArray;

    class Particle {
        constructor(x, y, directionX, directionY, size, color) {
            this.x = x;
            this.y = y;
            this.directionX = directionX;
            this.directionY = directionY;
            this.size = size;
            this.color = color;
        }
        draw() {
            ctx.beginPath();
            ctx.arc(this.x, this.y, this.size, 0, Math.PI * 2, false);
            ctx.fillStyle = '#00ff9d';
            ctx.fill();
        }
        update() {
            if (this.x > canvas.width || this.x < 0) {
                this.directionX = -this.directionX;
            }
            if (this.y > canvas.height || this.y < 0) {
                this.directionY = -this.directionY;
            }
            this.x += this.directionX;
            this.y += this.directionY;
            this.draw();
        }
    }

    function initParticles() {
        particlesArray = [];
        let numberOfParticles = (canvas.height * canvas.width) / 12000;
        for (let i = 0; i < numberOfParticles; i++) {
            let size = (Math.random() * 2) + 1;
            let x = (Math.random() * ((innerWidth - size * 2) - (size * 2)) + size * 2);
            let y = (Math.random() * ((innerHeight - size * 2) - (size * 2)) + size * 2);
            let directionX = (Math.random() * 1.5) - 0.75;
            let directionY = (Math.random() * 1.5) - 0.75;
            let color = '#00ff9d';
            particlesArray.push(new Particle(x, y, directionX, directionY, size, color));
        }
    }

    function connectParticles() {
        let opacityValue = 1;
        for (let a = 0; a < particlesArray.length; a++) {
            for (let b = a; b < particlesArray.length; b++) {
                let distance = ((particlesArray[a].x - particlesArray[b].x) * (particlesArray[a].x - particlesArray[b].x)) + 
                               ((particlesArray[a].y - particlesArray[b].y) * (particlesArray[a].y - particlesArray[b].y));
                if (distance < (canvas.width / 7) * (canvas.height / 7)) {
                    opacityValue = 1 - (distance / 20000);
                    ctx.strokeStyle = 'rgba(0, 255, 157,' + opacityValue * 0.5 + ')';
                    ctx.lineWidth = 1;
                    ctx.beginPath();
                    ctx.moveTo(particlesArray[a].x, particlesArray[a].y);
                    ctx.lineTo(particlesArray[b].x, particlesArray[b].y);
                    ctx.stroke();
                }
            }
        }
    }

    function animateParticles() {
        requestAnimationFrame(animateParticles);
        ctx.clearRect(0, 0, innerWidth, innerHeight);
        for (let i = 0; i < particlesArray.length; i++) {
            particlesArray[i].update();
        }
        connectParticles();
    }

    window.addEventListener('resize', () => {
        canvas.width = innerWidth;
        canvas.height = innerHeight;
        initParticles();
    });

    initParticles();
    animateParticles();

    // 3. Scroll Reveal & Animación de Terminal
    const revealElements = document.querySelectorAll('.reveal');
    const revealOptions = {
        threshold: 0.15,
        rootMargin: "0px 0px -50px 0px"
    };

    let terminalAnimated = false;
    const aboutText = "Soy un estudiante de ingenieria de software con inteligencia artificial, del instituto nacional Senati, aqui mostrare todo mi recorrido como programador tanto web como fullstack.";

    function runTerminalAnimation() {
        if(terminalAnimated) return;
        terminalAnimated = true;

        terminalBody.innerHTML = `
            <div class="terminal-line">
                <span class="terminal-prompt">user@senati:~$</span> 
                <span class="terminal-cmd" id="cmd-text"></span>
            </div>
        `;
        
        const cmdSpan = document.getElementById('cmd-text');
        const command = "cat sobre_mi.txt";
        let cmdIndex = 0;
        
        function typeCmd() {
            if (cmdIndex < command.length) {
                cmdSpan.textContent += command.charAt(cmdIndex);
                cmdIndex++;
                setTimeout(typeCmd, 80);
            } else {
                setTimeout(showOutput, 500);
            }
        }
        
        function showOutput() {
            terminalBody.innerHTML += `
                <div class="terminal-line" style="color: #a5d6ff; margin-top: 15px; margin-bottom: 15px;">
                    <span class="terminal-output" id="out-text"></span>
                </div>
            `;
            const outSpan = document.getElementById('out-text');
            let outIndex = 0;
            
            function typeOut() {
                if(outIndex < aboutText.length) {
                    outSpan.textContent += aboutText.charAt(outIndex);
                    outIndex++;
                    setTimeout(typeOut, 30);
                } else {
                    setTimeout(showFinalPrompt, 600);
                }
            }
            typeOut();
        }
        
        function showFinalPrompt() {
            terminalBody.innerHTML += `
                <div class="terminal-line">
                    <span class="terminal-prompt">user@senati:~$</span><span class="terminal-cursor"></span>
                </div>
            `;
        }
        
        setTimeout(typeCmd, 1000); 
    }

    const revealObserver = new IntersectionObserver(function(entries, observer) {
        entries.forEach(entry => {
            if (!entry.isIntersecting) {
                return;
            }
            entry.target.classList.add('active');
            
            if(entry.target.querySelector('#terminal-view')) {
                runTerminalAnimation();
            }

            observer.unobserve(entry.target);
        });
    }, revealOptions);

    revealElements.forEach(el => {
        revealObserver.observe(el);
    });

    // 4. Gestión de Proyectos
    loadProjects();

    form.addEventListener('submit', (e) => {
        e.preventDefault();

        const title = document.getElementById('project-title').value;
        const imageUrl = document.getElementById('project-img').value;
        const desc = document.getElementById('project-desc').value;
        const url = document.getElementById('project-url').value;
        const techString = document.getElementById('project-tech').value;
        
        const technologies = techString.split(',').map(tech => tech.trim()).filter(tech => tech !== '');

        const newProject = {
            id: Date.now().toString(),
            title: title,
            imageUrl: imageUrl,
            description: desc,
            url: url,
            technologies: technologies
        };

        saveProject(newProject);
        renderProject(newProject, true); 
        
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
                    imageUrl: 'https://images.unsplash.com/photo-1555066931-4365d14bab8c?auto=format&fit=crop&q=80&w=800',
                    description: 'Herramienta de automatización desarrollada para reducir tiempos de despliegue y tareas repetitivas en servidores locales.',
                    url: '#',
                    technologies: ['Python', 'Bash', 'Docker']
                 };
                 const defaultProject2 = {
                    id: '2',
                    title: 'API Gateway Microservicio',
                    imageUrl: 'https://images.unsplash.com/photo-1558494949-ef010cbdcc31?auto=format&fit=crop&q=80&w=800',
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
        let imageHTML = project.imageUrl ? `<img src="${project.imageUrl}" alt="${project.title}" class="project-image">` : '';

        card.innerHTML = `
            ${imageHTML}
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
