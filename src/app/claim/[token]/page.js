import { verifyGiftToken } from "@/actions/gift";
import ClaimClient from "./ClaimClient";

export async function generateMetadata({ params }) {
  const { token } = await params;
  return {
    title: `Redeem Gift | Janu Bhai Coffee`,
    description: `Claim your prepaid coffee gift using token ${token}.`
  };
}

export default async function ClaimPage({ params }) {
  const { token } = await params;
  
  // Verify token securely on the server
  const result = await verifyGiftToken(token);
  
  return <ClaimClient token={token} initialResult={result} />;
}
