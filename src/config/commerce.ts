/**
 * Commercial rules for the prototype. In production these must be enforced
 * server-side — never trust totals computed on the client.
 */
export const commerce = {
  freeDeliveryThreshold: 199,
  deliveryFee: 25,
  /** Simple first-order welcome offer (no coupon engine). */
  firstOrderOffer: { minSubtotal: 299, amount: 40, label: 'First basket offer' },
  /** Compressed order-progress timings for the prototype (seconds after placing). */
  trackingTimelineSeconds: {
    confirmed: 0,
    picking: 12,
    quality_checked: 30,
    packed: 48,
    out_for_delivery: 66,
    delivered: 150,
  },
  /** Show the small researcher controls (simulate delivery, reset data). */
  prototypeControls: true,
} as const
