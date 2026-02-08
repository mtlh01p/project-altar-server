"use client";

import Image from "next/image";
import { useRouter } from "next/navigation";
import { logout } from "@/lib/auth";

export default function Home() {
  const router = useRouter();

  const handleSignOut = async () => {
    try {
      await logout();
      router.replace("/"); // or /login
    } catch (err) {
      console.error(err);
    }
  };

  const handleAllInventories = async() => {
    router.replace("/inventory");
  }
  const handleMyVolunteering = async() => {
    router.replace("/volunteering");
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-zinc-50 font-sans dark:bg-black">
      <main className="flex min-h-screen w-full max-w-3xl flex-col items-center justify-between py-32 px-16 bg-white dark:bg-black sm:items-start">
        <Image
          className="dark:invert"
          src="/next.svg"
          alt="Next.js logo"
          width={100}
          height={20}
          priority
        />

        <div className="flex flex-col items-center gap-6 text-center sm:items-start sm:text-left">
          <h1 className="max-w-xs text-3xl font-semibold leading-10 tracking-tight text-black dark:text-zinc-50">
            This is the Welcome page after login.
          </h1>
          <p className="max-w-md text-lg leading-8 text-zinc-600 dark:text-zinc-400">
            You are successfully authenticated.
          </p>
        </div>

        <div className="flex flex-col gap-4 text-base font-medium sm:flex-row">
          <button
            onClick={handleSignOut}
            className="flex h-12 w-full items-center justify-center gap-2 rounded-full bg-foreground px-5 text-background transition-colors hover:bg-[#383838] dark:hover:bg-[#ccc] md:w-39.5"
          >
            <Image
              className="dark:invert"
              src="/vercel.svg"
              alt="Icon"
              width={16}
              height={16}
            />
            Sign out
          </button>
          <button
            onClick={handleAllInventories}
            className="flex h-12 w-full items-center justify-center gap-2 rounded-full bg-foreground px-5 text-background transition-colors hover:bg-[#383838] dark:hover:bg-[#ccc] md:w-39.5"
          >
            <Image
              className="dark:invert"
              src="/vercel.svg"
              alt="Icon"
              width={16}
              height={16}
            />
            Inventories
          </button>
          <button
            onClick={handleMyVolunteering}
            className="flex h-12 w-full items-center justify-center gap-2 rounded-full bg-foreground px-5 text-background transition-colors hover:bg-[#383838] dark:hover:bg-[#ccc] md:w-39.5"
          >
            <Image
              className="dark:invert"
              src="/vercel.svg"
              alt="Icon"
              width={16}
              height={16}
            />
            Volunteering
          </button>
        </div>
      </main>
    </div>
  );
}
