import React from "react";
import Galery from "../components/Galery/Galery";
import Wrapper from "../components/Wrapper/Wrapper";

const page = () => {
  return (
    <Wrapper>
      <section>
        <div className="galerie_page">
          <Galery />
        </div>
      </section>
    </Wrapper>
  );
};

export default page;
