import { Handler } from '@netlify/functions';
import postgres from 'postgres';

// Initialize the Postgres connection using the environment variable provided by Netlify Database
// Netlify automatically injects DATABASE_URL into the environment when you connect a database
const sql = postgres(process.env.DATABASE_URL || '', {
  ssl: 'require',
});

export const handler: Handler = async (event) => {
  try {
    // Only allow GET requests
    if (event.httpMethod !== 'GET') {
      return { statusCode: 405, body: 'Method Not Allowed' };
    }

    const { type } = event.queryStringParameters || {};

    if (type === 'menu') {
      const menuItems = await sql`SELECT * FROM menu_items WHERE is_available = true`;
      return {
        statusCode: 200,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(menuItems),
      };
    }

    if (type === 'outlets') {
      const outlets = await sql`SELECT * FROM outlets WHERE is_active = true`;
      return {
        statusCode: 200,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(outlets),
      };
    }

    return {
      statusCode: 400,
      body: JSON.stringify({ error: 'Invalid type parameter. Use ?type=menu or ?type=outlets' }),
    };

  } catch (error) {
    console.error('Database connection error:', error);
    return {
      statusCode: 500,
      body: JSON.stringify({ error: 'Failed to fetch data from database' }),
    };
  }
};
