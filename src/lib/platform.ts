const DEFAULT_PLATFORM_URL = "http://localhost:3000/login";

export function getPlatformUrl(): string {
  const configuredUrl = process.env.NEXT_PUBLIC_PLATFORM_URL?.trim();
  return configuredUrl && configuredUrl.length > 0 ? configuredUrl : DEFAULT_PLATFORM_URL;
}
