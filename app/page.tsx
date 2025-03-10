import { getClosedDays, getDays } from "@/actions/openingActions"; // Les actions que tu utilises pour récupérer les données
import Wrapper from "./components/Wrapper/Wrapper";
import Hero from "./components/Hero/Hero";
import About from "./components/About/About";
import Boat from "./components/Boat/Boat";
import Cruise from "./components/Cruise/Cruise";

export const dynamic = "force-dynamic"; // Utilisation de dynamic rendering dans Next.js

const Home = async () => {
  const days = await getDays(); // Récupérer les jours d'ouverture
  const closedDays = await getClosedDays(); // Récupérer les jours fermés

  return (
    <Wrapper>
      <main>
        {/* Passer les données récupérées à Hero */}
        <Hero days={days} closedDays={closedDays} />
        <section>
          <About />
        </section>
        <section>
          <Boat />
        </section>
        <section>
          <Cruise />
        </section>
      </main>
    </Wrapper>
  );
};

export default Home;
