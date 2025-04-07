import React from "react";
import Wrapper from "../components/Wrapper/Wrapper";
import Cavalaire from "../components/Cavalaire/Cavalaire";

const environs = () => {
  const images = [
    "/assets/images/cavalaire-plage-bonporteau.webp",
    "/assets/images/portcros-rocher-rascasse.webp",
    "/assets/images/ramatuelle-cap-taillat.webp",
  ];
  return (
    <Wrapper>
      <section>
        <Cavalaire images={images} />
      </section>
    </Wrapper>
  );
};

export default environs;
