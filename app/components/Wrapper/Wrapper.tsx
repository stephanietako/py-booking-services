// app/components/Wrapper/Wrapper.tsx
import React from "react";
import Navbar from "../Navbar/Navbar";

type WrapperProps = {
  children: React.ReactNode;
};

const Wrapper = ({ children }: WrapperProps) => {
  return (
    <div className="wrapper">
      <Navbar />
      <div className="wrapper_container">{children}</div>
    </div>
  );
};

export default Wrapper;
