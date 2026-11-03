# Feature Specification: Centered Mobile Logo and Header Controls

**Feature branch**: `005-mobile-centered-logo-header`
**Status**: Draft
**Input**: Refine only the mobile header: center the circular logo, align the BYTTEHMD wordmark above Brands, keep a fixed header while RO opens in a compact standalone dropdown directly below RU, and keep section links visible.

## User Scenarios & Testing

### User Story 1 - Read and use the mobile header (Priority: P1)

A visitor can recognize the BYTTEHMD identity and reach each primary navigation item without header elements overlapping.

**Independent Test**: Inspect the mobile header at 320px, 375px, and 430px, then open the RU selector and check the placement and usability of its menu.

**Acceptance Scenarios**:

1. **Given** a visitor opens the site on a phone, **When** the header is displayed, **Then** the circular logo icon is horizontally centered in the first header row.
2. **Given** the first header row is displayed, **When** the visitor views the controls, **Then** their order from the centered icon toward the right is theme first and RU second, with both slightly inset from the screen edge.
3. **Given** the BYTTEHMD wordmark is displayed with the icon, **When** the first row is rendered, **Then** the name sits a little farther left from the icon while remaining readable and not overlapping the icon or controls.
4. **Given** a visitor views the navigation row, **When** the mobile header is displayed, **Then** “Бренды”, “Преимущества”, “Каталог”, and “Контакты” remain together in one row directly below the first row, centered with balanced spacing and side margins.
5. **Given** a visitor hovers over or opens the RU selector, **When** the viewport is 320–374px wide, **Then** “RO” appears in a compact standalone dropdown above RU without resizing or moving the header.
6. **Given** the RU dropdown is open at 320–374px wide, **When** the visitor views the header, **Then** all four centered section links remain visible and unobscured.
7. **Given** a Romanian page is available, **When** a visitor selects RO, **Then** the site navigates to it and the menu closes. **Given** no Romanian page is available, **Then** RO remains visibly disabled and does not navigate to a broken page.
8. **Given** the viewport is 320px, 375px, or 430px wide, **When** the header and RU menu are displayed, **Then** controls and links do not create horizontal page scrolling; at 320–374px, the menu does not overlap the centered navigation links.
9. **Given** a visitor activates the request CTA, **When** the contact form is reached on mobile, **Then** the consultation heading and explanatory text are visible below the sticky header.
10. **Given** a desktop viewport, **When** the header is displayed, **Then** the existing desktop layout and behavior remain unchanged.

### User Story 2 - Preview the mobile header locally (Priority: P1)

The site owner can review the header changes locally before deciding whether to publish them.

**Independent Test**: Open the local site preview at the target phone widths and interact with the RU selector.

**Acceptance Scenarios**:

1. **Given** the local site is open at each target width, **When** the owner inspects the first and second header rows, **Then** the layout meets the requirements above.
2. **Given** the owner hovers over or taps RU, **When** the language menu opens, **Then** a compact RO option appears directly beneath the trigger without moving the header.
3. **Given** the owner activates RU again to close its menu, **When** the header returns to its default state, **Then** the menu is hidden and the RU control and navigation remain usable.
4. **Given** no Romanian page is available, **When** the owner tests RO, **Then** the option remains disabled and no broken navigation occurs.
5. **Given** the owner activates the request CTA, **When** the contact form is brought into view, **Then** the consultation heading and description are not obscured by the sticky header.

## Requirements

### Functional Requirements

- **FR-001**: Changes MUST be limited to mobile header presentation and interactions required to validate that presentation.
- **FR-002**: The circular logo icon MUST be horizontally centered in the first row of the mobile header.
- **FR-003**: The theme control MUST appear immediately to the right of the centered icon, followed by the RU control; both MUST be slightly inset from the right edge with spacing that adapts to viewport width.
- **FR-004**: The BYTTEHMD wordmark MUST be horizontally aligned above the Brands link, remain legible, and MUST NOT overlap the icon or controls.
- **FR-005**: “Бренды”, “Преимущества”, “Каталог”, and “Контакты” MUST remain visible together in one centered row directly beneath the first row, with balanced spacing and inset outer links rather than edge-aligned links.
- **FR-006**: The RU selector MUST open on hover, focus, and touch; at 320–374px, its compact RO option MUST appear above RU in a standalone dropdown that does not change header dimensions. At other mobile widths, its existing placement MUST remain unchanged.
- **FR-007**: With the RU dropdown open at 320–374px, all centered section links MUST remain visible and unobscured.
- **FR-008**: If a Romanian page is available, selecting RO MUST navigate to it and close the dropdown; otherwise, RO MUST remain disabled and MUST NOT navigate to a missing page.
- **FR-009**: The mobile request CTA MUST position the consultation heading and explanatory text below the sticky header.
- **FR-010**: The layout MUST be verified at viewport widths of 320px, 375px, and 430px, including with the RU menu open.
- **FR-011**: The mobile header MUST NOT introduce horizontal page overflow.
- **FR-012**: Desktop header layout and the rest of the page MUST remain unchanged.
- **FR-013**: A local preview MUST be provided for review; publication and commits are not required by this specification.

## Success Criteria

- **SC-001**: At 320px, 375px, and 430px, the circular icon is centered in the first row; the theme then RU controls are to its right without overlapping the wordmark.
- **SC-002**: At all target widths, the four named navigation links are visible in one centered row beneath the logo row, with balanced spacing from “Бренды” to “Контакты”.
- **SC-003**: At 320–374px, the compact RO dropdown opens above RU without changing header height; at other mobile widths, its existing placement is preserved.
- **SC-004**: At 320–374px, opening the dropdown leaves all centered section links visible and unobscured.
- **SC-005**: If RO is unavailable, selecting it is prevented; if a Romanian page is available, selecting it navigates to that page and closes the dropdown.
- **SC-006**: The CTA shows the consultation heading and description below the sticky header.
- **SC-007**: The header and open language menu fit within the viewport without horizontal scrolling.
- **SC-008**: Desktop header and all non-header page content retain their current appearance and behavior.
- **SC-009**: The local preview is available for the owner to inspect before any publication.

## Assumptions

- “Circular logo icon centered” means the circular mark itself is centered horizontally in the first mobile header row; the wordmark remains separately readable and is aligned above Brands with a balanced gap to the icon.
- “Swap the language and theme controls” means the first control to the right of the icon is the theme toggle, followed by RU toward the right edge.
- “Bring Contacts and Brands closer to the center” means center the complete four-link navigation group and provide balanced outer margins instead of placing its first and last links at the content edges.
- Control, wordmark, and navigation spacing should scale with the available viewport width while preserving tap targets and readable labels.
- No local Romanian page currently exists, so RO remains disabled until a working translation page is added.
- This specification does not authorize changes to desktop layout, page sections, or publishing.
