import type { Metadata } from "next";
import { fetchLibraryResource, imageUrl } from "@/lib/api";
import LibraryResourceDetail from "./LibraryResourceDetail";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await params;
  const data = await fetchLibraryResource(slug);
  const resource = data.resource;
  if (!resource) return { title: "Resource not found" };
  return {
    title: resource.title,
    description: resource.description.replace(/<[^>]+>/g, "").slice(0, 160),
    openGraph: {
      title: resource.title,
      description: resource.description.replace(/<[^>]+>/g, "").slice(0, 160),
      images: resource.image ? [{ url: imageUrl(resource.image) }] : undefined,
    },
  };
}

export default async function LibraryResourcePage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  return <LibraryResourceDetail slug={slug} />;
}
