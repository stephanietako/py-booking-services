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
// import { selectOptions } from "@/utils/helpers";
// import dynamic from "next/dynamic";
// const DynamicSelect = dynamic(() => import("react-select"), { ssr: false });

// type Input = {
//   id?: string;
//   name: string;
//   description?: string;
//   amount: number;
//   file?: File;
//   categories: string[];
//   imageUrl?: string;
// };

// const initialInput: Input = {
//   name: "",
//   description: "",
//   amount: 0,
//   file: undefined,
//   categories: [],
//   imageUrl: "",
// };

// const Service: FC = () => {
//   const [error, setError] = useState<string>("");
//   const [input, setInput] = useState<Input>(initialInput);
//   const [preview, setPreview] = useState<string>("");
//   const [services, setServices] = useState<ServiceType[]>([]);
//   const [successMessage, setSuccessMessage] = useState<string>("");
//   const [isFormModified, setIsFormModified] = useState(false);

//   useEffect(() => {
//     const fetchAllServices = async () => {
//       try {
//         const data = await getAllServices();
//         setServices(
//           data.map((service) => ({
//             ...service,
//             transactions: service.transactions || [],
//           }))
//         );
//       } catch {
//         console.error("Erreur lors du chargement des services:", error);
//         setError("Impossible de charger les services.");
//       }
//     };
//     fetchAllServices();
//     // eslint-disable-next-line react-hooks/exhaustive-deps
//   }, []);

//   useEffect(() => {
//     if (!input.file) return;

//     const objectUrl = URL.createObjectURL(input.file);
//     setPreview(objectUrl);
//     return () => URL.revokeObjectURL(objectUrl);
//   }, [input.file]);

//   const handleTextChange = (e: ChangeEvent<HTMLInputElement>) => {
//     const { name, value } = e.target;
//     setInput((prev) => ({ ...prev, [name]: value }));
//     setIsFormModified(true);
//   };

//   const handleFileSelect = (e: ChangeEvent<HTMLInputElement>) => {
//     if (!e.target.files?.[0]) return;
//     setError("");
//     const file = e.target.files[0];

//     if (file.size > MAX_FILE_SIZE) {
//       setError("Image trop grande, veuillez choisir une image de moins de 5Mo");
//       return;
//     }

//     const allowedTypes = ["image/png", "image/jpeg", "image/jpg"];
//     if (!allowedTypes.includes(file.type)) {
//       setError(
//         "Type de fichier non autorisé. Veuillez sélectionner une image (PNG, JPEG ou JPG)."
//       );
//       return;
//     }
//     setInput((prev) => ({ ...prev, file }));
//   };

//   const handleSaveService = async () => {
//     setError("");
//     setSuccessMessage("");

//     if (
//       !input.name.trim() ||
//       !input.description?.trim() ||
//       input.amount <= 0 ||
//       (!input.file && !input.imageUrl) ||
//       input.categories.length === 0
//     ) {
//       setError("Tous les champs sont requis.");
//       return;
//     }

//     try {
//       if (input.id) {
//         await updateService(
//           input.id,
//           input.name,
//           input.amount,
//           input.description || "",
//           input.file
//         );
//         setSuccessMessage("Service mis à jour avec succès !");
//       } else {
//         await createService(
//           input.name,
//           input.amount,
//           input.description || "",
//           input.file!,
//           input.categories
//         );
//         setSuccessMessage("Service créé avec succès !");
//       }

//       const updatedServices = await getAllServices();
//       setServices(updatedServices);
//       setInput(initialInput);
//       setPreview("");
//       setIsFormModified(false);
//     } catch {
//       setError("Une erreur est survenue.");
//     }
//   };

//   const handleDelete = async (id: string) => {
//     try {
//       await deleteService(id);
//       const updatedServices = await getAllServices();
//       setServices(updatedServices);
//       setSuccessMessage("Service supprimé avec succès !");
//     } catch {
//       setError("Erreur lors de la suppression.");
//     }
//   };

//   const handleEditService = (service: ServiceType) => {
//     setInput({
//       id: service.id,
//       name: service.name,
//       description: service.description || "",
//       amount: service.amount,
//       file: undefined,
//       categories: service.categories || [],
//       imageUrl: service.imageUrl || "",
//     });
//     setPreview(service.imageUrl || "/assets/default.png");
//   };

//   useEffect(() => {
//     if (successMessage) {
//       const timer = setTimeout(() => {
//         setSuccessMessage("");
//       }, 3000);

//       return () => clearTimeout(timer);
//     }
//   }, [successMessage]);

//   return (
//     <Wrapper>
//       <div className="menu_container">
//         <h1>Création et gestion des Services</h1>
//         <p className="guide_text">
//           Bienvenue sur la page de gestion des services. Vous pouvez ajouter,
//           modifier et supprimer des services en utilisant les formulaires
//           ci-dessous. Assurez-vous que tous les champs sont correctement remplis
//           avant de sauvegarder un service. Pour modifier un service existant,
//           cliquez sur &quot;Modifier&quot;, et pour supprimer un service,
//           cliquez sur &quot;Supprimer&quot;.
//         </p>
//         <div className="menu_form">
//           <DynamicSelect
//             value={input.categories.map((category) => ({
//               value: category,
//               label: category,
//             }))}
//             onChange={(newValue) => {
//               const selectedCategories = (
//                 newValue as { value: string; label: string }[]
//               ).map((option) => option.value);
//               setInput((prev) => ({ ...prev, categories: selectedCategories }));
//               setIsFormModified(true);
//             }}
//             isMulti
//             className="select_option"
//             options={selectOptions}
//           />
//           <input
//             name="name"
//             className="input_name"
//             type="text"
//             placeholder="Nom du service"
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
//                   src={preview || "/assets/default.png"}
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
//               <div key={service.id} className="service_item">
//                 <p>{service.categories.join(", ")}</p>
//                 <p>{service.name}</p>
//                 <p>{service.description}</p>
//                 <p>{service.amount}€</p>
//                 <Image
//                   src={service.imageUrl || "/default.png"}
//                   alt={service.name}
//                   width={100}
//                   height={100}
//                 />
//                 <div className="actions">
//                   <button onClick={() => handleEditService(service)}>
//                     Modifier
//                   </button>
//                   <button onClick={() => handleDelete(service.id)}>
//                     Supprimer
//                   </button>
//                 </div>
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

type Input = {
  id?: string;
  name: string;
  description?: string;
  amount: number;
  file?: File;
  categories: string[];
  imageUrl?: string;
};

const initialInput: Input = {
  name: "",
  description: "",
  amount: 0,
  file: undefined,
  categories: [],
  imageUrl: "",
};

const Service: FC = () => {
  const [error, setError] = useState<string>("");
  const [input, setInput] = useState<Input>(initialInput);
  const [preview, setPreview] = useState<string>("");
  const [services, setServices] = useState<ServiceType[]>([]);
  const [successMessage, setSuccessMessage] = useState<string>("");
  const [isFormModified, setIsFormModified] = useState(false);

  useEffect(() => {
    const fetchAllServices = async () => {
      try {
        const data = await getAllServices();
        setServices(
          data.map((service) => ({
            ...service,
            transactions: service.transactions || [],
          }))
        );
      } catch (err) {
        const errorMessage =
          err instanceof Error
            ? err.message
            : "Une erreur inconnue est survenue.";
        console.error("Erreur lors du chargement des services:", errorMessage); // Affiche l'erreur complète
        setError("Impossible de charger les services.");
      }
    };

    fetchAllServices();
  }, []);

  useEffect(() => {
    if (!input.file) return;

    const objectUrl = URL.createObjectURL(input.file);
    setPreview(objectUrl);
    return () => URL.revokeObjectURL(objectUrl);
  }, [input.file]);

  const handleTextChange = (e: ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setInput((prev) => ({ ...prev, [name]: value }));
    setIsFormModified(true);
  };

  const handlePriceChange = (e: ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;

    // Vérifie que l'entrée est valide (nombres, un seul point décimal et jusqu'à deux décimales)
    if (/^\d*\.?\d{0,2}$/.test(value)) {
      setInput((prev) => ({
        ...prev,
        amount: value === "" ? 0 : parseFloat(value),
      }));
      setIsFormModified(true);
    }
  };

  const handleFileSelect = (e: ChangeEvent<HTMLInputElement>) => {
    if (!e.target.files?.[0]) return;
    setError("");
    const file = e.target.files[0];

    if (file.size > MAX_FILE_SIZE) {
      setError("Image trop grande, veuillez choisir une image de moins de 5Mo");
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

  const handleSaveService = async () => {
    setError("");
    setSuccessMessage("");

    if (
      !input.name.trim() ||
      !input.description?.trim() ||
      input.amount <= 0 ||
      (!input.file && !input.imageUrl) ||
      input.categories.length === 0
    ) {
      setError("Tous les champs sont requis.");
      return;
    }

    try {
      if (input.id) {
        await updateService(
          input.id,
          input.name,
          input.amount,
          input.description || "",
          input.file
        );
        setSuccessMessage("Service mis à jour avec succès !");
      } else {
        await createService(
          input.name,
          input.amount,
          input.description || "",
          input.file!,
          input.categories
        );
        setSuccessMessage("Service créé avec succès !");
      }

      const updatedServices = await getAllServices();
      setServices(updatedServices);
      setInput(initialInput);
      setPreview("");
      setIsFormModified(false);
    } catch {
      setError("Une erreur est survenue.");
    }
  };

  const handleDelete = async (id: string) => {
    try {
      await deleteService(id);
      const updatedServices = await getAllServices();
      setServices(updatedServices);
      setSuccessMessage("Service supprimé avec succès !");
    } catch {
      setError("Erreur lors de la suppression.");
    }
  };

  const handleEditService = (service: ServiceType) => {
    setInput({
      id: service.id,
      name: service.name,
      description: service.description || "",
      amount: service.amount,
      file: undefined,
      categories: service.categories || [],
      imageUrl: service.imageUrl || "",
    });
    setPreview(service.imageUrl || "/assets/default.png");
  };

  useEffect(() => {
    if (successMessage) {
      const timer = setTimeout(() => {
        setSuccessMessage("");
      }, 3000);

      return () => clearTimeout(timer);
    }
  }, [successMessage]);

  return (
    <Wrapper>
      <div className="menu_container">
        <h1>Création et gestion des Services</h1>
        <p className="guide_text">
          Bienvenue sur la page de gestion des services. Vous pouvez ajouter,
          modifier et supprimer des services en utilisant les formulaires
          ci-dessous. Assurez-vous que tous les champs sont correctement remplis
          avant de sauvegarder un service. Pour modifier un service existant,
          cliquez sur &quot;Modifier&quot;, et pour supprimer un service,
          cliquez sur &quot;Supprimer&quot;.
        </p>
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
              setInput((prev) => ({ ...prev, categories: selectedCategories }));
              setIsFormModified(true);
            }}
            isMulti
            className="select_option"
            options={selectOptions}
          />
          <input
            name="name"
            className="input_name"
            type="text"
            placeholder="Nom du service"
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
            type="text"
            placeholder="Prix"
            onChange={handlePriceChange} // On utilise la fonction de validation ci-dessus
            value={input.amount === 0 ? "" : input.amount.toString()} // Empêche l'affichage de "0" dans le champ d'entrée
          />

          <label htmlFor="file" className="label_file">
            <span className="file_input">Choisir une image</span>
            <div className="file_input_preview">
              {preview ? (
                <Image
                  alt="preview"
                  src={preview || "/assets/default.png"}
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
              <div key={service.id} className="service_item">
                <p>{service.categories.join(", ")}</p>
                <p>{service.name}</p>
                <p>{service.description}</p>
                <p>{service.amount}€</p>
                <Image
                  src={service.imageUrl || "/default.png"}
                  alt={service.name}
                  width={100}
                  height={100}
                />
                <div className="actions">
                  <button onClick={() => handleEditService(service)}>
                    Modifier
                  </button>
                  <button onClick={() => handleDelete(service.id)}>
                    Supprimer
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </Wrapper>
  );
};

export default Service;
