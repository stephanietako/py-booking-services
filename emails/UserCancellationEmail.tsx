import {
  Html,
  Head,
  Body,
  Container,
  Heading,
  Text,
} from "@react-email/components";

export default function UserCancellationEmail({
  serviceName,
  userName,
  userEmail,
}: {
  serviceName: string;
  userName: string;
  userEmail: string;
}) {
  return (
    <Html>
      <Head />
      <Body style={{ backgroundColor: "#f3f3f3", padding: "20px" }}>
        <Container
          style={{
            backgroundColor: "#fff",
            padding: "20px",
            borderRadius: "8px",
          }}
        >
          <Heading>⏳ Votre réservation a expiré</Heading>
          <Text>Bonjour {userName},</Text>{" "}
          {/* Personnaliser avec le nom de l'utilisateur */}
          <Text>
            Malheureusement, votre réservation pour{" "}
            <strong>{serviceName}</strong> n&apos;a pas été validée sous 3
            jours.
          </Text>
          <Text>Elle a donc été annulée automatiquement.</Text>
          <Text>
            Si vous souhaitez réserver à nouveau, merci de vous rendre sur notre
            site.
          </Text>
          <Text>
            Vous pouvez nous contacter à l&apos;adresse suivante pour toute
            question : {userEmail}
          </Text>{" "}
          {/* Par exemple, tu pourrais afficher l'email de l'utilisateur */}
        </Container>
      </Body>
    </Html>
  );
}
