# Feature Specification: Mobile Header and Light-Theme Color Controls

**Feature branch**: `002-mobile-header-light-theme-colors`
**Status**: Draft
**Input**: Make the mobile site header fit the application CTA and language/theme controls without overlap. Hide the mobile-only “Advantages” and “Contacts” navigation links. Add separate color controls to the existing VS Code design editor for the top brand marquee, primary buttons, and quick-picker panel in the light theme.

## User Scenarios & Testing

### User Story 1 - Use the site header on a phone (Priority: P1)

A visitor can use the main navigation, language selector, theme toggle, and request CTA on a narrow screen without controls overlapping or becoming inaccessible.

**Why this priority**: Header controls are needed to navigate, request service, and switch language or theme on mobile.

**Independent Test**: Open the site at 320px, 375px, and 640px viewport widths; verify the header controls, destinations, and touch interactions.

**Acceptance Scenarios**:

1. **Given** a visitor opens the site on a phone, **When** the header is shown, **Then** the logo, “Brands”, “Catalog”, language selector, theme toggle, and “Leave a request” CTA are available without horizontal page overflow or overlapping elements.
2. **Given** the mobile header is shown, **When** the visitor views navigation links, **Then** “Advantages” and “Contacts” are hidden from the mobile navigation.
3. **Given** the viewport becomes narrow, **When** the header controls no longer fit on one row, **Then** they wrap or stack cleanly while remaining visible, readable, and operable.
4. **Given** the visitor activates the language selector or theme toggle, **When** they use it by touch or keyboard, **Then** it retains its existing behavior and does not obstruct the request CTA.
5. **Given** a desktop viewport above the mobile breakpoint, **When** the header is rendered, **Then** its existing desktop navigation and appearance remain unchanged.

### User Story 2 - Adjust selected light-theme colors in the VS Code editor (Priority: P1)

The site owner can independently change the color of the top brand marquee, primary buttons, and quick-picker panel using the existing VS Code visual design editor and its live preview.

**Why this priority**: The owner wants to refine these specific parts of the light-theme design without editing CSS manually.

**Independent Test**: Change each color in the editor, inspect the preview in light and dark themes, save, reload, and reset the design.

**Acceptance Scenarios**:

1. **Given** the design editor is open, **When** the owner changes the brand-marquee color, **Then** the preview updates that surface without unexpectedly changing the button or quick-picker colors.
2. **Given** the design editor is open, **When** the owner changes the primary-button color, **Then** the relevant primary action buttons update consistently in the preview.
3. **Given** the design editor is open, **When** the owner changes the quick-picker panel color, **Then** the quick-picker panel updates without changing unrelated cards.
4. **Given** the owner saves the selected colors, **When** the site is reloaded, **Then** those colors persist in the local design override file.
5. **Given** a color is adjusted, **When** the owner switches to dark theme, **Then** the existing dark-theme palette remains unchanged.
6. **Given** the owner chooses “Restore original design”, **When** the reset completes, **Then** all new color controls return to their documented default values along with existing editor defaults.
7. **Given** a selected background color changes, **When** its content is displayed, **Then** text and controls remain legible and have visible focus states.

## Requirements

### Functional Requirements

- **FR-001**: At the existing mobile breakpoint, the header MUST keep the logo, “Brands” and “Catalog” navigation, language selector, theme toggle, and “Leave a request” CTA available.
- **FR-002**: The mobile navigation MUST hide the “Advantages” and “Contacts” links; their page sections and desktop navigation MUST remain unchanged.
- **FR-003**: The mobile header MUST adapt its layout at narrow widths without overlapping controls, clipping essential labels, or causing horizontal page scrolling. It MAY wrap or use multiple compact rows.
- **FR-004**: The language selector and theme toggle MUST remain accessible by touch and keyboard at supported mobile widths, and their existing behavior MUST be preserved.
- **FR-005**: The existing VS Code design editor MUST expose independent color controls for the top brand marquee background, primary action buttons, and quick-picker panel background.
- **FR-006**: Each color control MUST update only its associated surface in the editor preview. Primary action-button styling MUST remain consistent across the site's primary calls to action.
- **FR-007**: The three new color settings MUST apply to the light theme only. The existing dark-theme colors and theme toggle behavior MUST remain unchanged.
- **FR-008**: The editor MUST persist the new color values through its existing `design-overrides.css` save workflow and restore their documented defaults through its reset workflow.
- **FR-009**: Color changes MUST preserve readable text contrast, button affordance, hover/focus feedback, and existing reduced-motion and responsive behavior.
- **FR-010**: Existing editor settings for typography, spacing, radii, and shared site colors MUST continue to load, preview, save, and reset.

### Key Entities

- **Mobile header**: Site identity, main navigation, locale selector, theme toggle, and request CTA arranged for narrow viewports.
- **Light-theme color setting**: An independently editable color value for the brand marquee, primary buttons, or quick-picker panel, persisted in the local design override stylesheet.
- **Design preview**: The local site rendering used by the VS Code visual editor to preview changes before saving.

## Success Criteria

- **SC-001**: At 320px, 375px, and 640px viewport widths, all required mobile header controls remain visible and usable without overlap or horizontal page overflow.
- **SC-002**: On mobile, “Advantages” and “Contacts” are absent from the navigation while their sections remain reachable through existing page content and desktop navigation.
- **SC-003**: Changing any one of the three editor color controls updates its intended light-theme surface without changing the other two.
- **SC-004**: Saved color values persist after reload, while switching to dark theme preserves the existing dark palette.
- **SC-005**: Reset restores all three color controls to their defaults and does not break previously supported editor settings.

## Assumptions

- The existing mobile breakpoint in `index.html` remains the breakpoint for this responsive-header change unless implementation testing demonstrates that a nearby adjustment is necessary.
- “Advantages” and “Contacts” are removed only from mobile navigation; the content sections themselves are not removed.
- The “Leave a request” CTA remains a visible, labeled control on mobile rather than being hidden or replaced with an icon.
- The quick-picker color setting applies to the quick-picker panel/card, not the surrounding page or every card on the site.
- Color changes are made locally in the editor; publishing the site remains a separate owner-approved release step.
