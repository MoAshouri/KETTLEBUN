# Kettle & Bun

A one-page café ordering site built with Vite, React, TypeScript and React Three Fiber.

## Run locally

Use Node.js 20.19+ or 22.12+.

```sh
npm ci
npm run dev
```

Open the local URL printed by Vite. Edit the catalog, including prices in cents, in `src/catalog.ts`.

## Set the WhatsApp recipient

Copy `.env.example` to `.env.local`. Set `VITE_RESTAURANT_WHATSAPP` to the café’s public WhatsApp number with its country code. The app strips formatting from the number. Restart the dev server after editing the file or rebuild before deploying. A blank setting or the example value uses the fictional demo number `12025550147`. The receipt offers both the WhatsApp link and a copy button in Demo mode.

## Build and host

```sh
npm run build
npm run preview
```

Publish the contents of `dist/` to any static host. The relative asset paths work at the domain root or in a subdirectory. Fonts, menu photography and the static burger are included in the build. Ordering uses local browser storage and opens a draft for the customer to send in WhatsApp.

<details>
<summary>Menu photography prompt and assets</summary>

The built-in imagegen tool generated a single triptych, cropped into `src/assets/classic-smash.webp`, `src/assets/house-tea.webp` and `src/assets/crispy-veg.webp`.

> Photorealistic editorial menu photography for an independent burger café, delivered as a single landscape image with precisely THREE equal-width side-by-side square-ish panels covering the entire image, with clean vertical cuts exactly at 1/3 and 2/3 and no gutters. Each subject centered inside its own panel with breathing room around it so the panels can be cropped into three distinct responsive menu card images. LEFT: one classic smash burger with a glossy golden sesame bun, ruffled green lettuce, melting orange cheddar, crispy-edged browned beef smash patty and a toasted lower bun on muted rust-red backdrop and red tabletop, all five main layers visible. CENTER: a low warm-cream speckled ceramic cup filled with amber black tea with subtle steam, resting on matching saucer, focused on cup, muted ochre tabletop and backdrop. RIGHT: a visibly different crispy vegetable burger, craggy golden breaded vegetable patty, green leaf lettuce and thin pickle and slaw on a glossy bun on a muted sage-olive tabletop and backdrop. Shoot all three at the same slightly elevated three-quarter angle, art-directed warm vintage cafe light with subtle natural shadows and high detail. Full foods visible, no hands, no packaging, no text, no logos, no borders. Make the three products appetizing and distinguishable.

</details>

<details>
<summary>Additional menu photos</summary>

The built-in ImageGen tool generated 21 additional menu photos. Each optimized WebP is in `src/assets/` under the item ID listed below.

The food, tea and coffee prompts started with the following art direction.

> Square photorealistic editorial product photograph for an independent burger café menu thumbnail. Frame from a slightly elevated three-quarter angle. Place the whole serving near the center and fill about 78% of the frame with even breathing room. The subject must be easy to identify at 48 pixels. Warm directional café lighting, real food texture, soft natural shadows, restrained vintage food styling, clean matte backdrop and tabletop in the same color. No text, hands, brands, borders or unrelated props.

The following subject descriptions completed the prompts.

- `double-smash.webp` — A double smash burger with exactly two thin, distinctly visible crispy-edged beef patties, two layers of melted cheddar, a few pickles and a glossy sesame bun. Deep paprika-red setting.
- `bbq-bacon.webp` — One beef burger with crisp curling smoked bacon strips clearly showing, melted cheddar and dark glossy barbecue sauce under a toasted sesame bun. Paprika-red setting.
- `spicy-chicken.webp` — One tall fried chicken sandwich with a thick craggy golden breast, a visible band of cool pale cabbage slaw and orange chili mayo on a glossy bun. Paprika-red setting.
- `classic-combo.webp` — A slightly overhead compact meal arrangement of one classic single beef smash burger with lettuce, melted cheddar and sesame bun, one portion of golden sea salt fries and one low cream ceramic cup of black tea. All three clearly visible in the crop. Warm terracotta setting.
- `double-combo.webp` — A slightly overhead compact meal arrangement of a sesame bun double smash burger with exactly two visible beef patties and melted cheddar, a portion of sea salt fries and a low cream ceramic cup of black tea. All three clearly visible in the crop. Burnt orange setting.
- `veg-combo.webp` — A slightly overhead compact meal arrangement of a crispy vegetable burger with a golden breaded patty, pickles and slaw, a portion of sea salt fries and a low cream ceramic cup of black tea. All three clearly visible in the crop. Warm sage-olive setting.
- `sea-salt-fries.webp` — One small shallow cream ceramic dish of golden straight-cut fries, with visible flaky sea salt. Warm ochre setting.
- `loaded-fries.webp` — One shallow cream dish of crisp golden fries generously drizzled with orange cheese sauce and visibly topped with sliced green jalapeños and scallions. Warm ochre setting.
- `onion-rings.webp` — One little cream ceramic dish of crunchy golden battered onion rings stacked so their round open centers read clearly. Warm ochre setting.
- `cabbage-slaw.webp` — One small shallow cream ceramic bowl of finely shredded pale green cabbage, purple cabbage and carrots, lightly glistening with tangy dressing. Warm ochre setting.
- `jalapeno-bites.webp` — One small cream dish of six round crunchy golden jalapeño cheese bites, with one split to show melting pale cheese and green jalapeño pieces. Warm ochre setting.
- `mint-tea.webp` — One short clear café glass cup and saucer containing translucent light green hot mint infusion, with a few distinctive fresh mint leaves visible at the surface. Soft sage-olive setting.
- `iced-lemon-tea.webp` — One plain tall glass of deep amber iced black tea, with clear ice cubes and a thin bright yellow lemon wheel. Ochre setting.
- `espresso.webp` — One very small cream speckled ceramic espresso demitasse with a little dark espresso and tawny crema on its matching saucer. Deep warm espresso-brown setting.
- `latte.webp` — One wide low cream ceramic latte cup and saucer, with pale microfoam and a clearly visible white rosette on caramel espresso. Warm espresso-brown setting.
- `chocolate-brownie.webp` — One thick square dark chocolate brownie on a little cream plate, with a crackled top and a visible rich fudgy cut side. Muted terracotta setting.
- `vanilla-scoop.webp` — Exactly one creamy ivory scoop of vanilla ice cream in a little chilled cream bowl, with fine natural vanilla flecks and soft scoop marks. Muted terracotta setting.
- `burnt-cheesecake.webp` — One thick slice of Basque burnt cheesecake on a small cream ceramic plate, with a very dark caramelized top and a pale creamy cut face. Muted terracotta setting.

The three cold drink prompts started with this art direction.

> Square close-up photorealistic beverage catalogue photograph of a single glass. The drink is the only subject. The entire glass stands alone at center and occupies three quarters of the image height. Soft directional café lighting, real beverage detail and a small contact shadow. No burger, fries, food, plates, cutlery, side dish, tray, cup, second glass, text, logos, hands or unrelated objects.

- `house-lemonade.webp` — One tall chilled clear glass of cloudy pale yellow lemonade with clear ice and a slim lemon wedge on the rim, beads of condensation. Muted sage-olive seamless tabletop and background.
- `cola.webp` — One tall chilled unbranded clear glass of dark caramel cola and visible angular ice, with tiny fizzy bubbles and condensation. Deep warm brick-red seamless tabletop and background.
- `sparkling-water.webp` — One chilled unbranded clear tumbler of completely transparent sparkling water, tiny rising bubbles highlighted against sage-olive, light condensation outside. Muted cool sage-olive seamless tabletop and background.

</details>
