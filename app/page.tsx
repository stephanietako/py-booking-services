import CalendarComponent from "./components/Calendar/Calendar";
import Head from "next/head";

import { Day } from "@prisma/client";
import { getClosedDays, getDays } from "@/actions/openingActions";
import Wrapper from "./components/Wrapper/Wrapper";
export const dynamic = "force-dynamic";

const Home = async () => {
  const days: Day[] = await getDays();
  const closedDays: string[] = await getClosedDays();

  return (
    <Wrapper>
      <Head>
        <title>Booking Software Boat and Services</title>
        <meta name="description" content="booking software boat and services" />
        <link rel="icon" href="/favicon.ico" />
      </Head>

      <main>
        <header>
          <h1>Boat and Services</h1>
        </header>

        <CalendarComponent days={days} closedDays={closedDays} />
      </main>
    </Wrapper>
  );
};

export default Home;
