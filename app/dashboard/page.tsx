"use client";

import {
  getLastServices,
  getReachedServices,
  getTotalTransactionAmount,
  getTotalTransactionCount,
} from "@/actions/actions";
import { useUser } from "@clerk/nextjs";
import React, { useState, useEffect } from "react";
import Wrapper from "../components/Wrapper/Wrapper";
import { FaMoneyCheckAlt } from "react-icons/fa";
import { MdOutlineDone } from "react-icons/md";
import { FaSailboat } from "react-icons/fa6";
import Link from "next/link";
import ServiceItem from "../components/ServiceItem/ServiceItem";
import { Service } from "@/type";

const DashboardPage = () => {
  const { user } = useUser();
  const [totalAmount, setTotalAmount] = useState<number | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [totalCount, setTotalCount] = useState<number | null>(null);
  const [reachedServicesRatio, setReachedServicesRatio] = useState<
    string | null
  >(null);
  //   const [budgetData, setBudgetData] = useState<any[]>([]);
  //   const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [services, setService] = useState<Service[]>([]);

  const fetchData = async () => {
    setIsLoading(true);
    try {
      const email = user?.primaryEmailAddress?.emailAddress as string;
      if (email) {
        const amount = await getTotalTransactionAmount(email);
        const count = await getTotalTransactionCount(email);
        const reachedServices = await getReachedServices(email);
        const lastServices = await getLastServices(email);
        setTotalAmount(amount);
        setTotalAmount(amount);
        setTotalCount(count);
        setReachedServicesRatio(reachedServices);
        setService(lastServices);
        setIsLoading(false);
      }
    } catch (error) {
      console.error("Erreur lors de la récupération des données", error);
    }
  };

  useEffect(() => {
    fetchData();
    // eslint-disable-next-line
  }, [user]);

  return (
    <Wrapper>
      {isLoading ? (
        <div className="loading">
          <span>Loading ...</span>
        </div>
      ) : (
        <div className="dashboard_container">
          {/*  */}
          <div className="dashboard_container__box">
            <div className="__box">
              <span id="total_transactions">Total des Transactions</span>
              <span className="item" id="box_total_amount">
                {totalAmount != null ? `${totalAmount}€` : "N/A"}
              </span>
            </div>
            <FaMoneyCheckAlt />
          </div>

          {/*  */}

          <div className="dashboard_container__box">
            <div className="__box">
              <span id="total_transactions">Nombre de Transactions</span>
              <span className="item" id="total_transactions">
                {totalCount != null ? `${totalCount}` : "N/A"}
              </span>
            </div>
            <MdOutlineDone />
          </div>

          {/*  */}

          <div className="dashboard_container__box">
            <div className="__box">
              <span id="total_transactions">Services atteints</span>
              <span className="item" id="box_total_amount">
                {reachedServicesRatio || "N/A"}
              </span>
            </div>
            <FaSailboat />
          </div>

          <div className="last_services">
            <h3 className="last_services__container">Derniers services</h3>
            <ul className="last_services__box">
              {services.map((service) => (
                <Link href={`/manage/${service.id}`} key={service.id}>
                  <ServiceItem service={service} enableHover={1}></ServiceItem>
                </Link>
              ))}
            </ul>
          </div>
        </div>
      )}
    </Wrapper>
  );
};

export default DashboardPage;
