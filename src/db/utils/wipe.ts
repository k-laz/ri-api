// wipe.ts
import pg from "pg";
import { sequelize } from "../models/index.js";
import dotenv from "dotenv";

dotenv.config();

const { Client } = pg;

const client = new Client({
  user: process.env.DB_USER,
  host: process.env.DB_HOST,
  database: process.env.DB_NAME,
  password: process.env.DB_PASSWORD,
  port: Number(process.env.DB_PORT),
});

const wipeDatabase = async () => {
  try {
    await client.connect();

    // Drop all tables
    const dropTables = `
      DO $$ DECLARE
      r RECORD;
      BEGIN
      FOR r IN (SELECT tablename FROM pg_tables WHERE schemaname = current_schema()) LOOP
          EXECUTE 'DROP TABLE IF EXISTS ' || quote_ident(r.tablename) || ' CASCADE';
      END LOOP;
      END $$;
    `;

    // Drop all sequences
    const dropSequences = `
      DO $$ DECLARE
      r RECORD;
      BEGIN
      FOR r IN (SELECT sequence_name FROM information_schema.sequences WHERE sequence_schema = current_schema()) LOOP
          EXECUTE 'DROP SEQUENCE IF EXISTS ' || quote_ident(r.sequence_name) || ' CASCADE';
      END LOOP;
      END $$;
    `;

    await client.query(dropTables);
    await client.query(dropSequences);

    console.log("Database wiped clean!");

    // Re-sync Sequelize models
    await sequelize.sync({ force: true });
    console.log("Sequelize models synchronized!");
  } catch (err) {
    console.error("Error wiping database:", err);
  } finally {
    await client.end();
    await sequelize.close();
  }
};

wipeDatabase();
