# Feature Specification: Mobile Header Controls and Navigation

**Feature branch**: `003-mobile-header-controls`
**Status**: Draft
**Input**: Update the mobile header to match the supplied annotated screenshot: keep the brand/logo on the left and move the language and theme controls to the right of it in the top row. Use the resulting space for all four navigation links—Brands, Advantages, Catalog, and Contacts—in a second row. Keep the request CTA in a separate row below.

## User Scenarios & Testing

### User Story 1 - Use all navigation links on mobile (Priority: P1)

A visitor can use every primary navigation link from a phone without opening a menu or scrolling sideways.

**Why this priority**: Advantages and Contacts are currently hidden from the compact mobile navigation, making sections less discoverable.

**Independent Test**: At common phone widths, verify each navigation link is visible, tappable, and reaches its corresponding section without horizontal overflow.

**Acceptance Scenarios**:

1. **Given** a visitor opens the site on a phone, **When** the header appears, **Then** the logo is at the left of the top row and the RU language selector and theme control are at its right.
2. **Given** the mobile header is shown, **When** the visitor views the second row, **Then** Brands, Advantages, Catalog, and Contacts are all visible and lead to their matching sections.
3. **Given** the mobile header is shown, **When** the visitor views the request CTA, **Then** it occupies a distinct row below navigation and remains easy to tap.
4. **Given** a visitor uses a narrow phone viewport, **When** the header is rendered, **Then** controls do not overlap, become clipped, or create horizontal page scrolling.
5. **Given** a visitor activates the language selector or theme control, **When** they use touch or keyboard, **Then** each control retains its existing interaction and remains visually distinguishable.
6. **Given** a desktop viewport, **When** the header is rendered, **Then** the existing desktop navigation layout remains unchanged.

### User Story 2 - Reach the request form from the mobile CTA (Priority: P1)

A visitor can use the request button to go directly to the form where they can enter their name and phone number.

**Independent Test**: Tap the mobile request CTA from the top of the page and verify the request form and submit button are brought into view.

**Acceptance Scenarios**:

1. **Given** a visitor is anywhere on the page, **When** they tap the request CTA, **Then** the page scrolls to the Contacts request form, not the catalog.
2. **Given** the form is reached on a phone, **When** the visitor views it, **Then** the name and phone fields and submit button are visible and usable.

## Requirements

### Functional Requirements

- **FR-001**: At mobile widths, the header top row MUST show the logo/brand on the left and the language and theme controls on the right, matching the annotated reference arrangement.
- **FR-002**: The second mobile header row MUST show all primary navigation links: Brands, Advantages, Catalog, and Contacts.
- **FR-003**: The request CTA MUST appear in its own row below the navigation links and MUST remain visibly labeled and touch-accessible.
- **FR-004**: The mobile header MUST fit common phone widths without overlap, clipped controls, or horizontal scrolling.
- **FR-005**: The language selector, theme control, navigation links, and request CTA MUST remain accessible by keyboard and touch.
- **FR-006**: Each navigation link MUST continue to target its corresponding existing section.
- **FR-007**: The request CTA MUST navigate directly to the Contacts request form, where the visitor can enter their name and phone number.
- **FR-008**: Existing desktop header layout and behavior MUST remain unchanged.

### Key Entities

- **Mobile header row 1**: Site identity plus language and theme controls.
- **Mobile header row 2**: Four primary section links.
- **Mobile request row**: A clearly labeled request CTA linking directly to the inquiry form.

## Success Criteria

- **SC-001**: At 320px, 360px, 375px, 430px, and 640px viewport widths, all required mobile header controls remain visible and non-overlapping with no horizontal scrolling.
- **SC-002**: All four primary links can be activated and reach the correct sections.
- **SC-003**: The request CTA brings the request form into view, with the name field, phone field, and submit action usable on screen.
- **SC-004**: At desktop widths, the pre-existing header presentation remains intact.

## Assumptions

- “The place on the right of the logo” refers to the first/top header row shown with red annotations in the supplied screenshot.
- “Use the freed space for Advantages and Contacts” means all four navigation links share the row below the brand and controls.
- The CTA stays separate below navigation, preserving its current clear label and destination.
- This specification records the desired behavior and does not itself modify or publish the site.
