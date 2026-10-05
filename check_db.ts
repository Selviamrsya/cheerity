import { config } from "dotenv";
import { neon } from "@neondatabase/serverless";
import { drizzle } from "drizzle-orm/neon-http";
import { users } from "./app/database/schema";

config({ path: ".env.local" });
const sql = neon(process.env.DATABASE_URL!);
const db = drizzle({ client: sql });

async function check() {
  const allUsers = await db.select().from(users);
  console.log("Users in DB:", allUsers.map(u => ({ email: u.email, role: u.role, name: u.name, id: u.id })));
}
check();
