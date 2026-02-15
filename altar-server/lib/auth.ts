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
  const res = await fetch("/api/logout", {
    method: "POST",
  });

  if (!res.ok) {
    throw new Error("Logout failed");
  }

  // client-side cleanup
  localStorage.removeItem("access_token");
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

export async function getCurrentUser() {
  const res = await fetch("/api/auth/me", {
    method: "GET",
    headers: { "Content-Type": "application/json" },
  });
  if (!res.ok) {
    throw new Error("Failed to fetch current user");
  }
  return res.json();
}