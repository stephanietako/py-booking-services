<div align="center">
  <img src="public/assets/logo/hippo.png" alt="Yachting Day Logo" width="200"/>
  
  # Yachting Day
  ### Plateforme de réservation et location de bateaux avec services à bord
  
  ![Next.js](https://img.shields.io/badge/Next.js-15.5.6-black?style=flat-square&logo=next.js)
  ![TypeScript](https://img.shields.io/badge/TypeScript-5.8.3-blue?style=flat-square&logo=typescript)
  ![React](https://img.shields.io/badge/React-19.1.0-61DAFB?style=flat-square&logo=react)
  ![Prisma](https://img.shields.io/badge/Prisma-6.8.2-2D3748?style=flat-square&logo=prisma)
  ![Stripe](https://img.shields.io/badge/Stripe-18.2.1-008CDD?style=flat-square&logo=stripe)
</div>

---

## 📖 À propos

**Yachting Day** est une plateforme web full-stack de réservation et location d'un bateau. Elle démontre une maîtrise technique du développement moderne avec **Next.js 15**, **TypeScript**, **Prisma** et des intégrations tierces (**Clerk**, **Stripe**, **Google Maps**).

### Fonctionnalités clés

- 🚤 Réservation d'un bateau avec sélection de dates et créneaux horaires
- 👨‍✈️ Services à bord personnalisables : capitaine, équipements nautiques, collation via traiteur partenaire
- 💳 Paiement sécurisé via Stripe
- 👤 Authentification via Clerk
- 📧 Emails transactionnels et génération de PDF
- 🗺️ Carte interactive Google Maps
- 📄 Pages légales conformes RGPD (CGU, Cookies)

---

## 🛠️ Stack technique

### Core

- **Next.js 15.5.6** : App Router, Server Actions, Turbopack, API Routes
- **TypeScript 5.8.3** : strict mode, path aliases (`@/*`)
- **React 19.1.0** : Server/Client Components, hooks
- **Prisma 6.8.2** : ORM type-safe, migrations, seed scripts
- **PostgreSQL** (Supabase 2.49.4)

### Authentification & Paiement

- **Clerk 6.34.4** : authentification complète, webhooks
- **Stripe 18.2.1** : paiements sécurisés, webhooks
- **jsonwebtoken 9.0.2** : tokens personnalisés
- **svix 1.67.0** : vérification signatures webhooks

### UI/UX & Formulaires

- **Framer Motion 12.9.4** : animations
- **react-hot-toast 2.5.2** : notifications
- **react-icons 5.5.0** : icônes
- **SCSS Modules** (Sass 1.87.0) : styles scoped
- **react-phone-number-input**, **react-select**, **react-calendar**

### Services tiers

- **Google Maps API** (@googlemaps/js-api-loader 1.16.8)
- **Resend 4.5.0** + **@react-email** : emails transactionnels
- **pdf-lib 1.17.1** : génération PDF
- **Sharp 0.33.5** : optimisation images

### Dates & Outils

- **date-fns 4.1.0** + **date-fns-tz 3.2.0**
- **ESLint 9.39.1**, **tsx 4.19.4**, **ts-node 10.9.2**

---

## 🎯 Techniques implémentées

### Architecture & Performance

✅ Server/Client Components  
✅ Server Actions  
✅ Code splitting automatique  
✅ Optimisation images (Sharp)  
✅ Turbopack en développement

### Sécurité

✅ Vérification signatures webhooks (Svix)  
✅ Conformité PCI DSS (Stripe)  
✅ JWT tokens personnalisés  
✅ Variables d'environnement sécurisées

### Base de données

✅ Prisma ORM type-safe  
✅ Migrations versionnées  
✅ Seed scripts pour données test

### UX/UI

✅ Design responsive (mobile, tablette, desktop)  
✅ Animations fluides  
✅ Notifications toast  
✅ États de chargement personnalisés

---

## 🚀 Compétences démontrées

**Full-Stack** : Next.js 15, TypeScript, React 19, Prisma, PostgreSQL  
**Intégrations** : Clerk, Stripe, Google Maps, Resend  
**Sécurité** : Webhooks, JWT, validation de paiements  
**UI/UX** : Design responsive, animations, notifications  
**DevOps** : TypeScript strict, migrations DB, ESLint

---

## 📧 Contact

Pour démonstration ou opportunités professionnelles :  
📩 **takodevcreation@gmail.com**

---

<div align="center">
  
**Tous droits réservés © 2025 Yachting Day**  
Développé par Tako Dev avec ❤️

</div>
