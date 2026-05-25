import AdminResource from "@/components/AdminResource";

export default function AdminStatsPage() {
  return (
    <AdminResource
      title="Stats"
      description="Headline metrics shown in the homepage stats band."
      endpoint="/api/admin/stats"
      newLabel="New stat"
      fields={[
        { name: "label", label: "Label", required: true },
        { name: "value", label: "Value (e.g. 66+)", required: true },
        { name: "sortOrder", label: "Sort order", type: "number" },
      ]}
      columns={[
        { name: "value", label: "Value" },
        { name: "label", label: "Label" },
        { name: "sortOrder", label: "Order" },
      ]}
    />
  );
}
