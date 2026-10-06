document.addEventListener('DOMContentLoaded', () => {
    // API URL
    const API_URL = 'http://localhost:3000/api';

    document.getElementById('year').textContent = new Date().getFullYear();

    const form = document.getElementById('add-project-form');
    const projectsGrid = document.getElementById('projects-grid');
    const loginTrigger = document.getElementById('login-trigger');
    const loginModal = document.getElementById('login-modal');
    const closeModal = document.getElementById('close-modal');
    const loginBtn = document.getElementById('login-btn');
    const usernameInput = document.getElementById('username');
    const passwordInput = document.getElementById('password');
    const loginError = document.getElementById('login-error');
    
    // Logout Modal
    const logoutModal = document.getElementById('logout-modal');
    const closeLogoutModal = document.getElementById('close-logout-modal');
    const logoutBtn = document.getElementById('logout-btn');

    const terminalBody = document.getElementById('terminal-body');

    // 1. Manejo del Modo Admin - SIEMPRE inactivo al inicio
    let isEditMode = false;
    document.body.classList.remove('edit-mode'); 

    // Login Modal Handlers
    loginTrigger.addEventListener('click', () => {
        if (isEditMode) {
            logoutModal.classList.add('show');
        } else {
            loginModal.classList.add('show');
            usernameInput.focus();
        }
    });

    closeModal.addEventListener('click', () => {
        loginModal.classList.remove('show');
        loginError.style.display = 'none';
        usernameInput.value = '';
        passwordInput.value = '';
    });

    closeLogoutModal.addEventListener('click', () => {
        logoutModal.classList.remove('show');
    });

    window.addEventListener('click', (e) => {
        if (e.target === loginModal) {
            loginModal.classList.remove('show');
            loginError.style.display = 'none';
        }
        if (e.target === logoutModal) {
            logoutModal.classList.remove('show');
        }
    });

    // Logout Action
    logoutBtn.addEventListener('click', () => {
        isEditMode = false;
        document.body.classList.remove('edit-mode');
        loginTrigger.title = "Acceso Admin";
        logoutModal.classList.remove('show');
    });

    // Login Action (API POSTGRESQL)
    loginBtn.addEventListener('click', async () => {
        const username = usernameInput.value.trim();
        const password = passwordInput.value;

        try {
            const response = await fetch(`${API_URL}/login`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ username, password })
            });
            const data = await response.json();
            
            if (data.success) {
                isEditMode = true;
                document.body.classList.add('edit-mode');
                loginTrigger.title = "Cerrar Sesión";
                loginModal.classList.remove('show');
                usernameInput.value = '';
                passwordInput.value = '';
                loginError.style.display = 'none';
            } else {
                loginError.textContent = "> Acceso denegado. Credenciales incorrectas.";
                loginError.style.display = 'block';
                passwordInput.value = '';
            }
        } catch (err) {
            console.error('Error conectando con el backend', err);
            loginError.textContent = "> Error de conexión. ¿Backend encendido?";
            loginError.style.display = 'block';
        }
    });

    passwordInput.addEventListener('keypress', (e) => {
        if(e.key === 'Enter') {
            loginBtn.click();
        }
    });

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

    // 4. Gestión de Proyectos con PostgreSQL API
    let editingProjectId = null;
    const submitProjectBtn = document.getElementById('submit-project-btn');
    const cancelEditBtn = document.getElementById('cancel-edit-btn');
    const imgHelp = document.getElementById('img-help');

    // Reset Form a estado original
    function resetFormState() {
        form.reset();
        editingProjectId = null;
        submitProjectBtn.textContent = 'Deploy >_';
        cancelEditBtn.style.display = 'none';
        imgHelp.style.display = 'none';
        document.getElementById('project-img').required = true;
    }

    cancelEditBtn.addEventListener('click', resetFormState);

    loadProjects();

    form.addEventListener('submit', async (e) => {
        e.preventDefault();

        const title = document.getElementById('project-title').value;
        const fileInput = document.getElementById('project-img');
        const desc = document.getElementById('project-desc').value;
        const url = document.getElementById('project-url').value;
        const techString = document.getElementById('project-tech').value;
        
        const technologies = techString.split(',').map(tech => tech.trim()).filter(tech => tech !== '');

        const sendData = async (base64Image) => {
            const projectData = {
                title: title,
                description: desc,
                url: url,
                technologies: technologies
            };
            
            if (base64Image) {
                projectData.imageUrl = base64Image;
            }

            try {
                const isEdit = editingProjectId !== null;
                const endpoint = isEdit ? `${API_URL}/projects/${editingProjectId}` : `${API_URL}/projects`;
                const method = isEdit ? 'PUT' : 'POST';

                const response = await fetch(endpoint, {
                    method: method,
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify(projectData)
                });
                
                if(response.ok) {
                    resetFormState();
                    loadProjects(); // Recargar todos para mantener el orden correcto
                } else {
                    alert('Error del servidor al guardar el proyecto.');
                }
            } catch (err) {
                alert('Error de conexión. Asegúrate que la base de datos y backend están corriendo.');
            }
        };

        if (fileInput.files && fileInput.files[0]) {
            compressImage(fileInput.files[0], sendData);
        } else {
            // Si es edición y no se subió imagen, mandamos sin imagen
            if (editingProjectId) {
                sendData(null);
            } else {
                alert("Selecciona una imagen para el nuevo proyecto.");
            }
        }
    });

    // Función para comprimir la imagen local y convertirla a Base64
    function compressImage(file, callback) {
        const reader = new FileReader();
        reader.readAsDataURL(file);
        reader.onload = event => {
            const img = new Image();
            img.src = event.target.result;
            img.onload = () => {
                const canvas = document.createElement('canvas');
                const MAX_WIDTH = 800;
                const MAX_HEIGHT = 800;
                let width = img.width;
                let height = img.height;

                if (width > height) {
                    if (width > MAX_WIDTH) {
                        height *= MAX_WIDTH / width;
                        width = MAX_WIDTH;
                    }
                } else {
                    if (height > MAX_HEIGHT) {
                        width *= MAX_HEIGHT / height;
                        height = MAX_HEIGHT;
                    }
                }
                canvas.width = width;
                canvas.height = height;
                const ctx = canvas.getContext('2d');
                ctx.drawImage(img, 0, 0, width, height);
                
                // Comprimir a JPEG con calidad 70%
                const dataUrl = canvas.toDataURL('image/jpeg', 0.7);
                callback(dataUrl);
            }
        };
    }

    // Guardar proyectos en memoria temporal para poder editarlos fácilmente
    let currentProjectsList = [];

    async function loadProjects() {
        projectsGrid.innerHTML = '';
        try {
            const response = await fetch(`${API_URL}/projects`);
            if (response.ok) {
                currentProjectsList = await response.json();
                currentProjectsList.forEach(project => renderProject(project, false));
            } else {
                projectsGrid.innerHTML = '<p style="color:red">> Error cargando proyectos de la base de datos.</p>';
            }
        } catch (err) {
            projectsGrid.innerHTML = '<p style="color:var(--text-secondary)">> Sin conexión al backend PostgreSQL. Ejecuta el servidor para visualizar proyectos.</p>';
        }
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
        let imageHTML = project.image_url ? `<img src="${project.image_url}" alt="${project.title}" class="project-image">` : project.imageUrl ? `<img src="${project.imageUrl}" alt="${project.title}" class="project-image">` : '';

        card.innerHTML = `
            ${imageHTML}
            <div class="admin-actions admin-only" style="position: absolute; top: 15px; right: 15px; z-index: 10; display: flex; gap: 5px;">
                <button class="edit-btn" onclick="editProject('${project.id}')" title="Editar proyecto" style="background: rgba(255, 189, 46, 0.1); color: #ffbd2e; border: 1px solid rgba(255, 189, 46, 0.3); padding: 8px 12px; border-radius: 6px; cursor: pointer; transition: all 0.3s;"><i class="fas fa-edit"></i></button>
                <button class="delete-btn" onclick="deleteProject('${project.id}')" title="Eliminar proyecto" style="position: relative; top: 0; right: 0;"><i class="fas fa-trash"></i></button>
            </div>
            <h3>${project.title}</h3>
            <p>${project.description}</p>
            <div class="project-tech">
                ${techHTML}
            </div>
            ${linkHTML}
        `;

        projectsGrid.appendChild(card);
    }

    window.editProject = function(id) {
        // Buscar proyecto
        const proj = currentProjectsList.find(p => p.id == id);
        if (!proj) return;

        editingProjectId = id;
        document.getElementById('project-title').value = proj.title;
        document.getElementById('project-desc').value = proj.description;
        document.getElementById('project-url').value = proj.url || '';
        document.getElementById('project-tech').value = proj.technologies.join(', ');
        
        // El input file no se puede "llenar", así que lo hacemos opcional
        document.getElementById('project-img').required = false;
        imgHelp.style.display = 'block';

        submitProjectBtn.textContent = 'Actualizar >_';
        cancelEditBtn.style.display = 'block';

        // Scroll suave al formulario
        document.getElementById('agregar').scrollIntoView({ behavior: 'smooth' });
    };

    window.deleteProject = async function(id) {
        if(confirm('¿Eliminar registro del proyecto de la base de datos?')) {
            try {
                const response = await fetch(`${API_URL}/projects/${id}`, {
                    method: 'DELETE'
                });
                if (response.ok) {
                    const card = document.querySelector(`.project-card[data-id="${id}"]`);
                    if(card) {
                        card.style.transform = 'scale(0.8)';
                        card.style.opacity = '0';
                        setTimeout(() => loadProjects(), 300);
                    } else {
                        loadProjects();
                    }
                } else {
                    alert("Error eliminando del servidor.");
                }
            } catch (err) {
                alert("Error de red.");
            }
        }
    };
});
