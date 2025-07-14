import { config } from 'dotenv';
config();
import { createClient } from '@libsql/client';
import { drizzle } from 'drizzle-orm/libsql';
import * as schema from './schema';

// Konfigurasi koneksi database
const client = createClient({
  // Gunakan URL database LibSQL/Turso Anda
  url: process.env.DATABASE_URL || 'file:./local.db',
  // Jika menggunakan Turso, tambahkan authToken
  // authToken: process.env.DATABASE_AUTH_TOKEN,
});

// Inisialisasi Drizzle ORM dengan skema
export const db = drizzle(client, { schema });
// console.log('DATABASE_URL yang digunakan:', process.env.DATABASE_URL);
