import React, { Suspense } from "react";
import ServiceList from "../components/ServiceList/ServiceList";

const serviceList = () => {
  return (
    <div>
      <Suspense fallback={<p>Chargement des services...</p>}>
        <ServiceList />
      </Suspense>
    </div>
  );
};

export default serviceList;
