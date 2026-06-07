import * as fs from 'fs';
import * as path from 'path';
import postgres from 'postgres';

const envPath = path.join(__dirname, '../.env');
if (!fs.existsSync(envPath)) {
  console.error('.env file not found at:', envPath);
  process.exit(1);
}

const envContent = fs.readFileSync(envPath, 'utf8');
let databaseUri = '';

envContent.split('\n').forEach(line => {
  const parts = line.split('=');
  const key = parts[0]?.trim();
  const value = parts.slice(1).join('=').trim();
  if (key === 'APP_DATABASE_URI_VALUE') {
    databaseUri = value;
  }
});

if (!databaseUri) {
  console.error('APP_DATABASE_URI_VALUE not found in .env');
  process.exit(1);
}

const safeUriLog = databaseUri.replace(/:([^:@/]+)@/, ':****@');
console.log('Connecting to database:', safeUriLog);

const sql = postgres(databaseUri, { max: 1, connect_timeout: 5 });

async function dropAll() {
  try {
    console.log('Dropping all tables, schemas, and types...');
    
    await sql`DROP SCHEMA IF EXISTS public CASCADE`;
    
    await sql`CREATE SCHEMA public`;
    await sql`GRANT ALL ON SCHEMA public TO public`;
    
    console.log('Successfully dropped and reset all database tables.');
    process.exit(0);
  } catch (error: any) {
    console.error('Failed to drop database tables:', error.message || error);
    process.exit(1);
  }
}

dropAll();
