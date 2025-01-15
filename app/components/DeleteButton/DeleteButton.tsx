import React from "react";

type DeleteButtonProps = {
  id: string;
};

const DeleteButton: React.FC<DeleteButtonProps> = ({ id }) => {
  const handleDelete = async () => {
    try {
      const response = await fetch(`/api/deleteUser`, {
        method: "DELETE",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ id }),
      });

      if (response.ok) {
        window.location.reload();
      } else {
        const errorData = await response.json();
        console.error(errorData);
      }
    } catch (error) {
      console.error("Error deleting user:", error);
    }
  };

  return (
    <form onSubmit={handleDelete}>
      <button type="submit">Delete User</button>
    </form>
  );
};

export default DeleteButton;
