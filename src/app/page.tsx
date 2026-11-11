import Link from "next/link";
import Footer from "@/components/footer";
import Navbar from "@/components/navbar";
import { getCurrentUser } from "@/lib/auth/current-user";

export default async function Home() {
  const user = await getCurrentUser();

  return (

    <main className= "min-h-screen overflow-x-hidden bg-blue-100">
      <Navbar />
      <section className="mx-auto max-w-5xl items-center px-4 py-14 text-center sm:px-6 sm:py-20 lg:py-24">
        <span className="inline-block px-6 py-4 text-base text-black font-semibold md:text-4xl sm:text-2xl">
          Welcom to ClubHub
        </span>
        <h1 className="mx-auto mt-6 text-balance text-xl font-semibold leading-tight sm:text-2xl md:text-4xl lg:text-6xl">
          Club management made simple.
        </h1>
        <p className="mx-auto mt-5 max-w-2xl text-pretty text-base leading-tight sm:text-2xl md:text-3xl lg:text-4xl xl:text-5xl">
          ClubHub connects students and organizations in one place to discover clubs, manage club memberships, and participate in campus events.
        </p>
        <Link href="/sign-up" className="mt-8 inline-block rounded-lg bg-primary px-8 py-3 text-base font-semibold text-white transition hover:-translate-y-0.5 hover:shadow-xl hover:bg-gray-500 sm:px-10 sm:py-4 sm:text-lg lg:text-xl">
          Create Account
        </Link>
      </section>

      <section className="mx-auto grid max-w-7xl gap-4 px-4 pb-10 sm:gap-6 sm:px-6 md:grid-cols-2 lg:gap-8 lg:px-8">
        <div className="group flex-row rounded-3xl border border-gray-400 bg-gray-200 p-5 sm:p-8">
          <h2 className="text-2xl text-black font-bold sm:text-3xl">
            For Students
          </h2>
          <p className="mt-3 leading-tight font-semibold">
            -Students can find and join organizations
          </p>
          <p className="mt-3 leading-tight font-semibold">
            -Students can see all available and upcoming events
          </p>
          <p className="mt-3 leading-tight font-semibold">
            -Students can check-in for events using the Event Pass
          </p>
        </div>

        <div className="group flex-row rounded-3xl border border-gray-400 bg-gray-200 p-5 sm:p-8">
          <h2 className="text-2xl text-black font-bold sm:text-3xl">
            For Oragnizations
          </h2>
          <p className="mt-3 leading-tight font-semibold">
            -Organizations can manage members and events
          </p>
          <p className="mt-3 leading-tight font-semibold">
            -Organizations can customize member roles
          </p>
          <p className="mt-3 leading-tight font-semibold">
            -organizations can manage attendance and membership status
          </p>
        </div>
      </section>
      <Footer/>
    </main>

  );
}
