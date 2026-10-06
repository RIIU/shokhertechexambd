import Link from "next/link";
import { notFound } from "next/navigation";
import { CheckCircle2, Eye, Trash2 } from "lucide-react";
import { AdminHeader, Badge } from "@/components/admin/AdminUi";
import { ConfirmButton } from "@/components/admin/ConfirmButton";
import { BulkQuestionForm, ExamMetaForm, QuestionForm } from "@/components/admin/ExamForms";
import { EmptyState, Panel } from "@/components/ui/StatTile";
import { deleteExamAction, deleteQuestionAction, setExamStatusAction } from "@/app/admin/actions";
import { getExam } from "@/lib/server/exams";
import { OPTION_LABEL_BN, cn, toBn } from "@/lib/utils";

export const metadata = { title: "Edit exam" };

export default async function EditExamPage({ params, searchParams }: { params: { id: string }; searchParams: { error?: string } }) {
  const exam = await getExam(params.id);
  if (!exam) notFound();
  const published = exam.status === "published";
  const totalMarks = exam.questions.reduce((s, q) => s + q.marks, 0);

  return (
    <>
      <AdminHeader
        title={exam.titleBn}
        subtitle={`${toBn(exam.questions.length)}টি প্রশ্ন · পূর্ণমান ${toBn(totalMarks)}`}
        action={
          <div className="flex flex-wrap items-center gap-2">
            <Badge tone={published ? "brand" : "amber"}>{published ? "প্রকাশিত" : "খসড়া"}</Badge>
            <Link href={`/exam/${exam.id}`} className="btn-ghost py-2" target="_blank">
              <Eye className="h-4 w-4" /> <span lang="bn">প্রিভিউ</span>
            </Link>
            <form action={setExamStatusAction}>
              <input type="hidden" name="id" value={exam.id} />
              <input type="hidden" name="status" value={published ? "draft" : "published"} />
              <button
                type="submit"
                disabled={!published && exam.questions.length === 0}
                title={!published && exam.questions.length === 0 ? "আগে অন্তত একটি প্রশ্ন যোগ করো" : undefined}
                className={cn(published ? "btn-ghost py-2" : "btn-primary py-2")}
              >
                {!published && <CheckCircle2 className="h-4 w-4" />}
                <span lang="bn">{published ? "অপ্রকাশিত করো" : "প্রকাশ করো"}</span>
              </button>
            </form>
          </div>
        }
      />

      {searchParams.error === "has-attempts" && (
        <p lang="bn" role="alert" className="mb-4 rounded-xl bg-state-danger/10 p-3 text-sm text-rose-200 ring-1 ring-state-danger/30">
          এই পরীক্ষায় শিক্ষার্থীরা অংশ নিয়েছে, তাই মুছে ফেলা যাবে না। চাইলে অপ্রকাশিত করে রাখো।
        </p>
      )}

      <div className="grid gap-6 2xl:grid-cols-2">
        <Panel title={`প্রশ্নসমূহ (${toBn(exam.questions.length)})`}>
          {exam.questions.length ? (
            <ol className="space-y-3">
              {exam.questions.map((q, i) => (
                <li key={q.id} className="rounded-2xl border border-surface-border p-4">
                  <div className="mb-2 flex items-start gap-3">
                    <span lang="bn" className="font-display text-sm font-bold text-ink-subtle">
                      {toBn(i + 1)}.
                    </span>
                    <p lang="bn" className="flex-1 text-sm font-medium text-ink">
                      {q.text}
                    </p>
                    <form action={deleteQuestionAction}>
                      <input type="hidden" name="examId" value={exam.id} />
                      <input type="hidden" name="questionId" value={q.id} />
                      <ConfirmButton message="প্রশ্নটি মুছে ফেলবে?" ariaLabel="Delete question" className="rounded-lg p-1.5 text-ink-subtle hover:bg-state-danger/10 hover:text-rose-300">
                        <Trash2 className="h-4 w-4" />
                      </ConfirmButton>
                    </form>
                  </div>
                  <ul className="grid gap-1.5 pl-6 sm:grid-cols-2">
                    {q.options.map((o) => (
                      <li
                        key={o.id}
                        lang="bn"
                        className={cn("rounded-lg px-2.5 py-1.5 text-xs", o.id === q.correctOptionId ? "bg-brand-400/15 text-brand-200" : "text-ink-muted")}
                      >
                        {OPTION_LABEL_BN[o.id]}. {o.text}
                      </li>
                    ))}
                  </ul>
                  <p lang="bn" className="mt-2 pl-6 text-[11px] text-ink-subtle">
                    {q.topic} · মান {toBn(q.marks)}
                  </p>
                </li>
              ))}
            </ol>
          ) : (
            <EmptyState text="এখনো কোনো প্রশ্ন নেই। পাশের ফর্ম থেকে প্রশ্ন যোগ করো।" />
          )}
        </Panel>

        <div className="space-y-6">
          <Panel title="নতুন প্রশ্ন যোগ করো">
            <QuestionForm examId={exam.id} />
          </Panel>
          <Panel title="একসাথে অনেক প্রশ্ন যোগ করো">
            <BulkQuestionForm examId={exam.id} />
          </Panel>
          <Panel title="পরীক্ষার তথ্য">
            <ExamMetaForm
              defaults={{
                id: exam.id,
                titleBn: exam.titleBn,
                titleEn: exam.titleEn,
                level: exam.level,
                stream: exam.stream,
                subjectId: exam.subjectId,
                type: exam.type,
                minutes: Math.round(exam.durationSec / 60),
                negativeMark: exam.negativeMark,
                maxWarnings: exam.maxWarnings,
                showSolutions: exam.showSolutions !== false,
                isPaid: Boolean(exam.isPaid),
                price: exam.price ?? 50,
                startsAt: exam.startsAt,
                closesAt: exam.closesAt,
              }}
            />
          </Panel>
          <form action={deleteExamAction} className="text-right">
            <input type="hidden" name="id" value={exam.id} />
            <ConfirmButton message="পুরো পরীক্ষাটি মুছে ফেলবে? এটা ফেরত আনা যাবে না।" className="inline-flex items-center gap-2 text-sm text-rose-300 hover:underline">
              <Trash2 className="h-4 w-4" /> <span lang="bn">পরীক্ষা মুছে ফেলো</span>
            </ConfirmButton>
          </form>
        </div>
      </div>
    </>
  );
}
