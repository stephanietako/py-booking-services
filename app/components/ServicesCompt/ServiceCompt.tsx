// "use client";

// import React, { useEffect, useState } from "react";
// import Image from "next/image";
// import { format } from "date-fns";
// import { fr } from "date-fns/locale";
// import styles from "./styles.module.scss";

// interface Option {
//   amount: number;
// }

// interface ServiceComptProps {
//   name: string;
//   description: string;
//   amount: number;
//   imageUrl: string;
//   categories: string[];
//   startTime?: string | Date | null;
//   endTime?: string | Date | null;
//   options?: Option[]; // Liste des options
// }

// const ServiceCompt: React.FC<ServiceComptProps> = ({
//   name,
//   description,
//   amount,
//   imageUrl,
//   categories,
//   startTime,
//   endTime,
//   options = [], // Default à une liste vide si pas de options
// }) => {
//   // État pour stocker le montant total dynamique
//   const [totalAmount, setTotalAmount] = useState(amount);
//   // eslint-disable-next-line @typescript-eslint/no-unused-vars
//   const [totalOptionsAmount, setTotalOptionsAmount] = useState(0); // Ajouter un état pour les options

//   // Vérification si startTime et endTime sont valides
//   const isValidStartTime =
//     startTime instanceof Date && !isNaN(startTime.getTime());
//   const isValidEndTime = endTime instanceof Date && !isNaN(endTime.getTime());

//   const formattedStartTime = isValidStartTime
//     ? format(startTime as Date, "eeee dd MMMM yyyy 'de' HH:mm", { locale: fr })
//     : null;

//   const formattedEndTime = isValidEndTime
//     ? format(endTime as Date, "HH:mm", { locale: fr })
//     : null;

//   useEffect(() => {
//     if (options.length > 0) {
//       const totalOptionsAmount = options.reduce(
//         (sum, option) => sum + option.amount,
//         0
//       );
//       setTotalAmount(amount + totalOptionsAmount);
//     }
//     // eslint-disable-next-line react-hooks/exhaustive-deps
//   }, [options]); // 🔥 On enlève `amount` pour éviter le reset !

//   // 🔹 Calcul de la barre de progression
//   const progressValue =
//     totalAmount > 0 ? (totalOptionsAmount / totalAmount) * 100 : 0;

//   return (
//     <div className={styles.service_card}>
//       <div className={styles.service_card__img_content}>
//         <Image
//           src={imageUrl}
//           alt={name}
//           width={250}
//           height={250}
//           className={styles.service_card__img}
//         />
//       </div>

//       <div className={styles.service_card__infos_bloc}>
//         <h3 className={styles.service__title}>{name}</h3>
//         <p className={styles.service_item__description}>
//           {description?.split("\n").map((line, index) => (
//             <React.Fragment key={index}>
//               {line}
//               <br />
//             </React.Fragment>
//           ))}
//         </p>

//         {/* 🔹 Affichage du prix mis à jour */}
//         <p className={styles.service__amount}>
//           <strong>Total :</strong> {totalAmount.toFixed(2)} €
//         </p>

//         <p className={styles.service__price}>
//           Catégories :{" "}
//           {categories.length > 0 ? categories.join(", ") : "Aucune"}
//         </p>

//         {/* 🔹 Affichage des options (si présentes) */}
//         {options.length > 0 && (
//           <div className={styles.service__options}>
//             <strong>Options incluses :</strong>
//             <ul>
//               {options.map((option, index) => (
//                 <li key={index}>{option.amount.toFixed(2)} €</li>
//               ))}
//             </ul>
//           </div>
//         )}

//         {/* 🔹 Montant total affiché correctement */}
//         <div className={styles.service__transactions}>
//           <span>
//             <strong>Total à payer :</strong> {totalAmount.toFixed(2)} €
//           </span>
//         </div>

//         {/* 🔹 Barre de progression */}
//         <div className={styles.service__progress}>
//           <progress value={progressValue} max="100" />
//         </div>

//         {/* 🔹 Affichage des horaires de réservation */}
//         {formattedStartTime && formattedEndTime ? (
//           <p className={styles.service__date}>
//             <strong>Réservé pour :</strong> {formattedStartTime} à{" "}
//             {formattedEndTime}
//           </p>
//         ) : (
//           <p className={styles.service__date}>Pas encore réservé</p>
//         )}
//       </div>
//     </div>
//   );
// };

// export default ServiceCompt;
// "use client";

// import React from "react";
// import Image from "next/image";
// import { format } from "date-fns";
// import { fr } from "date-fns/locale";
// import styles from "./styles.module.scss";

// interface Option {
//   amount: number;
// }

// interface ServiceComptProps {
//   name: string;
//   description: string;
//   amount: number;
//   imageUrl: string;
//   categories: string[];
//   startTime?: string | Date | null;
//   endTime?: string | Date | null;
//   options?: Option[];
// }

// const ServiceCompt: React.FC<ServiceComptProps> = ({
//   name,
//   description,
//   amount,
//   imageUrl,
//   categories,
//   startTime,
//   endTime,
//   options = [],
// }) => {
//   // Calcul direct du montant total
//   const totalAmount =
//     amount + options.reduce((sum, option) => sum + option.amount, 0);

//   // Vérification si startTime et endTime sont valides
//   const isValidStartTime =
//     startTime instanceof Date && !isNaN(startTime.getTime());
//   const isValidEndTime = endTime instanceof Date && !isNaN(endTime.getTime());

//   const formattedStartTime = isValidStartTime
//     ? format(startTime as Date, "eeee dd MMMM yyyy 'de' HH:mm", { locale: fr })
//     : null;

//   const formattedEndTime = isValidEndTime
//     ? format(endTime as Date, "HH:mm", { locale: fr })
//     : null;

//   return (
//     <div className={styles.service_card}>
//       <div className={styles.service_card__img_content}>
//         <Image
//           src={imageUrl}
//           alt={name}
//           width={250}
//           height={250}
//           className={styles.service_card__img}
//         />
//       </div>

//       <div className={styles.service_card__infos_bloc}>
//         <h3 className={styles.service__title}>{name}</h3>
//         <p className={styles.service_item__description}>
//           {description?.split("\n").map((line, index) => (
//             <React.Fragment key={index}>
//               {line}
//               <br />
//             </React.Fragment>
//           ))}
//         </p>

//         <p className={styles.service__amount}>
//           <strong>Total :</strong> {totalAmount.toFixed(2)} €
//         </p>

//         <p className={styles.service__price}>
//           Catégories :{" "}
//           {categories.length > 0 ? categories.join(", ") : "Aucune"}
//         </p>

//         {options.length > 0 && (
//           <div className={styles.service__options}>
//             <strong>Options incluses :</strong>
//             <ul>
//               {options.map((option, index) => (
//                 <li key={index}>{option.amount.toFixed(2)} €</li>
//               ))}
//             </ul>
//           </div>
//         )}

//         <div className={styles.service__transactions}>
//           <span>
//             <strong>Total :</strong> {(totalAmount ?? 0).toFixed(2)} €
//           </span>
//         </div>

//         {formattedStartTime && formattedEndTime ? (
//           <p className={styles.service__date}>
//             <strong>Réservé pour :</strong> {formattedStartTime} à{" "}
//             {formattedEndTime}
//           </p>
//         ) : (
//           <p className={styles.service__date}>Pas encore réservé</p>
//         )}
//       </div>
//     </div>
//   );
// };

// export default ServiceCompt;
////////////////////:
// "use client";
// import React from "react";
// import Image from "next/image";
// import { format } from "date-fns";
// import { fr } from "date-fns/locale";
// import styles from "./styles.module.scss";

// interface Option {
//   id: string;
//   description: string;
//   amount: number;
// }

// interface ServiceComptProps {
//   name: string;
//   description: string;
//   amount: number;
//   imageUrl: string;
//   categories: string[];
//   startTime?: string | Date | null;
//   endTime?: string | Date | null;
//   options?: Option[];
//   totalAmount: number; // Utiliser directement la valeur de l'API
// }

// const ServiceCompt: React.FC<ServiceComptProps> = ({
//   name,
//   description,
//   imageUrl,
//   categories,
//   startTime,
//   endTime,
//   options = [],
//   totalAmount, // Prendre la valeur fournie par l'API
// }) => {
//   // Vérification si startTime et endTime sont valides
//   const isValidStartTime =
//     startTime instanceof Date && !isNaN(startTime.getTime());
//   const isValidEndTime = endTime instanceof Date && !isNaN(endTime.getTime());

//   const formattedStartTime = isValidStartTime
//     ? format(startTime as Date, "eeee dd MMMM yyyy 'de' HH:mm", { locale: fr })
//     : null;

//   const formattedEndTime = isValidEndTime
//     ? format(endTime as Date, "HH:mm", { locale: fr })
//     : null;

//   return (
//     <div className={styles.service_card}>
//       <div className={styles.service_card__img_content}>
//         <Image
//           src={imageUrl}
//           alt={name}
//           width={250}
//           height={250}
//           className={styles.service_card__img}
//         />
//       </div>

//       <div className={styles.service_card__infos_bloc}>
//         <h3 className={styles.service__title}>{name}</h3>
//         <p className={styles.service_item__description}>
//           {description?.split("\n").map((line, index) => (
//             <React.Fragment key={index}>
//               {line}
//               <br />
//             </React.Fragment>
//           ))}
//         </p>

//         <p className={styles.service__amount}>
//           <strong>Total :</strong>{" "}
//           {totalAmount ? totalAmount.toFixed(2) : "0.00"} €
//         </p>

//         <p className={styles.service__price}>
//           Catégories :{" "}
//           {categories.length > 0 ? categories.join(", ") : "Aucune"}
//         </p>

//         {options.length > 0 && (
//           <div className={styles.service__options}>
//             <strong>Options incluses :</strong>
//             <ul>
//               {options.map((option) => (
//                 <li key={option.id}>
//                   <strong>Total :</strong>{" "}
//                   {totalAmount ? totalAmount.toFixed(2) : "0.00"} €
//                 </li>
//               ))}
//             </ul>
//           </div>
//         )}

//         {formattedStartTime && formattedEndTime ? (
//           <p className={styles.service__date}>
//             <strong>Réservé pour :</strong> {formattedStartTime} à{" "}
//             {formattedEndTime}
//           </p>
//         ) : (
//           <p className={styles.service__date}>Pas encore réservé</p>
//         )}
//       </div>
//     </div>
//   );
// };

// export default ServiceCompt;
// "use client";
// import React, { useEffect, useState } from "react";
// import Image from "next/image";
// import { format } from "date-fns";
// import { fr } from "date-fns/locale";
// import styles from "./styles.module.scss";

// interface Option {
//   id: string;
//   description: string;
//   amount: number;
// }

// interface ServiceComptProps {
//   name: string;
//   description: string;
//   imageUrl: string;
//   categories: string[];
//   startTime?: string | Date | null;
//   endTime?: string | Date | null;
//   options?: Option[];
//   totalAmount: number;
// }

// const ServiceCompt: React.FC<ServiceComptProps> = ({
//   name,
//   description,
//   imageUrl,
//   categories,
//   startTime,
//   endTime,
//   options = [],
//   totalAmount,
// }) => {
//   const [updatedTotalAmount, setUpdatedTotalAmount] = useState(totalAmount);

//   // Vérification si startTime et endTime sont valides
//   const isValidStartTime =
//     startTime instanceof Date && !isNaN(startTime.getTime());
//   const isValidEndTime = endTime instanceof Date && !isNaN(endTime.getTime());

//   const formattedStartTime = isValidStartTime
//     ? format(startTime as Date, "eeee dd MMMM yyyy 'de' HH:mm", { locale: fr })
//     : null;

//   const formattedEndTime = isValidEndTime
//     ? format(endTime as Date, "HH:mm", { locale: fr })
//     : null;

//   useEffect(() => {
//     setUpdatedTotalAmount(totalAmount); // Met à jour si totalAmount change
//   }, [totalAmount]);

//   useEffect(() => {
//     const totalOptionsAmount = options.reduce(
//       (acc, option) => acc + option.amount,
//       0
//     );
//     setUpdatedTotalAmount(totalAmount + totalOptionsAmount); // Calcul final du total
//   }, [totalAmount, options]); // Ce useEffect se déclenche à chaque fois que le totalAmount ou options changent

//   return (
//     <div className={styles.service_card}>
//       <div className={styles.service_card__img_content}>
//         <Image
//           src={imageUrl}
//           alt={name}
//           width={250}
//           height={250}
//           className={styles.service_card__img}
//         />
//       </div>

//       <div className={styles.service_card__infos_bloc}>
//         <h3 className={styles.service__title}>{name}</h3>
//         <p className={styles.service_item__description}>
//           {description?.split("\n").map((line, index) => (
//             <React.Fragment key={index}>
//               {line}
//               <br />
//             </React.Fragment>
//           ))}
//         </p>

//         <p className={styles.service__amount}>
//           <strong>Total :</strong>{" "}
//           {updatedTotalAmount ? updatedTotalAmount.toFixed(2) : "0.00"} €
//         </p>

//         <p className={styles.service__price}>
//           Catégories :{" "}
//           {categories.length > 0 ? categories.join(", ") : "Aucune"}
//         </p>

//         {options.length > 0 && (
//           <div className={styles.service__options}>
//             <strong>Options incluses :</strong>
//             <ul>
//               {options.map((option) => (
//                 <li key={option.id}>
//                   <strong>{option.description} :</strong>{" "}
//                   {option.amount.toFixed(2)} €
//                 </li>
//               ))}
//             </ul>
//           </div>
//         )}

//         {formattedStartTime && formattedEndTime ? (
//           <p className={styles.service__date}>
//             <strong>Réservé pour :</strong> {formattedStartTime} à{" "}
//             {formattedEndTime}
//           </p>
//         ) : (
//           <p className={styles.service__date}>Pas encore réservé</p>
//         )}
//       </div>
//     </div>
//   );
// };

// export default ServiceCompt;
// "use client";
// import React, { useEffect, useState } from "react";
// import Image from "next/image";
// import { format } from "date-fns";
// import { fr } from "date-fns/locale";
// import styles from "./styles.module.scss";

// interface Option {
//   id: string;
//   description: string;
//   amount: number;
// }

// interface ServiceComptProps {
//   name: string;
//   description: string;
//   imageUrl: string;
//   categories: string[];
//   startTime?: string | Date | null;
//   endTime?: string | Date | null;
//   options?: Option[];
//   totalAmount: number; // ⚠️ Inclut déjà le prix des options !
// }

// const ServiceCompt: React.FC<ServiceComptProps> = ({
//   name,
//   description,
//   imageUrl,
//   categories,
//   startTime,
//   endTime,
//   options = [],
//   totalAmount, // Ce total doit déjà inclure les options
// }) => {
//   const [updatedTotalAmount, setUpdatedTotalAmount] = useState(totalAmount);

//   useEffect(() => {
//     console.log("🔄 Mise à jour totalAmount:", totalAmount);
//     setUpdatedTotalAmount(totalAmount);
//   }, [totalAmount]);

//   useEffect(() => {
//     console.log("🛠 Options mises à jour:", options);

//     // Vérification si les montants des options sont bien inclus
//     const optionsTotal = options.reduce(
//       (acc, option) => acc + option.amount,
//       0
//     );
//     console.log("📊 Somme des options:", optionsTotal);

//     // Vérifie si le totalAmount contient déjà les options
//     if (updatedTotalAmount !== totalAmount) {
//       setUpdatedTotalAmount(totalAmount);
//     }
//     // eslint-disable-next-line react-hooks/exhaustive-deps
//   }, [options]);

//   return (
//     <div className={styles.service_card}>
//       <div className={styles.service_card__img_content}>
//         <Image
//           src={imageUrl}
//           alt={name}
//           width={250}
//           height={250}
//           className={styles.service_card__img}
//         />
//       </div>

//       <div className={styles.service_card__infos_bloc}>
//         <h3 className={styles.service__title}>{name}</h3>
//         <p className={styles.service_item__description}>
//           {description?.split("\n").map((line, index) => (
//             <React.Fragment key={index}>
//               {line}
//               <br />
//             </React.Fragment>
//           ))}
//         </p>

//         <p className={styles.service__amount}>
//           <strong>Total :</strong> {updatedTotalAmount.toFixed(2)} €
//         </p>

//         <p className={styles.service__price}>
//           Catégories :{" "}
//           {categories.length > 0 ? categories.join(", ") : "Aucune"}
//         </p>

//         {options.length > 0 && (
//           <div className={styles.service__options}>
//             <strong>Options incluses :</strong>
//             <ul>
//               {options.map((option) => (
//                 <li key={option.id}>
//                   <strong>{option.description} :</strong>{" "}
//                   {option.amount.toFixed(2)} €
//                 </li>
//               ))}
//             </ul>
//           </div>
//         )}

//         {startTime && endTime ? (
//           <p className={styles.service__date}>
//             <strong>Réservé pour :</strong>{" "}
//             {format(new Date(startTime), "eeee dd MMMM yyyy 'de' HH:mm", {
//               locale: fr,
//             })}{" "}
//             à {format(new Date(endTime), "HH:mm", { locale: fr })}
//           </p>
//         ) : (
//           <p className={styles.service__date}>Pas encore réservé</p>
//         )}
//       </div>
//     </div>
//   );
// };

// export default ServiceCompt;
///////////////////////////////////
"use client";
import React from "react";
import Image from "next/image";
import { format } from "date-fns";
import { fr } from "date-fns/locale";
import styles from "./styles.module.scss";

interface Option {
  id: string;
  description: string;
  amount: number;
}

interface ServiceComptProps {
  name: string;
  description: string;
  imageUrl: string;
  categories: string[];
  startTime?: string | Date | null;
  endTime?: string | Date | null;
  options?: Option[];
  totalAmount: number; // Le total est déjà calculé dans Zustand
}

const ServiceCompt: React.FC<ServiceComptProps> = ({
  name,
  description,
  imageUrl,
  categories,
  startTime,
  endTime,
  options = [],
  totalAmount,
}) => {
  return (
    <div className={styles.service_card}>
      <div className={styles.service_card__img_content}>
        <Image
          src={imageUrl}
          alt={name}
          width={250}
          height={250}
          className={styles.service_card__img}
        />
      </div>

      <div className={styles.service_card__infos_bloc}>
        <h3 className={styles.service__title}>{name}</h3>
        <p className={styles.service_item__description}>
          {description?.split("\n").map((line, index) => (
            <React.Fragment key={index}>
              {line}
              <br />
            </React.Fragment>
          ))}
        </p>

        <p className={styles.service__amount}>
          <strong>Total :</strong> {totalAmount.toFixed(2)} €
        </p>

        <p className={styles.service__price}>
          Catégories :{" "}
          {categories.length > 0 ? categories.join(", ") : "Aucune"}
        </p>

        {options.length > 0 && (
          <div className={styles.service__options}>
            <strong>Options incluses :</strong>
            <ul>
              {options.map((option) => (
                <li key={option.id}>
                  <strong>{option.description} :</strong>{" "}
                  {option.amount.toFixed(2)} €
                </li>
              ))}
            </ul>
          </div>
        )}

        {startTime && endTime ? (
          <p className={styles.service__date}>
            <strong>Réservé pour :</strong>{" "}
            {format(new Date(startTime), "eeee dd MMMM yyyy 'de' HH:mm", {
              locale: fr,
            })}{" "}
            à {format(new Date(endTime), "HH:mm", { locale: fr })}
          </p>
        ) : (
          <p className={styles.service__date}>Pas encore réservé</p>
        )}
      </div>
    </div>
  );
};

export default ServiceCompt;
