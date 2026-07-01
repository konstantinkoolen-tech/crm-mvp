const FALLBACK_SITE_URL = "https://crm-mvp-indol.vercel.app";

export function getSiteUrl() {
  const configuredUrl = process.env.NEXT_PUBLIC_SITE_URL?.trim();

  if (configuredUrl) {
    return normalizeUrl(configuredUrl);
  }

  const vercelProductionUrl = process.env.VERCEL_PROJECT_PRODUCTION_URL?.trim();

  if (vercelProductionUrl) {
    return normalizeUrl(vercelProductionUrl);
  }

  return process.env.NODE_ENV === "production"
    ? FALLBACK_SITE_URL
    : "http://localhost:3000";
}

function normalizeUrl(url: string) {
  const normalized = url.startsWith("http") ? url : `https://${url}`;
  return normalized.replace(/\/$/, "");
}
