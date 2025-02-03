"use client";

import React, { useEffect, useState, useCallback } from "react";
import { Service } from "@/types";
import { getUserBookings } from "@/actions/bookings";
import ServiceItem from "../components/ServiceItem/ServiceItem";
import styles from "./styles.module.scss";
import Wrapper from "@/app/components/Wrapper/Wrapper";
import Link from "next/link";
import { useUser } from "@clerk/nextjs";

const BookingsPage: React.FC = () => {
  const { user } = useUser();
  const [services, setServices] = useState<Service[]>([]);
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string>("");

  const fetchBookings = useCallback(async () => {
    if (!user) {
      setError("Vous devez être connecté pour voir vos réservations.");
      return;
    }

    setLoading(true);
    try {
      const bookings = await getUserBookings(user.id);
      const bookedServices = bookings.map((booking) => booking.service);
      setServices(bookedServices);
    } catch (error) {
      console.error("Erreur lors du chargement des réservations:", error);
      setError("Impossible de charger vos réservations.");
    } finally {
      setLoading(false);
    }
  }, [user]);

  useEffect(() => {
    fetchBookings();
  }, [fetchBookings]);

  return (
    <Wrapper>
      <div className={styles.container}>
        <h1 className={styles.title}>Mes Réservations</h1>
        {error && <p className={styles.error}>{error}</p>}
        <h2>Services réservés</h2>
        <ul className={styles.list_services}>
          {loading ? (
            <div>Chargement...</div>
          ) : services.length === 0 ? (
            <div>Aucune réservation</div>
          ) : (
            services.map((service) => (
              <Link key={service.id} href={`/bookings/manage/${service.id}`}>
                <ServiceItem service={service} enableHover={1}></ServiceItem>
              </Link>
            ))
          )}
        </ul>
      </div>
    </Wrapper>
  );
};

export default BookingsPage;
