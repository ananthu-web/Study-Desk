import { StudyBook } from "@/components/study-book";

export default function DashboardLoading() {
  return <div className="desk-route-loading" role="status" aria-live="polite" aria-busy="true"><StudyBook size={30} /><p>Opening your desk…</p><div className="desk-route-skeleton" aria-hidden="true"><span /><span /><span /></div></div>;
}
