import Footer from "@/components/footer";
import Navbar from "@/components/navbar";
import Hero from "./home/hero";
import Info from "./home/info/information";
import { Lineup } from "./home/lineup";
import { Marquee } from "./home/marquee";

export default async function Home() {

  return (
    <main className= "min-h-screen overflow-x-hidden bg-background">
      <Navbar/>
      <Hero/>
      <Marquee/>
      <Info/>
      <Lineup/>
      <Footer/>
    </main>
  );
}
