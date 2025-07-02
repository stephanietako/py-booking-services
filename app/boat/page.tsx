// app/boat/page.tsx
import React from "react";
import Wrapper from "../components/Wrapper/Wrapper";
import Boat from "../components/Boat/Boat";

const entretien = () => {
  return (
    <Wrapper>
      <section>
        <Boat />
      </section>
    </Wrapper>
  );
};

export default entretien;
