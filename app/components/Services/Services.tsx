import React from "react";
import ServiceCompt from "../ServiceCompt/ServiceCompt";
// Styles
import styles from "./styles.module.scss";
// Ce composant Services est une fonction qui contient une liste de services (titre, description, prix, URL de l'image).
// Il mappe cette liste pour créer un composant Service pour chaque élément de la liste.
const Services: React.FC = () => {
  const services = [
    {
      title: "Forfait Basic",
      description: "Lorem ipsum dolor sit amet, consectetur adipiscing elit.",
      price: "50€",
      imageUrl: "/assets/photo1.jpg",
    },
    {
      title: "Forfait Standard",
      description:
        "Sed do eiusmod tempor incididunt ut labore et dolore magna aliqua.",
      price: "100€",
      imageUrl: "/assets/photo1.jpg",
    },
    {
      title: "Forfait Premium",
      description:
        "Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris.",
      price: "200€",
      imageUrl: "/assets/photo1.jpg",
    },
  ];

  return (
    <div className={styles.services_container}>
      {services.map((service, index) => (
        <ServiceCompt
          key={index}
          title={service.title}
          description={service.description}
          price={service.price}
          imageUrl={service.imageUrl}
        />
      ))}
    </div>
  );
};

export default Services;
