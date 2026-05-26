import AdminResource from "@/components/AdminResource";

export default function AdminServicesPage() {
  return (
    <AdminResource
      title="Services"
      description="Offerings shown on the Services page and its detail pages."
      endpoint="/api/admin/services"
      newLabel="New service"
      fields={[
        { name: "title", label: "Title", required: true },
        { name: "icon", label: "Icon (emoji or symbol)" },
        { name: "summary", label: "Summary", type: "textarea" },
        { name: "body", label: "Full description", type: "richtext" },
        { name: "sortOrder", label: "Sort order", type: "number" },
        { name: "status", label: "Status", type: "status" },
      ]}
      columns={[
        { name: "title", label: "Title" },
        { name: "sortOrder", label: "Order" },
        { name: "status", label: "Status" },
      ]}
    />
  );
}
