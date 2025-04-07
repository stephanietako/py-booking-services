import React from "react";
import Cruise from "../components/Cruise/Cruise";
import Wrapper from "../components/Wrapper/Wrapper";

const tarifs = async () => {
  return (
    <Wrapper>
      <section>
        <Cruise />
      </section>
    </Wrapper>
  );
};

export default tarifs;
