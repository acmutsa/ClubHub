import Image from "next/image";
import Link from "next/link";

export default async function Home() {
  return (

    <main className= "min-h-screen bg-orange-50">
      <nav className="border-b border-black-500 bg-gray-100">
        <div className="mx-auto flex max-w-7xl items-center justify-between px-[2cqw] py-[2cqw]">
          <Link
            href="/"
            className="flex text-align:center text-xl font-bold"
          >
            <Image 
              src="/assets/logo.png" 
              alt="ACM Logo" 
              className="max-w-auto h-auto" 
              height={40} 
              width={40} 
            />
            ClubHub
          </Link>

          <div className="hidden gap-6 md:flex">
            <Link href="/students" className="rounded-full bg-gray-200 px-[1vw] py-[1vw] hover:text-black transition hover:-translate-y-1 hover:shadow-xl">
              Students
            </Link>
            <Link href="/organizations" className="rounded-full bg-gray-200 px-[1vw] py-[1vw] hover:text-black transition hover:-translate-y-1 hover:shadow-xl">
              Organizations
            </Link>
            <Link href="/about" className="rounded-full bg-gray-200 px-[1vw] py-[1vw] hover:text-black transition hover:-translate-y-1 hover:shadow-xl">
              About
            </Link>
          </div>

          <div className="flex items-center gap-3">
            <Link href="sign-in" className="rounded-full bg-green-500 px-[1vw] py-[1vw] text-sm font-semibold text-white hover:bg-green-700 transition hover:-translate-y-1 hover:shadow-xl">
              Sign-In
            </Link>
            <Link href="sign-up" className="rounded-full bg-green-500 px-[1vw] py-[1vw] text-sm font-semibold text-white hover:bg-green-700 transition hover:-translate-y-1 hover:shadow-xl">
              Sign-Up
            </Link>
          </div>
        </div>
      </nav>

      <section className="mx-auto max-w-7xl px-[2vw] py-[3vw] text-center sm:py-28">
        <span className="inline-block rounded-full bg-blue-200 px-[1vw] py-[1vw] text-sm font-semibold">
          Welcom to ClubHub
        </span>
        <h1 className="mx-auto mt-[2vw] max-w-4xl text-4xl font-semibold leading-tight sm:text-6xl">
          Club management made simple.
        </h1>
        <p className="mx-auto mt-[2vw] max-w-2xl text-xl leading-tight">
          ClubHub connects students and organizations in one place to discover clubs, manage club memberships, and participate in campus events.
        </p>
      </section>

      <section className="mx-auto grid max-w-7xl gap-[2cqw] px-[1vw] py-[3vw] md:grid-cols-2">
        <Link href="/students" className="group rounded-3xl border-1 border-gray-400 bg-gray-200 p-5 transition hover:-translate-y-1 hover:shadow-xl">
          <h2 className="text-2xl font-bold">
            Students
          </h2>
          <p className="mt-[1vw] leading-tight font-semibold">
            Learn more about student resources
          </p>
          <span className="mt-[1vw] inline-block font-semibold text-blue-300">
            -Learn more-
          </span>
        </Link>

        <Link href="/organizations" className="group rounded-3xl border-1 border-gray-400 bg-gray-200 p-5 transition hover:-translate-y-1 hover:shadow-xl">
          <h2 className="text-2xl font-bold">
            Oragnizations
          </h2>
          <p className="mt-[1vw] leading-tight font-semibold">
            Learn more about organization resources
          </p>
          <span className="mt-[1vw] inline-block font-semibold text-blue-300">
            -Learn more-
          </span>
        </Link>
      </section>
    </main>

  );
}
