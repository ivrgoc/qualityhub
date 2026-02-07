const { Client } = require('pg');

async function main() {
  const adminClient = new Client({
    host: 'localhost',
    port: 5432,
    user: 'qualityhub',
    password: 'qualityhub_secret',
    database: 'qualityhub',
  });

  try {
    await adminClient.connect();
    console.log('Connected to PostgreSQL');

    // Check if test database exists
    const result = await adminClient.query(
      "SELECT 1 FROM pg_database WHERE datname = 'qualityhub_test'"
    );

    if (result.rows.length === 0) {
      console.log('Creating qualityhub_test database...');
      await adminClient.query('CREATE DATABASE qualityhub_test');
      console.log('Database qualityhub_test created successfully');
    } else {
      console.log('Database qualityhub_test already exists');
    }
  } catch (err) {
    console.error('Error:', err.message);
    process.exit(1);
  } finally {
    await adminClient.end();
  }
}

main();
