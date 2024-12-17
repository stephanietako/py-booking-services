import Navbar from "../Navbar/Navbar";

type WrapperProps = {
  children: React.ReactNode;
};

// Qui va permettre d'avoir une même structure de toutes les tables
const Wrapper = ({ children }: WrapperProps) => {
  return (
    <div>
      <Navbar />
      <div className="wrapper_container">{children}</div>
    </div>
  );
};

export default Wrapper;
