// Shared API client and types for the Kuza Kizazi frontend.

export const API_URL =
  process.env.NEXT_PUBLIC_API_URL?.replace(/\/$/, "") || "http://localhost:8080";

// SITE_URL is the public base URL for the frontend (the place this app
// is reachable from). Used to build absolute URLs in sitemap.xml,
// robots.txt, OG tags, and canonical links. Set NEXT_PUBLIC_SITE_URL at
// build time in production.
export const SITE_URL =
  process.env.NEXT_PUBLIC_SITE_URL?.replace(/\/$/, "") ||
  "http://localhost:3000";

export const SITE_NAME = "Kuza Kizazi";

// resolveFileURL turns a stored URL into something a browser can
// fetch. Three cases:
//   - "" → "" (caller decides whether to render)
//   - "http(s)://..." → returned unchanged (external link)
//   - "/anything"     → prefixed with the API base URL
// The server-side handlers already tokenise protected paths into
// "/api/files/<token>" before returning them, so this client-side
// helper just needs to prepend the API host.
export function resolveFileURL(url: string | null | undefined): string {
  if (!url) return "";
  if (/^https?:\/\//i.test(url)) return url;
  return `${API_URL}${url}`;
}

const IMAGE_SRC_RE = /(<img\b[^>]*?\bsrc\s*=\s*)(["'])([^"']+)(\2)/gi;

// TipTap stores admin-uploaded images as relative backend paths so content
// stays portable across environments, but the frontend must resolve those
// paths when rendering HTML from the API.
export function resolveContentImageUrls(html: string): string {
  if (!html) return "";
  return html.replace(IMAGE_SRC_RE, (match, prefix, quote, src, endQuote) => {
    if (typeof src !== "string" || !src.startsWith("/") || src.startsWith("/images/")) return match;
    return `${prefix}${quote}${resolveFileURL(src)}${endQuote}`;
  });
}

export function storeContentImageUrls(html: string): string {
  if (!html) return "";
  const apiPrefix = `${API_URL}/`;
  return html.replace(IMAGE_SRC_RE, (match, prefix, quote, src, endQuote) => {
    if (typeof src !== "string" || !src.startsWith(apiPrefix)) return match;
    return `${prefix}${quote}/${src.slice(apiPrefix.length)}${endQuote}`;
  });
}

// --- Types ---

export interface Category {
  id: number;
  name: string;
  slug: string;
}

export interface Post {
  id: number;
  title: string;
  slug: string;
  excerpt: string;
  content: string;
  coverImage: string;
  status: "draft" | "scheduled" | "published";
  categoryId: number | null;
  categoryName: string;
  categorySlug: string;
  authorId: number | null;
  authorName: string;
  createdAt: string;
  updatedAt: string;
  publishedAt: string | null;
  scheduledAt: string | null;
}

export interface PostList {
  posts: Post[];
  total: number;
  page: number;
  perPage: number;
  pages: number;
}

export interface Comment {
  id: number;
  postId: number;
  authorName: string;
  body: string;
  createdAt: string;
  postTitle?: string;
  postSlug?: string;
}

export type ServicePillar =
  | "brand_identity"
  | "digital_platforms"
  | "content_growth"
  | "";

export interface ServiceSubservice {
  id: number;
  serviceId: number;
  title: string;
  summary: string;
  body: string;
  sortOrder: number;
  status: "draft" | "published";
  createdAt: string;
  updatedAt: string;
}

export interface Service {
  id: number;
  slug: string;
  title: string;
  summary: string;
  body: string;
  icon: string;
  pillar: ServicePillar;
  sortOrder: number;
  status: "draft" | "published";
  createdAt: string;
  updatedAt: string;
  subservices?: ServiceSubservice[];
}

export interface Project {
  id: number;
  slug: string;
  client: string;
  title: string;
  summary: string;
  body: string;
  coverImage: string;
  results: string;
  category: string;
  sortOrder: number;
  status: "draft" | "published";
  createdAt: string;
  updatedAt: string;
}

export interface TeamMember {
  id: number;
  name: string;
  role: string;
  photo: string;
  bio: string;
  socials: Record<string, string>;
  sortOrder: number;
}

export interface Testimonial {
  id: number;
  author: string;
  role: string;
  company: string;
  quote: string;
  avatar: string;
  sortOrder: number;
  status: "draft" | "published";
}

export interface Stat {
  id: number;
  label: string;
  value: string;
  sortOrder: number;
}

export interface ContactSubmission {
  id: number;
  name: string;
  email: string;
  phone: string;
  service: string;
  subject: string;
  message: string;
  status: "new" | "read" | "archived";
  createdAt: string;
}

export interface ProductImage {
  id: number;
  productId: number;
  url: string;
  position: number;
  isCover: boolean;
  createdAt: string;
}

export interface ProductDownload {
  id: number;
  productId: number;
  url: string;
  label: string;
  sizeBytes: number;
  position: number;
  createdAt: string;
}

export interface Product {
  id: number;
  slug: string;
  name: string;
  description: string;
  body: string;
  priceCents: number;
  /** Denormalised cover URL — same URL as the cover row in `images`. */
  image: string;
  category: string;
  status: "draft" | "published";
  sortOrder: number;
  /** "physical" (default; ships) or "digital" (downloadable files attached). */
  kind: "physical" | "digital";
  /** null = unlimited downloads per customer; integer = per-customer cap. */
  maxDownloads: number | null;
  /** Non-empty when this product unlocks an authenticated in-app asset. */
  interactiveAssetSlug: string;
  createdAt: string;
  updatedAt: string;
  /** Full gallery. Empty on list endpoints; populated on detail endpoints. */
  images?: ProductImage[];
}

export interface OrderItem {
  id: number;
  orderId: number;
  productId: number | null;
  productName: string;
  unitPriceCents: number;
  quantity: number;
}

export interface Order {
  id: number;
  kind: "shop" | "course" | "membership";
  membershipPlan: "full" | "library" | "";
  customerName: string;
  customerEmail: string;
  customerPhone: string;
  note: string;
  totalCents: number;
  status: "pending" | "confirmed" | "fulfilled" | "cancelled" | "payment_review";
  createdAt: string;
  autoCancelledAt: string | null;
  items: OrderItem[];
}

export interface CourseTask {
  id: number;
  courseId: number;
  module: string;
  prompt: string;
  requiredPass: boolean;
  sortOrder: number;
  createdAt: string;
  updatedAt: string;
}

export interface CourseTaskSubmission {
  id: number;
  taskId: number;
  userId: number;
  body: string;
  fileUrl: string;
  grade: "" | "passed" | "failed";
  feedback: string;
  submittedAt: string;
  gradedAt: string | null;
  graderId: number | null;
}

export interface CourseResource {
  id: number;
  courseId: number;
  /** Null on course-wide resources; set on lesson-scoped ones. */
  lessonId: number | null;
  label: string;
  url: string;
  kind: "link" | "file";
  sortOrder: number;
  createdAt: string;
}

export interface Lesson {
  id: number;
  courseId: number;
  module: string;
  slug: string;
  title: string;
  content: string;
  videoUrl: string;
  duration: string;
  isPreview: boolean;
  sortOrder: number;
  createdAt: string;
  updatedAt: string;
  /** Resources attached to this lesson specifically. */
  resources?: CourseResource[];
}

export interface Course {
  id: number;
  slug: string;
  title: string;
  summary: string;
  description: string;
  coverImage: string;
  level: string;
  duration: string;
  instructor: string;
  category: string;
  language: string;
  promoVideo: string;
  prerequisites: string;
  outcomes: string;
  priceCents: number;
  status: "draft" | "published";
  sortOrder: number;
  createdAt: string;
  updatedAt: string;
  lessons: Lesson[];
  /** Course-wide resources (resources whose lessonId is null). */
  resources?: CourseResource[];
  /** End-of-module tasks. On the public payload the prompt is blank for
   *  non-entitled viewers — only `module`/`requiredPass` drive the marker. */
  tasks?: CourseTask[];
  // Set by /api/courses/{slug}: `locked` means the course is paid and access
  // is gated; `entitled` means this requester has access (free, member, or
  // bought the course). When locked && !entitled, lesson content/video URLs
  // and attached resource URLs come back empty.
  entitled?: boolean;
  locked?: boolean;
}

// A course-completion certificate issued to the signed-in user. `code`
// is the public verify/download identifier.
export interface Certificate {
  id: number;
  code: string;
  userId: number;
  courseId: number;
  issuedAt: string;
  // Course context, present on /api/account/certificates so the UI can
  // render the title/cover without the owned-courses list.
  courseTitle?: string;
  courseSlug?: string;
  courseCover?: string;
}

export interface LibraryResource {
  id: number;
  slug: string;
  title: string;
  description: string;
  type: string;
  category: string;
  url: string;
  image: string;
  status: "draft" | "published";
  sortOrder: number;
  createdAt: string;
  updatedAt: string;
}

export interface Review {
  id: number;
  userId: number;
  entityType: "product" | "course";
  entityId: number;
  rating: number;
  body: string;
  status: "pending" | "published" | "rejected";
  createdAt: string;
  updatedAt: string;
  /** Filled in on public list responses; empty on admin/own responses. */
  authorName?: string;
}

export interface ReviewSummary {
  averageRating: number;
  count: number;
}

export interface ReviewsResponse {
  summary: ReviewSummary;
  reviews: Review[];
  /** Present only when the caller is signed in: whether they can post a review. */
  canReview?: boolean;
  /** Present only when the caller is signed in and has already reviewed. */
  mine?: Review;
}

export type SiteSettings = Record<string, string>;

export interface User {
  id: number;
  email: string;
  name: string;
  role: string;
  createdAt: string;
}

// --- Helpers ---

// imageUrl turns a stored "/uploads/..." path into an absolute URL.
export function imageUrl(path: string): string {
  if (!path) return "";
  if (path.startsWith("http")) return path;
  if (path.startsWith("/images/")) return path;
  return `${API_URL}${path}`;
}

// formatPrice renders an integer cent amount as Kenyan shillings.
export function formatPrice(cents: number): string {
  return "KSh " + Math.round(cents / 100).toLocaleString("en-US");
}

export function formatDate(iso: string | null): string {
  if (!iso) return "";
  return new Date(iso).toLocaleDateString("en-US", {
    year: "numeric",
    month: "long",
    day: "numeric",
  });
}

export function formatDateTime(iso: string | null): string {
  if (!iso) return "";
  return new Date(iso).toLocaleString("en-US", {
    year: "numeric",
    month: "long",
    day: "numeric",
    hour: "numeric",
    minute: "2-digit",
  });
}

// getJSON fetches a public endpoint, returning a fallback on any failure so
// Server Components never crash when the API is unavailable.
async function getJSON<T>(path: string, fallback: T): Promise<T> {
  try {
    const res = await fetch(`${API_URL}${path}`, { cache: "no-store" });
    if (!res.ok) return fallback;
    return (await res.json()) as T;
  } catch {
    return fallback;
  }
}

// --- Public data fetching (safe to call from Server Components) ---

export async function fetchPosts(
  query: Record<string, string | number | undefined>,
): Promise<PostList> {
  const params = new URLSearchParams();
  for (const [key, value] of Object.entries(query)) {
    if (value !== undefined && value !== "") params.set(key, String(value));
  }
  return getJSON<PostList>(`/api/posts?${params}`, {
    posts: [],
    total: 0,
    page: 1,
    perPage: 6,
    pages: 0,
  });
}

export async function fetchPost(slug: string): Promise<Post | null> {
  return getJSON<Post | null>(`/api/posts/${encodeURIComponent(slug)}`, null);
}

export async function fetchCategories(): Promise<Category[]> {
  return getJSON<Category[]>(`/api/categories`, []);
}

export async function fetchServices(): Promise<Service[]> {
  return getJSON<Service[]>(`/api/services`, []);
}

export async function fetchService(slug: string): Promise<Service | null> {
  return getJSON<Service | null>(
    `/api/services/${encodeURIComponent(slug)}`,
    null,
  );
}

export async function fetchProjects(): Promise<Project[]> {
  return getJSON<Project[]>(`/api/projects`, []);
}

export async function fetchProject(slug: string): Promise<Project | null> {
  return getJSON<Project | null>(
    `/api/projects/${encodeURIComponent(slug)}`,
    null,
  );
}

export async function fetchTeam(): Promise<TeamMember[]> {
  return getJSON<TeamMember[]>(`/api/team`, []);
}

export async function fetchTestimonials(): Promise<Testimonial[]> {
  return getJSON<Testimonial[]>(`/api/testimonials`, []);
}

export async function fetchStats(): Promise<Stat[]> {
  return getJSON<Stat[]>(`/api/stats`, []);
}

export async function fetchSettings(): Promise<SiteSettings> {
  return getJSON<SiteSettings>(`/api/settings`, {});
}

export async function fetchProducts(
  query: Record<string, string | undefined> = {},
): Promise<Product[]> {
  const params = new URLSearchParams();
  for (const [key, value] of Object.entries(query)) {
    if (value !== undefined && value !== "") params.set(key, String(value));
  }
  return getJSON<Product[]>(`/api/products?${params}`, []);
}

export async function fetchProduct(slug: string): Promise<Product | null> {
  return getJSON<Product | null>(
    `/api/products/${encodeURIComponent(slug)}`,
    null,
  );
}

export async function fetchCourses(): Promise<Course[]> {
  return getJSON<Course[]>(`/api/courses`, []);
}

export async function fetchCourse(slug: string): Promise<Course | null> {
  return getJSON<Course | null>(
    `/api/courses/${encodeURIComponent(slug)}`,
    null,
  );
}

// LibraryListing is the gated wrapper returned by /api/library: when the
// requester isn't an active member, `entitled` is false and each
// resource's `url` is blanked server-side so the download links can't be
// scraped from the client.
export interface LibraryListing {
  entitled: boolean;
  resources: LibraryResource[];
}

export interface LibraryResourceDetail {
  entitled: boolean;
  resource: LibraryResource | null;
}

// fetchLibrary supports an optional bearer token so an authenticated
// browser fetch can prove membership and unlock the URLs in the response.
export async function fetchLibrary(): Promise<LibraryListing> {
  try {
    // credentials: 'include' sends the kk_session cookie so members
    // get the unlocked URLs back; anonymous callers see redacted ones.
    const res = await fetch(`${API_URL}/api/library`, {
      cache: "no-store",
      credentials: "include",
    });
    if (!res.ok) return { entitled: false, resources: [] };
    return (await res.json()) as LibraryListing;
  } catch {
    return { entitled: false, resources: [] };
  }
}

export async function fetchLibraryResource(
  slug: string,
  includeCredentials = false,
): Promise<LibraryResourceDetail> {
  try {
    const res = await fetch(`${API_URL}/api/library/${encodeURIComponent(slug)}`, {
      cache: "no-store",
      credentials: includeCredentials ? "include" : "same-origin",
    });
    if (!res.ok) return { entitled: false, resource: null };
    return (await res.json()) as LibraryResourceDetail;
  } catch {
    return { entitled: false, resource: null };
  }
}

// adminFetch performs an authenticated request to the admin API.
//
// Admin auth rides the HttpOnly `kk_session` cookie now (set by the
// backend on login), sent automatically by the browser when the
// fetch uses `credentials: "include"`. The `token` argument is kept
// in the signature for backward compatibility with the ~40 admin
// pages that pass `getToken() || ""` — `getToken` is itself a
// legacy-sweep no-op, so the parameter is effectively unused. If
// any callers still hold a real token (mid-deploy, before reload),
// we pass it through as a Bearer header so the server's
// claimsFromRequest fallback still validates the session.
export async function adminFetch(
  path: string,
  token: string,
  options: RequestInit = {},
): Promise<Response> {
  const headers: Record<string, string> = {
    ...(options.headers as Record<string, string>),
  };
  if (token) headers["Authorization"] = `Bearer ${token}`;
  if (options.body && !(options.body instanceof FormData)) {
    headers["Content-Type"] = "application/json";
  }
  return fetch(`${API_URL}${path}`, {
    ...options,
    headers,
    credentials: "include",
  });
}
