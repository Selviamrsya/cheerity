const { config } = require("dotenv");
config({ path: ".env.local" });
const { neon } = require("@neondatabase/serverless");
const sql = neon(process.env.DATABASE_URL);
const fs = require("fs");
const crypto = require("crypto");

const journal = JSON.parse(
  fs.readFileSync("migrations/meta/_journal.json", "utf8")
);

(async () => {
  for (const e of journal.entries) {
    const q = fs.readFileSync("migrations/" + e.tag + ".sql").toString();
    const hash = crypto.createHash("sha256").update(q).digest("hex");
    await sql.query(
      "insert into drizzle.__drizzle_migrations (hash, created_at) values ($1, $2)",
      [hash, e.when]
    );
    console.log("inserted", e.tag, e.when);
  }
  console.log("done");
})().catch((e) => {
  console.error(e.message);
  process.exit(1);
});
