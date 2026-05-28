import AdminResource from "@/components/AdminResource";

const TYPES = ["Guide", "Template", "E-book", "Video", "Tool"].map((t) => ({
  value: t,
  label: t,
}));

export default function AdminLibraryPage() {
  return (
    <AdminResource
      title="Library"
      description="Free guides, templates, and tools in the resource library."
      endpoint="/api/admin/library"
      newLabel="New resource"
      fields={[
        { name: "title", label: "Title", required: true },
        { name: "type", label: "Type", type: "select", options: TYPES },
        { name: "category", label: "Category" },
        { name: "description", label: "Description", type: "richtext" },
        {
          name: "url",
          label: "Resource link or file",
          type: "urlOrFile",
          full: true,
        },
        { name: "image", label: "Cover image", type: "image" },
        { name: "sortOrder", label: "Sort order", type: "number" },
        { name: "status", label: "Status", type: "status" },
      ]}
      columns={[
        { name: "title", label: "Title" },
        { name: "type", label: "Type" },
        { name: "status", label: "Status" },
      ]}
    />
  );
}
