import { createFileRoute, notFound } from "@tanstack/react-router";
import { AdminGuard } from "@/components/admin/AdminGuard";
import { AdminResourcePage } from "@/components/admin/AdminResourcePage";
import { AdminShell } from "@/components/admin/AdminShell";
import { getAdminModule } from "@/lib/admin/admin-modules";

export const Route = createFileRoute("/admin/$module")({
  head: ({ params }) => {
    const module = getAdminModule(params.module);
    return {
      meta: [
        { title: `${module?.title ?? "Admin Module"} - Fashion Cove Admin` },
        { name: "description", content: module?.description ?? "Fashion Cove admin module." },
      ],
    };
  },
  component: AdminModuleRoute,
});

function AdminModuleRoute() {
  const { module: moduleSlug } = Route.useParams();
  const module = getAdminModule(moduleSlug);

  if (!module) throw notFound();

  return (
    <AdminGuard>
      <AdminShell>
        <AdminResourcePage module={module} />
      </AdminShell>
    </AdminGuard>
  );
}
