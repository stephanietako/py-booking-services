// app/components/HeroMediaUploadForm/HeroMediaUploadForm.tsx
"use client";

import React, { useState } from "react";
// Importe tes styles SCSS, le chemin est ok
import styles from "./styles.module.scss";

export default function HeroMediaUploadForm() {
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [message, setMessage] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    // ... (Ton code existant, qui est correct pour la validation et la sélection de fichier)
    if (event.target.files && event.target.files[0]) {
      const file = event.target.files[0];
      if (!file.type.startsWith("image/") && !file.type.startsWith("video/")) {
        setMessage("Veuillez sélectionner un fichier image ou vidéo valide.");
        setSelectedFile(null);
        return;
      }
      if (file.size > 50 * 1024 * 1024) {
        setMessage("Le fichier est trop volumineux (max 50 Mo).");
        setSelectedFile(null);
        return;
      }
      setSelectedFile(file);
      setMessage("");
    } else {
      setSelectedFile(null);
    }
  };

  const handleUpload = async () => {
    if (!selectedFile) {
      setMessage("Veuillez sélectionner un fichier à télécharger.");
      return;
    }

    setIsLoading(true);
    setMessage("Téléchargement en cours...");

    const formData = new FormData();
    formData.append("file", selectedFile);

    try {
      // APPEL CLIENT VERS API ROUTE : C'est la bonne manière !
      const res = await fetch("/api/admin/upload", {
        method: "POST",
        body: formData,
      });

      if (!res.ok) {
        const errorData = await res.json();
        throw new Error(
          errorData.message || "Échec du téléchargement du fichier."
        );
      }

      const { url, mediaType } = await res.json();
      setMessage(
        `Média Hero mis à jour avec succès ! Type: ${mediaType}, URL: ${url}`
      );
      setSelectedFile(null);

      window.location.reload();
    } catch (error: unknown) {
      console.error("Erreur d'upload:", error);
      let errorMessage = "Une erreur inconnue est survenue lors de l'upload.";
      if (error instanceof Error) {
        errorMessage = error.message;
      } else if (
        typeof error === "object" &&
        error !== null &&
        "message" in error &&
        typeof (error as { message: unknown }).message === "string"
      ) {
        errorMessage = (error as { message: string }).message;
      }
      setMessage(`Erreur lors de l'upload: ${errorMessage}`);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    // ... (Ton JSX existant du formulaire)
    <div className={styles.heroUploadWrapper}>
      <h2 className={styles.heroUploadTitle}>Changer le Média Hero</h2>
      <div className={styles.fileInputContainer}>
        <label htmlFor="file-upload" className={styles.fileInputLabel}>
          Sélectionner une image ou une vidéo (max 50 Mo) :
        </label>
        <input
          id="file-upload"
          type="file"
          onChange={handleFileChange}
          accept="image/*,video/*"
          className={styles.fileInput}
        />
        {selectedFile && (
          <p className={styles.selectedFileText}>
            Fichier sélectionné:{" "}
            <span className={styles.selectedFileName}>{selectedFile.name}</span>
          </p>
        )}
      </div>

      <button
        onClick={handleUpload}
        disabled={!selectedFile || isLoading}
        className={`${styles.uploadButton} ${!selectedFile || isLoading ? styles.uploadButtonDisabled : ""}`}
      >
        {isLoading ? "Téléchargement..." : "Télécharger et Changer le Média"}
      </button>

      {message && (
        <p
          className={`${styles.messageText} ${message.startsWith("Erreur") ? styles.errorMessage : styles.successMessage}`}
        >
          {message}
        </p>
      )}
    </div>
  );
}
