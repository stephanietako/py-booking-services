"use client";

import { useState, useEffect } from "react";
import { User } from "@/types";
import Wrapper from "@/app/components/Wrapper/Wrapper";
import { useParams } from "next/navigation"; // Importer useParams de Next.js

const EditUser = () => {
  const { clerkUserId } = useParams(); // Récupération de l'ID depuis l'URL
  const [user, setUser] = useState<User | null>(null);
  const [message, setMessage] = useState<string>("");
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    description: "",
  });

  // Fonction pour récupérer l'utilisateur
  useEffect(() => {
    if (!clerkUserId) return;

    const fetchUser = async () => {
      try {
        const response = await fetch(`/api/getUser`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ userId: clerkUserId }),
        });

        if (!response.ok)
          throw new Error("Erreur lors du chargement de l'utilisateur");

        const data: User = await response.json();
        console.log("Utilisateur récupéré:", data);
        setUser(data);
        setFormData({
          name: data.name || "",
          email: data.email || "",
          description: data.description || "",
        });
      } catch (error) {
        setMessage("Erreur lors du chargement de l'utilisateur");
        console.error(error);
      }
    };

    fetchUser();
  }, [clerkUserId]);

  // Gestion de la soumission du formulaire
  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    try {
      const response = await fetch(`/api/updateUser`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          userId: clerkUserId,
          userName: formData.name,
          userEmail: formData.email,
          userDescription: formData.description,
        }),
      });

      if (!response.ok) throw new Error("Échec de la mise à jour");

      setMessage("Utilisateur mis à jour avec succès !");
    } catch (error) {
      setMessage("Erreur lors de la mise à jour");
      console.error(error);
    }
  };

  // Mise à jour des champs de formulaire
  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    const { name, value } = e.target;
    setFormData((prevData) => ({
      ...prevData,
      [name]: value, // Mise à jour dynamique basée sur le nom du champ
    }));
  };

  return (
    <Wrapper>
      <div
        className="edit_container"
        style={{
          display: "flex",
          border: "3px solid gray",
          flexDirection: "column",
        }}
      >
        <h1>Modifier l&apos;utilisateur</h1>
        {message && <p className="error">{message}</p>}

        {user ? (
          <form onSubmit={handleSubmit}>
            <input
              type="text"
              name="name"
              value={formData.name}
              onChange={handleChange}
              placeholder="Nom"
            />
            <input
              type="email"
              name="email"
              value={formData.email}
              onChange={handleChange}
              placeholder="Email"
            />
            <textarea
              name="description"
              value={formData.description}
              onChange={handleChange}
              placeholder="Description"
            />
            <button type="submit">Enregistrer</button>
          </form>
        ) : (
          <p>Chargement des données...</p>
        )}
      </div>
    </Wrapper>
  );
};

export default EditUser;
