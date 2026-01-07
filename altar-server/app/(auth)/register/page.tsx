"use client"
import Image from "next/image";
import { useRouter } from "next/navigation";
import { useState } from 'react';

export default function Register() {
  const [name, setName] = useState("");
  const [userId, setUserId] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const router = useRouter();

  const handleRegister = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setError("");

    const res = await fetch("/api/register", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ name, userId, email, password }),
    });
    if (!res.ok) {
      setError("Registration failed");
      return;
    }

    router.push("/");
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-zinc-50 dark:bg-black">
      <main className="w-full max-w-md rounded-xl bg-white p-8 shadow dark:bg-black">
        <Image
          src="/next.svg"
          alt="Next.js logo"
          width={80}
          height={24}
          priority
          className="mb-8 dark:invert"
        />

        <form onSubmit={handleRegister} className="flex flex-col gap-4">
          <input
            type="text"
            placeholder="Name"
            value={name}
            onChange={(e) => setName(e.target.value)}
            required
            className="rounded border p-3"
          />

          <input
            type="text"
            placeholder="User ID"
            value={userId}
            onChange={(e) => setUserId(e.target.value)}
            required
            className="rounded border p-3"
          />

          <input
            type="email"
            placeholder="Email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
            className="rounded border p-3"
          />

          <input
            type="password"
            placeholder="Password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
            className="rounded border p-3"
          />

          {error && (
            <p className="text-sm text-red-500">{error}</p>
          )}

          <button
            type="submit"
            className="flex h-12 items-center justify-center gap-2 rounded-full bg-black text-white transition hover:bg-zinc-800 dark:bg-white dark:text-black"
          >
            <Image
              src="/vercel.svg"
              alt="Vercel"
              width={16}
              height={16}
              className="dark:invert"
            />
            Register
          </button>
        </form>
      </main>
    </div>
  );
}
