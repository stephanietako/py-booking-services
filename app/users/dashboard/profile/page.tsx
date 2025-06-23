"use client";

import React, { useEffect, useState } from "react";
import { useUser } from "@clerk/nextjs";
import { BookingWithDetails } from "@/types";
import Wrapper from "@/app/components/Wrapper/Wrapper";

export default function ProfileForm() {
  const { user } = useUser();
  const clerkUserId = user?.id;

  // Protection hydratation
  const [isClient, setIsClient] = useState(false);

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

  // Protection hydratation
  useEffect(() => {
    setIsClient(true);
  }, []);

  useEffect(() => {
    if (!clerkUserId || !isClient) return;

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
        const parsed = data.map((booking) => ({
          ...booking,
          startTime: new Date(booking.startTime),
          endTime: new Date(booking.endTime),
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
  }, [clerkUserId, isClient]);

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
      setInitialForm(form);
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

  // Protection hydratation - ne pas rendre avant le client
  if (!isClient) {
    return (
      <Wrapper>
        <div
          style={{
            display: "flex",
            justifyContent: "center",
            alignItems: "center",
            minHeight: "50vh",
          }}
        >
          <p>Chargement du profil...</p>
        </div>
      </Wrapper>
    );
  }

  if (!clerkUserId) return <p>Vous devez être connecté.</p>;

  return (
    <Wrapper>
      <div
        className="profile_container"
        style={{
          maxWidth: "100%",
          padding: 20,
          marginTop: "7rem",
          border: "2px solid rgb(221, 221, 221)",
          borderRadius: 8,
          display: "flex",
          flexDirection: "column",
          justifyContent: "center",
          alignItems: "center",
          margin: "10rem 2rem",
          gap: 20,
        }}
      >
        <h1>Mon profil</h1>
        <div
          className="profile_form"
          style={{
            width: "100%",
            padding: "20px",
            border: "2px solid rgb(221, 221, 221)",
            borderRadius: " 8px",
            display: "flex",
            color: "aqua",
            flexDirection: "column",
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
            <h2> Bonjour {form.userName || user?.fullName || "utilisateur"}</h2>
            <p style={{ color: "whitesmoke" }}>
              Voici vos informations de profil. Vous pouvez les modifier et
              mettre à jour votre profil.
            </p>
            <form
              onSubmit={handleSubmit}
              style={{
                maxWidth: "50%",
                // border: "5px solid yellow",
                display: "flex",
                width: "100%",
                height: "100%",
                justifyContent: "center",
                alignContent: "center",
                flexDirection: "column",
              }}
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
          <section>
            <h3>Mes réservations</h3>
            <div
              className="bookings_bloc"
              style={{
                border: "4px solid blue",
                borderRadius: 6,
                padding: 16,
                backgroundColor: "aliceblue",
                display: "flex",
                flexDirection: "column",
                justifyContent: "space-between",
                margin: "2rem",
                alignItems: "center",
                width: "100%",
                height: "auto",
              }}
            >
              <h2>Mes réservations</h2>
              {loadingBookings && <p>Chargement des réservations...</p>}
              {errorBookings && (
                <p style={{ color: "red" }}>Erreur : {errorBookings}</p>
              )}
              {!loadingBookings && bookings.length === 0 && (
                <p>Vous n&apos;avez aucune réservation pour le moment.</p>
              )}
              {!loadingBookings && bookings.length > 0 && (
                <ul
                  style={{
                    // border: "4px solid blue",
                    borderRadius: 6,
                    padding: "2rem",
                    marginBottom: 12,
                    display: "flex",
                    justifyContent: "space-evenly",
                    alignItems: "center",
                    width: "100%",
                    height: "auto",
                    flexWrap: "wrap",
                  }}
                >
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
                        <strong>Service :</strong>{" "}
                        {booking.service?.name || "—"}
                      </p>
                      <p>
                        <strong>Date :</strong>{" "}
                        <span suppressHydrationWarning>
                          {booking.startTime.toLocaleDateString("fr-FR", {
                            dateStyle: "long",
                          })}
                        </span>
                      </p>
                      <p>
                        <strong>Heure :</strong>{" "}
                        <span suppressHydrationWarning>
                          {booking.startTime.toLocaleTimeString("fr-FR", {
                            timeStyle: "short",
                          })}{" "}
                          -{" "}
                          {booking.endTime.toLocaleTimeString("fr-FR", {
                            timeStyle: "short",
                          })}
                        </span>
                      </p>
                      <p>
                        <strong>Statut :</strong> {booking.status}
                      </p>
                      <p>
                        <strong>Montant bateau :</strong>{" "}
                        <span suppressHydrationWarning>
                          {booking.boatAmount.toLocaleString("fr-FR", {
                            style: "currency",
                            currency: booking.service?.currency || "EUR",
                          })}
                        </span>
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
                                    <span suppressHydrationWarning>
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
                                <span suppressHydrationWarning>
                                  {totalOptionsAmount.toLocaleString("fr-FR", {
                                    style: "currency",
                                    currency:
                                      booking.service?.currency || "EUR",
                                  })}
                                </span>
                              </p>
                            </>
                          );
                        })()}
                    </li>
                  ))}
                </ul>
              )}
            </div>
          </section>
        </div>
      </div>
    </Wrapper>
  );
}
