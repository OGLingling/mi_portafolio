const { Client } = require('pg');

const connectionString = 'postgresql://neondb_owner:npg_zTfS9Apmix4k@ep-cool-recipe-b67rh5rj-pooler.c-2.sa-east-1.aws.neon.tech/neondb?sslmode=require';

const client = new Client({
  connectionString,
  ssl: {
    rejectUnauthorized: false
  }
});

const sql = `
CREATE TABLE IF NOT EXISTS users (
    id SERIAL PRIMARY KEY,
    username VARCHAR(50) UNIQUE NOT NULL,
    password VARCHAR(255) NOT NULL
);

INSERT INTO users (username, password) VALUES ('LazyEngineer', 'amoprogramar') ON CONFLICT (username) DO NOTHING;

CREATE TABLE IF NOT EXISTS projects (
    id SERIAL PRIMARY KEY,
    title VARCHAR(255) NOT NULL,
    image_url TEXT,
    description TEXT,
    url TEXT,
    technologies TEXT
);
`;

async function run() {
  try {
    await client.connect();
    console.log('Connected to Neon!');
    await client.query(sql);
    console.log('Tables created successfully!');
  } catch (err) {
    console.error('Error:', err);
  } finally {
    await client.end();
  }
}

run();
