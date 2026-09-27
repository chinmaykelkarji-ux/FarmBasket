import type { QualityFeedback, QualityIssue } from '@/types'
import { uid } from '@/utils/format'
import { db, latency } from './db'

const TABLE = 'quality_feedback'

export const qualityIssueLabels: Record<QualityIssue, string> = {
  not_fresh: 'Not fresh',
  damaged: 'Damaged',
  wrong_size: 'Wrong size',
  wrong_variety: 'Wrong variety',
  missing_item: 'Missing item',
  other: 'Other',
}

export const feedbackService = {
  async submit(input: Omit<QualityFeedback, 'id' | 'createdAt' | 'status'>): Promise<QualityFeedback> {
    await latency(450)
    const comment = input.comment.trim().slice(0, 1000)
    const rating = Math.min(5, Math.max(1, Math.round(input.rating)))
    const fb: QualityFeedback = { ...input, comment, rating, id: uid('qf_'), createdAt: new Date().toISOString(), status: 'received' }
    const all = db.read<QualityFeedback[]>(TABLE, [])
    db.write(TABLE, [...all.filter((f) => f.orderId !== fb.orderId), fb])
    return fb
  },

  forOrder(orderId: string): QualityFeedback | undefined {
    return db.read<QualityFeedback[]>(TABLE, []).find((f) => f.orderId === orderId)
  },
}
