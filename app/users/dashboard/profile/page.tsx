// "use client";

// import React, { useEffect, useState } from "react";
// import { useUser } from "@clerk/nextjs";
// import { BookingWithDetails } from "@/types";
// import Wrapper from "@/app/components/Wrapper/Wrapper";

// export default function ProfileForm() {
//   const { user } = useUser();
//   const clerkUserId = user?.id;

//   const [form, setForm] = useState({
//     userName: "",
//     userEmail: "",
//     userPhone: "",
//     userDescription: "",
//   });

//   const [loading, setLoading] = useState(false);
//   const [error, setError] = useState<string | null>(null);
//   const [success, setSuccess] = useState(false);

//   const [bookings, setBookings] = useState<BookingWithDetails[]>([]);
//   const [loadingBookings, setLoadingBookings] = useState(false);
//   const [errorBookings, setErrorBookings] = useState<string | null>(null);

//   useEffect(() => {
//     if (!clerkUserId) return;

//     async function fetchBookings() {
//       setLoadingBookings(true);
//       setErrorBookings(null);

//       try {
//         const res = await fetch(`/api/bookings/profile`);
//         if (!res.ok)
//           throw new Error("Erreur lors du chargement des réservations");

//         const data: BookingWithDetails[] = await res.json();

//         const parsed = data.map((b) => ({
//           ...b,
//           startTime: new Date(b.startTime),
//           endTime: new Date(b.endTime),
//         }));

//         setBookings(parsed);
//       } catch (err) {
//         setErrorBookings(err instanceof Error ? err.message : String(err));
//       } finally {
//         setLoadingBookings(false);
//       }
//     }

//     fetchBookings();
//   }, [clerkUserId]);

//   function handleChange(
//     e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
//   ) {
//     const { name, value } = e.target;
//     setForm((prev) => ({ ...prev, [name]: value }));
//   }

//   async function handleSubmit(e: React.FormEvent) {
//     e.preventDefault();
//     setLoading(true);
//     setError(null);
//     setSuccess(false);

//     try {
//       const res = await fetch(`/api/users/${clerkUserId}`, {
//         method: "PUT",
//         headers: { "Content-Type": "application/json" },
//         body: JSON.stringify(form),
//       });

//       if (!res.ok) {
//         const errData = await res.json();
//         throw new Error(errData.error || "Erreur lors de la mise à jour");
//       }

//       setSuccess(true);
//     } catch (err) {
//       setError(err instanceof Error ? err.message : String(err));
//     } finally {
//       setLoading(false);
//     }
//   }

//   if (!clerkUserId) return <p>Vous devez être connecté.</p>;

//   return (
//     <>
//       <Wrapper>
//         <div
//           className="profile-container"
//           style={{
//             maxWidth: "100%",
//             padding: 20,
//             marginTop: "7rem",
//             border: "2px solid #ddd",
//             borderRadius: 8,
//             display: "flex",
//             flexDirection: "column",
//             justifyContent: "center",
//             alignItems: "center",
//             margin: "7rem 2rem",
//             gap: 20,
//           }}
//         >
//           <h1>Mon profil</h1>
//           <div
//             className="profile-form"
//             style={{
//               maxWidth: 1200,
//               padding: 20,
//               border: "2px solid #ddd",
//               borderRadius: 8,
//               display: "flex",
//               color: "aqua",
//             }}
//           >
//             <div
//               className="form-container"
//               style={{
//                 maxWidth: "100%",
//                 padding: 20,
//                 border: "2px solid red",
//                 borderRadius: 8,
//                 display: "flex",
//                 flexDirection: "column",
//                 justifyContent: "center",
//                 alignItems: "center",
//                 gap: 20,
//               }}
//             >
//               Bonjour {form.userName || user?.fullName || "utilisateur"} !
//               <p>
//                 Voici vos informations de profil. Vous pouvez les modifier et
//                 mettre à jour votre profil.
//               </p>
//               <form
//                 onSubmit={handleSubmit}
//                 style={{ maxWidth: 400, margin: "auto" }}
//               >
//                 {loading && <p>Chargement...</p>}
//                 {error && <p style={{ color: "red" }}>{error}</p>}
//                 {success && (
//                   <p style={{ color: "green" }}>
//                     Profil mis à jour avec succès !
//                   </p>
//                 )}

//                 <div>
//                   <label>Nom</label>
//                   <input
//                     type="text"
//                     name="userName"
//                     value={form.userName}
//                     onChange={handleChange}
//                     required
//                   />
//                 </div>

//                 <div>
//                   <label>Email</label>
//                   <input
//                     type="email"
//                     name="userEmail"
//                     value={form.userEmail}
//                     onChange={handleChange}
//                     required
//                     disabled
//                   />
//                 </div>

//                 <div>
//                   <label>Téléphone</label>
//                   <input
//                     type="tel"
//                     name="userPhone"
//                     value={form.userPhone}
//                     onChange={handleChange}
//                   />
//                 </div>

//                 <div>
//                   <label>Description</label>
//                   <textarea
//                     name="userDescription"
//                     value={form.userDescription}
//                     onChange={handleChange}
//                   />
//                 </div>

//                 <button type="submit" disabled={loading}>
//                   Mettre à jour
//                 </button>
//               </form>
//             </div>
//             <section style={{ maxWidth: 600, margin: "40px auto" }}>
//               <h2>Mes réservations</h2>

//               {loadingBookings && <p>Chargement des réservations...</p>}
//               {errorBookings && (
//                 <p style={{ color: "red" }}>Erreur : {errorBookings}</p>
//               )}

//               {!loadingBookings && bookings.length === 0 && (
//                 <p>Vous n’avez aucune réservation pour le moment.</p>
//               )}

//               {!loadingBookings && bookings.length > 0 && (
//                 <ul style={{ listStyle: "none", padding: 0 }}>
//                   {bookings.map((booking) => (
//                     <li
//                       key={booking.id}
//                       style={{
//                         border: "1px solid #ccc",
//                         borderRadius: 6,
//                         padding: 16,
//                         marginBottom: 12,
//                         backgroundColor: "#fafafa",
//                       }}
//                     >
//                       <p>
//                         <strong>Service :</strong>{" "}
//                         {booking.service?.name || "—"}
//                       </p>
//                       <p>
//                         <strong>Date :</strong>{" "}
//                         {booking.startTime.toLocaleDateString("fr-FR", {
//                           dateStyle: "long",
//                         })}
//                       </p>
//                       <p>
//                         <strong>Heure :</strong>{" "}
//                         {booking.startTime.toLocaleTimeString("fr-FR", {
//                           timeStyle: "short",
//                         })}{" "}
//                         -{" "}
//                         {booking.endTime.toLocaleTimeString("fr-FR", {
//                           timeStyle: "short",
//                         })}
//                       </p>
//                       <p>
//                         <strong>Statut :</strong> {booking.status}
//                       </p>
//                       <p>
//                         <strong>Montant bateau :</strong>{" "}
//                         {booking.boatAmount.toLocaleString("fr-FR", {
//                           style: "currency",
//                           currency: booking.service?.currency || "EUR",
//                         })}
//                       </p>

//                       {booking.description && (
//                         <p>
//                           <strong>Note client :</strong> {booking.description}
//                         </p>
//                       )}
//                       {booking.bookingOptions.length > 0 &&
//                         (() => {
//                           const totalOptionsAmount =
//                             booking.bookingOptions.reduce(
//                               (sum, opt) =>
//                                 sum +
//                                 (Number(opt.option.unitPrice) || 0) *
//                                   (Number(opt.quantity) || 0),
//                               0
//                             );
//                           return (
//                             <>
//                               <strong
//                                 style={{
//                                   display: "block",
//                                   marginTop: 12,
//                                   marginBottom: 6,
//                                 }}
//                               >
//                                 Options :
//                               </strong>
//                               <ul style={{ paddingLeft: 20, marginBottom: 8 }}>
//                                 {booking.bookingOptions.map((opt) => (
//                                   <li
//                                     key={opt.id}
//                                     style={{
//                                       marginBottom: 4,
//                                       fontSize: 14,
//                                       color: "#333",
//                                       display: "flex",
//                                       justifyContent: "space-between",
//                                       maxWidth: 400,
//                                     }}
//                                   >
//                                     <span>
//                                       {opt.option.label} x {opt.quantity}
//                                     </span>
//                                     <span>
//                                       {(
//                                         (Number(opt.option.unitPrice) || 0) *
//                                         (Number(opt.quantity) || 0)
//                                       ).toLocaleString("fr-FR", {
//                                         style: "currency",
//                                         currency:
//                                           booking.service?.currency || "EUR",
//                                       })}
//                                     </span>
//                                   </li>
//                                 ))}
//                               </ul>
//                               <p
//                                 style={{
//                                   fontWeight: "bold",
//                                   borderTop: "1px solid #ddd",
//                                   paddingTop: 6,
//                                   maxWidth: 400,
//                                   marginBottom: 0,
//                                   color: "#222",
//                                 }}
//                               >
//                                 Total options :{" "}
//                                 {totalOptionsAmount.toLocaleString("fr-FR", {
//                                   style: "currency",
//                                   currency: booking.service?.currency || "EUR",
//                                 })}
//                               </p>
//                             </>
//                           );
//                         })()}
//                     </li>
//                   ))}
//                 </ul>
//               )}
//             </section>
//           </div>
//         </div>
//       </Wrapper>
//     </>
//   );
// }
"use client";

import React, { useEffect, useState } from "react";
import { useUser } from "@clerk/nextjs";
import { BookingWithDetails } from "@/types";
import Wrapper from "@/app/components/Wrapper/Wrapper";

export default function ProfileForm() {
  const { user } = useUser();
  const clerkUserId = user?.id;

  const [form, setForm] = useState({
    userName: "",
    userEmail: "",
    userPhone: "",
    userDescription: "",
  });

  const [initialForm, setInitialForm] = useState(form);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  const [bookings, setBookings] = useState<BookingWithDetails[]>([]);
  const [loadingBookings, setLoadingBookings] = useState(false);
  const [errorBookings, setErrorBookings] = useState<string | null>(null);

  useEffect(() => {
    if (!clerkUserId) return;

    async function fetchUserData() {
      try {
        const res = await fetch(`/api/users/${clerkUserId}`);
        if (!res.ok) throw new Error("Erreur lors du chargement du profil");

        const data = await res.json();
        const parsedForm = {
          userName: data.name || "",
          userEmail: data.email || "",
          userPhone: data.phoneNumber || "",
          userDescription: data.description || "",
        };

        setForm(parsedForm);
        setInitialForm(parsedForm);
      } catch (err) {
        setError(err instanceof Error ? err.message : String(err));
      }
    }

    async function fetchBookings() {
      setLoadingBookings(true);
      setErrorBookings(null);

      try {
        const res = await fetch(`/api/bookings/profile`);
        if (!res.ok)
          throw new Error("Erreur lors du chargement des réservations");

        const data: BookingWithDetails[] = await res.json();
        const parsed = data.map((b) => ({
          ...b,
          startTime: new Date(b.startTime),
          endTime: new Date(b.endTime),
        }));

        setBookings(parsed);
      } catch (err) {
        setErrorBookings(err instanceof Error ? err.message : String(err));
      } finally {
        setLoadingBookings(false);
      }
    }

    fetchUserData();
    fetchBookings();
  }, [clerkUserId]);

  function handleChange(
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError(null);
    setSuccess(false);

    try {
      const res = await fetch(`/api/users/${clerkUserId}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      });

      if (!res.ok) {
        const errData = await res.json();
        throw new Error(errData.error || "Erreur lors de la mise à jour");
      }

      setSuccess(true);
      setInitialForm(form); // mettre à jour l’état initial après une sauvegarde
    } catch (err) {
      setError(err instanceof Error ? err.message : String(err));
    } finally {
      setLoading(false);
    }
  }

  function isFormModified() {
    return (
      form.userName !== initialForm.userName ||
      form.userEmail !== initialForm.userEmail ||
      form.userPhone !== initialForm.userPhone ||
      form.userDescription !== initialForm.userDescription
    );
  }

  if (!clerkUserId) return <p>Vous devez être connecté.</p>;

  return (
    <Wrapper>
      <div
        className="profile-container"
        style={{
          maxWidth: "100%",
          padding: 20,
          marginTop: "7rem",
          border: "2px solid #ddd",
          borderRadius: 8,
          display: "flex",
          flexDirection: "column",
          justifyContent: "center",
          alignItems: "center",
          margin: "7rem 2rem",
          gap: 20,
        }}
      >
        <h1>Mon profil</h1>
        <div
          className="profile-form"
          style={{
            maxWidth: 1200,
            padding: 20,
            border: "2px solid #ddd",
            borderRadius: 8,
            display: "flex",
            color: "aqua",
          }}
        >
          <div
            className="form-container"
            style={{
              maxWidth: "100%",
              padding: 20,
              border: "2px solid red",
              borderRadius: 8,
              display: "flex",
              flexDirection: "column",
              justifyContent: "center",
              alignItems: "center",
              gap: 20,
            }}
          >
            Bonjour {form.userName || user?.fullName || "utilisateur"} !
            <p>
              Voici vos informations de profil. Vous pouvez les modifier et
              mettre à jour votre profil.
            </p>
            <form
              onSubmit={handleSubmit}
              style={{ maxWidth: 400, margin: "auto" }}
            >
              {loading && <p>Chargement...</p>}
              {error && <p style={{ color: "red" }}>{error}</p>}
              {success && (
                <p style={{ color: "green" }}>
                  Profil mis à jour avec succès !
                </p>
              )}

              <div>
                <label>Nom</label>
                <input
                  type="text"
                  name="userName"
                  value={form.userName}
                  onChange={handleChange}
                  required
                />
              </div>

              <div>
                <label>Email</label>
                <input
                  type="email"
                  name="userEmail"
                  value={form.userEmail}
                  onChange={handleChange}
                  required
                  disabled
                />
              </div>

              <div>
                <label>Téléphone</label>
                <input
                  type="tel"
                  name="userPhone"
                  value={form.userPhone}
                  onChange={handleChange}
                />
              </div>

              <div>
                <label>Description</label>
                <textarea
                  name="userDescription"
                  value={form.userDescription}
                  onChange={handleChange}
                />
              </div>

              <div style={{ display: "flex", justifyContent: "space-between" }}>
                <button type="submit" disabled={loading}>
                  Mettre à jour
                </button>

                {isFormModified() && (
                  <button
                    type="button"
                    onClick={() => setForm(initialForm)}
                    disabled={loading}
                    style={{ marginLeft: 10 }}
                  >
                    Annuler les modifications
                  </button>
                )}
              </div>
            </form>
          </div>

          {/* Réservations */}
          <section style={{ maxWidth: 600, margin: "40px auto" }}>
            <h2>Mes réservations</h2>
            {loadingBookings && <p>Chargement des réservations...</p>}
            {errorBookings && (
              <p style={{ color: "red" }}>Erreur : {errorBookings}</p>
            )}
            {!loadingBookings && bookings.length === 0 && (
              <p>Vous n’avez aucune réservation pour le moment.</p>
            )}
            {!loadingBookings && bookings.length > 0 && (
              <ul style={{ listStyle: "none", padding: 0 }}>
                {bookings.map((booking) => (
                  <li
                    key={booking.id}
                    style={{
                      border: "1px solid #ccc",
                      borderRadius: 6,
                      padding: 16,
                      marginBottom: 12,
                      backgroundColor: "#fafafa",
                    }}
                  >
                    <p>
                      <strong>Service :</strong> {booking.service?.name || "—"}
                    </p>
                    <p>
                      <strong>Date :</strong>{" "}
                      {booking.startTime.toLocaleDateString("fr-FR", {
                        dateStyle: "long",
                      })}
                    </p>
                    <p>
                      <strong>Heure :</strong>{" "}
                      {booking.startTime.toLocaleTimeString("fr-FR", {
                        timeStyle: "short",
                      })}{" "}
                      -{" "}
                      {booking.endTime.toLocaleTimeString("fr-FR", {
                        timeStyle: "short",
                      })}
                    </p>
                    <p>
                      <strong>Statut :</strong> {booking.status}
                    </p>
                    <p>
                      <strong>Montant bateau :</strong>{" "}
                      {booking.boatAmount.toLocaleString("fr-FR", {
                        style: "currency",
                        currency: booking.service?.currency || "EUR",
                      })}
                    </p>
                    {booking.description && (
                      <p>
                        <strong>Note client :</strong> {booking.description}
                      </p>
                    )}
                    {booking.bookingOptions.length > 0 &&
                      (() => {
                        const totalOptionsAmount =
                          booking.bookingOptions.reduce(
                            (sum, opt) =>
                              sum +
                              (Number(opt.option.unitPrice) || 0) *
                                (Number(opt.quantity) || 0),
                            0
                          );
                        return (
                          <>
                            <strong
                              style={{
                                display: "block",
                                marginTop: 12,
                                marginBottom: 6,
                              }}
                            >
                              Options :
                            </strong>
                            <ul style={{ paddingLeft: 20, marginBottom: 8 }}>
                              {booking.bookingOptions.map((opt) => (
                                <li
                                  key={opt.id}
                                  style={{
                                    marginBottom: 4,
                                    fontSize: 14,
                                    color: "#333",
                                    display: "flex",
                                    justifyContent: "space-between",
                                    maxWidth: 400,
                                  }}
                                >
                                  <span>
                                    {opt.option.label} x {opt.quantity}
                                  </span>
                                  <span>
                                    {(
                                      (Number(opt.option.unitPrice) || 0) *
                                      (Number(opt.quantity) || 0)
                                    ).toLocaleString("fr-FR", {
                                      style: "currency",
                                      currency:
                                        booking.service?.currency || "EUR",
                                    })}
                                  </span>
                                </li>
                              ))}
                            </ul>
                            <p
                              style={{
                                fontWeight: "bold",
                                borderTop: "1px solid #ddd",
                                paddingTop: 6,
                                maxWidth: 400,
                                marginBottom: 0,
                                color: "#222",
                              }}
                            >
                              Total options :{" "}
                              {totalOptionsAmount.toLocaleString("fr-FR", {
                                style: "currency",
                                currency: booking.service?.currency || "EUR",
                              })}
                            </p>
                          </>
                        );
                      })()}
                  </li>
                ))}
              </ul>
            )}
          </section>
        </div>
      </div>
    </Wrapper>
  );
}
