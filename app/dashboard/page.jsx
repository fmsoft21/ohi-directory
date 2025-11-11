import DashboardShell from "@/assets/components/DashboardShell";
import DashboardOverview from "@/assets/components/DashboardOverview";

export const metadata = {
  title: "Dashboard | Ohi!",
  description: "Manage your products and view store analytics",
};

export default function DashboardPage() {
  return (
    <DashboardShell>
      <DashboardOverview />
    </DashboardShell>
  );
}