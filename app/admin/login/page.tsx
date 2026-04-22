import { AccessGateway } from "@/components/auth/access-gateway"

export default function AdminLoginPage() {
  return <AccessGateway adminRedirectTo="/admin" participantRedirectTo="/torneo" backHref="/torneo" />
}
