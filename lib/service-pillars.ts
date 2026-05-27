import type { Service, ServicePillar } from "@/lib/api";

export interface PillarDefinition {
  key: ServicePillar;
  anchor: string;
  title: string;
  description: string;
}

export const SERVICE_PILLARS: PillarDefinition[] = [
  {
    key: "brand_identity",
    anchor: "brand-identity",
    title: "Brand Identity",
    description:
      "Strategy, visual systems, design, and merchandise that make your brand recognisable.",
  },
  {
    key: "digital_platforms",
    anchor: "digital-platforms",
    title: "Websites & Digital Platforms",
    description:
      "Web experiences and commerce platforms designed to turn interest into action.",
  },
  {
    key: "content_growth",
    anchor: "content-growth",
    title: "Content, Media & Growth",
    description:
      "Photo, video, motion, content systems, and organic visibility for consistent growth.",
  },
];

export function servicesForPillar(
  services: Service[],
  pillar: ServicePillar,
): Service[] {
  return services.filter((service) => service.pillar === pillar);
}

export function ungroupedServices(services: Service[]): Service[] {
  return services.filter(
    (service) => !SERVICE_PILLARS.some((pillar) => pillar.key === service.pillar),
  );
}
