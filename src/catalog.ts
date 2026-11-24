import classicSmash from './assets/classic-smash.webp'
import crispyVeg from './assets/crispy-veg.webp'
import houseTea from './assets/house-tea.webp'
import doubleSmash from './assets/double-smash.webp'
import bbqBacon from './assets/bbq-bacon.webp'
import spicyChicken from './assets/spicy-chicken.webp'
import classicCombo from './assets/classic-combo.webp'
import doubleCombo from './assets/double-combo.webp'
import vegCombo from './assets/veg-combo.webp'
import seaSaltFries from './assets/sea-salt-fries.webp'
import loadedFries from './assets/loaded-fries.webp'
import onionRings from './assets/onion-rings.webp'
import cabbageSlaw from './assets/cabbage-slaw.webp'
import jalapenoBites from './assets/jalapeno-bites.webp'
import mintTea from './assets/mint-tea.webp'
import icedLemonTea from './assets/iced-lemon-tea.webp'
import espresso from './assets/espresso.webp'
import latte from './assets/latte.webp'
import houseLemonade from './assets/house-lemonade.webp'
import cola from './assets/cola.webp'
import sparklingWater from './assets/sparkling-water.webp'
import chocolateBrownie from './assets/chocolate-brownie.webp'
import vanillaScoop from './assets/vanilla-scoop.webp'
import burntCheesecake from './assets/burnt-cheesecake.webp'

type CatalogItem = { id: string; name: string; price: number; description: string; thumbnail: string }

export const categories = [
  {
    id: 'burgers', name: 'Burgers', items: [
      { id: 'classic-smash', name: 'Classic Smash', price: 800, description: 'Griddled beef, cheddar, pickles, tomato and lettuce.', thumbnail: classicSmash },
      { id: 'double-smash', name: 'Double Smash', price: 1100, description: 'Two griddled beef patties with melted cheddar and pickles.', thumbnail: doubleSmash },
      { id: 'bbq-bacon', name: 'BBQ Bacon', price: 1050, description: 'Griddled beef, smoky bacon, cheddar and barbecue sauce.', thumbnail: bbqBacon },
      { id: 'spicy-chicken', name: 'Spicy Chicken', price: 900, description: 'Crispy chicken with chili mayo and cool slaw.', thumbnail: spicyChicken },
      { id: 'crispy-veg', name: 'Crispy Veg Burger', price: 750, description: 'Golden vegetable patty, slaw, pickles and lettuce.', thumbnail: crispyVeg },
    ],
  },
  {
    id: 'combos', name: 'Combos', items: [
      { id: 'classic-combo', name: 'Classic Combo', price: 1200, description: 'Classic Smash, Sea Salt Fries and House Tea.', thumbnail: classicCombo },
      { id: 'double-combo', name: 'Double Combo', price: 1500, description: 'Double Smash, Sea Salt Fries and House Tea.', thumbnail: doubleCombo },
      { id: 'veg-combo', name: 'Veg Combo', price: 1150, description: 'Crispy Veg Burger, Sea Salt Fries and House Tea.', thumbnail: vegCombo },
    ],
  },
  {
    id: 'sides', name: 'Sides', items: [
      { id: 'sea-salt-fries', name: 'Sea Salt Fries', price: 350, description: 'Golden fries tossed with flaky sea salt.', thumbnail: seaSaltFries },
      { id: 'loaded-fries', name: 'Loaded Fries', price: 550, description: 'Crisp fries with cheese sauce, jalapeños and scallions.', thumbnail: loadedFries },
      { id: 'onion-rings', name: 'Onion Rings', price: 450, description: 'Sweet onion rings in a crisp golden batter.', thumbnail: onionRings },
      { id: 'cabbage-slaw', name: 'Cabbage Slaw', price: 300, description: 'Shredded cabbage and carrots in tangy dressing.', thumbnail: cabbageSlaw },
      { id: 'jalapeno-bites', name: 'Jalapeño Bites', price: 450, description: 'Crispy golden bites with jalapeños and cheese.', thumbnail: jalapenoBites },
    ],
  },
  {
    id: 'tea-coffee', name: 'Tea & Coffee', items: [
      { id: 'house-tea', name: 'House Tea', price: 400, description: 'Slow-steeped black tea with a smooth, malty finish.', thumbnail: houseTea },
      { id: 'mint-tea', name: 'Mint Tea', price: 450, description: 'Hot mint infusion with a bright, clean finish.', thumbnail: mintTea },
      { id: 'iced-lemon-tea', name: 'Iced Lemon Tea', price: 450, description: 'Chilled black tea with fresh lemon.', thumbnail: icedLemonTea },
      { id: 'espresso', name: 'Espresso', price: 300, description: 'A short, rich shot of espresso.', thumbnail: espresso },
      { id: 'latte', name: 'Latte', price: 450, description: 'Espresso with steamed milk and soft foam.', thumbnail: latte },
    ],
  },
  {
    id: 'cold-drinks', name: 'Cold Drinks', items: [
      { id: 'house-lemonade', name: 'House Lemonade', price: 450, description: 'Fresh, tart lemonade served over ice.', thumbnail: houseLemonade },
      { id: 'cola', name: 'Cola', price: 300, description: 'Classic chilled cola.', thumbnail: cola },
      { id: 'sparkling-water', name: 'Sparkling Water', price: 250, description: 'Cold, crisp sparkling water.', thumbnail: sparklingWater },
    ],
  },
  {
    id: 'desserts', name: 'Desserts', items: [
      { id: 'chocolate-brownie', name: 'Chocolate Brownie', price: 450, description: 'A fudgy dark chocolate brownie with a crackly top.', thumbnail: chocolateBrownie },
      { id: 'vanilla-scoop', name: 'Vanilla Scoop', price: 350, description: 'One scoop of creamy vanilla ice cream.', thumbnail: vanillaScoop },
      { id: 'burnt-cheesecake', name: 'Burnt Cheesecake', price: 550, description: 'Creamy cheesecake with a deep caramelized crust.', thumbnail: burntCheesecake },
    ],
  },
] as const satisfies readonly { id: string; name: string; items: readonly CatalogItem[] }[]

type Category = (typeof categories)[number]
export type ItemId = Category['items'][number]['id']
export type MenuItem = CatalogItem & { id: ItemId }
export const menu = categories.flatMap<MenuItem>((category) => category.items)
