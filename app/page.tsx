import { getClosedDays, getDays } from "@/actions/openingActions"; // Les actions que tu utilises pour récupérer les données
import Wrapper from "./components/Wrapper/Wrapper";
import Hero from "./components/Hero/Hero";
import About from "./components/About/About";
import Boat from "./components/Boat/Boat";
import Cruise from "./components/Cruise/Cruise";
import Maintenance from "./components/Maintenance/Maintenance";
import Cavalaire from "./components/Cavalaire/Cavalaire";
import Header from "./components/Header/Header";
//import TarifsDisponibilites from "./components/TarifsDisponibilites/TarifsDisponibilites";

export const dynamic = "force-dynamic"; // Utilisation de dynamic rendering dans Next.js

const Home = async () => {
  const days = await getDays(); // Récupérer les jours d'ouverture
  const closedDays = await getClosedDays(); // Récupérer les jours fermés
  // Liste d'images pour le carrousel
  const images = [
    "/assets/Calanques-de-Cavalaire.jpg",
    "/assets/Port-Cros1.webp",
    "/assets/Beach-Notre-Dame-Porquerolles.jpg",
    // Ajoutez plus d'images si nécessaire
  ];
  return (
    <Wrapper>
      <main>
        {/* Passer les données récupérées à Hero */}
        <Hero days={days} closedDays={closedDays} />
        <section>
          <About />
        </section>
        <section>
          <Header days={days} closedDays={closedDays} />
        </section>
        <section>
          <Boat />
        </section>
        <section>
          <Cavalaire images={images} />
        </section>
        <section>
          <Cruise />
        </section>
        <section>
          <Maintenance />
        </section>
      </main>
    </Wrapper>
  );
};

export default Home;
