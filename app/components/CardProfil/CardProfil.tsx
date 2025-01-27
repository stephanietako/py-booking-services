"use client";

import { useState, useEffect } from "react";
import Image from "next/image";
import { CustomUser } from "@/types";

type CardProfilProps = {
  userId: string;
};

const CardProfil: React.FC<CardProfilProps> = ({ userId }) => {
  const [data, setData] = useState<CustomUser | null>(null);
  const [error, setError] = useState<string>("");

  useEffect(() => {
    const fetchUserData = async () => {
      //on peut pas utiliser une methode post alors qu'on est dans une methode get c'est parce-que sinon on ne pourrait pas renvoyer le body de la requète
      // et comme je veux donner userId directement dans le body de la requète et pas à travers l'url je suis obligé de mettre la methode en post
      try {
        const res = await fetch(`/api/getUser`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ userId }),
        });

        if (!res.ok) {
          throw new Error("error fetching user data");
        }

        const userData = await res.json();
        setData(userData);
      } catch (error) {
        console.error("Impossible de récupérer les données", error);
        setError("error fetching user data");
      }
    };

    fetchUserData();
  }, [userId]);

  if (error) {
    return <p className="error_text">{error}</p>;
  }

  return (
    <div className="card_profile_container">
      <div className="card_profile_container_bloc">
        {data?.image ? (
          <Image
            className="profile_img"
            src={data.image}
            alt={data.name ?? "Profil"}
            height={50}
            width={50}
          />
        ) : (
          <p>Aucune image disponible</p>
        )}
      </div>
      <h1>Tableau de bord</h1>
      <h2>{data?.name}</h2>
      <p>Role: {data?.role?.name}</p>
    </div>
  );
};

export default CardProfil;
