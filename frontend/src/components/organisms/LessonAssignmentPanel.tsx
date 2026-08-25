import { IconCalendarDue, IconPaperclip } from '@tabler/icons-react'
import { useState } from 'react'

import { Badge } from '@/components/atoms/Badge'
import { Button } from '@/components/atoms/Button'
import { Textarea } from '@/components/atoms/inputs'
import { SUBMISSION_STATUS_LABELS } from '@/core/domain/schemas/assessment'
import { useAssignment, useSubmitAssignment } from '@/features/assessment/hooks'
import { formatDate } from '@/shared/lib/format'

interface LessonAssignmentPanelProps {
  assignmentId: number
}

export function LessonAssignmentPanel({ assignmentId }: LessonAssignmentPanelProps) {
  const { data: assignment, isLoading } = useAssignment(assignmentId)
  const submit = useSubmitAssignment(assignmentId)

  const [edited, setEdited] = useState<string | null>(null)

  const submission = assignment?.my_submission ?? null
  const content = edited ?? submission?.content ?? ''

  if (isLoading) return <p className="text-sm text-text-muted">Loading assignment…</p>
  if (!assignment) return null

  const isLocked = submission !== null && !isEditable(submission.status)

  return (
    <div className="bg-surface/90 backdrop-blur-md border border-border rounded-lg shadow-[0_4px_14px_-2px_rgba(31,11,16,0.06),inset_0_1px_0_0_rgba(255,255,255,0.9)] dark:shadow-[0_4px_14px_-2px_rgba(0,0,0,0.5),inset_0_1px_0_0_rgba(255,255,255,0.08)] overflow-hidden flex flex-col">
      <div className="flex items-center justify-between gap-3 px-5 py-3.5 border-b border-border bg-surface-muted/40 flex-wrap">
        <div>
          <h3 className="font-bold text-sm sm:text-base text-text-main m-0">{assignment.title}</h3>
          <p className="text-xs text-text-muted mt-0.5 mb-0">
            Worth {assignment.max_points} points
            {assignment.due_at ? ` · due ${formatDate(assignment.due_at, 'd MMM yyyy, HH:mm')}` : ''}
          </p>
        </div>

        {submission ? (
          <Badge
            tone={
              submission.status === 'graded'
                ? 'success'
                : submission.status === 'returned_for_revision'
                  ? 'warning'
                  : 'info'
            }
          >
            {SUBMISSION_STATUS_LABELS[submission.status]}
          </Badge>
        ) : assignment.is_overdue ? (
          <Badge tone="danger" icon={<IconCalendarDue size={13} />}>
            Overdue
          </Badge>
        ) : null}
      </div>

      <div className="p-5 flex flex-col gap-4">
        {assignment.instructions ? (
          <div className="text-xs sm:text-sm text-text-main whitespace-pre-line leading-relaxed p-3.5 rounded-md bg-surface-muted/50 border border-border/80">
            {assignment.instructions}
          </div>
        ) : null}

        {assignment.attachments.length > 0 ? (
          <ul className="flex flex-col gap-1.5 list-none p-0 m-0">
            {assignment.attachments.map((attachment) => (
              <li key={attachment.url}>
                <a
                  href={attachment.url}
                  className="inline-flex items-center gap-2 text-xs font-semibold text-primary hover:underline"
                  target="_blank"
                  rel="noreferrer"
                >
                  <IconPaperclip size={14} /> {attachment.name}
                </a>
              </li>
            ))}
          </ul>
        ) : null}

        {submission?.status === 'graded' ? (
          <div className="p-3.5 rounded-md bg-teal-500/10 border border-teal-500/30 text-teal-800 dark:text-teal-300 flex flex-col gap-1">
            <h4 className="font-bold text-sm m-0">
              Score: {submission.score}/{assignment.max_points} points
            </h4>
            {submission.feedback ? <p className="text-xs mt-0.5 mb-0">{submission.feedback}</p> : null}
          </div>
        ) : null}

        {submission?.status === 'returned_for_revision' && submission.feedback ? (
          <div className="p-3.5 rounded-md bg-secondary-light border border-secondary/30 text-secondary flex flex-col gap-1">
            <h4 className="font-bold text-sm m-0">Revision Requested by Instructor</h4>
            <p className="text-xs mt-0.5 mb-0">{submission.feedback}</p>
          </div>
        ) : null}

        {isLocked ? (
          <div className="flex flex-col gap-1.5">
            <span className="text-xs font-bold uppercase tracking-wider text-text-muted">Your Submission</span>
            <p className="text-xs sm:text-sm text-text-main whitespace-pre-line leading-relaxed p-3.5 rounded-md bg-surface-muted/40 border border-border">
              {submission?.content}
            </p>
          </div>
        ) : (
          <div className="flex flex-col gap-1.5">
            <label className="text-xs font-bold uppercase tracking-wider text-text-muted" htmlFor="assignment-answer">
              Your Answer / Solution
            </label>
            <Textarea
              id="assignment-answer"
              rows={7}
              value={content}
              onChange={(event) => setEdited(event.target.value)}
              placeholder="Write your detailed solution here…"
            />

            {!assignment.accepts_submissions ? (
              <p className="text-xs font-medium text-danger mt-1 m-0">
                The deadline has passed and late submissions are not accepted.
              </p>
            ) : null}
          </div>
        )}
      </div>

      {!isLocked ? (
        <div className="flex items-center justify-end gap-2.5 px-5 py-3.5 border-t border-border bg-surface-muted/40">
          <Button
            variant="ghost"
            size="sm"
            loading={submit.isPending}
            disabled={!content.trim()}
            onClick={() => submit.mutate({ input: { content }, asDraft: true })}
          >
            Save draft
          </Button>

          <Button
            size="sm"
            loading={submit.isPending}
            disabled={!content.trim() || !assignment.accepts_submissions}
            onClick={() => submit.mutate({ input: { content }, asDraft: false })}
          >
            Submit for grading
          </Button>
        </div>
      ) : null}
    </div>
  )
}

function isEditable(status: string): boolean {
  return status === 'draft' || status === 'returned_for_revision'
}
