// // app/my-bookings/BookingSummary.tsx
// "use client";

// import { Booking } from "@/types";
// import OptionList from "../OptionSelector/OptionSelector";
// import styles from "./styles.module.scss";

// interface Props {
//   booking: Booking;
// }

// export default function BookingSummary({ booking }: Props) {
//   const formatter = new Intl.NumberFormat("fr-FR", {
//     style: "currency",
//     currency: booking.service?.currency || "EUR",
//   });
//   if (!booking.service) return <p>Service de réservation introuvable.</p>;
//   const onboardTotal =
//     booking.bookingOptions?.reduce(
//       (sum, opt) =>
//         opt.option?.payableOnline ? sum : sum + opt.unitPrice * opt.quantity,
//       0
//     ) ?? 0;

//   return (
//     <div className={styles.summaryBox}>
//       <h2>Réservation</h2>
//       <p>Bateau : {formatter.format(booking.boatAmount)}</p>
//       <OptionList options={booking.bookingOptions || []} />
//       <p>Total à payer à bord : {formatter.format(onboardTotal)}</p>
//       <p className={styles.notice}>
//         Conditions d&apos;annulation : voir les <a href="/cgu">CGU</a>
//       </p>
//     </div>
//   );
// }
