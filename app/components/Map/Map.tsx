"use client";

import React, { useState, useEffect, useRef } from "react";
import { Loader } from "@googlemaps/js-api-loader";
import icon from "@/public/assets/logo/hipo-transparent.svg";
import geo from "@/public/assets/icon/geo.png";
// STYLES
import styles from "./styles.module.scss";

export const dynamic = "force-dynamic";

// Types pour les propriétés
interface Property {
  title: string;
  description: string;
  position: {
    lat: number;
    lng: number;
  };
}

const properties: Property[] = [
  {
    title: "Maison Essenza",
    description: `Du Mardi au Vendredi de 10h00 à 19h00 <br />
                  Le samedi de 10h00 à 16h00`,
    position: {
      lat: 43.17278473616548,
      lng: 6.536504524006781,
    },
  },
];

const Map: React.FC = () => {
  const mapRef = useRef<HTMLDivElement | null>(null);
  const [map, setMap] = useState<google.maps.Map | null>(null);
  const [userMarker, setUserMarker] =
    useState<google.maps.marker.AdvancedMarkerElement | null>(null);
  const [infoWindow, setInfoWindow] = useState<google.maps.InfoWindow | null>(
    null
  );

  const toggleHighlight = (
    marker: google.maps.marker.AdvancedMarkerElement
  ) => {
    if ((marker.content as HTMLElement)?.classList.contains(styles.highlight)) {
      (marker.content as HTMLElement)?.classList.remove(styles.highlight);
      marker.zIndex = null;
    } else {
      (marker.content as HTMLElement)?.classList.add(styles.highlight);
      marker.zIndex = 1;
    }
  };

  useEffect(() => {
    const initMap = async () => {
      const loader = new Loader({
        apiKey: process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY!,
        version: "weekly",
        libraries: ["places", "marker"], // Assurez-vous d'inclure la bibliothèque "marker"
      });

      const { Map } = await loader.importLibrary("maps");
      const markerLibrary = await loader.importLibrary("marker");
      const { AdvancedMarkerElement } =
        markerLibrary as typeof google.maps.marker;

      const position = {
        lat: 43.251496859869185,
        lng: 6.532052481579163,
      };

      const mapOptions: google.maps.MapOptions = {
        center: position,
        zoom: 10,
        mapId: "MY_NEXTJS_APID",
      };

      // setup the map
      const mapInstance = new Map(mapRef.current!, mapOptions);
      setMap(mapInstance);

      const infoWindowInstance = new google.maps.InfoWindow();
      setInfoWindow(infoWindowInstance);

      const buildContent = (property: Property) => {
        const content = document.createElement("div");
        content.classList.add(styles.property);

        content.innerHTML = `
          <div>
            <div class="${styles.icon}">
              <img src="${icon.src}" alt="Maison essenza marqueur sur la carte" />
            </div>
            <div class="${styles.details}">
              <span class="${styles.title}" title="${property.title}">${property.title}</span>
              <span>${property.description}</span>
            </div>
          </div>
        `;
        return content;
      };

      // Ajout des markers pour chaque propriété
      properties.forEach((property) => {
        const content = buildContent(property);

        const marker = new AdvancedMarkerElement({
          map: mapInstance,
          position: property.position,
          title: property.title,
        });

        marker.content = content;

        marker.addListener("click", () => {
          toggleHighlight(marker);
          if (infoWindowInstance) {
            infoWindowInstance.setContent(`
              <div>
                <h3>${property.title}</h3>
                <p>${property.description}</p>
              </div>
            `);
          }
        });
      });
      setMap(mapInstance);
    };

    initMap();
  }, []);

  // Fonction pour centrer la carte sur la position de l'utilisateur
  const centerMyLocation = () => {
    const user = document.createElement("img");
    user.src = geo.src;
    user.style.width = "40px";
    user.style.height = "40px";

    if (navigator.geolocation && map) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          const userLocation = {
            lat: position.coords.latitude,
            lng: position.coords.longitude,
          };

          if (userMarker) {
            userMarker.map = map;
            userMarker.position = userLocation;
          } else {
            const userLocationMarker =
              new google.maps.marker.AdvancedMarkerElement({
                position: userLocation,
                content: user,
                title: "Vous êtes ici",
              });

            setUserMarker(userLocationMarker);

            userLocationMarker.addListener("click", () => {
              if (infoWindow) {
                infoWindow.setContent(`
                  <div class="${styles["custom_info_window"]}">
                    <h3>Vous êtes ici</h3>
                  </div>
                `);
                infoWindow.open(map, userLocationMarker);
              }
            });
          }

          map.setCenter(userLocation);
        },
        (error) => {
          console.error(
            "Erreur lors de la récupération de la position de l'utilisateur :",
            error
          );
        }
      );
    }
  };

  return (
    <div className={styles.googlemap}>
      <div className={styles.map}>
        <div className={styles.map__container} ref={mapRef} />
        <div className={styles.__btn_box}>
          <button className={styles.__btnPosition} onClick={centerMyLocation}>
            <p>Me localiser sur la carte</p>
          </button>
          <a
            href="https://maps.app.goo.gl/P8YWn9kBxpecbK9m9"
            target="_blank"
            rel="noreferrer noopener"
          >
            <button className={styles.__btn_googlemap}>
              <p>Ouvrir un lien vers Google Map</p>
            </button>
          </a>
        </div>
      </div>
    </div>
  );
};

export default Map;
