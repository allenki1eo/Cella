import { NextRequest, NextResponse } from 'next/server'
import { stripe } from '@/lib/stripe'
import { createClient } from '@supabase/supabase-js'
import Stripe from 'stripe'

function getSupabaseAdmin() {
  return createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
  )
}

export async function POST(req: NextRequest) {
  const body = await req.text()
  const sig = req.headers.get('stripe-signature')!

  let event: Stripe.Event
  try {
    event = stripe.webhooks.constructEvent(body, sig, process.env.STRIPE_WEBHOOK_SECRET!)
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : 'Unknown error'
    return NextResponse.json({ error: `Webhook error: ${message}` }, { status: 400 })
  }

  switch (event.type) {
    case 'checkout.session.completed': {
      const session = event.data.object as Stripe.Checkout.Session
      const userId = session.metadata?.user_id
      const plan = session.metadata?.plan
      if (userId && plan) {
        await getSupabaseAdmin()
          .from('profiles')
          .update({
            plan,
            stripe_subscription_id: session.subscription as string,
          })
          .eq('id', userId)
      }
      break
    }

    case 'customer.subscription.deleted': {
      const sub = event.data.object as Stripe.Subscription
      const customerId = sub.customer as string
      const { data: profile } = await getSupabaseAdmin()
        .from('profiles')
        .select('id')
        .eq('stripe_customer_id', customerId)
        .single()
      if (profile) {
        await getSupabaseAdmin()
          .from('profiles')
          .update({ plan: 'free', stripe_subscription_id: null })
          .eq('id', profile.id)
      }
      break
    }

    case 'invoice.payment_failed': {
      const invoice = event.data.object as Stripe.Invoice
      const customerId = invoice.customer as string
      const { data: profile } = await getSupabaseAdmin()
        .from('profiles')
        .select('id')
        .eq('stripe_customer_id', customerId)
        .single()
      if (profile) {
        await getSupabaseAdmin()
          .from('profiles')
          .update({ plan: 'free' })
          .eq('id', profile.id)
      }
      break
    }
  }

  return NextResponse.json({ received: true })
}
