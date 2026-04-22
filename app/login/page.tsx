import { AccessGateway } from "@/components/auth/access-gateway"

export default function LoginPage() {
  return <AccessGateway adminRedirectTo="/admin" participantRedirectTo="/torneo" backHref="/torneo" />
}
