import { useState, useEffect } from "react";
import { changeOpeningHours, getOpeningHours } from "@/actions/openingActions";
import { ServiceHours } from "@/type";

const generateTimeOptions = (): string[] => {
  return Array.from({ length: 19 }, (_, i) =>
    Array.from(
      { length: 2 },
      (_, j) =>
        `${(i + 5).toString().padStart(2, "0")}:${(j * 30)
          .toString()
          .padStart(2, "0")}`
    )
  ).flat();
};

const timeOptions = generateTimeOptions();

const ManageOpeningHours = () => {
  const [hours, setHours] = useState<ServiceHours[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    const fetchHours = async () => {
      setIsLoading(true);
      setError(null);

      try {
        const data = await getOpeningHours(); // Appel direct à la fonction du serveur
        setHours(data);
      } catch (err) {
        const errorMessage =
          err instanceof Error ? err.message : "Erreur inconnue";
        setError(errorMessage);
      } finally {
        setIsLoading(false);
      }
    };

    fetchHours();
  }, []);

  const handleInputChange = (
    index: number,
    field: "opening" | "closing",
    value: string
  ) => {
    const newHours = [...hours];
    newHours[index][field] = timeToNumber(value);
    setHours(newHours);
  };

  // const handleSubmit = async () => {
  //   setIsLoading(true);
  //   setError(null);

  //   try {
  //     await changeOpeningHours(hours); // Appel à l'action du serveur pour mettre à jour les horaires
  //     alert("Horaires mis à jour avec succès");
  //   } catch (err) {
  //     const errorMessage =
  //       err instanceof Error ? err.message : "Erreur inconnue";
  //     setError(errorMessage);
  //   } finally {
  //     setIsLoading(false);
  //   }
  // };
  const handleSubmit = async () => {
    setIsLoading(true);
    setError(null);

    try {
      // Validation de la structure des données
      hours.forEach((hour) => {
        console.log("Vérification de la structure:", hour);
        if (typeof hour.id !== "number")
          throw new Error(`id invalide: ${hour.id}`);
        if (typeof hour.dayOfWeek !== "string")
          throw new Error(`dayOfWeek invalide: ${hour.dayOfWeek}`);
        if (typeof hour.opening !== "number")
          throw new Error(`opening invalide: ${hour.opening}`);
        if (typeof hour.closing !== "number")
          throw new Error(`closing invalide: ${hour.closing}`);
        if (typeof hour.isClosed !== "boolean")
          throw new Error(`isClosed invalide: ${hour.isClosed}`);
      });

      await changeOpeningHours(hours); // Mettre à jour dans la base
      alert("Horaires mis à jour avec succès");
    } catch (err) {
      const errorMessage =
        err instanceof Error ? err.message : "Erreur inconnue";
      setError(errorMessage);
    } finally {
      setIsLoading(false);
    }
  };

  const timeToNumber = (time: string): number => {
    const [hours, minutes] = time.split(":").map(Number);
    return hours + minutes / 60;
  };

  const numberToTime = (time: number): string => {
    const hours = Math.floor(time);
    const minutes = Math.round((time - hours) * 60);
    return `${hours.toString().padStart(2, "0")}:${minutes
      .toString()
      .padStart(2, "0")}`;
  };

  return (
    <div>
      <h2>Gestion des horaires d&apos;ouverture</h2>
      <form
        onSubmit={(e) => {
          e.preventDefault();
          handleSubmit();
        }}
      >
        {hours.map((hour, index) => (
          <div key={hour.id}>
            <label>
              {hour.dayOfWeek}:
              <select
                value={numberToTime(hour.opening)}
                onChange={(e) =>
                  handleInputChange(index, "opening", e.target.value)
                }
              >
                {timeOptions.map((time) => (
                  <option key={time} value={time}>
                    {time}
                  </option>
                ))}
              </select>
              -
              <select
                value={numberToTime(hour.closing)}
                onChange={(e) =>
                  handleInputChange(index, "closing", e.target.value)
                }
              >
                {timeOptions.map((time) => (
                  <option key={time} value={time}>
                    {time}
                  </option>
                ))}
              </select>
            </label>
          </div>
        ))}
        <button type="submit" disabled={isLoading}>
          {isLoading ? "Mise à jour en cours..." : "Mettre à jour"}
        </button>
      </form>

      {error && <p style={{ color: "red" }}>{error}</p>}
    </div>
  );
};

export default ManageOpeningHours;
