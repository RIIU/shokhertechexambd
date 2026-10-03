import { AdminHeader } from "@/components/admin/AdminUi";
import { ExamMetaForm } from "@/components/admin/ExamForms";
import { Panel } from "@/components/ui/StatTile";

export const metadata = { title: "New exam" };

export default function NewExamPage() {
  return (
    <>
      <AdminHeader title="নতুন পরীক্ষা" subtitle="প্রথমে পরীক্ষার তথ্য দাও। পরের ধাপে প্রশ্ন যোগ করে প্রকাশ করবে।" />
      <Panel title="পরীক্ষার তথ্য">
        <ExamMetaForm />
      </Panel>
    </>
  );
}
