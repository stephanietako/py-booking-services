// app/admin/hero-settings/page.tsx
import { auth } from "@clerk/nextjs/server";
import HeroMediaUploadForm from "@/app/components/HeroMediaUploadForm/HeroMediaUploadForm";
import { getHeroConfig } from "@/lib/hero-utils";
import Image from "next/image";
import React from "react";
import Wrapper from "@/app/components/Wrapper/Wrapper";

interface HeroDisplayProps {
  mediaUrl: string;
  mediaType: string;
}

const HeroDisplay: React.FC<HeroDisplayProps> = ({ mediaUrl, mediaType }) => {
  if (mediaType === "video") {
    return (
      <video
        controls
        src={mediaUrl}
        style={{
          width: "100%",
          height: "auto",
          maxHeight: "24rem",
          objectFit: "contain",
        }}
      >
        Votre navigateur ne supporte pas la vidéo.
      </video>
    );
  }

  return (
    <div
      style={{
        position: "relative",
        width: "100%",
        height: "24rem",
        backgroundColor: "#f3f4f6",
        borderRadius: "0.5rem",
        overflow: "hidden",
      }}
    >
      <Image
        src={mediaUrl}
        alt="Média Hero Actuel"
        fill
        style={{
          objectFit: "contain",
        }}
        sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
        priority
      />
    </div>
  );
};

export default async function HeroSettingsPage() {
  const { userId } = await auth();

  if (!userId) {
    return (
      <div
        style={{
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          minHeight: "100vh",
          backgroundColor: "#374151",
        }}
      >
        <p
          style={{
            fontSize: "1.25rem",
            color: "#dc2626",
          }}
        >
          Accès refusé. Veuillez vous connecter.
        </p>
      </div>
    );
  }

  const currentHeroConfig = await getHeroConfig();

  return (
    <Wrapper>
      <section>
        <div
          style={{
            minHeight: "100vh",
            backgroundColor: "#374151",
            padding: "2rem",
            marginTop: "10vh",
          }}
        >
          <h1
            style={{
              fontSize: "2rem",
              fontWeight: "bold",
              textAlign: "center",
              marginBottom: "2rem",
              color: "white",
            }}
          >
            Paramètres du Média Home
          </h1>

          <div
            style={{
              maxWidth: "64rem",
              marginLeft: "auto",
              marginRight: "auto",
              backgroundColor: "#fff",
              padding: "1.5rem",
              borderRadius: "0.5rem",
              boxShadow:
                "0 10px 15px -3px rgba(0, 0, 0, 0.1), 0 4px 6px -2px rgba(0, 0, 0, 0.05)",
              marginBottom: "2rem",
            }}
          >
            <h2
              style={{
                fontSize: "1.25rem",
                fontWeight: "600",
                marginBottom: "1rem",
              }}
            >
              Média Actuel
            </h2>
            {currentHeroConfig.mediaUrl ? (
              <HeroDisplay
                mediaUrl={currentHeroConfig.mediaUrl}
                mediaType={currentHeroConfig.mediaType}
              />
            ) : (
              <p
                style={{
                  color: "#6b7280",
                }}
              >
                Aucun média hero configuré pour le moment.
              </p>
            )}
          </div>

          <div
            style={{
              maxWidth: "64rem",
              marginLeft: "auto",
              marginRight: "auto",
              backgroundColor: "#fff",
              padding: "1.5rem",
              borderRadius: "0.5rem",
              boxShadow:
                "0 10px 15px -3px rgba(0, 0, 0, 0.1), 0 4px 6px -2px rgba(0, 0, 0, 0.05)",
            }}
          >
            <HeroMediaUploadForm />
          </div>
        </div>
      </section>
    </Wrapper>
  );
}
