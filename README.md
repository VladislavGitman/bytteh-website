# BYTTEHMD catalog

## Product inventory in Firestore

The website reads product documents from the Firestore `products` collection.
Create one document per model/listing. The public catalog shows every document,
including products with `stock: 0`, and displays the available quantity.
Out-of-stock products have an availability inquiry button that opens the
request form and a direct phone link. Selecting a brand filters its models
regardless of stock.

Submitting the quick picker filters the catalog by the selected category and
maximum budget, then scrolls to the product cards. Ordering directly from the
quick picker also applies its category and budget filters before opening the
request form. Clicking a brand adds that filter without clearing category or
budget, and submitting the quick picker after selecting a brand preserves the
brand filter. The filters combine, so only products matching every selected
criterion are shown. Categories are matched from Firestore `category`, `model`,
and `description` text:
refrigerator/freezer terms, dishwasher terms, washing-machine terms, and
cooktop/induction/stove terms map to the corresponding picker categories.
If a selected brand has no products in the selected category, the category and
budget filters are cleared and all products from the selected brand are shown.
If the brand has products in the selected category but none are within budget,
the combined filters remain active and the empty result is shown.
If an image is not set for Liebherr, Miele, Siemens, or Bosch, the catalog uses
the matching local card image when available.

Each document must contain:

| Field | Type | Example |
| --- | --- | --- |
| `brand` | string | `Miele` |
| `model` | string, optional | `G 7100 SC` |
| `category` | string | `Посудомоечные машины` |
| `description` | string, optional | `Встраиваемая посудомоечная машина` |
| `price` | number, preferably (numeric string also accepted) | `25000` |
| `stock` | integer, zero or more (numeric string also accepted) | `1` |
| `image` | string, optional | `./assets/miele-card.jpg` |

Use the `Number` field type for `price` and `stock` in Firestore when possible.
Numeric strings such as `"25000"` and `"1"` are accepted and converted by the
website, but invalid values and fractional stock quantities are rejected.
If `model` is missing or blank, the brand is used as the card title. If
`description` is missing or blank, the card asks customers to contact the shop
for model details. This allows incomplete listings to remain visible.

Publish `firestore.rules` to Firebase for the website to read the public
catalog. Catalog documents are read-only from the website; manage inventory
from the Firebase Console or a trusted Admin SDK.


## ИИ-чат

The floating BYTTEHMD assistant is served by the Vercel Function at `/api/chat`.
The browser keeps up to 40 chat messages in its local storage; chat history is not written to Firestore.
The widget is hidden on GitHub Pages because that static host cannot serve the API function.

To enable the assistant, deploy this repository on Vercel and add `OPENROUTER_KEYS`
in the Vercel project Environment Variables. Enter the OpenRouter API keys as a
comma-separated list in the encrypted/sensitive value field, then redeploy. Keep
the keys out of GitHub and browser code. The function also accepts the optional `OPENROUTER_MODEL` variable; its
default is `openrouter/auto`. Keep the website and API on the same Vercel
project/domain so the browser can call `/api/chat`.

The existing Firebase project `bytteh-website` remains responsible for the
`products` catalog and `orders` collection. The chat widget does not change
Firestore rules or database records.
