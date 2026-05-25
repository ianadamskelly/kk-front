import AdminResource from "@/components/AdminResource";

const STATUS = [
  { value: "published", label: "Published" },
  { value: "draft", label: "Draft" },
];

export default function AdminTestimonialsPage() {
  return (
    <AdminResource
      title="Testimonials"
      description="Client quotes shown on the homepage."
      endpoint="/api/admin/testimonials"
      newLabel="New testimonial"
      fields={[
        { name: "author", label: "Author", required: true },
        { name: "role", label: "Role" },
        { name: "company", label: "Company" },
        { name: "quote", label: "Quote", type: "textarea", required: true },
        { name: "sortOrder", label: "Sort order", type: "number" },
        { name: "status", label: "Status", type: "select", options: STATUS },
      ]}
      columns={[
        { name: "author", label: "Author" },
        { name: "company", label: "Company" },
        { name: "status", label: "Status" },
      ]}
    />
  );
}
