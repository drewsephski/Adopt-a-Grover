# Mobile UX Analysis: Dialogs and Forms

**Analysis Date:** January 4, 2026  
**Project:** Adopt a Grover - Gift Adoption Platform  
**Focus:** Mobile UX issues in dialogs and forms

---

## Executive Summary

This analysis identifies **11 dialog components** and **6 base UI components** with multiple mobile UX issues. The most critical issues are:

1. **Touch target sizes** - Most buttons and interactive elements are below 44x44px minimum
2. **Dialog close buttons** - All close buttons are only 16x16px (h-4 w-4)
3. **Input field heights** - Default inputs are 36px (h-9), below 44px minimum
4. **Dialog positioning** - No bottom sheet positioning for mobile screens
5. **Select dropdowns** - Trigger heights are 32-36px, below minimum touch targets

---

## Dialog Components Inventory

### Admin Dialogs (8 components)

1. **CreateCampaignDialog** - Create new donation campaigns
2. **CreateFamilyDialog** - Add families to campaigns
3. **CreateGiftDialog** - Add gift items to families
4. **CreatePersonDialog** - Add people to families
5. **EditFamilyDialog** - Edit family aliases
6. **EditGiftDialog** - Edit gift details
7. **ImportCSVDialog** - Bulk import families and gifts
8. **ManagePersonsDialog** - View and manage family members

### Donor Dialogs (2 components)

9. **AdoptFamilyDialog** - Adopt entire families
2. **ClaimDialog** - Claim individual gifts

### Other Dialogs (1 component)

11. **OnboardingModal** - Welcome/tutorial modal

---

## Base UI Components Analysis

### 1. Dialog Component ([`components/ui/dialog.tsx`](components/ui/dialog.tsx))

**Issues Found:**

| Severity | Line | Issue | Impact |
|----------|------|-------|--------|
| **Critical** | 47 | Close button is `h-4 w-4` (16x16px) - below 44x44px minimum | Very difficult to tap on mobile |
| High | 41 | Dialog uses `max-w-lg` (32rem/512px) - may cause horizontal scroll on small screens | Poor fit on mobile devices |
| High | 76 | DialogFooter buttons may be too close together on mobile | Accidental taps |
| Medium | 41 | No bottom sheet positioning for mobile (`data-[state=bottom-0]` exists but not used) | Not following mobile patterns |
| Low | 47 | Close button has no visual focus state for keyboard navigation | Accessibility concern |

**Recommendations:**

- Increase close button to minimum 44x44px (h-11 w-11)
- Add mobile-specific bottom sheet variant
- Add responsive max-width: `max-w-[95vw] max-w-md sm:max-w-lg`
- Add minimum 16px spacing between footer buttons

---

### 2. Input Component ([`components/ui/input.tsx`](components/ui/input.tsx))

**Issues Found:**

| Severity | Line | Issue | Impact |
|----------|------|-------|--------|
| **Critical** | 11 | Input height is `h-9` (36px) - below 44x44px minimum | Difficult to tap on mobile |
| Medium | 11 | Padding `px-2.5 py-1` may be insufficient for touch | Text may be hard to edit |
| Low | 11 | No mobile-specific variant for larger touch targets | One-size-fits-all approach |

**Recommendations:**

- Increase default height to `h-11` (44px minimum)
- Add mobile variant: `data-mobile="true"` with `h-12`
- Increase padding to `px-4 py-3` for better touch targets
- Add responsive height: `h-10 sm:h-9`

---

### 3. Textarea Component ([`components/ui/textarea.tsx`](components/ui/textarea.tsx))

**Issues Found:**

| Severity | Line | Issue | Impact |
|----------|------|-------|--------|
| Medium | 10 | No explicit height specified, uses `min-h-16` (64px) | May be too short for comfortable typing |
| Medium | 10 | Padding `px-2.5 py-2` - may be insufficient for touch | Text may be hard to edit |

**Recommendations:**

- Increase minimum height to `min-h-[120px]` for better mobile typing
- Increase padding to `px-4 py-3`
- Add mobile variant with larger touch targets

---

### 4. Select Component ([`components/ui/select.tsx`](components/ui/select.tsx))

**Issues Found:**

| Severity | Line | Issue | Impact |
|----------|------|-------|--------|
| **Critical** | 47 | Default trigger height `h-9` (36px) - below 44x44px minimum | Difficult to tap |
| **Critical** | 47 | Small variant `h-8` (32px) - even worse for mobile | Very difficult to tap |
| Medium | 114 | Select items have `py-1.5` (6px vertical padding) | Items may be too small to tap |
| High | 71 | SelectContent dropdown may be clipped on small screens | Poor visibility of options |

**Recommendations:**

- Increase default trigger to `h-11` (44px minimum)
- Remove or increase small variant to `h-10`
- Increase item padding to `py-2.5` (10px)
- Add mobile-specific max-height and positioning

---

### 5. Field Component ([`components/ui/field.tsx`](components/ui/field.tsx))

**Issues Found:**

| Severity | Line | Issue | Impact |
|----------|------|-------|--------|
| Medium | 40 | FieldGroup uses `gap-7` (28px) - may be excessive on mobile | Wasted vertical space |
| Medium | 48 | Field uses `gap-3` (12px) - may be insufficient between label and input | Visual crowding |

**Recommendations:**

- Add responsive gap: `gap-4 sm:gap-7` for FieldGroup
- Add responsive gap: `gap-2 sm:gap-3` for Field
- Consider tighter spacing for mobile screens

---

### 6. Label Component ([`components/ui/label.tsx`](components/ui/label.tsx))

**Issues Found:**

| Severity | Line | Issue | Impact |
|----------|------|-------|--------|
| Low | 16 | No explicit tap target size - relies on associated input | May be hard to tap if needed |

**Recommendations:**

- Add minimum tap target of 44x44px for interactive labels
- Ensure sufficient spacing from inputs

---

### 7. Button Component ([`components/ui/button.tsx`](components/ui/button.tsx))

**Issues Found:**

| Severity | Line | Issue | Impact |
|----------|------|-------|--------|
| **Critical** | 20 | Default size `h-9` (36px) - below 44x44px minimum | Difficult to tap |
| **Critical** | 22 | Small size `h-8` (32px) - even worse for mobile | Very difficult to tap |
| **Critical** | 21 | Extra small size `h-6` (24px) - extremely small | Nearly impossible to tap |
| High | 23 | Large size `h-10` (40px) - still below minimum | Still difficult to tap |
| High | 24-27 | Icon buttons are 24-40px - below minimum | Difficult to tap |

**Recommendations:**

- Increase default size to `h-11` (44px minimum)
- Increase small size to `h-10` (40px)
- Remove or increase extra small size to `h-9`
- Increase large size to `h-12` (48px)
- Increase all icon buttons to minimum 44x44px
- Add mobile-specific variants with larger touch targets

---

## Dialog-Specific Issues

### 1. Onboarding Modal ([`components/onboarding-modal.tsx`](components/onboarding-modal.tsx))

**Issues Found:**

| Severity | Line | Issue | Impact |
|----------|------|-------|--------|
| **Critical** | 201-203 | Step indicators are `h-2` (8px) - impossible to tap | Cannot interact with progress |
| **Critical** | 194 | Dialog uses `max-w-[550px]` - horizontal scroll on small screens | Poor mobile fit |
| High | 224-231 | Footer buttons may be too close together | Accidental taps |
| High | 216 | Fixed min-height `min-h-[400px]` - may cause scrolling | Poor viewport usage |
| Medium | 149-164 | Feedback buttons use `size="sm"` (32px) - below minimum | Difficult to tap |
| Medium | 172-178 | Textarea has `min-h-[80px]` - may be too short | Difficult to type |

**Recommendations:**

- Increase step indicators to minimum 44x44px for interaction
- Add responsive max-width: `max-w-[95vw] max-w-md sm:max-w-[550px]`
- Add minimum 16px spacing between footer buttons
- Remove fixed min-height, use viewport-based sizing
- Increase feedback buttons to `size="default"` or larger
- Increase textarea to `min-h-[120px]`

---

### 2. CreateCampaignDialog ([`components/admin/create-campaign-dialog.tsx`](components/admin/create-campaign-dialog.tsx))

**Issues Found:**

| Severity | Line | Issue | Impact |
|----------|------|-------|--------|
| High | 55 | Dialog uses `max-w-[425px]` - may cause horizontal scroll | Poor mobile fit |
| High | 66-72 | Input uses default height (36px) - below minimum | Difficult to tap |
| High | 74-76 | Helper text is `text-[10px]` - very small on mobile | Hard to read |
| Medium | 75-88 | Footer buttons may be too close | Accidental taps |

**Recommendations:**

- Add responsive max-width: `max-w-[95vw] max-w-md sm:max-w-[425px]`
- Increase input height to 44px minimum
- Increase helper text to `text-xs` (12px)
- Add minimum 16px spacing between footer buttons

---

### 3. CreateFamilyDialog ([`components/admin/create-family-dialog.tsx`](components/admin/create-family-dialog.tsx))

**Issues Found:**

| Severity | Line | Issue | Impact |
|----------|------|-------|--------|
| High | 56 | Dialog uses `max-w-[425px]` - may cause horizontal scroll | Poor mobile fit |
| High | 67-73 | Input uses default height (36px) - below minimum | Difficult to tap |
| High | 74-76 | Helper text is `text-[10px]` - very small on mobile | Hard to read |
| Medium | 79-92 | Footer buttons may be too close | Accidental taps |

**Recommendations:**

- Add responsive max-width: `max-w-[95vw] max-w-md sm:max-w-[425px]`
- Increase input height to 44px minimum
- Increase helper text to `text-xs` (12px)
- Add minimum 16px spacing between footer buttons

---

### 4. CreateGiftDialog ([`components/admin/create-gift-dialog.tsx`](components/admin/create-gift-dialog.tsx))

**Issues Found:**

| Severity | Line | Issue | Impact |
|----------|------|-------|--------|
| **Critical** | 112 | Dialog uses `max-w-[500px]` - horizontal scroll on small screens | Poor mobile fit |
| **Critical** | 128-148 | Toggle buttons use `size="sm"` (32px) - below minimum | Difficult to tap |
| **Critical** | 181-203 | Select trigger uses default height (36px) - below minimum | Difficult to tap |
| High | 125 | Form uses `grid-cols-4` - labels on left, inputs on right | Poor mobile layout |
| High | 209-250 | All inputs use default height (36px) - below minimum | Difficult to tap |
| High | 231-240 | Textarea uses default padding - may be insufficient | Hard to edit text |
| High | 125 | Grid layout with 4 columns on mobile - very cramped | Poor usability |

**Recommendations:**

- Add responsive max-width: `max-w-[95vw] max-w-md sm:max-w-[500px]`
- Increase toggle buttons to `size="default"` or larger
- Increase select trigger to 44px minimum
- Change to single-column layout on mobile: `grid-cols-1 sm:grid-cols-4`
- Increase all inputs to 44px minimum
- Increase textarea padding to `px-4 py-3`
- Remove labels from left side on mobile, place above inputs

---

### 5. CreatePersonDialog ([`components/admin/create-person-dialog.tsx`](components/admin/create-person-dialog.tsx))

**Issues Found:**

| Severity | Line | Issue | Impact |
|----------|------|-------|--------|
| High | 68 | Dialog uses `max-w-[500px]` - may cause horizontal scroll | Poor mobile fit |
| High | 78-95 | Inputs use default height (36px) - below minimum | Difficult to tap |
| High | 104-119 | Select trigger uses default height (36px) - below minimum | Difficult to tap |
| Medium | 135-159 | Footer buttons use `flex-1` - may be too close | Accidental taps |

**Recommendations:**

- Add responsive max-width: `max-w-[95vw] max-w-md sm:max-w-[500px]`
- Increase all inputs to 44px minimum
- Increase select trigger to 44px minimum
- Add minimum 16px spacing between footer buttons

---

### 6. EditFamilyDialog ([`components/admin/edit-family-dialog.tsx`](components/admin/edit-family-dialog.tsx))

**Issues Found:**

| Severity | Line | Issue | Impact |
|----------|------|-------|--------|
| High | 56 | Dialog uses `max-w-[425px]` - may cause horizontal scroll | Poor mobile fit |
| High | 67-73 | Input uses default height (36px) - below minimum | Difficult to tap |
| High | 74-76 | Helper text is `text-[10px]` - very small on mobile | Hard to read |
| Medium | 79-92 | Footer buttons may be too close | Accidental taps |

**Recommendations:**

- Add responsive max-width: `max-w-[95vw] max-w-md sm:max-w-[425px]`
- Increase input height to 44px minimum
- Increase helper text to `text-xs` (12px)
- Add minimum 16px spacing between footer buttons

---

### 7. EditGiftDialog ([`components/admin/edit-gift-dialog.tsx`](components/admin/edit-gift-dialog.tsx))

**Issues Found:**

| Severity | Line | Issue | Impact |
|----------|------|-------|--------|
| **Critical** | 82 | Dialog uses `max-w-[500px]` - horizontal scroll on small screens | Poor mobile fit |
| **Critical** | 98-109 | Select trigger uses default height (36px) - below minimum | Difficult to tap |
| High | 90 | Form uses `grid-cols-4` - labels on left, inputs on right | Poor mobile layout |
| High | 114-154 | All inputs use default height (36px) - below minimum | Difficult to tap |
| High | 137-144 | Textarea uses default padding - may be insufficient | Hard to edit text |

**Recommendations:**

- Add responsive max-width: `max-w-[95vw] max-w-md sm:max-w-[500px]`
- Increase select trigger to 44px minimum
- Change to single-column layout on mobile: `grid-cols-1 sm:grid-cols-4`
- Increase all inputs to 44px minimum
- Increase textarea padding to `px-4 py-3`

---

### 8. ImportCSVDialog ([`components/admin/import-csv-dialog.tsx`](components/admin/import-csv-dialog.tsx))

**Issues Found:**

| Severity | Line | Issue | Impact |
|----------|------|-------|--------|
| **Critical** | 220 | Dialog uses `max-w-[500px]` - horizontal scroll on small screens | Poor mobile fit |
| High | 232-268 | File upload area has `p-8` (32px) - touch targets may be small | Difficult to tap |
| High | 250-257 | Remove file button uses `size="sm"` (32px) - below minimum | Difficult to tap |
| High | 294-314 | CSV mapping text is `text-[10px]` - very small on mobile | Hard to read |
| High | 316-340 | Template download buttons are text-only - no tap target | Difficult to tap |
| Medium | 276-284 | Import summary grid uses 2 columns - may be cramped | Poor mobile layout |

**Recommendations:**

- Add responsive max-width: `max-w-[95vw] max-w-md sm:max-w-[500px]`
- Increase file upload area padding and add larger tap targets
- Increase remove file button to `size="default"` or larger
- Increase CSV mapping text to `text-xs` (12px)
- Convert template links to proper buttons with 44x44px minimum
- Change summary to single column on mobile

---

### 9. ManagePersonsDialog ([`components/admin/manage-persons-dialog.tsx`](components/admin/manage-persons-dialog.tsx))

**Issues Found:**

| Severity | Line | Issue | Impact |
|----------|------|-------|--------|
| **Critical** | 74 | Dialog uses `max-w-[600px]` - horizontal scroll on small screens | Poor mobile fit |
| **Critical** | 115-127 | Delete button uses `size="sm"` (32px) - below minimum | Difficult to tap |
| High | 96-128 | Person cards use `p-4` (16px) - may be cramped | Poor touch targets |
| High | 145-149 | Add Person button uses `w-full` but may be too small | Difficult to tap |
| Medium | 233-327 | Nested CreatePersonDialog has same issues as standalone | Duplicate issues |

**Recommendations:**

- Add responsive max-width: `max-w-[95vw] max-w-md sm:max-w-[600px]`
- Increase delete button to `size="default"` or larger
- Increase person card padding to `p-5` or `p-6`
- Ensure Add Person button has 44px minimum height
- Fix nested dialog issues

---

### 10. AdoptFamilyDialog ([`components/donor/adopt-family-dialog.tsx`](components/donor/adopt-family-dialog.tsx))

**Issues Found:**

| Severity | Line | Issue | Impact |
|----------|------|-------|--------|
| **Critical** | 92 | Dialog uses `max-w-[520px]` - horizontal scroll on small screens | Poor mobile fit |
| **Critical** | 115-123 | Input with icon uses `h-12` (48px) - GOOD | Meets minimum ✓ |
| **Critical** | 130-139 | Input with icon uses `h-12` (48px) - GOOD | Meets minimum ✓ |
| High | 152-166 | Gift list uses `max-h-[160px]` - may be hard to scroll | Poor visibility |
| High | 170-191 | Footer buttons use `h-12` (48px) - GOOD | Meets minimum ✓ |
| Medium | 140 | Helper text is `text-[10px]` - very small on mobile | Hard to read |

**Recommendations:**

- Add responsive max-width: `max-w-[95vw] max-w-md sm:max-w-[520px]`
- Increase gift list max-height to `max-h-[200px]` or use viewport-based sizing
- Increase helper text to `text-xs` (12px)

**Positive Notes:**

- Input fields with icons use 48px height - meets minimum touch target ✓
- Footer buttons use 48px height - meets minimum touch target ✓

---

### 11. ClaimDialog ([`components/donor/claim-dialog.tsx`](components/donor/claim-dialog.tsx))

**Issues Found:**

| Severity | Line | Issue | Impact |
|----------|------|-------|--------|
| **Critical** | 100 | Dialog uses `max-w-[480px]` - horizontal scroll on small screens | Poor mobile fit |
| **Critical** | 123-130 | Input with icon uses `h-12` (48px) - GOOD | Meets minimum ✓ |
| **Critical** | 138-147 | Input with icon uses `h-12` (48px) - GOOD | Meets minimum ✓ |
| **Critical** | 158-168 | Select trigger uses `h-12` (48px) - GOOD | Meets minimum ✓ |
| High | 174-195 | Footer buttons use `h-12` (48px) - GOOD | Meets minimum ✓ |
| Medium | 148 | Helper text is `text-[10px]` - very small on mobile | Hard to read |

**Recommendations:**

- Add responsive max-width: `max-w-[95vw] max-w-md sm:max-w-[480px]`
- Increase helper text to `text-xs` (12px)

**Positive Notes:**

- Input fields with icons use 48px height - meets minimum touch target ✓
- Select trigger uses 48px height - meets minimum touch target ✓
- Footer buttons use 48px height - meets minimum touch target ✓

---

## Summary of Issues by Severity

### Critical Issues (12)

1. Dialog close buttons are 16x16px (all dialogs)
2. Input height is 36px (base Input component)
3. Select trigger heights are 32-36px (base Select component)
4. Button default size is 36px (base Button component)
5. Button small size is 32px (base Button component)
6. Button extra small size is 24px (base Button component)
7. Button icon sizes are 24-40px (base Button component)
8. Onboarding step indicators are 8px tall
9. CreateGiftDialog toggle buttons are 32px
10. CreateGiftDialog select trigger is 36px
11. ImportCSVDialog template links have no tap target
12. ManagePersonsDialog delete button is 32px

### High Issues (17)

1. Dialog max-widths cause horizontal scroll (8 dialogs)
2. DialogFooter buttons too close together (all dialogs)
3. CreateGiftDialog uses 4-column grid layout on mobile
4. EditGiftDialog uses 4-column grid layout on mobile
5. Helper text is 10px (too small to read)
6. File upload touch targets too small
7. Person cards have insufficient padding
8. Gift list max-height too small

### Medium Issues (15)

1. No bottom sheet positioning for dialogs
2. Textarea minimum height too small
3. Select item padding too small
4. Field gaps may be excessive on mobile
5. Onboarding feedback buttons are 32px
6. Onboarding textarea is 80px minimum
7. ImportCSVDialog CSV mapping text is 10px
8. Nested CreatePersonDialog has duplicate issues

### Low Issues (3)

1. Close button has no visual focus state
2. Label has no explicit tap target size
3. One-size-fits-all approach for components

---

## Recommendations by Priority

### Immediate Actions (Critical Issues)

1. **Increase all touch targets to minimum 44x44px**
   - Update base Button component sizes
   - Update base Input component height to 44px
   - Update base Select component height to 44px
   - Update dialog close buttons to 44x44px

2. **Fix dialog widths for mobile**
   - Add responsive max-width to all dialogs: `max-w-[95vw] max-w-md sm:max-w-[original]`
   - Ensure no horizontal scrolling on 375px screens

3. **Fix form layouts for mobile**
   - Change 4-column grids to single column on mobile
   - Move labels above inputs on mobile

### Short-term Actions (High Issues)

1. **Increase spacing between footer buttons**
   - Add minimum 16px gap on mobile
   - Consider stacking buttons vertically on very small screens

2. **Increase helper text size**
   - Change from `text-[10px]` to `text-xs` (12px)
   - Ensure readability on mobile

3. **Improve file upload experience**
   - Add larger tap targets for file selection
   - Increase button sizes for file operations

### Medium-term Actions (Medium Issues)

1. **Add bottom sheet positioning for dialogs**
   - Implement mobile-specific dialog variant
   - Slide up from bottom on mobile screens

2. **Increase textarea minimum height**
   - Change from `min-h-16` to `min-h-[120px]`
   - Better for mobile typing

3. **Increase select item padding**
   - Change from `py-1.5` to `py-2.5`
   - Better touch targets for dropdown items

### Long-term Actions (Low Issues)

1. **Add visual focus states**
   - Improve keyboard navigation
   - Better accessibility

2. **Add mobile-specific variants**
   - Create mobile-optimized component variants
   - Better control over mobile experience

---

## Components Already Mobile-Friendly

### AdoptFamilyDialog

- Input fields with icons use 48px height ✓
- Footer buttons use 48px height ✓
- Good visual hierarchy ✓

### ClaimDialog

- Input fields with icons use 48px height ✓
- Select trigger uses 48px height ✓
- Footer buttons use 48px height ✓
- Good visual hierarchy ✓

---

## Testing Recommendations

1. **Test on actual mobile devices**
   - iPhone SE (375px width)
   - iPhone 12/13 (390px width)
   - iPhone 14 Pro Max (430px width)
   - Android devices (360-412px width)

2. **Test touch targets**
   - Use finger-sized touch targets (44x44px minimum)
   - Test with actual fingers, not mouse

3. **Test scrolling**
   - Ensure no horizontal scrolling
   - Test dialog content scrolling
   - Test form field scrolling

4. **Test keyboard navigation**
   - Test tab order
   - Test focus states
   - Test screen reader compatibility

5. **Test in different orientations**
   - Portrait mode (primary)
   - Landscape mode (secondary)

---

## Conclusion

The project has **12 critical mobile UX issues** that need immediate attention, primarily related to touch target sizes. The donor-facing dialogs (AdoptFamilyDialog and ClaimDialog) are already well-optimized for mobile, but admin dialogs and base UI components need significant improvements.

**Key Takeaways:**

- Most interactive elements are below 44x44px minimum touch target
- Dialog widths need responsive adjustments
- Form layouts need mobile-specific variants
- Some components already follow mobile best practices

**Estimated Effort:**

- Critical issues: 2-3 days
- High issues: 2-3 days
- Medium issues: 1-2 days
- Low issues: 1 day

**Total Estimated Effort:** 6-9 days to address all identified issues

---

**Analysis Completed By:** Documentation Specialist Mode  
**Next Steps:** Review this analysis with the team and prioritize fixes based on user impact and development resources.
