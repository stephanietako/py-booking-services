// app/entretien/page.tsx
"use client";
import React from "react";
import Maintenance from "../components/Maintenance/Maintenance";
import Wrapper from "../components/Wrapper/Wrapper";

const entretien = () => {
  return (
    <Wrapper>
      <section>
        <Maintenance />
      </section>
    </Wrapper>
  );
};

export default entretien;
