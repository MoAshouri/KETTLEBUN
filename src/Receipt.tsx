import { useRef, useState } from 'react'
import { Icon, Teapot } from './Icons'
import { cafeName, demoMode, money, orderMessage, whatsappUrl } from './order'
import type { Order, summarize } from './order'

type ReceiptProps = {
  dialog: React.RefObject<HTMLDialogElement | null>
  summary: ReturnType<typeof summarize>
  order: Order
  onNotesChange: (notes: string) => void
  onClose: () => void
}

export function Receipt({ dialog, summary, order, onNotesChange, onClose }: ReceiptProps) {
  const [copyStatus, setCopyStatus] = useState<'ready' | 'copied' | 'manual'>('ready')
  const manualText = useRef<HTMLTextAreaElement>(null)
  const message = orderMessage(summary, order.notes)

  async function copyOrder() {
    try {
      await navigator.clipboard.writeText(message)
      setCopyStatus('copied')
    } catch {
      setCopyStatus('manual')
      requestAnimationFrame(() => {
        manualText.current?.focus()
        manualText.current?.select()
      })
    }
  }

  return (
    <dialog ref={dialog} className="receipt" aria-labelledby="receipt-title" aria-describedby="receipt-help" onClose={() => {
      setCopyStatus('ready')
      onClose()
    }} onClick={(event) => {
      if (event.target === event.currentTarget) dialog.current?.close()
    }}>
      <div className="receipt-inner">
        <button className="icon-button receipt-close" type="button" aria-label="Close receipt" autoFocus onClick={() => dialog.current?.close()}><Icon name="close" /></button>
        <div className="receipt-brand"><Teapot /> {cafeName}</div>
        <h2 id="receipt-title">Your order</h2>
        <ul className="receipt-lines">
          {summary.lines.map((line) => <li key={line.id}><span>{line.quantity} × {line.name}</span><span>{money(line.total)}</span></li>)}
        </ul>
        <div className="receipt-total"><span>Grand total</span><strong>{money(summary.total)}</strong></div>
        <label className="notes-label" htmlFor="order-notes">Order notes <span>(optional)</span></label>
        <textarea id="order-notes" rows={2} placeholder="Any changes to your order?" maxLength={300} value={order.notes} onChange={(event) => {
          setCopyStatus('ready')
          onNotesChange(event.target.value)
        }} />
        <p className="receipt-help" id="receipt-help">
          {demoMode && <><strong>Demo mode.</strong> This draft uses the fictional number +1 202-555-0147. </>}
          Review your draft, then tap Send in WhatsApp to place your order.
        </p>
        <div className="receipt-actions">
          <a className="button receipt-confirm" href={whatsappUrl(message)}><Icon name="whatsapp" /> Confirm &amp; Open WhatsApp</a>
          <button className="button button--outline" type="button" onClick={() => dialog.current?.close()}>Edit Order</button>
          <button className="button button--outline" type="button" onClick={copyOrder}><Icon name={copyStatus === 'copied' ? 'check' : 'copy'} /> Copy Order Text</button>
        </div>
        <div className="copy-status" role="status">
          {copyStatus === 'copied' && 'Order text copied.'}
          {copyStatus === 'manual' && <><label htmlFor="copy-draft">Select and copy your order text below.</label><textarea id="copy-draft" rows={4} value={message} readOnly ref={manualText} /></>}
        </div>
      </div>
    </dialog>
  )
}
