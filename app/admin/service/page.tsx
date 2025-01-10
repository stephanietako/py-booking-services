"use client";

import React, { FC, useEffect, useState, ChangeEvent } from "react";
import Image from "next/image";
import { MAX_FILE_SIZE } from "@/app/constants/config";
import {
  deleteService,
  createService,
  updateService,
  getAllServices,
} from "@/actions/actions";
import { Service as ServiceType } from "@/type";
import Wrapper from "@/app/components/Wrapper/Wrapper";
import { useUser } from "@clerk/nextjs";

type Input = {
  id?: string;
  name: string;
  description?: string; // description est facultatif
  amount: number;
  file?: File;
};

const initialInput: Input = {
  name: "",
  description: "", // Valeur initiale vide pour description
  amount: 0,
  file: undefined,
};

const Service: FC = () => {
  const [error, setError] = useState<string>("");
  const [input, setInput] = useState<Input>(initialInput);
  const [preview, setPreview] = useState<string>("");
  const [services, setServices] = useState<ServiceType[]>([]);
  const [successMessage, setSuccessMessage] = useState<string>("");
  const { user } = useUser();
  const [isFormModified, setIsFormModified] = useState(false);

  // Récupération des services au chargement
  useEffect(() => {
    const fetchAllServices = async () => {
      try {
        const data = await getAllServices();
        setServices(data);
      } catch (error) {
        console.error("Erreur lors du chargement des services:", error);
        setError("Impossible de charger les services.");
      }
    };
    fetchAllServices();
  }, []);

  // Gestion de l'aperçu de l'image
  useEffect(() => {
    if (!input.file) return;
    const objectUrl = URL.createObjectURL(input.file);
    setPreview(objectUrl);
    return () => URL.revokeObjectURL(objectUrl);
  }, [input.file]);

  // Gestion des champs texte
  const handleTextChange = (e: ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setInput((prev) => ({ ...prev, [name]: value }));
    setIsFormModified(true);
  };

  // Gestion de la sélection de fichier
  const handleFileSelect = (e: ChangeEvent<HTMLInputElement>) => {
    if (!e.target.files?.[0]) return;
    setError("");
    const file = e.target.files[0];

    if (file.size > MAX_FILE_SIZE) {
      setError("Image trop grande, veuillez choisir une image de moins de 1Mo");
      return;
    }

    const allowedTypes = ["image/png", "image/jpeg", "image/jpg"];
    if (!allowedTypes.includes(file.type)) {
      setError(
        "Type de fichier non autorisé. Veuillez sélectionner une image (PNG, JPEG ou JPG)."
      );
      return;
    }
    setInput((prev) => ({ ...prev, file }));
  };

  // Enregistrement ou mise à jour du service
  const handleSaveService = async (): Promise<void> => {
    setError("");
    setSuccessMessage("");

    // Vérification minimale : au moins un champ doit être modifié
    if (
      !input.id &&
      (!input.name.trim() ||
        !input.description?.trim() ||
        input.amount <= 0 ||
        !input.file)
    ) {
      setError("Tous les champs sont requis lors de la création.");
      return;
    }

    if (
      input.id &&
      !input.name &&
      !input.description &&
      !input.amount &&
      !input.file
    ) {
      setError("Veuillez modifier au moins un champ.");
      return;
    }

    // Contrôle de l'utilisateur
    if (!user?.primaryEmailAddress?.emailAddress) {
      setError("Utilisateur non identifié.");
      return;
    }

    try {
      setIsFormModified(false);

      if (input.id) {
        const updateData: Partial<typeof input> = {};
        if (input.name) updateData.name = input.name;
        if (input.description) updateData.description = input.description;
        if (input.amount) updateData.amount = input.amount;
        if (input.file) updateData.file = input.file;

        await updateService(
          input.id,
          updateData.name!,
          updateData.amount!,
          updateData.description!,
          updateData.file
        );
        setSuccessMessage("Service mis à jour avec succès !");
      } else {
        await createService(
          user.primaryEmailAddress.emailAddress,
          input.name,
          input.amount,
          input.description!,
          input.file!
        );
        setSuccessMessage("Service créé avec succès !");
      }

      const updatedServices = await getAllServices();
      setServices(updatedServices);
      setInput(initialInput);
      setPreview("");
    } catch (error) {
      console.error("Erreur lors de l'enregistrement :", error);
      setError("Une erreur s'est produite. Veuillez réessayer.");
    } finally {
      setIsFormModified(true);
    }
  };

  // Suppression d'un service
  const handleDelete = async (id: string) => {
    try {
      await deleteService(id);
      const updatedServices = await getAllServices();
      setServices(updatedServices);
      setSuccessMessage("Service supprimé avec succès !");
    } catch (error) {
      console.error("Erreur de suppression :", error);
      setError("Erreur lors de la suppression.");
    }
  };

  // Préparation de l'édition d'un service
  const handleEditService = (service: ServiceType) => {
    setInput({
      id: service.id,
      name: service.name,
      description: service.description || "", // Valeur par défaut pour description
      amount: service.amount,
      file: undefined,
    });
    setPreview(service.imageUrl || "/default.png");
  };

  return (
    <Wrapper>
      <div className="menu_container">
        <div className="menu_form">
          <input
            name="name"
            className="input_name"
            type="text"
            placeholder="Nom"
            onChange={handleTextChange}
            value={input.name}
          />
          <input
            name="description"
            className="input_description"
            type="text"
            placeholder="Description"
            onChange={handleTextChange}
            value={input.description || ""}
          />
          <input
            name="amount"
            className="input_price"
            type="number"
            placeholder="Prix"
            onChange={(e) =>
              setInput((prev) => ({ ...prev, amount: Number(e.target.value) }))
            }
            value={input.amount}
          />
          <label htmlFor="file" className="label_file">
            <span className="file_input">Choisir une image</span>
            <div className="file_input_preview">
              {preview ? (
                <Image
                  alt="preview"
                  src={preview || "/default.png"}
                  width={100}
                  height={100}
                />
              ) : (
                <span>Sélectionnez une image</span>
              )}
            </div>
            <input
              name="file"
              id="file"
              type="file"
              accept="image/png, image/jpeg, image/jpg"
              onChange={handleFileSelect}
            />
          </label>
          <button
            className="btn_add"
            disabled={!isFormModified}
            onClick={handleSaveService}
          >
            {input.id ? "Mettre à jour le service" : "Ajouter le service"}
          </button>
        </div>

        {error && <p className="text_error">{error}</p>}
        {successMessage && <p className="text_success">{successMessage}</p>}

        <div className="menu_items">
          <p className="menu_items__text">Vos services :</p>
          <div className="menu_items__container">
            {services.map((service) => (
              <div key={service.id}>
                <p>{service.name}</p>
                <p>{service.description}</p>
                <Image
                  src={service.imageUrl || "/default.png"}
                  alt={service.name}
                  width={100}
                  height={100}
                />
                <button onClick={() => handleDelete(service.id)}>
                  Supprimer
                </button>
                <button onClick={() => handleEditService(service)}>
                  Modifier
                </button>
              </div>
            ))}
          </div>
        </div>
      </div>
    </Wrapper>
  );
};

export default Service;
