import defaultHeroImg from "@/public/assets/images/hero.webp";
import { prisma } from "./prisma";

export interface HeroConfigReturn {
  mediaUrl: string;
  mediaType: "image" | "video";
}

export const DEFAULT_HERO_IMAGE_DATA = defaultHeroImg;

export async function getHeroConfig(): Promise<HeroConfigReturn> {
  try {
    const config = await prisma.heroConfig.findFirst({
      orderBy: {
        updatedAt: "desc",
      },
    });

    // Vérification stricte de l'existence et de la validité de l'URL
    if (
      config?.mediaUrl &&
      config.mediaUrl.trim() !== "" &&
      isValidUrl(config.mediaUrl)
    ) {
      const mediaType = config.mediaType === "video" ? "video" : "image";

      return {
        mediaUrl: config.mediaUrl,
        mediaType: mediaType,
      };
    }

    // Retour par défaut avec l'image locale
    console.log(
      "🔄 Utilisation de l'image par défaut - pas de config valide en BDD"
    );
    return {
      mediaUrl: defaultHeroImg.src,
      mediaType: "image",
    };
  } catch (error) {
    console.error(
      "❌ Erreur lors de la récupération de la configuration hero:",
      error
    );

    // En cas d'erreur, on retourne toujours l'image par défaut
    return {
      mediaUrl: defaultHeroImg.src,
      mediaType: "image",
    };
  }
}

// Fonction utilitaire pour valider les URLs
function isValidUrl(string: string): boolean {
  if (!string || string.trim() === "") {
    return false;
  }

  try {
    const url = new URL(string);
    // Vérification que l'URL a bien un protocole http ou https
    return url.protocol === "http:" || url.protocol === "https:";
  } catch {
    return false;
  }
}

// Fonction pour mettre à jour la configuration hero
export async function updateHeroConfig(
  mediaUrl: string,
  mediaType: "image" | "video"
) {
  try {
    // Validation de l'URL avant sauvegarde
    if (!mediaUrl || mediaUrl.trim() === "" || !isValidUrl(mediaUrl)) {
      throw new Error("URL de média invalide");
    }

    const existingConfig = await prisma.heroConfig.findFirst();

    if (existingConfig) {
      const updatedConfig = await prisma.heroConfig.update({
        where: { id: existingConfig.id },
        data: {
          mediaUrl: mediaUrl.trim(),
          mediaType,
          updatedAt: new Date(),
        },
      });
      console.log("✅ Configuration Hero mise à jour:", updatedConfig);
      return updatedConfig;
    } else {
      const newConfig = await prisma.heroConfig.create({
        data: {
          mediaUrl: mediaUrl.trim(),
          mediaType,
        },
      });
      console.log("✅ Nouvelle configuration Hero créée:", newConfig);
      return newConfig;
    }
  } catch (error) {
    console.error(
      "❌ Erreur lors de la mise à jour de la configuration hero:",
      error
    );
    throw error;
  }
}

// Fonction utilitaire pour réinitialiser la config (optionnel)
export async function resetHeroConfigToDefault() {
  try {
    const existingConfig = await prisma.heroConfig.findFirst();

    if (existingConfig) {
      await prisma.heroConfig.update({
        where: { id: existingConfig.id },
        data: {
          mediaUrl: defaultHeroImg.src,
          mediaType: "image",
          updatedAt: new Date(),
        },
      });
    } else {
      await prisma.heroConfig.create({
        data: {
          mediaUrl: defaultHeroImg.src,
          mediaType: "image",
        },
      });
    }

    console.log("✅ Configuration Hero réinitialisée avec l'image par défaut");
  } catch (error) {
    console.error("❌ Erreur lors de la réinitialisation:", error);
    throw error;
  }
}
