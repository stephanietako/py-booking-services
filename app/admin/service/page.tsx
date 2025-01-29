// "use client";

// import React, { FC, useEffect, useState, ChangeEvent } from "react";
// import Image from "next/image";
// import { MAX_FILE_SIZE } from "@/app/constants/config";
// import {
//   deleteService,
//   createService,
//   updateService,
//   getAllServices,
// } from "@/actions/actions";
// import { Service as ServiceType } from "@/types";
// import Wrapper from "@/app/components/Wrapper/Wrapper";
// //import { selectOptions } from 'src/utils/helper'
// //
// // Définition des types d'input (propriétés d'un service)
// type Input = {
//   id?: string; // L'ID est optionnel lors de la création d'un service
//   name: string;
//   description?: string; // description est facultatif
//   amount: number;
//   file?: File; // fichier est optionnel
// };

// // Valeurs initiales des inputs, utilisée lors de la réinitialisation du formulaire
// const initialInput: Input = {
//   name: "",
//   description: "", // Valeur initiale vide pour description
//   amount: 0,
//   file: undefined,
// };

// // interface ServiceProps {
// //   selectedTime: string; //as ISO
// // }

// const Service: FC = () => {
//   // États pour la gestion des erreurs, des entrées et des services
//   const [error, setError] = useState<string>("");
//   const [input, setInput] = useState<Input>(initialInput); // Valeurs du formulaire
//   const [preview, setPreview] = useState<string>(""); // Prévisualisation de l'image
//   const [services, setServices] = useState<ServiceType[]>([]); // Liste des services
//   const [successMessage, setSuccessMessage] = useState<string>(""); // Message de succès
//   //const { user } = useUser(); // Utilisateur connecté via Clerk
//   const [isFormModified, setIsFormModified] = useState(false); // Suivi des modifications du formulaire

//   // Récupération des services au chargement
//   useEffect(() => {
//     const fetchAllServices = async () => {
//       try {
//         const data = await getAllServices(); // Récupère la liste des services
//         setServices(data);
//       } catch (error) {
//         console.error("Erreur lors du chargement des services:", error);
//         setError("Impossible de charger les services.");
//       }
//     };
//     fetchAllServices();
//   }, []);

//   // Gestion de l'aperçu de l'image sélectionnée
//   useEffect(() => {
//     if (!input.file) return; // Si aucun fichier n'est sélectionné, on ne fait rien

//     const objectUrl = URL.createObjectURL(input.file); // Création d'un URL temporaire pour l'aperçu
//     setPreview(objectUrl);
//     return () => URL.revokeObjectURL(objectUrl); // Libère l'URL après utilisation
//   }, [input.file]);

//   // Gestion des champs texte (nom, description, montant)
//   const handleTextChange = (e: ChangeEvent<HTMLInputElement>) => {
//     const { name, value } = e.target;
//     setInput((prev) => ({ ...prev, [name]: value }));
//     setIsFormModified(true); // Marque que le formulaire a été modifié
//   };

//   // Gestion de la sélection de fichier pour l'image
//   const handleFileSelect = (e: ChangeEvent<HTMLInputElement>) => {
//     if (!e.target.files?.[0]) return; // Si aucun fichier n'est sélectionné, on arrête
//     setError(""); // Réinitialise les erreurs
//     const file = e.target.files[0];

//     // Vérification de la taille du fichier
//     if (file.size > MAX_FILE_SIZE) {
//       setError("Image trop grande, veuillez choisir une image de moins de 1Mo");
//       return;
//     }

//     // Vérification du type de fichier
//     const allowedTypes = ["image/png", "image/jpeg", "image/jpg"];
//     if (!allowedTypes.includes(file.type)) {
//       setError(
//         "Type de fichier non autorisé. Veuillez sélectionner une image (PNG, JPEG ou JPG)."
//       );
//       return;
//     }
//     setInput((prev) => ({ ...prev, file })); // Mémorise le fichier sélectionné
//   };

//   // Enregistrement ou mise à jour du service
//   const handleSaveService = async () => {
//     setError(""); // Réinitialisation des erreurs
//     setSuccessMessage(""); // Réinitialisation du message de succès

//     // Vérification minimale : au moins un champ doit être modifié
//     if (
//       !input.id && // Si l'ID est absent (création d'un service)
//       (!input.name.trim() ||
//         !input.description?.trim() ||
//         input.amount <= 0 ||
//         !input.file)
//     ) {
//       setError("Tous les champs sont requis lors de la création.");
//       return;
//     }

//     // Vérification que des modifications ont été apportées pour un service existant
//     if (
//       input.id && // Si c'est une mise à jour de service
//       !input.name && // Aucun champ n'a été modifié
//       !input.description &&
//       !input.amount &&
//       !input.file
//     ) {
//       setError("Veuillez modifier au moins un champ.");
//       return;
//     }

//     try {
//       setIsFormModified(false); // Désactive le statut de modification

//       // Si c'est une mise à jour, on prépare les données
//       if (input.id) {
//         const updateData: Partial<typeof input> = {};
//         if (input.name) updateData.name = input.name;
//         if (input.description) updateData.description = input.description;
//         if (input.amount) updateData.amount = input.amount;
//         if (input.file) updateData.file = input.file;

//         // Appel à l'action updateService pour mettre à jour
//         await updateService(
//           input.id,
//           updateData.name!,
//           updateData.amount!,
//           updateData.description!,
//           updateData.file
//         );
//         setSuccessMessage("Service mis à jour avec succès !");
//       } else {
//         // Si c'est une création de service
//         await createService(
//           input.name,
//           input.amount,
//           input.description!,
//           input.file!
//         );
//         setSuccessMessage("Service créé avec succès !");
//       }

//       // Récupération de la liste mise à jour des services
//       const updatedServices = await getAllServices();
//       setServices(updatedServices);
//       setInput(initialInput); // Réinitialisation du formulaire
//       setPreview(""); // Réinitialisation de l'aperçu de l'image
//     } catch (error) {
//       console.error("Erreur lors de l'enregistrement :", error);
//       setError("Une erreur s'est produite. Veuillez réessayer.");
//     } finally {
//       setIsFormModified(true); // Réactive le statut de modification
//     }
//   };

//   // Suppression d'un service
//   const handleDelete = async (id: string) => {
//     try {
//       await deleteService(id); // Appel à l'action deleteService
//       const updatedServices = await getAllServices(); // Mise à jour de la liste des services
//       setServices(updatedServices);
//       setSuccessMessage("Service supprimé avec succès !");
//     } catch (error) {
//       console.error("Erreur de suppression :", error);
//       setError("Erreur lors de la suppression.");
//     }
//   };

//   // Préparation à l'édition d'un service
//   const handleEditService = (service: ServiceType) => {
//     setInput({
//       id: service.id,
//       name: service.name,
//       description: service.description || "", // Valeur par défaut pour description
//       amount: service.amount,
//       file: undefined, // Réinitialisation de l'image
//     });
//     setPreview(service.imageUrl || "/default.png"); // Prise en charge de l'URL de l'image du service
//   };

//   return (
//     <Wrapper>
//       <div className="menu_container">
//         <h1>CRÉATION D&apos;UN SERVICE </h1>
//         <div className="menu_form">
//           <input
//             name="name"
//             className="input_name"
//             type="text"
//             placeholder="Nom"
//             onChange={handleTextChange}
//             value={input.name}
//           />
//           <input
//             name="description"
//             className="input_description"
//             type="text"
//             placeholder="Description"
//             onChange={handleTextChange}
//             value={input.description || ""}
//           />
//           <input
//             name="amount"
//             className="input_price"
//             type="number"
//             placeholder="Prix"
//             onChange={(e) =>
//               setInput((prev) => ({ ...prev, amount: Number(e.target.value) }))
//             }
//             value={input.amount}
//           />
//           <label htmlFor="file" className="label_file">
//             <span className="file_input">Choisir une image</span>
//             <div className="file_input_preview">
//               {preview ? (
//                 <Image
//                   alt="preview"
//                   src={preview || "/default.png"}
//                   width={100}
//                   height={100}
//                 />
//               ) : (
//                 <span>Sélectionnez une image</span>
//               )}
//             </div>
//             <input
//               name="file"
//               id="file"
//               type="file"
//               accept="image/png, image/jpeg, image/jpg"
//               onChange={handleFileSelect}
//               style={{ display: "none" }}
//             />
//           </label>
//           <button
//             className="btn_add"
//             disabled={!isFormModified}
//             onClick={handleSaveService}
//           >
//             {input.id ? "Mettre à jour le service" : "Ajouter le service"}
//           </button>
//         </div>
//         {error && <p className="text_error">{error}</p>}
//         {successMessage && <p className="text_success">{successMessage}</p>}
//         <div className="menu_items">
//           <p className="menu_items__text">Vos services :</p>
//           <div className="menu_items__container">
//             {services.map((service) => (
//               <div key={service.id}>
//                 <p>{service.name}</p>
//                 <p>{service.description}</p>
//                 <Image
//                   src={service.imageUrl || "/default.png"}
//                   alt={service.name}
//                   width={100}
//                   height={100}
//                 />
//                 <button onClick={() => handleDelete(service.id)}>
//                   Supprimer
//                 </button>
//                 <button onClick={() => handleEditService(service)}>
//                   Modifier
//                 </button>
//               </div>
//             ))}
//           </div>
//         </div>
//       </div>
//     </Wrapper>
//   );
// };

// export default Service;
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
import { Service as ServiceType } from "@/types";
import Wrapper from "@/app/components/Wrapper/Wrapper";
import { selectOptions } from "@/utils/helpers";
import dynamic from "next/dynamic";
const DynamicSelect = dynamic(() => import("react-select"), { ssr: false });

// Définition des types d'input (propriétés d'un service)
type Input = {
  id?: string; // L'ID est optionnel lors de la création d'un service
  name: string;
  description?: string; // description est facultatif
  amount: number;
  file?: File; // fichier est optionnel
  categories: string[];
};

// Valeurs initiales des inputs, utilisée lors de la réinitialisation du formulaire
const initialInput: Input = {
  name: "",
  description: "", // Valeur initiale vide pour description
  amount: 0,
  file: undefined,
  categories: [],
};

const Service: FC = () => {
  // États pour la gestion des erreurs, des entrées et des services
  const [error, setError] = useState<string>("");
  const [input, setInput] = useState<Input>(initialInput); // Valeurs du formulaire
  const [preview, setPreview] = useState<string>(""); // Prévisualisation de l'image
  const [services, setServices] = useState<ServiceType[]>([]); // Liste des services
  const [successMessage, setSuccessMessage] = useState<string>(""); // Message de succès
  const [isFormModified, setIsFormModified] = useState(false); // Suivi des modifications du formulaire

  // Récupération des services au chargement
  useEffect(() => {
    const fetchAllServices = async () => {
      try {
        const data = await getAllServices(); // Récupère la liste des services
        setServices(data);
      } catch (error) {
        console.error("Erreur lors du chargement des services:", error);
        setError("Impossible de charger les services.");
      }
    };
    fetchAllServices();
  }, []);

  // Gestion de l'aperçu de l'image sélectionnée
  useEffect(() => {
    if (!input.file) return; // Si aucun fichier n'est sélectionné, on ne fait rien

    const objectUrl = URL.createObjectURL(input.file); // Création d'un URL temporaire pour l'aperçu
    setPreview(objectUrl);
    return () => URL.revokeObjectURL(objectUrl); // Libère l'URL après utilisation
  }, [input.file]);

  // Gestion des champs texte (nom, description, montant)
  const handleTextChange = (e: ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setInput((prev) => ({ ...prev, [name]: value }));
    setIsFormModified(true); // Marque que le formulaire a été modifié
  };

  // Gestion de la sélection de fichier pour l'image
  const handleFileSelect = (e: ChangeEvent<HTMLInputElement>) => {
    if (!e.target.files?.[0]) return; // Si aucun fichier n'est sélectionné, on arrête
    setError(""); // Réinitialise les erreurs
    const file = e.target.files[0];

    // Vérification de la taille du fichier
    if (file.size > MAX_FILE_SIZE) {
      setError("Image trop grande, veuillez choisir une image de moins de 1Mo");
      return;
    }

    // Vérification du type de fichier
    const allowedTypes = ["image/png", "image/jpeg", "image/jpg"];
    if (!allowedTypes.includes(file.type)) {
      setError(
        "Type de fichier non autorisé. Veuillez sélectionner une image (PNG, JPEG ou JPG)."
      );
      return;
    }
    setInput((prev) => ({ ...prev, file })); // Mémorise le fichier sélectionné
  };

  // Enregistrement ou mise à jour du service
  const handleSaveService = async () => {
    setError(""); // Réinitialisation des erreurs
    setSuccessMessage(""); // Réinitialisation du message de succès

    // Vérification minimale : au moins un champ doit être modifié
    if (
      !input.id && // Si l'ID est absent (création d'un service)
      (!input.name.trim() ||
        !input.description?.trim() ||
        input.amount <= 0 ||
        !input.file)
    ) {
      setError("Tous les champs sont requis lors de la création.");
      return;
    }

    // Vérification que des modifications ont été apportées pour un service existant
    if (
      input.id && // Si c'est une mise à jour de service
      !input.name && // Aucun champ n'a été modifié
      !input.description &&
      !input.amount &&
      !input.file
    ) {
      setError("Veuillez modifier au moins un champ.");
      return;
    }

    try {
      setIsFormModified(false); // Désactive le statut de modification

      // Si c'est une mise à jour, on prépare les données
      if (input.id) {
        const updateData: Partial<typeof input> = {};
        if (input.name) updateData.name = input.name;
        if (input.description) updateData.description = input.description;
        if (input.amount) updateData.amount = input.amount;
        if (input.file) updateData.file = input.file;

        // Appel à l'action updateService pour mettre à jour
        await updateService(
          input.id,
          updateData.name!,
          updateData.amount!,
          updateData.description!,
          updateData.file
        );
        setSuccessMessage("Service mis à jour avec succès !");
      } else {
        // Si c'est une création de service
        await createService(
          input.name,
          input.amount,
          input.description!,
          input.file!
        );
        setSuccessMessage("Service créé avec succès !");
      }

      // Récupération de la liste mise à jour des services
      const updatedServices = await getAllServices();
      setServices(updatedServices);
      setInput(initialInput); // Réinitialisation du formulaire
      setPreview(""); // Réinitialisation de l'aperçu de l'image
    } catch (error) {
      console.error("Erreur lors de l'enregistrement :", error);
      setError("Une erreur s'est produite. Veuillez réessayer.");
    } finally {
      setIsFormModified(true); // Réactive le statut de modification
    }
  };

  // Suppression d'un service
  const handleDelete = async (id: string) => {
    try {
      await deleteService(id); // Appel à l'action deleteService
      const updatedServices = await getAllServices(); // Mise à jour de la liste des services
      setServices(updatedServices);
      setSuccessMessage("Service supprimé avec succès !");
    } catch (error) {
      console.error("Erreur de suppression :", error);
      setError("Erreur lors de la suppression.");
    }
  };

  // Préparation à l'édition d'un service
  const handleEditService = (service: ServiceType) => {
    setInput({
      id: service.id,
      name: service.name,
      description: service.description || "", // Valeur par défaut pour description
      amount: service.amount,
      file: undefined, // Réinitialisation de l'image
      categories: service.categories || [], // Ajout des catégories
    });
    setPreview(service.imageUrl || "/default.png"); // Prise en charge de l'URL de l'image du service
  };

  return (
    <Wrapper>
      <div className="menu_container">
        <h1>CRÉATION D&apos;UN SERVICE </h1>
        <div className="menu_form">
          <DynamicSelect
            value={input.categories.map((category) => ({
              value: category,
              label: category,
            }))}
            onChange={(newValue) => {
              const selectedCategories = (
                newValue as { value: string; label: string }[]
              ).map((option) => option.value);
              setInput((prev) => ({
                ...prev,
                categories: selectedCategories,
                name: selectedCategories[0] || "", // Définir le nom comme la première catégorie sélectionnée
              }));
              setIsFormModified(true); // Marque que le formulaire a été modifié
            }}
            isMulti
            className="select_option"
            options={selectOptions}
          />
          <input
            name="name"
            className="input_name"
            type="text"
            placeholder="Nom"
            onChange={handleTextChange}
            value={input.name}
            readOnly // Rendre le champ en lecture seule pour éviter les modifications manuelles
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
              style={{ display: "none" }}
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
                <p>{service.categories.join(", ")}</p>
                <p>{service.name}</p>
                <p>{service.description}</p>
                <p>{service.amount}</p>
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
