// app/about/page.tsx
import About from "@/app/components/About/About";
import React from "react";
import Wrapper from "../components/Wrapper/Wrapper";

const about = () => {
  return (
    <Wrapper>
      <section>
        <About />
      </section>
    </Wrapper>
  );
};

export default about;
