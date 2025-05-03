// "use client";

// import React, { useEffect, useState, useCallback } from "react";
// import {
//   addOptionToBooking,
//   deleteOption,
//   getOptionsByBookingId,
//   updateBookingTotal,
// } from "@/actions/bookings";
// import { Booking } from "@/types";
// import { useBookingStore } from "@/store/store";
// import { format } from "date-fns";
// import { fr } from "date-fns/locale";
// // Styles
// import styles from "./styles.module.scss";

// // Définition des props
// interface BookingWithOptionsProps {
//   booking: Booking;
//   onCancel: () => void;
// }

// const BookingWithOptions: React.FC<BookingWithOptionsProps> = ({ booking }) => {
//   const [state, setState] = useState({
//     loading: false,
//     error: null as string | null,
//     selectedOption: "",
//   });

//   const { options, setOptions, totalAmounts, setTotalAmount } =
//     useBookingStore();
//   const bookingOptions = options[booking.id] || [];

//   const optionsPlus = [
//     { id: "1", description: "Capitaine", amount: 350 },
//     { id: "2", description: "Hôtesse", amount: 200 },
//   ];

//   // Fonction pour récupérer les options
//   const fetchOptions = useCallback(async () => {
//     setState((prev) => ({ ...prev, loading: true }));
//     try {
//       const fetchedOptions = await getOptionsByBookingId(booking.id.toString());
//       setOptions(
//         booking.id.toString(),
//         fetchedOptions.map((opt) => ({
//           id: opt.id,
//           description: opt.label,
//           amount: opt.unitPrice,
//           quantity: opt.quantity,
//         }))
//       );

//       // Calcul du total
//       const total =
//         booking.totalAmount +
//         fetchedOptions.reduce(
//           (sum: number, opt: { unitPrice: number }) => sum + opt.unitPrice,
//           0
//         );

//       setTotalAmount(booking.id, total);
//     } catch (error) {
//       console.error("❌ Erreur lors de la récupération des options :", error);
//       setState((prev) => ({
//         ...prev,
//         error: "Impossible de charger les options.",
//       }));
//     } finally {
//       setState((prev) => ({ ...prev, loading: false }));
//     }
//   }, [booking.id, booking.totalAmount, setOptions, setTotalAmount]);

//   useEffect(() => {
//     fetchOptions();
//   }, [fetchOptions]);

//   // Ajouter une option
//   const handleAddOption = async () => {
//     if (!state.selectedOption) {
//       setState((prev) => ({
//         ...prev,
//         error: "Veuillez sélectionner une option.",
//       }));
//       return;
//     }

//     const option = optionsPlus.find((opt) => opt.id === state.selectedOption);
//     if (!option) {
//       setState((prev) => ({ ...prev, error: "Option invalide." }));
//       return;
//     }

//     if (bookingOptions.some((opt) => opt.id === option.id)) {
//       setState((prev) => ({
//         ...prev,
//         error: "Cette option est déjà ajoutée.",
//       }));
//       return;
//     }

//     try {
//       const newOption = await addOptionToBooking(
//         booking.id.toString(),
//         option.id,
//         1 // Quantité par défaut
//       );

//       const updatedOptions = [
//         ...bookingOptions,
//         {
//           ...option,
//           id: newOption.id,
//         },
//       ];
//       setOptions(booking.id.toString(), updatedOptions);

//       const updatedTotal = await updateBookingTotal(booking.id.toString());
//       setTotalAmount(booking.id, updatedTotal);
//       setState((prev) => ({ ...prev, selectedOption: "" }));
//     } catch (error) {
//       console.error("❌ Erreur lors de l'ajout de l'option :", error);
//       setState((prev) => ({
//         ...prev,
//         error: "Erreur lors de l'ajout de l'option.",
//       }));
//     }
//   };

//   // Supprimer une option
//   const handleDeleteOption = async (optionId: string) => {
//     if (!window.confirm("Voulez-vous vraiment supprimer cette option ?"))
//       return;

//     try {
//       await deleteOption(optionId);
//       const updatedOptions = bookingOptions.filter(
//         (opt) => opt.id !== optionId
//       );
//       setOptions(booking.id.toString(), updatedOptions);

//       const updatedTotal = await updateBookingTotal(booking.id.toString());
//       setTotalAmount(booking.id.toString(), updatedTotal);
//     } catch (error) {
//       console.error("❌ Erreur lors de la suppression de l'option :", error);
//       setState((prev) => ({
//         ...prev,
//         error: "Impossible de supprimer cette option.",
//       }));
//     }
//   };

//   return (
//     <div className={styles.bookingItem}>
//       <div className={styles.bookingItem__header}>
//         <h3>{booking.service?.name || "Service non disponible"}</h3>
//         <p>{booking.service?.description || "Aucune description disponible"}</p>
//       </div>

//       <div className={styles.bookingItem__content}>
//         <div className={styles.bookingItem__details}>
//           <p>
//             <strong>Réservé pour :</strong>{" "}
//             {format(new Date(booking.startTime), "eeee dd MMMM 'à' HH:mm", {
//               locale: fr,
//             })}{" "}
//             à {format(new Date(booking.endTime), "HH:mm", { locale: fr })}
//           </p>
//           <p className={styles.bookingItem__total}>
//             Total: {totalAmounts[booking.id] || booking.totalAmount} €
//           </p>
//         </div>

//         <div className={styles.bookingItem__options}>
//           <h4>Options choisies :</h4>
//           {state.loading ? (
//             <p>Chargement...</p>
//           ) : state.error ? (
//             <p className="error">{state.error}</p>
//           ) : bookingOptions.length === 0 ? (
//             <p>Aucune option sélectionnée.</p>
//           ) : (
//             <ul>
//               {bookingOptions.map((option) => (
//                 <li key={option.id}>
//                   {option.description} - {option.amount} €
//                   <button onClick={() => handleDeleteOption(option.id)}>
//                     ❌
//                   </button>
//                 </li>
//               ))}
//             </ul>
//           )}

//           <select
//             value={state.selectedOption}
//             onChange={(e) =>
//               setState((prev) => ({ ...prev, selectedOption: e.target.value }))
//             }
//           >
//             <option value="">Choisir une option</option>
//             {optionsPlus.map((opt) => (
//               <option key={opt.id} value={opt.id}>
//                 {opt.description} - {opt.amount} €
//               </option>
//             ))}
//           </select>
//           <button onClick={handleAddOption}>Ajouter</button>
//         </div>
//       </div>
//     </div>
//   );
// };

// export default BookingWithOptions;
