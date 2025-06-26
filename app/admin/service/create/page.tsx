// app/admin/services/create/page.tsx
"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

export default function CreateServicePage() {
  const [file, setFile] = useState<File | null>(null);
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [price, setPrice] = useState(0);
  const [defaultPrice, setDefaultPrice] = useState(0);
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const [categories, setCategories] = useState<string[]>([]);
  const [uploading, setUploading] = useState(false);
  const router = useRouter();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!file) return alert("Veuillez sélectionner une image.");
    setUploading(true);

    const formData = new FormData();
    formData.append("file", file);

    const uploadRes = await fetch("/api/admin/service/upload", {
      method: "POST",
      body: formData,
    });

    const { imageUrl } = await uploadRes.json();

    const res = await fetch("/api/admin/service/create", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        name,
        description,
        price,
        defaultPrice,
        imageUrl,
        categories,
      }),
    });

    if (res.ok) {
      router.push("/admin/services");
    } else {
      alert("Erreur lors de la création du service");
    }
    setUploading(false);
  };

  return (
    <form onSubmit={handleSubmit} className="max-w-xl mx-auto p-4 space-y-4">
      <input
        type="text"
        placeholder="Nom du service"
        value={name}
        onChange={(e) => setName(e.target.value)}
        required
        className="w-full p-2 border"
      />
      <textarea
        placeholder="Description"
        value={description}
        onChange={(e) => setDescription(e.target.value)}
        required
        className="w-full p-2 border"
      />
      <input
        type="number"
        placeholder="Prix"
        value={price}
        onChange={(e) => setPrice(Number(e.target.value))}
        required
        className="w-full p-2 border"
      />
      <input
        type="number"
        placeholder="Prix par défaut"
        value={defaultPrice}
        onChange={(e) => setDefaultPrice(Number(e.target.value))}
        required
        className="w-full p-2 border"
      />
      <input
        type="file"
        accept="image/*"
        onChange={(e) => setFile(e.target.files?.[0] || null)}
        required
      />
      <button
        type="submit"
        disabled={uploading}
        className="bg-blue-600 text-white px-4 py-2 rounded"
      >
        {uploading ? "Chargement..." : "Créer le service"}
      </button>
    </form>
  );
}
