export async function login(email: string, password: string) {
  const res = await fetch("/api/login", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ email, password }),
  });

  if (!res.ok) {
    throw new Error("Login failed");
  }

  return res.json();
}

export async function logout() {
  await fetch("/api/logout", { method: "POST" });
}

export async function register(
  name: string,
  userId: string,
    email: string,
    password: string
) {
  const res = await fetch("/api/register", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ name, userId, email, password }),
  });
    if (!res.ok) {
    throw new Error("Registration failed");
  }
    return res.json();
}