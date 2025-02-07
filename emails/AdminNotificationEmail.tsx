import {
  Html,
  Head,
  Body,
  Container,
  Heading,
  Text,
} from "@react-email/components";

export default function AdminNotificationEmail({
  userName,
  serviceName,
  userEmail,
}: {
  userName: string;
  serviceName: string;
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
          <Heading>📢 Nouvelle réservation en attente</Heading>
          <Text>Bonjour Admin,</Text>
          <Text>
            L&apos;utilisateur <strong>{userName}</strong> a réservé le service{" "}
            <strong>{serviceName}</strong>.
          </Text>
          <Text>
            Vous pouvez contacter l&apos;utilisateur à l&apos;adresse :{" "}
            <strong>{userEmail}</strong>
          </Text>
          <Text>
            Veuillez vous connecter à votre tableau de bord pour approuver ou
            refuser cette réservation.
          </Text>
        </Container>
      </Body>
    </Html>
  );
}
