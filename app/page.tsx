import CalendarComponent from "./components/Calendar/Calendar";
import Head from "next/head";

import { Day } from "@prisma/client";
import { getClosedDays, getDays } from "@/actions/openingActions";
import Wrapper from "./components/Wrapper/Wrapper";

interface HomeProps {
  days: Day[];
  closedDays: string[];
}

const Home: React.FC<HomeProps> = async () => {
  const days = await getDays();
  const closedDays = await getClosedDays();

  return (
    <Wrapper>
      <Head>
        <title>Booking Software</title>
        <meta name="description" content="by josh" />
        <link rel="icon" href="/favicon.ico" />
      </Head>

      <main>
        <CalendarComponent days={days} closedDays={closedDays} />
      </main>
    </Wrapper>
  );
};

export default Home;
