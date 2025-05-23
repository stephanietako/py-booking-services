import React, { ReactNode } from "react";
import { motion } from "framer-motion";
import { AiOutlineClose } from "react-icons/ai";
// Styles
import styles from "./styles.module.scss";

interface ModalProps {
  isOpen: boolean;
  onClose: () => void;
  title: string;
  children: ReactNode;
}

const Modal: React.FC<ModalProps> = ({ isOpen, onClose, title, children }) => {
  if (!isOpen) return null;

  return (
    <div className={styles.modalOverlay} onClick={onClose}>
      <motion.div
        className={styles.modal}
        initial={{ scale: 0.8, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        exit={{ scale: 0.8, opacity: 0 }}
        transition={{ duration: 0.3, ease: "easeOut" }}
        onClick={(e) => e.stopPropagation()} // Empêche la fermeture si on clique dans le modal
      >
        <div className={styles.modalContent}>
          <button onClick={onClose} className={styles.closeButton}>
            <AiOutlineClose size={24} />
          </button>
          <h3 className={styles.modalTitle}>{title}</h3>
          <div className={styles.modalBody}>
            {/* Assurez-vous que l'image est bien rendue ici */}
            <div className={styles.modalImage}>{children}</div>
          </div>
        </div>
      </motion.div>
    </div>
  );
};

export default Modal;
