import { useState } from 'react'
import { Link } from 'react-router-dom'
import type { Order, QualityFeedback, QualityIssue } from '@/types'
import { Button } from '@/components/ui/Button'
import { Icon } from '@/components/ui/Icon'
import { feedbackService, qualityIssueLabels, track } from '@/services'
import { useToast } from '@/state/ToastContext'

const RATING_WORDS = ['', 'Poor', 'Not great', 'Okay', 'Good', 'Excellent']

interface Props {
  order: Order
  startWithReport?: boolean
  onSubmitted?: (fb: QualityFeedback) => void
}

export function QualityFeedbackForm({ order, startWithReport, onSubmitted }: Props) {
  const toast = useToast()
  const [existing, setExisting] = useState(() => feedbackService.forOrder(order.id))
  const [rating, setRating] = useState(startWithReport ? 2 : 0)
  const [reporting, setReporting] = useState(Boolean(startWithReport))
  const [issues, setIssues] = useState<QualityIssue[]>([])
  const [items, setItems] = useState<string[]>([])
  const [comment, setComment] = useState('')
  const [submitting, setSubmitting] = useState(false)
  const [error, setError] = useState<string | null>(null)

  if (existing) {
    const hasIssue = existing.issues.length > 0
    return (
      <div className="animate-fade-up rounded-3xl bg-white p-5 shadow-card" role="status">
        <div className="flex items-center gap-3">
          <span className="grid size-11 place-items-center rounded-full bg-forest-50 text-forest">
            <Icon name={hasIssue ? 'shield' : 'heart'} />
          </span>
          <div>
            <p className="font-bold">{hasIssue ? 'We’re on it' : 'Thanks for your feedback!'}</p>
            <p className="text-sm text-muted">
              You rated this order {existing.rating}/5{hasIssue ? ` · reported: ${existing.issues.map((i) => qualityIssueLabels[i].toLowerCase()).join(', ')}` : ''}
            </p>
          </div>
        </div>
        {hasIssue && (
          <p className="mt-3 rounded-2xl bg-sand/60 p-3 text-sm text-ink-soft">
            Our quality team will call you on {order.address.phone} within 2 hours to arrange a replacement or refund for the affected items. Reference: {existing.id.slice(-6).toUpperCase()}
          </p>
        )}
      </div>
    )
  }

  const toggle = <T,>(list: T[], v: T) => (list.includes(v) ? list.filter((x) => x !== v) : [...list, v])

  const submit = async () => {
    setError(null)
    if (rating === 0) return setError('Please tap a star rating.')
    if (reporting && issues.length === 0) return setError('Tell us what went wrong — pick at least one option.')
    setSubmitting(true)
    const fb = await feedbackService.submit({
      orderId: order.id,
      rating,
      issues: reporting ? issues : [],
      itemVariantIds: reporting ? items : [],
      comment,
    })
    if (fb.issues.length) track('quality_issue_reported', { orderId: order.id, issues: fb.issues, items: fb.itemVariantIds, rating })
    setSubmitting(false)
    setExisting(fb)
    toast.show(fb.issues.length ? 'Problem reported — we’ll call you shortly' : 'Thanks! Your feedback helps us pick better.')
    onSubmitted?.(fb)
  }

  return (
    <section className="rounded-3xl bg-white p-5 shadow-card" aria-labelledby="qf-h">
      <h2 id="qf-h" className="font-display text-xl font-semibold">
        How was your produce?
      </h2>
      <p className="mt-0.5 text-sm text-muted">Your rating goes straight to the team that picks and grades your vegetables.</p>

      <div className="mt-4 flex items-center gap-1" role="radiogroup" aria-label="Rating">
        {[1, 2, 3, 4, 5].map((n) => (
          <button
            key={n}
            type="button"
            role="radio"
            aria-checked={rating === n}
            aria-label={`${n} star${n > 1 ? 's' : ''} — ${RATING_WORDS[n]}`}
            onClick={() => {
              setRating(n)
              if (n <= 3) setReporting(true)
            }}
            className="grid size-11 place-items-center rounded-xl transition-transform active:scale-90"
          >
            <Icon name="star" filled className={`size-8 transition-colors ${n <= rating ? 'text-turmeric' : 'text-line'}`} strokeWidth={1} />
          </button>
        ))}
        {rating > 0 && <span className="ml-2 text-sm font-semibold text-ink-soft">{RATING_WORDS[rating]}</span>}
      </div>

      {!reporting ? (
        <button type="button" onClick={() => setReporting(true)} className="mt-4 inline-flex items-center gap-1.5 text-sm font-semibold text-clay hover:underline">
          <Icon name="alert" className="size-4" /> Report a problem
        </button>
      ) : (
        <div className="mt-5 animate-fade-up space-y-5">
          <fieldset>
            <legend className="mb-2 text-sm font-bold">What went wrong?</legend>
            <div className="flex flex-wrap gap-2">
              {(Object.keys(qualityIssueLabels) as QualityIssue[]).map((k) => (
                <button
                  key={k}
                  type="button"
                  aria-pressed={issues.includes(k)}
                  onClick={() => setIssues((l) => toggle(l, k))}
                  className={`h-9 rounded-full border px-3.5 text-sm font-semibold transition-colors ${
                    issues.includes(k) ? 'border-clay bg-clay text-white' : 'border-line bg-white text-ink-soft hover:border-ink/25'
                  }`}
                >
                  {qualityIssueLabels[k]}
                </button>
              ))}
            </div>
          </fieldset>

          <fieldset>
            <legend className="mb-2 text-sm font-bold">Which items? <span className="font-medium text-muted">(optional)</span></legend>
            <div className="flex flex-wrap gap-2">
              {order.items.map((it) => (
                <button
                  key={it.variantId}
                  type="button"
                  aria-pressed={items.includes(it.variantId)}
                  onClick={() => setItems((l) => toggle(l, it.variantId))}
                  className={`h-9 rounded-full border px-3.5 text-sm font-semibold transition-colors ${
                    items.includes(it.variantId) ? 'border-ink bg-ink text-white' : 'border-line bg-white text-ink-soft hover:border-ink/25'
                  }`}
                >
                  {it.productName} · {it.variantLabel}
                </button>
              ))}
            </div>
          </fieldset>

          <div>
            <label htmlFor="qf-comment" className="mb-2 block text-sm font-bold">
              Tell us what happened
            </label>
            <textarea
              id="qf-comment"
              rows={3}
              maxLength={1000}
              value={comment}
              onChange={(e) => setComment(e.target.value)}
              placeholder="e.g. Two tomatoes were soft and the onions were smaller than medium."
              className="w-full resize-none rounded-xl border border-line bg-white px-3.5 py-3 text-sm outline-none focus:border-forest"
            />
            <p className="mt-1 text-xs text-muted">Photo upload is coming soon — for now, our team may ask for a photo on WhatsApp.</p>
          </div>
        </div>
      )}

      {error && (
        <p className="mt-3 text-sm font-semibold text-clay" role="alert">
          {error}
        </p>
      )}
      <div className="mt-5 flex flex-wrap items-center gap-3">
        <Button onClick={submit} loading={submitting} variant={reporting ? 'accent' : 'primary'}>
          Submit
        </Button>
        <Link to="/quality" className="text-sm font-semibold text-muted hover:text-ink">
          Our quality guarantee
        </Link>
      </div>
    </section>
  )
}
