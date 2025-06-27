import React from "react";

type DeleteButtonProps = {
  id: string | number;
  type: "user" | "client";
  onDeleted?: () => void;
  className?: string;
};

const DeleteButton: React.FC<DeleteButtonProps> = ({
  id,
  type,
  onDeleted,
  className,
}) => {
  const handleDelete = async () => {
    if (!confirm("Supprimer cet élément ?")) return;
    try {
      const response = await fetch(
        `/api/${type === "user" ? "users" : "clients"}/${id}`,
        {
          method: "DELETE",
        }
      );
      if (response.ok) {
        if (onDeleted) onDeleted();
      } else {
        alert("Erreur lors de la suppression.");
      }
    } catch (error) {
      console.error(error);
      alert("Erreur lors de la suppression.");
    }
  };

  return (
    <button type="button" onClick={handleDelete} className={className}>
      Supprimer
    </button>
  );
};

export default DeleteButton;
