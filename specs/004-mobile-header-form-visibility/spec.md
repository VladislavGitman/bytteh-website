# Feature Specification: Mobile Header Alignment and Form Visibility

**Feature branch**: `004-mobile-header-form-visibility`
**Status**: Draft
**Input**: Refine the mobile brand alignment, language menu, theme control, and request-form destination based on the annotated phone screenshot.

## User Scenarios & Testing

### User Story 1 - Use the mobile header without obstruction (Priority: P1)

A visitor can recognize the BYTTEHMD brand and reach navigation and display controls without the controls competing for space.

**Independent Test**: At common phone widths, inspect the header in its default state and with the RU menu open.

**Acceptance Scenarios**:

1. **Given** a visitor opens the site on a phone, **When** the header is shown, **Then** the logo and BYTTEHMD name are centered together in the area beside the language and theme controls, with a balanced logo-to-wordmark proportion.
2. **Given** the mobile header is shown, **When** the visitor views the theme control, **Then** it is shifted slightly toward the center and visually aligned with the Contacts area without colliding with the language control.
3. **Given** a visitor opens the RU language menu, **When** the Romanian option is displayed, **Then** it does not cover or prevent use of the Contacts link or theme control.
4. **Given** a visitor uses a narrow phone viewport, **When** the header is rendered or the language menu is opened, **Then** no header content is clipped and the page has no horizontal overflow.
5. **Given** a desktop viewport, **When** the header is rendered, **Then** the existing desktop layout remains unchanged.

### User Story 2 - See the consultation heading after requesting contact (Priority: P1)

A visitor who taps the request button can immediately see the heading that introduces the consultation form.

**Independent Test**: From the top of the page, activate the request CTA on a phone and verify the consultation heading is fully visible below the sticky header.

**Acceptance Scenarios**:

1. **Given** a visitor is on a phone, **When** they activate the request CTA, **Then** the page scrolls to the consultation block with enough top spacing that the full consultation heading is visible and not obscured by the sticky header.
2. **Given** the consultation block is in view, **When** the visitor uses the form, **Then** the explanatory text, name field, phone field, and submit button remain visible and usable through normal scrolling.
3. **Given** a desktop viewport, **When** the visitor activates the request CTA, **Then** it continues to navigate to the same request form.

## Requirements

### Functional Requirements

- **FR-001**: On mobile, the logo and BYTTEHMD name MUST form a visually centered brand lockup in the area available beside the language and theme controls.
- **FR-002**: The brand lockup MUST retain readable text and proportionate logo, wordmark, and gap dimensions without overlapping the language or theme controls.
- **FR-003**: The mobile theme control MUST move slightly toward the center in relation to its current placement and align visually with the Contacts navigation area while remaining distinct from other controls.
- **FR-004**: Opening the language menu MUST NOT obscure or block the Contacts link or theme control.
- **FR-005**: Header controls and navigation MUST remain visible and usable on narrow phone screens without horizontal page overflow.
- **FR-006**: The mobile request CTA MUST scroll to the consultation block with enough offset for the full consultation heading to appear below the sticky header.
- **FR-007**: The request form fields and submit action MUST remain available and usable after navigation to the consultation block.
- **FR-008**: Existing desktop header and request-form behavior MUST remain unchanged.

## Success Criteria

- **SC-001**: At 320px, 360px, 375px, 430px, and 640px viewport widths, the logo, brand name, language control, and theme control are fully visible, proportionate, and non-overlapping.
- **SC-002**: Opening the language menu does not cover the Contacts link or theme control at the tested phone widths.
- **SC-003**: Activating the request CTA on a phone places the full consultation heading below the sticky header.
- **SC-004**: The name and phone inputs and submit action remain usable after the CTA navigation.
- **SC-005**: Desktop header layout and CTA destination retain their current behavior.

## Assumptions

- “Put the icon in the middle” refers to centering the logo together with the BYTTEHMD wordmark, not centering the icon separately from its name.
- The theme control should move inward toward the center while staying associated with the Contacts area; exact pixel coordinates are an implementation detail.
- The Romanian option may be positioned or the menu layout adjusted as needed, provided it does not obstruct Contacts or the theme control.
- The CTA visibility issue is caused by scrolling to the form itself rather than the consultation block; the intended outcome is visibility of the full consultation heading, not a particular pixel offset.
- This specification records the desired behavior and does not itself publish the site.
