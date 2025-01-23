"use client";

import React, { useState } from "react";
import { Service } from "@/type";
import Modal from "../Modal/Modal";

interface AddServiceFormProps {
  services: Service[];
  selectedService: string;
  setSelectedService: (value: string) => void;
  handleAddService: () => Promise<void>;
}

const AddServiceForm: React.FC<AddServiceFormProps> = ({
  services,
  selectedService,
  setSelectedService,
  handleAddService,
}) => {
  const [isModalOpen, setIsModalOpen] = useState(false);
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  return (
    <div className="add_services">
      {/* Bouton pour ouvrir le modal */}
      <button
        onClick={() => setIsModalOpen(true)}
        className="btn_modal_service"
      >
        Cliquer ici pour choisir votre Service
      </button>

      {/* Modal pour sélectionner un service */}
      <Modal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        title="Choisir un service"
      >
        <h3 className="text_service__title">Tous nos services</h3>
        <p className="text_service">Faites votre choix</p>

        {/* Sélection du service */}
        <div className="service_input">
          <select
            value={selectedService}
            onChange={(e) => setSelectedService(e.target.value)}
            className={"service_input_select"}
            required
          >
            <option value="" disabled>
              Sélectionnez un service
            </option>
            {services.map((service) => (
              <option key={service.id} value={service.name}>
                {service.name} - {service.amount}€ ({service.description})
              </option>
            ))}
          </select>
          {errorMessage && <p className="error">{errorMessage}</p>}
          <button
            onClick={async () => {
              await handleAddService();
              setIsModalOpen(false);
            }}
            className="btn_handle_add_budget"
          >
            Ajouter le service
          </button>
        </div>
      </Modal>
    </div>
  );
};

export default AddServiceForm;
