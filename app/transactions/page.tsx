// "use client";

// import React, { useState, useEffect } from "react";
// import { useUser } from "@clerk/nextjs";
// import { getTransactionsByEmailAndPeriod } from "@/actions/actions";
// import Wrapper from "../components/Wrapper/Wrapper";
// import { Transaction } from "@/types";
// import TransactionItem from "../components/TransactionItem/TransactionItem";

// const TransactionsPage = () => {
//   const { user } = useUser();
//   const [transactions, setTransactions] = useState<Transaction[]>([]);
//   const [loading, setLoading] = useState<boolean>(false);
//   // const [period, setPeriod] = useState<string>("last30");
//   // const [error, setError] = useState<string | null>(null);

//   const fetchTransactions = async (period: string) => {
//     if (user?.primaryEmailAddress?.emailAddress) {
//       setLoading(true);
//       try {
//         const transactionData = await getTransactionsByEmailAndPeriod(
//           user?.primaryEmailAddress?.emailAddress,
//           period
//         );
//         setTransactions(transactionData);
//         setLoading(false);
//       } catch (err) {
//         console.error("Erreur lors de la récupération des transactions: ", err);
//       }
//     }
//   };

//   useEffect(() => {
//     fetchTransactions("last30");
//     // eslint-disable-next-line react-hooks/exhaustive-deps
//   }, [user?.primaryEmailAddress?.emailAddress]);

//   return (
//     <Wrapper>
//       <div className="transactions_select">
//         <select
//           className="transactions_select__input"
//           defaultValue="last30"
//           onChange={(e) => fetchTransactions(e.target.value)}
//         >
//           <option value="last7">Derniers 7 jours</option>
//           <option value="last30">Derniers 30 jours</option>
//           <option value="last90">Derniers 90 jours</option>
//           <option value="last365">Derniers 365 jours</option>
//         </select>
//       </div>

//       <div className="transactions_container">
//         {loading ? (
//           <div className="flex justify-center items-center">
//             <span className="loading ">LOADING...</span>
//           </div>
//         ) : transactions.length === 0 ? (
//           <div className="loading_info">
//             <span>Aucune transaction à afficher</span>
//           </div>
//         ) : (
//           <ul className="list_transactions">
//             {transactions.map((transaction) => (
//               <TransactionItem
//                 key={transaction.id}
//                 transaction={transaction}
//               ></TransactionItem>
//             ))}
//           </ul>
//         )}
//       </div>
//     </Wrapper>
//   );
// };

// export default TransactionsPage;
// "use client";

// import React, { useState, useEffect } from "react";
// import { useUser } from "@clerk/nextjs";
// import { getTransactionsByEmailAndPeriod } from "@/actions/actions";
// import Wrapper from "../components/Wrapper/Wrapper";
// import { Transaction } from "@/types";
// import TransactionItem from "../components/TransactionItem/TransactionItem";

// const TransactionsPage = () => {
//   const { user } = useUser();
//   const [transactions, setTransactions] = useState<Transaction[]>([]);
//   const [loading, setLoading] = useState<boolean>(false);

//   // const fetchTransactions = async (period: string) => {
//   //   if (user?.id) {
//   //     // ✅ Utilisation correcte de Clerk user.id, qui correspond à clerkUserId en DB
//   //     setLoading(true);
//   //     try {
//   //       const transactionData = await getTransactionsByEmailAndPeriod(
//   //         user.id, // ✅ Envoie de `user.id` (Clerk) qui correspond à `clerkUserId` (Prisma)
//   //         period
//   //       );
//   //       setTransactions(transactionData);
//   //     } catch (err) {
//   //       console.error("Erreur lors de la récupération des transactions: ", err);
//   //     } finally {
//   //       setLoading(false);
//   //     }
//   //   }
//   // };
//   const fetchTransactions = async (period: string) => {
//     if (user?.id) {
//       setLoading(true);
//       try {
//         const transactionData = await getTransactionsByEmailAndPeriod(
//           user.id,
//           period
//         );
//         console.log("Données reçues dans le client:", transactionData); // ✅ DEBUG
//         setTransactions(transactionData);
//       } catch (err) {
//         console.error("Erreur lors de la récupération des transactions: ", err);
//       } finally {
//         setLoading(false);
//       }
//     }
//   };

//   useEffect(() => {
//     if (user?.id) {
//       fetchTransactions("last30");
//     }
//     // eslint-disable-next-line react-hooks/exhaustive-deps
//   }, [user?.id]); // ✅ Dépendance correcte sur `user.id`

//   return (
//     <Wrapper>
//       <div className="transactions_select">
//         <select
//           className="transactions_select__input"
//           defaultValue="last30"
//           onChange={(e) => fetchTransactions(e.target.value)}
//         >
//           <option value="last7">Derniers 7 jours</option>
//           <option value="last30">Derniers 30 jours</option>
//           <option value="last90">Derniers 90 jours</option>
//           <option value="last365">Derniers 365 jours</option>
//         </select>
//       </div>

//       <div className="transactions_container">
//         {loading ? (
//           <div className="flex justify-center items-center">
//             <span className="loading ">LOADING...</span>
//           </div>
//         ) : transactions.length === 0 ? (
//           <div className="loading_info">
//             <span>Aucune transaction à afficher</span>
//           </div>
//         ) : (
//           <ul className="list_transactions">
//             {transactions.map((transaction) => (
//               <TransactionItem key={transaction.id} transaction={transaction} />
//             ))}
//           </ul>
//         )}
//       </div>
//     </Wrapper>
//   );
// };

// export default TransactionsPage;
"use client";

import React, { useState, useEffect } from "react";
import { useUser } from "@clerk/nextjs";
import { getTransactionsByEmailAndPeriod } from "@/actions/actions";
import Wrapper from "../components/Wrapper/Wrapper";
import { Transaction } from "@/types";
import TransactionItem from "../components/TransactionItem/TransactionItem";

const TransactionsPage = () => {
  const { user } = useUser();
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [loading, setLoading] = useState<boolean>(false);
  const [period, setPeriod] = useState<string>("last30");
  const [error, setError] = useState<string | null>(null);

  const fetchTransactions = async (period: string) => {
    if (user?.id) {
      setLoading(true);
      try {
        const transactionData = await getTransactionsByEmailAndPeriod(
          user.id,
          period
        );
        console.log("Données reçues dans le client:", transactionData);
        setTransactions(transactionData);
      } catch (err) {
        console.error("Erreur lors de la récupération des transactions: ", err);
        setError("Impossible de récupérer les transactions.");
      } finally {
        setLoading(false);
      }
    }
  };

  useEffect(() => {
    if (user?.id) {
      fetchTransactions("last30");
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user?.id]);

  return (
    <Wrapper>
      <div className="transactions_select">
        <select
          className="transactions_select__input"
          value={period}
          onChange={(e) => setPeriod(e.target.value)}
        >
          <option value="last7">Derniers 7 jours</option>
          <option value="last30">Derniers 30 jours</option>
          <option value="last90">Derniers 90 jours</option>
          <option value="last365">Derniers 365 jours</option>
        </select>
      </div>

      <div className="transactions_container">
        {loading ? (
          <div className="flex justify-center items-center">
            <span className="loading ">LOADING...</span>
          </div>
        ) : error ? (
          <div className="error">{error}</div>
        ) : transactions.length === 0 ? (
          <div className="loading_info">
            <span>Aucune transaction à afficher</span>
          </div>
        ) : (
          <ul className="list_transactions">
            {transactions.map((transaction) => (
              <TransactionItem key={transaction.id} transaction={transaction} />
            ))}
          </ul>
        )}
      </div>
    </Wrapper>
  );
};

export default TransactionsPage;
