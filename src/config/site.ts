export const SITE_NAME = "Naqlia";

export function getMetadataBase(): URL {
  const configuredUrl = process.env.NEXT_PUBLIC_APP_URL?.trim();
  const vercelProductionUrl = process.env.VERCEL_PROJECT_PRODUCTION_URL?.trim();
  const vercelDeploymentUrl = process.env.VERCEL_URL?.trim();

  if (configuredUrl) {
    return new URL(configuredUrl);
  }

  if (vercelProductionUrl) {
    return new URL(`https://${vercelProductionUrl}`);
  }

  if (vercelDeploymentUrl) {
    return new URL(`https://${vercelDeploymentUrl}`);
  }

  return new URL("http://localhost:3000");
}

export function getWhatsAppHref(message: string): string {
  const configuredNumber = process.env.NEXT_PUBLIC_WHATSAPP_NUMBER?.replace(/\D/g, "") ?? "";
  const recipient = /^9665\d{8}$/.test(configuredNumber) ? configuredNumber : "";
  const url = new URL(recipient ? `https://wa.me/${recipient}` : "https://wa.me/");

  url.searchParams.set("text", message);

  return url.toString();
}
