# Implementation Plan: Mobile Header and Consultation Visibility

## Scope

Implement the three mobile adjustments in the annotated screenshot: balance and center the BYTTEHMD logo/wordmark, keep the Romanian language menu clear of Contacts and the theme control, and make the consultation heading visible after tapping the request CTA. Preserve desktop behavior.

## Goal

On phone widths, position the logo and “BYTTEHMD” wordmark closer to the center of the header and tune their size and spacing in proportion to the language and theme controls. Keep the language popup away from Contacts and the theme control. On CTA activation, position the consultation heading below the sticky header.

## Current Implementation

- The logo and wordmark are grouped in the `.brand` anchor in `index.html`.
- Mobile sizing for `.brand` and `.brand-mark`, and positioning of the language/theme controls, are defined in `design-overrides.css`.
- The mobile language and theme controls currently occupy reserved space at the right side of the header.
- The RU switcher is inserted after Contacts; its popup currently opens over the navigation row.
- The request CTA currently scrolls the form to the viewport center, which can hide the heading above the form.

## Implementation Approach

1. Adjust the mobile header grid and reserved control space in `design-overrides.css`; keep the logo and wordmark together and centered in the available area beside the control cluster.
2. Tune logo size, wordmark size, and gap as a proportioned group that fits narrow phone widths.
3. Move the theme control slightly inward toward the Contacts column and position the language popup to the left of its trigger so it does not obstruct Contacts or the theme control.
4. Add mobile scroll spacing to the consultation block and update the CTA handler in `index.html` to scroll that block into view on compact layouts. Preserve the existing desktop form-centered behavior.
5. Leave the navigation links, CTA destination, and unrelated interactions unchanged.

## Validation Plan

- Inspect the mobile header at 320px, 360px, 375px, 430px, and 640px viewport widths.
- Confirm the logo and full wordmark are visible, centered in their available area, and proportionate to the adjacent control cluster.
- Open the RU menu and confirm its popup does not overlap Contacts or the theme control.
- Activate the request CTA and confirm the full consultation heading is visible below the sticky header; verify the form fields remain usable.
- Confirm no horizontal page overflow is introduced and the desktop header remains unchanged.

## Out of Scope

- Changing the language options or implementing the Romanian translation.
- Changing the request CTA destination.
- Publishing the changes.
