//import { getClosedDays, getDays } from "@/actions/openingActions"; // Les actions que tu utilises pour récupérer les données
import Wrapper from "./components/Wrapper/Wrapper";
import Hero from "./components/Hero/Hero";
import Location from "./components/Location/Location";

export const dynamic = "force-dynamic";

const Home = async () => {
  //const days = await getDays(); // Récupérer les jours d'ouverture
  //const closedDays = await getClosedDays(); // Récupérer les jours fermés

  return (
    <Wrapper>
      <main>
        <Hero />
        <Location />
      </main>
    </Wrapper>
  );
};

export default Home;
