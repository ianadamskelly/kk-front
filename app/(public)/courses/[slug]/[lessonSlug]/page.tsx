import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { fetchCourse } from "@/lib/api";
import { LessonGate } from "@/components/CourseGate";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string; lessonSlug: string }>;
}): Promise<Metadata> {
  const { slug, lessonSlug } = await params;
  const course = await fetchCourse(slug);
  const lesson = course?.lessons?.find((l) => l.slug === lessonSlug);
  return {
    title: lesson ? `${lesson.title} — ${course?.title}` : "Lesson not found",
  };
}

export default async function LessonPage({
  params,
}: {
  params: Promise<{ slug: string; lessonSlug: string }>;
}) {
  const { slug, lessonSlug } = await params;
  const course = await fetchCourse(slug);
  if (!course) notFound();

  const lesson = (course.lessons || []).find((l) => l.slug === lessonSlug);
  if (!lesson) notFound();

  return <LessonGate initialCourse={course} lessonSlug={lessonSlug} />;
}
