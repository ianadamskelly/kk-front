import AdminResource from "@/components/AdminResource";

export default function AdminProjectsPage() {
  return (
    <AdminResource
      title="Projects"
      description="Portfolio case studies."
      endpoint="/api/admin/projects"
      newLabel="New project"
      fields={[
        { name: "title", label: "Title", required: true },
        { name: "client", label: "Client" },
        { name: "category", label: "Category" },
        { name: "summary", label: "Summary", type: "textarea" },
        { name: "body", label: "Case study", type: "richtext" },
        { name: "results", label: "Results", type: "textarea" },
        { name: "coverImage", label: "Cover image", type: "image" },
        { name: "sortOrder", label: "Sort order", type: "number" },
        { name: "status", label: "Status", type: "status" },
      ]}
      columns={[
        { name: "title", label: "Title" },
        { name: "client", label: "Client" },
        { name: "status", label: "Status" },
      ]}
    />
  );
}
