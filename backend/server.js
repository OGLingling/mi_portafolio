const express = require('express');
const { Pool } = require('pg');
const cors = require('cors');

const app = express();
const port = 3000;

app.use(cors());
app.use(express.json({ limit: '10mb' }));

const pool = new Pool({
  user: 'lazyengineer',
  host: 'localhost',
  database: 'portafolio',
  password: 'amoprogramar',
  port: 5432,
});

pool.query('SELECT NOW()', (err, res) => {
    if(err) {
        console.error('Error conectando a la base de datos:', err);
    } else {
        console.log('Base de datos PostgreSQL conectada con éxito.');
    }
});

app.post('/api/login', async (req, res) => {
    const { username, password } = req.body;
    try {
        const result = await pool.query('SELECT * FROM users WHERE username = $1 AND password = $2', [username, password]);
        if (result.rows.length > 0) {
            res.json({ success: true, message: 'Login exitoso' });
        } else {
            res.status(401).json({ success: false, message: 'Credenciales inválidas' });
        }
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: 'Error del servidor' });
    }
});

app.get('/api/projects', async (req, res) => {
    try {
        const result = await pool.query('SELECT * FROM projects ORDER BY id DESC');
        // Convertir technologies de vuelta a array
        const projects = result.rows.map(row => ({
            ...row,
            technologies: row.technologies ? row.technologies.split(',') : []
        }));
        res.json(projects);
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: 'Error obteniendo proyectos' });
    }
});

app.post('/api/projects', async (req, res) => {
    const { title, imageUrl, description, url, technologies } = req.body;
    const techString = technologies.join(','); 
    
    try {
        const result = await pool.query(
            'INSERT INTO projects (title, image_url, description, url, technologies) VALUES ($1, $2, $3, $4, $5) RETURNING *',
            [title, imageUrl, description, url, techString]
        );
        res.json(result.rows[0]);
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: 'Error guardando proyecto' });
    }
});

app.delete('/api/projects/:id', async (req, res) => {
    const { id } = req.params;
    try {
        await pool.query('DELETE FROM projects WHERE id = $1', [id]);
        res.json({ success: true });
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: 'Error eliminando proyecto' });
    }
});

app.listen(port, () => {
    console.log(`API Backend corriendo en http://localhost:${port}`);
});
