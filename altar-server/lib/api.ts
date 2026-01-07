export async function apiFetch(
  path: string,
  options: RequestInit = {}
) {
  const baseUrl = process.env.FLASK_API_URL;

  if (!baseUrl) {
    throw new Error("FLASK_API_URL not defined");
  }

  const res = await fetch(`${baseUrl}${path}`, {
    ...options,
    headers: {
      "Content-Type": "application/json",
      ...(options.headers || {}),
    },
    cache: "no-store",
  });

  return res;
}
