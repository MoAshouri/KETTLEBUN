import { menu } from './catalog'
import type { ItemId } from './catalog'

export const cafeName = 'Kettle & Bun'
export type Order = { quantities: Partial<Record<ItemId, number>>; notes: string }

const storageKey = 'kettle-and-bun-order'
const usd = new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' })

export const money = (cents: number) => usd.format(cents / 100)
const demoRecipient = '12025550147'
const configuredRecipient = (import.meta.env.VITE_RESTAURANT_WHATSAPP ?? '').replace(/\D/g, '').replace(/^00/, '')
const recipient = /^[1-9]\d{1,14}$/.test(configuredRecipient) ? configuredRecipient : demoRecipient
export const demoMode = recipient === demoRecipient

export function readOrder(): Order {
  try {
    const saved = JSON.parse(localStorage.getItem(storageKey) ?? 'null')
    const quantities: Order['quantities'] = {}
    for (const { id } of menu) {
      const quantity = saved?.quantities?.[id]
      if (Number.isSafeInteger(quantity) && quantity > 0) quantities[id] = quantity
    }
    return { quantities, notes: typeof saved?.notes === 'string' ? saved.notes.slice(0, 300) : '' }
  } catch {
    return { quantities: {}, notes: '' }
  }
}

export function saveOrder(order: Order) {
  try {
    localStorage.setItem(storageKey, JSON.stringify(order))
  } catch {
    // Ordering remains available in browsers with storage disabled.
  }
}

export function summarize({ quantities }: Order) {
  const lines = menu.flatMap((item) => {
    const quantity = quantities[item.id] ?? 0
    return quantity ? [{ ...item, quantity, total: quantity * item.price }] : []
  })

  return {
    lines,
    count: lines.reduce((sum, line) => sum + line.quantity, 0),
    total: lines.reduce((sum, line) => sum + line.total, 0),
  }
}

export function orderMessage({ lines, total }: ReturnType<typeof summarize>, notes: string) {
  return [
    `Order for ${cafeName}`,
    '',
    ...lines.map((line) => `${line.quantity} × ${line.name} — ${money(line.total)}`),
    '',
    `Grand total: ${money(total)}`,
    ...(notes.trim() ? [`Notes: ${notes.trim()}`] : []),
  ].join('\n')
}

export const whatsappUrl = (message: string) => `https://wa.me/${recipient}?text=${encodeURIComponent(message)}`
