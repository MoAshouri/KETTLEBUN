import { categories } from './catalog'
import type { ItemId, MenuItem } from './catalog'
import { Icon } from './Icons'
import { money } from './order'
import type { Order } from './order'

type MenuProps = {
  section: React.RefObject<HTMLElement | null>
  quantities: Order['quantities']
  changeQuantity: (id: ItemId, difference: number) => void
}

function MenuRow({ item, quantity, changeQuantity }: { item: MenuItem; quantity: number; changeQuantity: MenuProps['changeQuantity'] }) {
  return (
    <article className="menu-row" aria-labelledby={`${item.id}-name`}>
      <div className="menu-item-details">
        <img className="menu-thumb" src={item.thumbnail} alt="" width={64} height={64} loading="lazy" decoding="async" />
        <div>
          <h4 id={`${item.id}-name`}>{item.name}</h4>
          <p>{item.description}</p>
        </div>
      </div>
      <div className="menu-item-order">
        <strong>{money(item.price)}</strong>
        <div className="quantity" role="group" aria-label={`${item.name} quantity`}>
          {quantity > 0 && <>
            <button type="button" aria-label={`Remove one ${item.name}`} onClick={(event) => {
              if (quantity === 1 && document.activeElement === event.currentTarget) {
                event.currentTarget.parentElement?.querySelector<HTMLButtonElement>('.quantity-add')?.focus()
              }
              changeQuantity(item.id, -1)
            }}><Icon name="minus" size={17} /></button>
            <output aria-label={`${item.name} quantity`}>{quantity}</output>
          </>}
          <button className="quantity-add" type="button" aria-label={`Add one ${item.name}`} onClick={() => changeQuantity(item.id, 1)}>
            {quantity > 0 ? <Icon name="plus" size={17} /> : 'Add'}
          </button>
        </div>
      </div>
    </article>
  )
}

export function Menu({ section, quantities, changeQuantity }: MenuProps) {
  return (
    <section id="menu" className="menu-section" aria-labelledby="menu-title" ref={section} tabIndex={-1}>
      <div className="shell">
        <div className="menu-heading">
          <p className="eyebrow"><span /> ORDER FROM THE CAFÉ</p>
          <h2 id="menu-title">On the menu.</h2>
        </div>
        <nav className="menu-categories" aria-label="Menu categories">
          {categories.map(({ id, name }) => <a key={id} href={`#menu-${id}`}>{name}</a>)}
        </nav>
        {categories.map(({ id, name, items }) => (
          <section className="menu-category" id={`menu-${id}`} key={id} aria-labelledby={`menu-${id}-title`} tabIndex={-1}>
            <h3 id={`menu-${id}-title`}>{name}</h3>
            <div className="menu-grid">
              {items.map((item) => <MenuRow key={item.id} item={item} quantity={quantities[item.id] ?? 0} changeQuantity={changeQuantity} />)}
            </div>
          </section>
        ))}
      </div>
    </section>
  )
}
