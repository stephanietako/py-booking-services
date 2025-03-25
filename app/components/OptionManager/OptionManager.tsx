// "use client";

// import React, { useEffect, useRef, useState } from "react";
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

//   const selectRef = useRef<HTMLSelectElement>(null); // Référence pour le select

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
//       setTotalAmount(total); // Mise à jour du total

//       // 🔥 Appel de la fonction `onTotalUpdate`
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

//   // 🔹 Chargement initial des options
//   useEffect(() => {
//     setOptions([]);
//     fetchOptions(); // Recharger les options à chaque fois qu'il y a un changement dans le `bookingId`
//     // eslint-disable-next-line react-hooks/exhaustive-deps
//   }, [bookingId]);

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

//     // Vérifie si l'option est déjà présente dans les options existantes
//     const optionAlreadyAdded = options.some(
//       (opt) => opt.amount === option.amount
//     );
//     if (optionAlreadyAdded) {
//       alert("Cette option a déjà été ajoutée.");
//       return;
//     }

//     try {
//       // Ajouter l'option à la réservation
//       const newOption = await addOptionToBooking(
//         bookingId,
//         option.amount,
//         option.description
//       );

//       // Ajouter l'option au tableau des options locales
//       const updatedOptions = [
//         ...options,
//         { ...option, id: newOption.id, createdAt: newOption.createdAt },
//       ];
//       setOptions(updatedOptions);

//       // Calcul du nouveau total localement
//       const updatedTotal =
//         serviceAmount +
//         updatedOptions.reduce((sum, option) => sum + option.amount, 0);
//       setTotalAmount(updatedTotal); // Mise à jour du `totalAmount` local

//       // Mise à jour du total côté serveur avec `updateBookingTotal`
//       const updatedTotalFromServer = await updateBookingTotal(bookingId);

//       // Après l'appel serveur, on met à jour `totalAmount` en cas de changement
//       setTotalAmount(updatedTotalFromServer);

//       // Mettre à jour le total localement via le callback `onTotalUpdate` si nécessaire
//       if (onTotalUpdate) {
//         onTotalUpdate(updatedTotalFromServer, updatedOptions);
//       }

//       // Réinitialiser l'option sélectionnée pour préparer l'interface pour une nouvelle option
//       setSelectedOption("");

//       // Focus sur le select après l'ajout d'une option
//       if (selectRef.current) {
//         selectRef.current.focus();
//       }
//     } catch (error) {
//       console.error("Erreur lors de l'ajout de l'option :", error);
//       alert("Une erreur s'est produite lors de l'ajout. Veuillez réessayer.");
//     }
//   };

//   // 🔹 Suppression d'une option
//   const handleDeleteOption = async (optionId: string) => {
//     const confirmed = window.confirm(
//       "Voulez-vous vraiment supprimer cette option ?"
//     );
//     if (!confirmed) return;

//     try {
//       await deleteOption(optionId);

//       // Récupérer à nouveau les options et recalculer le montant total localement
//       await fetchOptions();

//       // Mise à jour du total côté serveur avec `updateBookingTotal`
//       const updatedTotalFromServer = await updateBookingTotal(bookingId);

//       // Après l'appel serveur, on met à jour `totalAmount` en cas de changement
//       setTotalAmount(updatedTotalFromServer);
//     } catch (error) {
//       console.error("Erreur lors de la suppression de l'option :", error);
//       alert("Impossible de supprimer l'option.");
//     }
//   };

//   return (
//     <div className="manage_service_container">
//       <h3>Options supplémentaires</h3>
//       <div className="form">
//         <div className="options">
//           <select
//             ref={selectRef} // Attribuer la référence ici
//             value={selectedOption}
//             onChange={(e) => setSelectedOption(e.target.value)}
//             className="select_option"
//             aria-label="Sélectionner une option"
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
//           <button
//             onClick={handleAddOption}
//             className="btn_option"
//             aria-label="Ajouter l'option sélectionnée"
//           >
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
//                       {option.createdAt
//                         ? new Date(option.createdAt).toLocaleDateString("fr-FR")
//                         : "Date non disponible"}
//                     </td>
//                     <td>
//                       {option.createdAt
//                         ? new Date(option.createdAt).toLocaleTimeString("fr-FR")
//                         : "Heure non disponible"}
//                     </td>

//                     <td>
//                       <button
//                         onClick={() => handleDeleteOption(option.id)}
//                         className="btn_action"
//                         aria-label={`Supprimer l'option ${option.description}`}
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
// import styles from "./styles.module.scss"; // Importation du fichier SCSS

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

//   const [totalAmount, setTotalAmount] = useState<number>(serviceAmount || 0);

//   const optionsPlus = [
//     { description: "Capitaine", amount: 350 },
//     { description: "Hôtesse", amount: 200 },
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
//       setTotalAmount(total); // Mise à jour du total

//       // 🔥 Appel de la fonction `onTotalUpdate`
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

//   // 🔹 Chargement initial des options
//   useEffect(() => {
//     setOptions([]);
//     fetchOptions(); // Recharger les options à chaque fois qu'il y a un changement dans le `bookingId`
//     // eslint-disable-next-line react-hooks/exhaustive-deps
//   }, [bookingId]);

//   // 🔹 Ajout d'une option à la réservation
//   const handleAddOption = async (
//     optionAmount: number,
//     optionDescription: string
//   ) => {
//     // Vérifie si l'option est déjà présente dans les options existantes
//     const optionAlreadyAdded = options.some(
//       (opt) => opt.amount === optionAmount
//     );
//     if (optionAlreadyAdded) {
//       alert("Cette option a déjà été ajoutée.");
//       return;
//     }

//     try {
//       // Ajouter l'option à la réservation
//       const newOption = await addOptionToBooking(
//         bookingId,
//         optionAmount,
//         optionDescription
//       );

//       // Ajouter l'option au tableau des options locales
//       const updatedOptions = [
//         ...options,
//         { ...newOption, amount: optionAmount, description: optionDescription },
//       ];
//       setOptions(updatedOptions);

//       // Calcul du nouveau total localement
//       const updatedTotal =
//         serviceAmount +
//         updatedOptions.reduce((sum, option) => sum + option.amount, 0);
//       setTotalAmount(updatedTotal); // Mise à jour du `totalAmount` local

//       // Mise à jour du total côté serveur avec `updateBookingTotal`
//       const updatedTotalFromServer = await updateBookingTotal(bookingId);

//       // Après l'appel serveur, on met à jour `totalAmount` en cas de changement
//       setTotalAmount(updatedTotalFromServer);

//       // Mettre à jour le total localement via le callback `onTotalUpdate` si nécessaire
//       if (onTotalUpdate) {
//         onTotalUpdate(updatedTotalFromServer, updatedOptions);
//       }
//     } catch (error) {
//       console.error("Erreur lors de l'ajout de l'option :", error);
//       alert("Une erreur s'est produite lors de l'ajout. Veuillez réessayer.");
//     }
//   };

//   // 🔹 Suppression d'une option
//   const handleDeleteOption = async (optionId: string) => {
//     const confirmed = window.confirm(
//       "Voulez-vous vraiment supprimer cette option ?"
//     );
//     if (!confirmed) return;

//     try {
//       await deleteOption(optionId);

//       // Récupérer à nouveau les options et recalculer le montant total localement
//       await fetchOptions();

//       // Mise à jour du total côté serveur avec `updateBookingTotal`
//       const updatedTotalFromServer = await updateBookingTotal(bookingId);

//       // Après l'appel serveur, on met à jour `totalAmount` en cas de changement
//       setTotalAmount(updatedTotalFromServer);
//     } catch (error) {
//       console.error("Erreur lors de la suppression de l'option :", error);
//       alert("Impossible de supprimer l'option.");
//     }
//   };

//   return (
//     <div className={styles.manage_service_container}>
//       <h3>Options supplémentaires</h3>
//       <div className={styles.form}>
//         <h4>Total à payer : {totalAmount}€</h4>

//         <div className={styles.optionButtons}>
//           {optionsPlus.map((option) => (
//             <div
//               key={option.amount}
//               className={styles.optionCard}
//               onClick={() => handleAddOption(option.amount, option.description)}
//             >
//               <h5>{option.description}</h5>
//               <p>{option.amount}€</p>
//             </div>
//           ))}
//         </div>

//         {loading ? (
//           <p>Chargement...</p>
//         ) : error ? (
//           <p className={styles.error}>{error}</p>
//         ) : options.length === 0 ? (
//           <div className={styles.noTransaction}>
//             <span className={styles.noTransactionText}>
//               <BsCartX />
//               <p>aucune option</p>
//             </span>
//           </div>
//         ) : (
//           <>
//             <h3>Voici les options que vous avez choisies:</h3>
//             <table className={styles.tableContainer}>
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
//                       {option.createdAt
//                         ? new Date(option.createdAt).toLocaleDateString("fr-FR")
//                         : "Date non disponible"}
//                     </td>
//                     <td>
//                       {option.createdAt
//                         ? new Date(option.createdAt).toLocaleTimeString("fr-FR")
//                         : "Heure non disponible"}
//                     </td>

//                     <td>
//                       <button
//                         onClick={() => handleDeleteOption(option.id)}
//                         className={styles.btnAction}
//                         aria-label={`Supprimer l'option ${option.description}`}
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
import styles from "./styles.module.scss"; // Importation du fichier SCSS

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
  const [totalAmount, setTotalAmount] = useState<number>(serviceAmount);
  const [shouldUpdateTotal, setShouldUpdateTotal] = useState(false);

  const optionsPlus = [
    { description: "Capitaine", amount: 350 },
    { description: "Hôtesse", amount: 200 },
  ];

  // 🔹 Charge les options existantes
  useEffect(() => {
    const fetchOptions = async () => {
      setLoading(true);
      try {
        const { options } = await getOptionsByBookingId(bookingId);
        setOptions(options);

        // Calcul du total
        const total =
          serviceAmount +
          options.reduce((sum, option) => sum + option.amount, 0);
        setTotalAmount(total);

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

    fetchOptions();
  }, [bookingId, serviceAmount, onTotalUpdate]);

  // 🔄 Met à jour le total toutes les 3 secondes après un changement
  useEffect(() => {
    if (!shouldUpdateTotal) return; // Ne met à jour que si un changement a eu lieu

    const updateTotal = async () => {
      try {
        const updatedTotalFromServer = await updateBookingTotal(bookingId);
        setTotalAmount(updatedTotalFromServer);
      } catch (error) {
        console.error("Erreur mise à jour du total :", error);
      } finally {
        setShouldUpdateTotal(false); // Reset après mise à jour
      }
    };

    const timeout = setTimeout(updateTotal, 3000);
    return () => clearTimeout(timeout);
  }, [shouldUpdateTotal, bookingId]);

  // 🔹 Ajoute une option à la réservation
  const handleAddOption = async (
    optionAmount: number,
    optionDescription: string
  ) => {
    if (options.some((opt) => opt.amount === optionAmount)) {
      alert("Cette option a déjà été ajoutée.");
      return;
    }

    try {
      const newOption = await addOptionToBooking(
        bookingId,
        optionAmount,
        optionDescription
      );

      const updatedOptions = [
        ...options,
        { ...newOption, amount: optionAmount, description: optionDescription },
      ];
      setOptions(updatedOptions);
      setShouldUpdateTotal(true); // Déclenche la mise à jour du total
    } catch (error) {
      console.error("Erreur lors de l'ajout de l'option :", error);
      alert("Une erreur s'est produite lors de l'ajout. Veuillez réessayer.");
    }
  };

  // 🔹 Supprime une option de la réservation
  const handleDeleteOption = async (optionId: string) => {
    if (!window.confirm("Voulez-vous vraiment supprimer cette option ?"))
      return;

    try {
      await deleteOption(optionId);

      // Mise à jour locale des options
      setOptions((prevOptions) =>
        prevOptions.filter((opt) => opt.id !== optionId)
      );
      setShouldUpdateTotal(true); // Déclenche la mise à jour du total
    } catch (error) {
      console.error("Erreur lors de la suppression de l'option :", error);
      alert("Impossible de supprimer l'option.");
    }
  };

  return (
    <div className={styles.manage_service_container}>
      <h3>Options supplémentaires</h3>
      <div className={styles.form}>
        <h4>Total à payer : {totalAmount}€</h4>

        <div className={styles.optionButtons}>
          {optionsPlus.map((option) => (
            <div
              key={option.amount}
              className={styles.optionCard}
              onClick={() => handleAddOption(option.amount, option.description)}
            >
              <h5>{option.description}</h5>
              <p>{option.amount}€</p>
            </div>
          ))}
        </div>

        {loading ? (
          <p>Chargement...</p>
        ) : error ? (
          <p className={styles.error}>{error}</p>
        ) : options.length === 0 ? (
          <div className={styles.noTransaction}>
            <span className={styles.noTransactionText}>
              <BsCartX />
              <p>aucune option</p>
            </span>
          </div>
        ) : (
          <>
            <h3>Voici les options que vous avez choisies:</h3>
            <table className={styles.tableContainer}>
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
                      {option.createdAt
                        ? new Date(option.createdAt).toLocaleDateString("fr-FR")
                        : "Date non disponible"}
                    </td>
                    <td>
                      {option.createdAt
                        ? new Date(option.createdAt).toLocaleTimeString("fr-FR")
                        : "Heure non disponible"}
                    </td>

                    <td>
                      <button
                        onClick={() => handleDeleteOption(option.id)}
                        className={styles.btnAction}
                        aria-label={`Supprimer l'option ${option.description}`}
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
