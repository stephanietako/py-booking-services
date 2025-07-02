import { clerkMiddleware, createRouteMatcher } from "@clerk/nextjs/server";

const isProtectedRoute = createRouteMatcher([
  "/dashboard(.*)",
  "/admin(.*)",
  "/users(.*)",
]);

export default clerkMiddleware(async (auth, req) => {
  // 👮‍♂️ Protection Clerk
  if (isProtectedRoute(req)) await auth.protect();

  // 🍪 Lecture du cookie de consentement
  const consent = req.cookies.get("cookie-consent")?.value;

  // Exemple : log (tu peux remplacer par une logique réelle)
  if (!consent) {
    console.log("[middleware] Consentement non défini");
  } else if (consent === "rejected") {
    console.log("[middleware] Consentement REFUSÉ");
  } else {
    console.log("[middleware] Consentement ACCEPTÉ");
  }
});

export const config = {
  matcher: [
    "/((?!_next|[^?]*\\.(?:html?|css|js(?!on)|jpe?g|webp|png|gif|svg|ttf|woff2?|ico|csv|docx?|xlsx?|zip|webmanifest)).*)",
    "/(api|trpc)(.*)",
  ],
};
