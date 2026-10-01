# BYTTEHMD catalog

## Product inventory in Firestore

The website reads product documents from the Firestore `products` collection.
Create one document per model/listing. The public catalog shows every document,
including products with `stock: 0`, and displays the available quantity.
Out-of-stock products have an availability inquiry button that opens the
request form and a direct phone link. Selecting a brand filters its models
regardless of stock.

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
