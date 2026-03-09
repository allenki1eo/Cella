import Stripe from 'stripe'

let _stripe: Stripe | null = null

export function getStripe(): Stripe {
  if (!_stripe) {
    _stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
      apiVersion: '2026-02-25.clover',
    })
  }
  return _stripe
}

// For backwards compat — lazy getter
export const stripe = new Proxy({} as Stripe, {
  get(_target, prop) {
    return (getStripe() as unknown as Record<string | symbol, unknown>)[prop]
  },
})

export const STRIPE_PLANS = {
  pro: {
    priceId: process.env.STRIPE_PRO_PRICE_ID || 'price_pro',
    amount: 1200,
    name: 'Pro',
    requests: 1000,
  },
  team: {
    priceId: process.env.STRIPE_TEAM_PRICE_ID || 'price_team',
    amount: 3900,
    name: 'Team',
    requests: 999999,
  },
}
