// "use client";

// import React, { useEffect, useState } from "react";
// import {
//   addOptionToBooking,
//   deleteOption,
//   getOptionsByBookingId,
//   updateBookingTotal, // ✅ Nouvelle action
// } from "@/actions/bookings";
// import { Option } from "@/types";
// import { FaRegTrashAlt, FaWallet } from "react-icons/fa";
// import { BsCartX } from "react-icons/bs";

// interface OptionManagerProps {
//   bookingId: string;
//   serviceAmount: number; // ✅ Ajout du prix initial du service
//   onTotalUpdate?: (total: number) => void; // ✅ Callback pour envoyer le total
// }

// const OptionManager: React.FC<OptionManagerProps> = ({
//   bookingId,
//   serviceAmount, // ✅ Montant initial
//   onTotalUpdate,
// }) => {
//   const [options, setOptions] = useState<Option[]>([]);
//   const [loading, setLoading] = useState<boolean>(true);
//   const [error, setError] = useState<string | null>(null);
//   const [selectedOption, setSelectedOption] = useState<string>("");
//   const [totalAmount, setTotalAmount] = useState<number>(serviceAmount || 0);

//   const optionsPlus = [
//     { description: "Capitaine", amount: 350 },
//     { description: "Personne supplémentaire", amount: 50 },
//     { description: "Personne supplémentaire", amount: 120 },
//     { description: "Hôtesse", amount: 200 },
//     { description: "Vidéo drone", amount: 500 },
//     { description: "Paddle board", amount: 50 },
//   ];

//   const fetchOptions = async () => {
//     setLoading(true);
//     try {
//       const { options } = await getOptionsByBookingId(bookingId);
//       setOptions(options);

//       // Calculer le total en incluant correctement le montant du service
//       const optionsTotal = options.reduce(
//         (sum, option) => sum + option.amount,
//         0
//       );
//       const newTotal = serviceAmount + optionsTotal; // Utilisation du montant du service récupéré

//       setTotalAmount(newTotal); // Mise à jour avec la somme correcte
//       onTotalUpdate?.(newTotal);

//       console.log("Montant du service:", serviceAmount);
//       console.log("Options récupérées:", options);
//       console.log("Total recalculé :", newTotal);
//     } catch (error) {
//       console.error("❌ Erreur lors du chargement des options :", error);
//       setError("Impossible de récupérer les options.");
//     } finally {
//       setLoading(false);
//     }
//   };

//   useEffect(() => {
//     fetchOptions();
//     // eslint-disable-next-line react-hooks/exhaustive-deps
//   }, [bookingId]); // 🔥 On enlève serviceAmount pour éviter le reset

//   const handleAddOption = async () => {
//     if (!selectedOption) {
//       alert("Veuillez sélectionner une option valide");
//       return;
//     }

//     // Recherche l'option à ajouter en fonction de la valeur sélectionnée
//     const option = optionsPlus.find(
//       (opt) => opt.amount.toString() === selectedOption
//     );

//     if (!option) {
//       alert("Option invalide");
//       return;
//     }

//     try {
//       // Ajout de l'option à la réservation dans la base de données
//       await addOptionToBooking(bookingId, option.amount, option.description);

//       // Mise à jour du total dans la base de données
//       await updateBookingTotal(bookingId);

//       // Recharger les options et recalculer le total
//       fetchOptions(); // Cette fonction recalculera le total totalAmount
//     } catch (error) {
//       console.error("❌ Erreur lors de l'ajout de l'option :", error);
//       alert("Une erreur s'est produite lors de l'ajout.");
//     }
//   };

//   const handleDeleteOption = async (optionId: string, amount: number) => {
//     const confirmed = window.confirm(
//       "Voulez-vous vraiment supprimer cette option ?"
//     );
//     if (!confirmed) return;

//     try {
//       await deleteOption(optionId);
//       await updateBookingTotal(bookingId); // ✅ Mise à jour en base de données

//       setTotalAmount((prev) => prev - amount); // ✅ Met à jour le total en local
//       setOptions((prev) => prev.filter((option) => option.id !== optionId)); // ✅ Met à jour l'affichage
//     } catch (error) {
//       console.error("❌ Erreur lors de la suppression de l'option :", error);
//       alert("Impossible de supprimer l'option.");
//     }
//   };

//   return (
//     <div className="manage_service_container">
//       <h3>Options supplémentaires</h3>
//       <div className="form">
//         <div className="options">
//           <select
//             value={selectedOption}
//             onChange={(e) => setSelectedOption(e.target.value)}
//             className="select_option"
//           >
//             <option value="" disabled>
//               Choisir une option
//             </option>
//             {optionsPlus.map((option) => (
//               <option
//                 key={`${option.description}-${option.amount}`}
//                 value={option.amount.toString()}
//               >
//                 {option.description} - {option.amount}€
//               </option>
//             ))}
//           </select>
//           <button onClick={handleAddOption} className="btn_option">
//             Ajouter une option
//           </button>
//         </div>

//         <h4>Total à payer : {totalAmount}€</h4>

//         {loading ? (
//           <p>Chargement...</p>
//         ) : error ? (
//           <p className="error">{error}</p>
//         ) : options.length === 0 ? (
//           <div className="no_transaction">
//             <span className="no_transaction_text">
//               <BsCartX />
//               <p>aucune option</p>
//             </span>
//           </div>
//         ) : (
//           <>
//             <h3>Voici les options que vous avez choisies:</h3>
//             <table className="table_container">
//               <thead>
//                 <tr>
//                   <th>Service</th>
//                   <th>Montant</th>
//                   <th>Description</th>
//                   <th>Date</th>
//                   <th>Heure</th>
//                   <th>Action</th>
//                 </tr>
//               </thead>
//               <tbody>
//                 {options.map((option) => (
//                   <tr key={option.id}>
//                     <td>
//                       <FaWallet />
//                     </td>
//                     <td>+ {option.amount}€</td>
//                     <td>{option.description}</td>
//                     <td>
//                       {new Date(option.createdAt).toLocaleDateString("fr-FR")}
//                     </td>
//                     <td>
//                       {new Date(option.createdAt).toLocaleTimeString("fr-FR", {
//                         hour: "2-digit",
//                         minute: "2-digit",
//                         second: "2-digit",
//                       })}
//                     </td>
//                     <td>
//                       <button
//                         onClick={() =>
//                           handleDeleteOption(option.id, option.amount)
//                         }
//                         className="btn_action"
//                       >
//                         <FaRegTrashAlt />
//                       </button>
//                     </td>
//                   </tr>
//                 ))}
//               </tbody>
//             </table>
//           </>
//         )}
//       </div>
//     </div>
//   );
// };

// export default OptionManager;
// "use client";

// import React, { useEffect, useState } from "react";
// import {
//   addOptionToBooking,
//   deleteOption,
//   getOptionsByBookingId,
//   updateBookingTotal,
// } from "@/actions/bookings";
// import { Option } from "@/types";
// import { FaRegTrashAlt, FaWallet } from "react-icons/fa";
// import { BsCartX } from "react-icons/bs";

// interface OptionManagerProps {
//   bookingId: string;
//   serviceAmount: number;
//   onTotalUpdate?: (total: number, updatedOptions: Option[]) => void;
// }

// const OptionManager: React.FC<OptionManagerProps> = ({
//   bookingId,
//   serviceAmount,
//   onTotalUpdate,
// }) => {
//   const [options, setOptions] = useState<Option[]>([]);
//   const [loading, setLoading] = useState<boolean>(true);
//   const [error, setError] = useState<string | null>(null);
//   const [selectedOption, setSelectedOption] = useState<string>("");
//   const [totalAmount, setTotalAmount] = useState<number>(serviceAmount || 0);

//   const optionsPlus = [
//     { description: "Personne supplémentaire", amount: 50 },
//     { description: "Personne supplémentaire", amount: 120 },
//     { description: "Hôtesse", amount: 200 },
//     { description: "Vidéo drone", amount: 500 },
//     { description: "Paddle board", amount: 50 },
//   ];

//   // 🔹 Fonction pour récupérer les options et calculer le montant total
//   const fetchOptions = async () => {
//     setLoading(true);
//     try {
//       const { options } = await getOptionsByBookingId(bookingId);
//       setOptions(options);

//       // Calcul du montant total avec les options
//       const total =
//         serviceAmount + options.reduce((sum, option) => sum + option.amount, 0);
//       setTotalAmount(total);

//       // 🔥 Appel de la fonction `onTotalUpdate` avec les deux arguments
//       if (onTotalUpdate) {
//         onTotalUpdate(total, options);
//       }
//     } catch (error) {
//       console.error("❌ Erreur lors du chargement des options :", error);
//       setError("Impossible de récupérer les options.");
//     } finally {
//       setLoading(false);
//     }
//   };

//   useEffect(() => {
//     fetchOptions();
//     // eslint-disable-next-line react-hooks/exhaustive-deps
//   }, [bookingId, serviceAmount]); // Ajout de serviceAmount ici

//   // 🔹 Ajout d'une option à la réservation
//   const handleAddOption = async () => {
//     if (!selectedOption) {
//       alert("Veuillez sélectionner une option valide");
//       return;
//     }

//     const option = optionsPlus.find(
//       (opt) => opt.amount.toString() === selectedOption
//     );
//     if (!option) {
//       alert("Option invalide");
//       return;
//     }

//     try {
//       const newOption = await addOptionToBooking(
//         bookingId,
//         option.amount,
//         option.description
//       );

//       // 🛠 Met à jour la liste des options
//       const updatedOptions = [
//         ...options,
//         { ...option, id: newOption.id, createdAt: newOption.createdAt },
//       ];
//       setOptions(updatedOptions);

//       // 🛠 Met à jour le total avant d'appeler `onTotalUpdate`
//       const updatedTotal = await updateBookingTotal(bookingId);
//       setTotalAmount(updatedTotal);

//       // ✅ Utilise les options mises à jour !
//       if (onTotalUpdate) {
//         onTotalUpdate(updatedTotal, updatedOptions);
//       }

//       setSelectedOption(""); // Réinitialise l'option sélectionnée
//     } catch (error) {
//       console.error("❌ Erreur lors de l'ajout de l'option :", error);
//       alert("Une erreur s'est produite lors de l'ajout.");
//     }
//   };
//   useEffect(() => {
//     if (!bookingId || options.length > 0) return; // ✅ Évite un appel inutile si les options sont déjà là
//     fetchOptions();
//     // eslint-disable-next-line react-hooks/exhaustive-deps
//   }, [bookingId]);

//   // 🔹 Suppression d'une option
//   const handleDeleteOption = async (optionId: string) => {
//     const confirmed = window.confirm(
//       "Voulez-vous vraiment supprimer cette option ?"
//     );
//     if (!confirmed) return;

//     try {
//       await deleteOption(optionId);
//       await updateBookingTotal(bookingId);

//       // Refait la récupération des options après la suppression
//       await fetchOptions();
//     } catch (error) {
//       console.error("❌ Erreur lors de la suppression de l'option :", error);
//       alert("Impossible de supprimer l'option.");
//     }
//   };

//   return (
//     <div className="manage_service_container">
//       <h3>Options supplémentaires</h3>
//       <div className="form">
//         <div className="options">
//           <select
//             value={selectedOption}
//             onChange={(e) => setSelectedOption(e.target.value)}
//             className="select_option"
//           >
//             <option value="" disabled>
//               Choisir une option
//             </option>
//             {optionsPlus.map((option) => (
//               <option
//                 key={`${option.description}-${option.amount}`}
//                 value={option.amount.toString()}
//               >
//                 {option.description} - {option.amount}€
//               </option>
//             ))}
//           </select>
//           <button onClick={handleAddOption} className="btn_option">
//             Ajouter une option
//           </button>
//         </div>

//         <h4>Total à payer : {totalAmount}€</h4>

//         {loading ? (
//           <p>Chargement...</p>
//         ) : error ? (
//           <p className="error">{error}</p>
//         ) : options.length === 0 ? (
//           <div className="no_transaction">
//             <span className="no_transaction_text">
//               <BsCartX />
//               <p>aucune option</p>
//             </span>
//           </div>
//         ) : (
//           <>
//             <h3>Voici les options que vous avez choisies:</h3>
//             <table className="table_container">
//               <thead>
//                 <tr>
//                   <th>Service</th>
//                   <th>Montant</th>
//                   <th>Description</th>
//                   <th>Date</th>
//                   <th>Heure</th>
//                   <th>Action</th>
//                 </tr>
//               </thead>
//               <tbody>
//                 {options.map((option) => (
//                   <tr key={option.id}>
//                     <td>
//                       <FaWallet />
//                     </td>
//                     <td>+ {option.amount}€</td>
//                     <td>{option.description}</td>
//                     <td>
//                       {new Date(option.createdAt).toLocaleDateString("fr-FR")}
//                     </td>
//                     <td>
//                       {new Date(option.createdAt).toLocaleTimeString("fr-FR", {
//                         hour: "2-digit",
//                         minute: "2-digit",
//                         second: "2-digit",
//                       })}
//                     </td>
//                     <td>
//                       <button
//                         onClick={() => handleDeleteOption(option.id)}
//                         className="btn_action"
//                       >
//                         <FaRegTrashAlt />
//                       </button>
//                     </td>
//                   </tr>
//                 ))}
//               </tbody>
//             </table>
//           </>
//         )}
//       </div>
//     </div>
//   );
// };

// export default OptionManager;
/////////////////////////
"use client";

import React, { useEffect, useState } from "react";
import {
  addOptionToBooking,
  deleteOption,
  getOptionsByBookingId,
  updateBookingTotal,
} from "@/actions/bookings";
import { Option } from "@/types";
import { FaRegTrashAlt, FaWallet } from "react-icons/fa";
import { BsCartX } from "react-icons/bs";

interface OptionManagerProps {
  bookingId: string;
  serviceAmount: number;
  onTotalUpdate?: (total: number, updatedOptions: Option[]) => void;
}

const OptionManager: React.FC<OptionManagerProps> = ({
  bookingId,
  serviceAmount,
  onTotalUpdate,
}) => {
  const [options, setOptions] = useState<Option[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedOption, setSelectedOption] = useState<string>("");
  const [totalAmount, setTotalAmount] = useState<number>(serviceAmount || 0);

  const optionsPlus = [
    { description: "Personne supplémentaire", amount: 50 },
    { description: "Personne supplémentaire", amount: 120 },
    { description: "Hôtesse", amount: 200 },
    { description: "Vidéo drone", amount: 500 },
    { description: "Paddle board", amount: 50 },
  ];

  // 🔹 Fonction pour récupérer les options et calculer le montant total
  const fetchOptions = async () => {
    setLoading(true);
    try {
      const { options } = await getOptionsByBookingId(bookingId);
      setOptions(options);

      // Calcul du montant total avec les options
      const total =
        serviceAmount + options.reduce((sum, option) => sum + option.amount, 0);
      setTotalAmount(total);

      // 🔥 Appel de la fonction `onTotalUpdate`
      if (onTotalUpdate) {
        onTotalUpdate(total, options);
      }
    } catch (error) {
      console.error("❌ Erreur lors du chargement des options :", error);
      setError("Impossible de récupérer les options.");
    } finally {
      setLoading(false);
    }
  };

  // 🔹 Chargement initial des options (fusion des useEffect pour éviter les appels en double)

  useEffect(() => {
    setOptions([]);
    fetchOptions(); // Recharger les options à chaque fois qu'il y a un changement dans le `bookingId`
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [bookingId]);

  // 🔹 Ajout d'une option à la réservation

  const handleAddOption = async () => {
    if (!selectedOption) {
      alert("Veuillez sélectionner une option valide");
      return;
    }

    const option = optionsPlus.find(
      (opt) => opt.amount.toString() === selectedOption
    );
    if (!option) {
      alert("Option invalide");
      return;
    }

    // Vérifie si l'option est déjà présente dans les options existantes
    const optionAlreadyAdded = options.some(
      (opt) => opt.amount === option.amount
    );
    if (optionAlreadyAdded) {
      alert("Cette option a déjà été ajoutée.");
      return;
    }

    try {
      // Ajouter l'option à la réservation
      const newOption = await addOptionToBooking(
        bookingId,
        option.amount,
        option.description
      );

      // Ajouter l'option au tableau des options locales
      const updatedOptions = [
        ...options,
        { ...option, id: newOption.id, createdAt: newOption.createdAt },
      ];
      setOptions(updatedOptions);

      // Mettre à jour le total avec l'API
      const updatedTotal = await updateBookingTotal(bookingId);
      setTotalAmount(updatedTotal);

      // Mettre à jour le total localement via le callback `onTotalUpdate` si nécessaire
      if (onTotalUpdate) {
        onTotalUpdate(updatedTotal, updatedOptions);
      }

      // Réinitialiser l'option sélectionnée pour préparer l'interface pour une nouvelle option
      setSelectedOption("");
    } catch (error) {
      console.error("Erreur lors de l'ajout de l'option :", error);
      alert("Une erreur s'est produite lors de l'ajout. Veuillez réessayer.");
    }
  };

  // 🔹 Suppression d'une option
  // const handleDeleteOption = async (optionId: string) => {
  //   const confirmed = window.confirm(
  //     "Voulez-vous vraiment supprimer cette option ?"
  //   );
  //   if (!confirmed) return;

  //   try {
  //     await deleteOption(optionId);
  //     await updateBookingTotal(bookingId);

  //     // Refait la récupération des options après la suppression
  //     await fetchOptions();
  //   } catch (error) {
  //     console.error("❌ Erreur lors de la suppression de l'option :", error);
  //     alert("Impossible de supprimer l'option.");
  //   }
  // };
  const handleDeleteOption = async (optionId: string) => {
    const confirmed = window.confirm(
      "Voulez-vous vraiment supprimer cette option ?"
    );
    if (!confirmed) return;

    try {
      await deleteOption(optionId);

      // Récupérer à nouveau les options et recalculer le montant total
      await fetchOptions();
    } catch (error) {
      console.error("Erreur lors de la suppression de l'option :", error);
      alert("Impossible de supprimer l'option.");
    }
  };

  return (
    <div className="manage_service_container">
      <h3>Options supplémentaires</h3>
      <div className="form">
        <div className="options">
          <select
            value={selectedOption}
            onChange={(e) => setSelectedOption(e.target.value)}
            className="select_option"
          >
            <option value="" disabled>
              Choisir une option
            </option>
            {optionsPlus.map((option) => (
              <option
                key={`${option.description}-${option.amount}`}
                value={option.amount.toString()}
              >
                {option.description} - {option.amount}€
              </option>
            ))}
          </select>
          <button onClick={handleAddOption} className="btn_option">
            Ajouter une option
          </button>
        </div>

        <h4>Total à payer : {totalAmount}€</h4>

        {loading ? (
          <p>Chargement...</p>
        ) : error ? (
          <p className="error">{error}</p>
        ) : options.length === 0 ? (
          <div className="no_transaction">
            <span className="no_transaction_text">
              <BsCartX />
              <p>aucune option</p>
            </span>
          </div>
        ) : (
          <>
            <h3>Voici les options que vous avez choisies:</h3>
            <table className="table_container">
              <thead>
                <tr>
                  <th>Service</th>
                  <th>Montant</th>
                  <th>Description</th>
                  <th>Date</th>
                  <th>Heure</th>
                  <th>Action</th>
                </tr>
              </thead>
              <tbody>
                {options.map((option) => (
                  <tr key={option.id}>
                    <td>
                      <FaWallet />
                    </td>
                    <td>+ {option.amount}€</td>
                    <td>{option.description}</td>
                    <td>
                      {new Date(option.createdAt).toLocaleDateString("fr-FR")}
                    </td>
                    <td>
                      {new Date(option.createdAt).toLocaleTimeString("fr-FR")}
                    </td>
                    <td>
                      <button
                        onClick={() => handleDeleteOption(option.id)}
                        className="btn_action"
                      >
                        <FaRegTrashAlt />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </>
        )}
      </div>
    </div>
  );
};

export default OptionManager;
