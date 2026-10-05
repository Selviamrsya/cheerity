import { hashPassword } from "better-auth/crypto";
async function test() {
  const hash = await hashPassword("Admin1234");
  console.log("Hashed:", hash);
}
test();
