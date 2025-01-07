import React from "react";
import ServiceCompt from "../ServicesCompt/ServiceCompt";
// Styles
import styles from "./styles.module.scss";
// Ce composant Services est une fonction qui contient une liste de services (titre, description, prix, URL de l'image).
// Il mappe cette liste pour créer un composant Service pour chaque élément de la liste.
const Services: React.FC = () => {
  const services = [
    {
      name: "Forfait Basic",
      description: "Lorem ipsum dolor sit amet, consectetur adipiscing elit.",
      amount: "50€",
      imageUrl: "/assets/photo1.jpg",
    },
    {
      name: "Forfait Standard",
      description:
        "Sed do eiusmod tempor incididunt ut labore et dolore magna aliqua.",
      amount: "100€",
      imageUrl: "/assets/photo1.jpg",
    },
    {
      name: "Forfait Premium",
      description:
        "Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris.",
      amount: "200€",
      imageUrl: "/assets/photo1.jpg",
    },
  ];

  return (
    <div className={styles.services_container}>
      {services.map((service, index) => (
        <ServiceCompt
          key={index}
          name={service.name}
          description={service.description}
          amount={service.amount}
          imageUrl={service.imageUrl}
        />
      ))}
    </div>
  );
};

export default Services;
