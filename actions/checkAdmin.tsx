"use server";

export async function checkAdmin(
  email: string,
  provider: string,
  password?: string
) {
  const adminEmail = process.env.ADMIN_EMAIL;
  const adminPassword = process.env.ADMIN_PASSWORD;

  // Vérifie si l'email correspond à l'email administrateur
  if (email === adminEmail) {
    // Vérifie si le fournisseur est Google ou si le mot de passe est correct
    if (provider === "google" || password === adminPassword) {
      return { isAdmin: true };
    } else {
      return { isAdmin: false, message: "Mot de passe incorrect" };
    }
  } else {
    return { isAdmin: false, message: "Email non autorisé" };
  }
}
