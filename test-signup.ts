import { auth } from "./lib/auth";
async function test() {
  const res = await auth.api.signUpEmail({
    body: {
      email: "test@example.com",
      password: "password123",
      name: "Test User"
    }
  });
  console.log(res);
}
test();
