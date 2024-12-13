"use client";

import { useState, useEffect } from "react";
import { createSecret, getSecret } from "@/actions/secretActions";

const Secret = () => {
  // Définition des états (variables réactives)
  const [secret, setSecret] = useState(""); // Stocke le secret actuel
  const [content, setContent] = useState(""); // Stocke le contenu du textarea
  const [error, setError] = useState(""); // Stocke les messages d'erreur

  // useEffect s'exécute au montage du composant
  useEffect(() => {
    const loadSecret = async () => {
      const result = await getSecret(); // Récupère le secret depuis le serveur
      if (result.success) {
        setSecret(result.content || ""); // Met à jour l'état avec le secret récupéré
      } else {
        setError("Erreur de chargement"); // Affiche une erreur si la récupération échoue
      }
    };
    loadSecret();
  }, []); // Le tableau vide signifie que l'effet ne s'exécute qu'une fois au montage

  // Gestionnaire de soumission du formulaire
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault(); // Empêche le rechargement de la page

    // Validation : vérifie que le contenu n'est pas vide
    if (!content) {
      setError("Le secret ne peut pas être vide");
      return;
    }

    // Sauvegarde du nouveau secret
    const result = await createSecret(content);
    if (result.success) {
      setContent(""); // Vide le textarea
      // Recharge le secret mis à jour
      const newSecret = await getSecret();
      if (newSecret.success) {
        setSecret(newSecret.content || "");
      }
    } else {
      setError("Erreur de sauvegarde");
    }
  };

  // Interface utilisateur
  return (
    <div className="secret_container">
      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          {/* Affichage du secret actuel */}
          <div className=".__secret">Secret : {secret}</div>

          {/* Champ de saisie du nouveau secret */}
          <textarea
            value={content}
            onChange={(e) => setContent(e.target.value)}
            placeholder="Entrez votre secret..."
            className="text_area"
          />

          {/* Affichage conditionnel des erreurs */}
          {error && <p className="error_display">{error}</p>}
        </div>

        {/* Bouton de soumission */}
        <button type="submit" className="btn_secret ">
          Sauvegarder le secret
        </button>
      </form>
    </div>
  );
};

export default Secret;
