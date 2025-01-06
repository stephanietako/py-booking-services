// "use client";

// import React, { FC, useEffect, useState, ChangeEvent } from "react";
// import Select from "react-select";
// import { selectOptions } from "@/app/utils/helpers";
// import { MultiValue } from "react-select";
// import Image from "next/image";
// import { MAX_FILE_SIZE } from "@/app/constants/config";
// import { deleteService } from "@/actions/actions";
// import { Service as ServiceType } from "@/type"; // Importez l'interface Service depuis votre fichier type.ts
// import Wrapper from "@/app/components/Wrapper/Wrapper";

// type Input = {
//   name: string;
//   description: string;
//  amount: number;
//   duration: number;
//   categories: MultiValue<{ value: string; label: string }>;
//   file: undefined | File;
// };

// const initialInput = {
//   name: "",
//   description: "",
//  amount: 0,
//   duration: 0,
//   categories: [],
//   file: undefined,
// };

// const Service: FC = () => {
//   const [error, setError] = useState<string>("");
//   const [input, setInput] = useState<Input>(initialInput);
//   const [preview, setPreview] = useState<string>("");
//   const [services, setServices] = useState<ServiceType[]>([]); // Utilisez l'interface ServiceType

//   // image preview
//   useEffect(() => {
//     if (!input.file) return;
//     const objectUrl = URL.createObjectURL(input.file);
//     setPreview(objectUrl);
//     return () => URL.revokeObjectURL(objectUrl);
//   }, [input.file]);

//   const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
//     if (!e.target.files?.[0]) return;
//     setError("");
//     if (e.target.files[0].size > MAX_FILE_SIZE) {
//       setError("Image trop grande, veuillez choisir une image de moins de 1Mo");
//       return;
//     }
//     setInput((prev) => ({
//       ...prev,
//       file: e.target.files ? e.target.files[0] : undefined,
//     }));
//   };

//   const handleFileUpload = async () => {
//     if (!input.file) return;
//     try {
//       const formData = new FormData();
//       formData.append("file", input.file);

//       const response = await fetch("/api/upload", {
//         method: "POST",
//         headers: {
//           "file-name": input.file.name,
//         },
//         body: formData,
//       });

//       if (!response.ok) {
//         throw new Error("Erreur lors du téléchargement du fichier");
//       }

//       const data = await response.json();
//       return data.url;
//     } catch (error) {
//       console.error("Erreur lors du téléchargement du fichier:", error);
//       setError("Erreur lors du téléchargement du fichier");
//     }
//   };

//   const handleTextChange = (e: ChangeEvent<HTMLInputElement>) => {
//     const { name, value } = e.target;
//     setInput((prev) => ({ ...prev, [name]: value }));
//   };

//   const handleDelete = async (id: string) => {
//     try {
//       await deleteService(id);
//       setServices((prev) => prev.filter((service) => service.id !== id));
//     } catch (error) {
//       console.error("Erreur lors de la suppression du service:", error);
//     }
//   };

//   const handleAddService = async () => {
//     const imageUrl = await handleFileUpload();
//     if (!imageUrl) return;

//     try {
//       const response = await fetch("/api/services", {
//         method: "POST",
//         headers: {
//           "Content-Type": "application/json",
//         },
//         body: JSON.stringify({
//           name: input.name,
//           description: input.description,
//          amount: input.price,
//           imageUrl,
//         }),
//       });

//       if (!response.ok) {
//         throw new Error("Erreur lors de l'ajout du service");
//       }

//       const data = await response.json();
//       setServices((prev) => [...prev, data]);
//       setInput(initialInput);
//       setPreview("");
//     } catch (error) {
//       console.error("Erreur lors de l'ajout du service:", error);
//       setError("Erreur lors de l'ajout du service");
//     }
//   };

//   return (
//     <Wrapper>
//       <div className="menu_container">
//         <div className="menu_form">
//           <input
//             name="name"
//             className="input_name"
//             type="text"
//             placeholder="name"
//             onChange={handleTextChange}
//             value={input.name}
//           />

//           <input
//             name="price"
//             className="input_price"
//             type="number"
//             placeholder="price"
//             onChange={(e) =>
//               setInput((prev) => ({ ...prev,amount: Number(e.target.value) }))
//             }
//             value={input.price}
//           />

//           <Select
//             value={input.categories}
//             name="categories"
//             onChange={(e) => setInput((prev) => ({ ...prev, categories: e }))}
//             isMulti
//             className="select_categories"
//             options={selectOptions}
//           />

//           <label htmlFor="file" className="label_file">
//             <span className="file_input">File input</span>
//             <div className="file_input_preview">
//               {preview ? (
//                 <div className="image_preview">
//                   <Image
//                     alt="preview"
//                     style={{ objectFit: "contain" }}
//                     fill
//                     src={preview}
//                   />
//                 </div>
//               ) : (
//                 <span>Select image</span>
//               )}
//             </div>

//             <input
//               name="file"
//               id="file"
//               onChange={handleFileSelect}
//               accept="image/jpeg image/png image/jpg"
//               type="file"
//               className="file_input"
//             />
//           </label>

//           <button
//             className="btn_add"
//             disabled={!input.file || !input.name}
//             onClick={handleAddService}
//           >
//             Add menu item
//           </button>
//         </div>
//         {error && <p className="text_error">{error}</p>}

//         <div className="menu_items">
//           <p className="menu_items__text">Your menu items:</p>
//           <div className="menu_items__container">
//             {services?.map((service) => (
//               <div key={service.id}>
//                 <p>{service.name}</p>
//                 <div className="file_input_preview">
//                   <Image priority fill alt="" src={service.imageUrl} />
//                 </div>
//                 <button
//                   onClick={() => handleDelete(service.id)}
//                   className="tex_delete"
//                 >
//                   delete
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
import Select from "react-select";
import { selectOptions } from "@/app/utils/helpers";
import { MultiValue } from "react-select";
import Image from "next/image";
import { MAX_FILE_SIZE } from "@/app/constants/config";
import { deleteService } from "@/actions/actions";
import { Service as ServiceType } from "@/type"; // Importez l'interface Service depuis votre fichier type.ts
import Wrapper from "@/app/components/Wrapper/Wrapper";

type Input = {
  name: string;
  description: string;
  amount: number;
  duration: number;
  categories: MultiValue<{ value: string; label: string }>;
  file: undefined | File;
};

const initialInput = {
  name: "",
  description: "",
  amount: 0,
  duration: 0,
  categories: [],
  file: undefined,
};

const Service: FC = () => {
  const [error, setError] = useState<string>("");
  const [input, setInput] = useState<Input>(initialInput);
  const [preview, setPreview] = useState<string>("");
  const [services, setServices] = useState<ServiceType[]>([]); // Utilisez l'interface ServiceType

  // Image preview
  useEffect(() => {
    if (!input.file) return;
    const objectUrl = URL.createObjectURL(input.file);
    setPreview(objectUrl);
    return () => URL.revokeObjectURL(objectUrl);
  }, [input.file]);

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!e.target.files?.[0]) return;
    setError("");
    if (e.target.files[0].size > MAX_FILE_SIZE) {
      setError("Image trop grande, veuillez choisir une image de moins de 1Mo");
      return;
    }
    setInput((prev) => ({
      ...prev,
      file: e.target.files ? e.target.files[0] : undefined,
    }));
  };

  // Handle file upload and service creation in one request
  const handleAddService = async () => {
    if (!input.file) return;

    try {
      const formData = new FormData();
      formData.append("file", input.file);
      formData.append("name", input.name);
      formData.append("amount", input.amount.toString());
      formData.append(
        "categories",
        input.categories.map((c) => c.value).join(",")
      );

      const response = await fetch("/api/upload", {
        method: "POST",
        body: formData,
      });

      if (!response.ok) {
        throw new Error("Erreur lors du téléchargement du fichier");
      }

      const data = await response.json();
      const imageUrl = data.url;

      // Maintenant, ajouter le service avec l'URL de l'image récupérée
      const serviceResponse = await fetch("/api/upload", {
        method: "POST",
        body: JSON.stringify({
          name: input.name,
          amount: input.amount,
          categories: input.categories.map((c) => c.value),
          imageUrl,
        }),
        headers: {
          "Content-Type": "application/json",
        },
      });

      if (!serviceResponse.ok) {
        throw new Error("Erreur lors de l'ajout du service");
      }

      const newService = await serviceResponse.json(); // Récupère l'objet Prisma complet
      setServices((prev) => [...prev, newService]); // Ajout direct du retour API
      setInput(initialInput);
      setPreview("");
    } catch (error) {
      console.error("Erreur lors de l'ajout du service:", error);
      setError("Erreur lors de l'ajout du service");
    }
  };

  const handleTextChange = (e: ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setInput((prev) => ({ ...prev, [name]: value }));
  };

  const handleDelete = async (id: string) => {
    try {
      await deleteService(id);
      setServices((prev) => prev.filter((service) => service.id !== id));
    } catch (error) {
      console.error("Erreur lors de la suppression du service:", error);
    }
  };

  return (
    <Wrapper>
      <div className="menu_container">
        <div className="menu_form">
          <input
            name="name"
            className="input_name"
            type="text"
            placeholder="name"
            onChange={handleTextChange}
            value={input.name}
          />

          <input
            name="amount"
            className="input_price"
            type="number"
            placeholder="amount"
            onChange={(e) =>
              setInput((prev) => ({ ...prev, amount: Number(e.target.value) }))
            }
            value={input.amount}
          />

          <Select
            value={input.categories}
            name="categories"
            onChange={(e) => setInput((prev) => ({ ...prev, categories: e }))}
            isMulti
            className="select_categories"
            options={selectOptions}
          />

          <label htmlFor="file" className="label_file">
            <span className="file_input">File input</span>
            <div className="file_input_preview">
              {preview ? (
                <div className="image_preview">
                  <Image
                    alt="preview"
                    src={preview}
                    width={100}
                    height={100}
                    style={{ objectFit: "contain" }}
                  />
                </div>
              ) : (
                <span>Select image</span>
              )}
            </div>

            <input
              name="file"
              id="file"
              onChange={handleFileSelect}
              accept="image/jpeg image/png image/jpg"
              type="file"
              className="file_input"
            />
          </label>

          <button
            className="btn_add"
            disabled={!input.file || !input.name}
            onClick={handleAddService}
          >
            Add menu item
          </button>
        </div>
        {error && <p className="text_error">{error}</p>}

        <div className="menu_items">
          <p className="menu_items__text">Your menu items:</p>
          <div className="menu_items__container">
            {services?.map((service) => (
              <div key={service.id}>
                <p>{service.name}</p>
                <div className="file_input_preview">
                  <Image priority fill alt="" src={service.imageUrl} />
                </div>
                <button
                  onClick={() => handleDelete(service.id)}
                  className="tex_delete"
                >
                  delete
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
