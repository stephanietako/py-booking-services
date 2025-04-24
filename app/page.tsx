// //import { getClosedDays, getDays } from "@/actions/openingActions"; // Les actions que tu utilises pour récupérer les données
// import Wrapper from "./components/Wrapper/Wrapper";
// import Hero from "./components/Hero/Hero";
// import Location from "./components/Location/Location";

// export const dynamic = "force-dynamic";

// const Home = async () => {
//   //const days = await getDays(); // Récupérer les jours d'ouverture
//   //const closedDays = await getClosedDays(); // Récupérer les jours fermés

//   return (
//     <Wrapper>
//       <main>
//         <Hero />
//         <Location />
//       </main>
//     </Wrapper>
//   );
// };

// export default Home;
//import { getClosedDays, getDays } from "@/actions/openingActions"; // Les actions que tu utilises pour récupérer les données
import Wrapper from "./components/Wrapper/Wrapper";
import Hero from "./components/Hero/Hero";
import Location from "./components/Location/Location";
import Head from "next/head";

export const dynamic = "force-dynamic";

const Home = () => {
  return (
    <>
      <Head>
        {/* Balises Open Graph */}
        <meta
          property="og:title"
          content="Location de bateau à Cavalaire-sur-Mer – Cap Camarat 12.5 WA avec skipper"
        />
        <meta
          property="og:description"
          content="Profitez d'une excursion privée en mer à bord d'un Cap Camarat 12.5 WA de 2021, avec skipper au départ de Cavalaire-sur-Mer. Bateau spacieux, récent et tout équipé pour un confort exceptionnel."
        />
        <meta
          property="og:image"
          content="https://yachting-day.com/assets/images/hero.webp"
        />
        <meta property="og:url" content="https://yachting-day.com" />
        <meta property="og:type" content="website" />
        <meta property="og:locale" content="fr_FR" />
      </Head>
      <Wrapper>
        <main>
          <Hero />
          <Location />
        </main>
      </Wrapper>
    </>
  );
};

export default Home;
