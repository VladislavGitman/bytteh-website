# Feature Specification: Romanian Language and Catalog-Aware Assistant

**Feature branch**: `001-romanian-language-ai-assistant`
**Status**: Draft
**Input**: Add Romanian to BYTTEHMD with a Russian/Romanian language switch, translate the full customer-facing site and catalog cards, and complete the AI assistant so it works in both languages with current catalog information. Use `https://bytteh.vercel.app/ru` as visual inspiration, not as a source to copy.

## User Scenarios & Testing

### User Story 1 - Switch between Russian and Romanian (Priority: P1)

A visitor can use the site in Russian or Romanian and switch languages from the upper-right area of the header.

**Why this priority**: Language selection is the entry point for every other localized experience.

**Independent Test**: Open the Russian and Romanian URLs directly, switch languages in the header, reload each URL, and verify that the selected language and current page location are retained.

**Acceptance Scenarios**:

1. **Given** a visitor opens the Russian site, **When** they select Romanian, **Then** the Romanian version opens and the language control clearly indicates Romanian.
2. **Given** a visitor opens the Romanian site, **When** they select Russian, **Then** the Russian version opens.
3. **Given** a visitor switches language while viewing a section or filtered catalog, **When** the other language opens, **Then** the visitor remains at the equivalent section and the active catalog filters are preserved when possible.
4. **Given** a visitor opens a language URL directly or refreshes it, **When** the page loads, **Then** the matching language is rendered without requiring a prior visit.

### User Story 2 - Browse a fully localized catalog and contact form (Priority: P1)

A Romanian-speaking visitor can understand the site content, product cards, catalog controls, and request form in Romanian, while Russian-speaking visitors retain the existing Russian experience.

**Why this priority**: Product discovery and submitting an inquiry are the site's primary customer tasks.

**Independent Test**: Inspect each locale with populated, empty, loading, and failed catalog states; submit the request form successfully and with a simulated failure in both locales.

**Acceptance Scenarios**:

1. **Given** the Romanian locale, **When** the visitor browses the page, **Then** navigation, headings, descriptions, calls to action, form labels and statuses, catalog controls, and accessibility labels are Romanian.
2. **Given** a product with Romanian category and description fields, **When** its card is rendered in Romanian, **Then** those Romanian fields are shown while its brand, model identifier, stock quantity, and price remain accurate.
3. **Given** a product whose Romanian category or description is missing, **When** its Romanian card is rendered, **Then** the missing field falls back to its Russian value and the card remains usable.
4. **Given** a visitor changes locale while an inquiry is being composed, **When** the new locale opens, **Then** the inquiry's entered values are not silently discarded.
5. **Given** a catalog or form error, **When** it is shown in either locale, **Then** the message and next step are understandable in that locale.

### User Story 3 - Get help from the AI assistant in either language (Priority: P1)

A visitor can ask the assistant in the selected language and receive useful answers grounded in current catalog information.

**Why this priority**: The assistant should support product discovery without misleading customers about availability or price.

**Independent Test**: Ask Russian and Romanian questions about a product present in the catalog, about a product absent from the catalog, and an unrelated question; verify language, grounding, and fallback behavior.

**Acceptance Scenarios**:

1. **Given** the site is in Romanian, **When** the visitor opens and uses the assistant, **Then** its labels, prompts, status messages, and responses are Romanian.
2. **Given** the site is in Russian, **When** the visitor uses the assistant, **Then** its labels, prompts, status messages, and responses remain Russian.
3. **Given** the visitor asks about a listed product, **When** the assistant answers, **Then** it uses current catalog facts and does not invent price, stock, condition, delivery, or warranty details.
4. **Given** the requested product information is absent or unavailable, **When** the assistant answers, **Then** it says so and directs the visitor to the catalog or shop contact instead of guessing.
5. **Given** the assistant service is unavailable or not configured, **When** the visitor sends a message, **Then** a localized, actionable error is shown and the rest of the site remains usable.

### User Story 4 - Publish and share the localized site (Priority: P2)

The site owner can deploy the completed changes through the existing GitHub-connected hosting workflow and share the live site on LinkedIn.

**Independent Test**: Verify the production Russian and Romanian URLs and assistant endpoint after deployment; prepare a LinkedIn announcement containing the live URL for owner review.

**Acceptance Scenarios**:

1. **Given** the changes are merged to the deployment branch, **When** the hosting workflow completes, **Then** both locale URLs and the assistant work on the live site.
2. **Given** a LinkedIn announcement is prepared, **When** it is ready to publish, **Then** the owner can review and approve the wording and destination URL before it is posted.

## Requirements

### Functional Requirements

- **FR-001**: The site MUST provide Russian and Romanian locales, with a language control in the upper-right portion of the header on desktop and a usable equivalent on narrow screens.
- **FR-002**: The site MUST support direct entry and refresh for `/ru` and `/ro`; an unknown or missing locale MUST resolve to Russian.
- **FR-003**: Switching locales MUST retain the visitor's equivalent page location and preserve in-progress form values and applicable catalog filters.
- **FR-004**: All customer-facing static content and dynamic interface states MUST be localized, including navigation, headings, buttons, forms, validation and submission messages, catalog loading/empty/error states, and assistant interface text.
- **FR-005**: The Russian locale MUST preserve the current Russian content and site behavior.
- **FR-006**: Product documents MUST support optional `categoryRo` and `descriptionRo` text fields. Romanian cards MUST use these fields when present and fall back per field to the existing Russian values when absent.
- **FR-007**: Product brand names, model identifiers, stock quantities, and monetary values MUST remain accurate and MUST NOT be machine-translated. Price formatting and surrounding labels MUST match the selected locale while retaining MDL.
- **FR-008**: Existing filtering, product ordering/inquiry, and Firebase order submission MUST continue to work in both locales.
- **FR-009**: The assistant MUST localize its interface and answer in the active site language.
- **FR-010**: The assistant MUST ground product-specific claims in current catalog data and MUST NOT fabricate price, availability, condition, delivery, or warranty information. If current data is unavailable, it MUST say so and provide the existing contact path.
- **FR-011**: The assistant MUST remain usable on the supported production host, show localized errors when unavailable, and keep provider credentials out of client code and Git.
- **FR-012**: The visual treatment MAY take general inspiration from the reference site's language selector and product-card presentation, but MUST retain BYTTEHMD branding and MUST NOT copy the reference site's text, logo, or distinctive visual assets.
- **FR-013**: Deployment MUST keep the existing production hosting and Firebase catalog/order behavior intact. A LinkedIn post MUST be reviewed and approved by the owner before publication.

### Key Entities

- **Locale**: One of Russian (`ru`) or Romanian (`ro`), selected by the URL and exposed in the header control.
- **Product**: Existing Firestore product data plus optional Romanian category and description fields; existing brand, model, price, stock, and image remain authoritative.
- **Assistant conversation**: Visitor messages and assistant replies in the active locale, with product-specific answers grounded in current catalog data.

## Success Criteria

- **SC-001**: A visitor can reach Russian and Romanian versions from the header in one action, and each version works when opened directly or refreshed.
- **SC-002**: All customer-facing page and catalog interface text is in the selected locale; missing Romanian product text follows the specified per-field Russian fallback.
- **SC-003**: Product filters, price/stock display, order inquiries, and form submissions pass the same behavioral checks in both locales.
- **SC-004**: In test conversations in both languages, the assistant answers in the active locale, uses current catalog facts when available, and does not invent unavailable facts.
- **SC-005**: Locale switching and deployment introduce no broken navigation, missing assets, or client-visible provider credentials.
- **SC-006**: The deployed site exposes working Russian and Romanian URLs, and any LinkedIn announcement is published only after owner approval.

## Assumptions

- The existing Russian site remains the source of truth for Russian copy and behavior.
- Romanian product text will be supplied through optional Firestore fields; no automatic machine translation is required.
- Currency remains Moldovan lei (MDL), and current brand/model identifiers are not translated.
- The reference site is used only for broad layout inspiration. BYTTEHMD-specific copy and assets remain in use.
- Publishing this feature to GitHub and preparing a LinkedIn share are release activities; external publication requires owner approval.
