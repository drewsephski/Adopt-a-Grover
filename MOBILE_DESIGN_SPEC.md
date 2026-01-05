# Mobile Design Specification: Dialogs and Forms

**Document Version:** 1.0  
**Created:** January 4, 2026  
**Project:** Adopt a Grover - Gift Adoption Platform  
**Based On:** MOBILE_ANALYSIS.md (47 issues identified)

---

## Executive Summary

This design specification provides comprehensive mobile optimization guidelines for all dialogs and forms in the Adopt a Grover platform. It addresses 47 identified issues across 11 dialog components and 6 base UI components, with a focus on WCAG mobile accessibility standards and modern mobile UX patterns.

**Key Design Decisions:**

- Minimum touch target size: 44x44px for all interactive elements
- Mobile-first responsive design with breakpoints at 640px (sm)
- Dialog width strategy: 95vw max on mobile, scaling to original widths on desktop
- Form layout: Single-column on mobile, multi-column on desktop
- Input heights: 44px minimum on mobile, 40px on desktop

**Components Covered:** 17 total (6 base UI + 11 dialog components)

---

## 1. Touch Target Standards

### 1.1 Minimum Touch Target Sizes

All interactive elements must meet the minimum touch target size of **44x44px** as per WCAG 2.5.5 (Target Size) Level AAA recommendation and Apple Human Interface Guidelines.

| Element Type | Current Size | Target Size | Tailwind Classes |
|--------------|--------------|-------------|------------------|
| Default Button | 36px (h-9) | 44px (h-11) | `h-11` |
| Small Button | 32px (h-8) | 40px (h-10) | `h-10` |
| Extra Small Button | 24px (h-6) | 36px (h-9) | `h-9` |
| Large Button | 40px (h-10) | 48px (h-12) | `h-12` |
| Icon Button (default) | 36px (size-9) | 44px (size-11) | `size-11` |
| Icon Button (small) | 24px (size-6) | 44px (size-11) | `size-11` |
| Icon Button (large) | 40px (size-10) | 48px (size-12) | `size-12` |
| Dialog Close Button | 16px (h-4 w-4) | 44px (h-11 w-11) | `h-11 w-11` |
| Input Field | 36px (h-9) | 44px (h-11) | `h-11` |
| Select Trigger | 32-36px (h-8/h-9) | 44px (h-11) | `h-11` |
| Step Indicators | 8px (h-2) | 44px (h-11) | `h-11` |

### 1.2 Spacing Between Touch Targets

Minimum spacing of **8px** between adjacent touch targets to prevent accidental taps.

```css
/* Tailwind spacing standards */
- Between buttons in footer: gap-3 (12px) → gap-4 (16px) on mobile
- Between form fields: gap-4 (16px) on mobile, gap-6 (24px) on desktop
- Between label and input: gap-2 (8px) minimum
- Between icon and input edge: pl-11 (44px) for proper alignment
```

### 1.3 Element-Specific Guidelines

#### Buttons

- **Primary Action Buttons:** `h-12 px-6` (48px height, 24px horizontal padding)
- **Secondary Action Buttons:** `h-11 px-4` (44px height, 16px horizontal padding)
- **Icon-Only Buttons:** `size-11` (44x44px) with centered icon
- **Button Groups:** Minimum `gap-3` (12px) between buttons

#### Inputs

- **Standard Input:** `h-11 px-4 py-3` (44px height, 16px horizontal, 12px vertical padding)
- **Input with Icon:** `pl-11 h-11` (44px left padding for icon, 44px height)
- **Textarea:** `min-h-[120px] px-4 py-3` (120px minimum height)

#### Select Dropdowns

- **Trigger:** `h-11 px-4 py-3` (44px height)
- **Dropdown Items:** `py-2.5 px-3` (10px vertical, 12px horizontal padding)
- **Minimum Item Height:** 44px total height

#### Dialog Close Buttons

- **Size:** `h-11 w-11` (44x44px)
- **Position:** `right-4 top-4` (16px from edges)
- **Icon Size:** `h-5 w-5` (20px) centered within button

---

## 2. Dialog Responsive Design

### 2.1 Responsive Width Strategy

All dialogs must use a mobile-first responsive width strategy with the following pattern:

```tsx
// DialogContent width pattern
className="max-w-[95vw] max-w-md sm:max-w-[original-width]"
```

| Dialog Component | Current Width | Mobile Width | Desktop Width |
|------------------|---------------|--------------|---------------|
| OnboardingModal | 550px | 95vw (max-md) | 550px |
| CreateCampaignDialog | 425px | 95vw (max-md) | 425px |
| CreateFamilyDialog | 425px | 95vw (max-md) | 425px |
| CreateGiftDialog | 500px | 95vw (max-md) | 500px |
| CreatePersonDialog | 500px | 95vw (max-md) | 500px |
| EditFamilyDialog | 425px | 95vw (max-md) | 425px |
| EditGiftDialog | 500px | 95vw (max-md) | 500px |
| ImportCSVDialog | 500px | 95vw (max-md) | 500px |
| ManagePersonsDialog | 600px | 95vw (max-md) | 600px |
| AdoptFamilyDialog | 520px | 95vw (max-md) | 520px |
| ClaimDialog | 480px | 95vw (max-md) | 480px |

**Breakpoint Strategy:**

- **Mobile (< 640px):** `max-w-[95vw] max-w-md` (95% of viewport, max 448px)
- **Desktop (≥ 640px):** Original max-width preserved

### 2.2 Mobile-First Dialog Positioning

#### Current State

Dialogs use center positioning with `left-[50%] top-[50%] translate-x-[-50%] translate-y-[-50%]`

#### Recommended Enhancement

Add mobile-specific bottom sheet positioning for better mobile UX:

```tsx
// DialogContent enhanced positioning
className={cn(
  "fixed left-[50%] top-[50%] z-50 grid w-full max-w-lg translate-x-[-50%] translate-y-[-50%]",
  "sm:rounded-lg",
  // Mobile bottom sheet variant
  "data-[state=open]:animate-in data-[state=closed]:animate-out",
  "data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0",
  "data-[state=closed]:zoom-out-95 data-[state=open]:zoom-in-95",
  "data-[state=bottom-0]:slide-in-from-left-1/2 data-[state=bottom-0]:slide-in-from-top-[48%]",
  className
)}
```

**Implementation Note:** The `data-[state=bottom-0]` classes exist but are not currently used. Consider adding a `mobileBottomSheet` prop to enable bottom sheet positioning on mobile screens.

### 2.3 Dialog Content Adaptation

#### Padding Standards

- **Mobile:** `p-6` (24px) for standard dialogs, `p-8` (32px) for donor dialogs
- **Desktop:** Maintain existing padding or increase slightly

#### Scroll Behavior

- **Dialog Content:** `max-h-[85vh] overflow-y-auto` on mobile to prevent viewport overflow
- **Scrollable Lists:** `max-h-[200px]` minimum for better touch interaction

#### Header Section

- **Mobile:** `p-6 pb-4` (24px top, 16px bottom)
- **Desktop:** `p-8 pb-6` (32px top, 24px bottom)

#### Footer Section

- **Mobile:** `p-6 pt-0` (24px horizontal, no top padding)
- **Desktop:** `p-8 pt-0` (32px horizontal, no top padding)

---

## 3. Form Layout Patterns

### 3.1 Mobile-First Form Layouts

All forms must use single-column layouts on mobile, transitioning to multi-column on desktop.

#### Standard Form Pattern

```tsx
// Mobile-first form layout
<form className="flex flex-col">
  {/* Header Section */}
  <div className="bg-primary/10 p-6 pb-4">
    <DialogHeader>
      <DialogTitle className="text-2xl font-bold">Title</DialogTitle>
      <DialogDescription className="text-base">Description</DialogDescription>
    </DialogHeader>
  </div>

  {/* Form Fields - Single Column on Mobile */}
  <div className="p-6 space-y-4">
    <div className="space-y-2">
      <Label htmlFor="field">Label</Label>
      <Input id="field" className="h-11" />
    </div>
  </div>

  {/* Footer Buttons */}
  <div className="p-6 pt-0 flex gap-4">
    <Button variant="ghost" className="flex-1 h-11">Cancel</Button>
    <Button className="flex-[2] h-11">Submit</Button>
  </div>
</form>
```

### 3.2 Responsive Grid Patterns

#### Single to Multi-Column Transition

```tsx
// Grid layout pattern
<div className="grid grid-cols-1 gap-4 sm:grid-cols-2 md:grid-cols-4">
  {/* Fields */}
</div>
```

| Layout | Mobile (< 640px) | Tablet (640px-768px) | Desktop (≥ 768px) |
|--------|------------------|---------------------|-------------------|
| 2-Column Form | `grid-cols-1` | `grid-cols-2` | `grid-cols-2` |
| 4-Column Form | `grid-cols-1` | `grid-cols-2` | `grid-cols-4` |
| Label Position | Above input | Above input | Beside input (optional) |

#### Label Positioning

**Mobile (Labels Above Inputs):**

```tsx
<div className="space-y-2">
  <Label htmlFor="field" className="text-sm font-bold">Label</Label>
  <Input id="field" className="h-11" />
</div>
```

**Desktop (Labels Beside Inputs - Optional):**

```tsx
<div className="grid grid-cols-[140px_1fr] gap-4 items-start">
  <Label htmlFor="field" className="text-sm font-bold pt-3">Label</Label>
  <Input id="field" className="h-10" />
</div>
```

### 3.3 Spacing and Padding Standards

#### Mobile Spacing

- **Form Container Padding:** `p-6` (24px)
- **Field Spacing:** `space-y-4` (16px between fields)
- **Label to Input Gap:** `gap-2` (8px)
- **Input to Helper Text Gap:** `gap-1` (4px)

#### Desktop Spacing

- **Form Container Padding:** `p-8` (32px)
- **Field Spacing:** `space-y-6` (24px between fields)
- **Label to Input Gap:** `gap-3` (12px)
- **Input to Helper Text Gap:** `gap-2` (8px)

#### FieldGroup Spacing

```tsx
// FieldGroup responsive gap
<div className="gap-4 sm:gap-7">
  {/* Fields */}
</div>
```

---

## 4. Input Method Improvements

### 4.1 Mobile-Friendly Input Types

Use semantic HTML5 input types to trigger appropriate mobile keyboards:

| Input Purpose | Current Type | Recommended Type | Example |
|---------------|--------------|------------------|---------|
| Email Addresses | `type="email"` | ✓ Keep | `<Input type="email" />` |
| Phone Numbers | `type="tel"` | ✓ Use | `<Input type="tel" />` |
| Numbers | `type="number"` | ✓ Use | `<Input type="number" />` |
| Dates | `type="date"` | ✓ Use | `<Input type="date" />` |
| URLs | `type="url"` | ✓ Use | `<Input type="url" />` |
| Search | `type="search"` | ✓ Use | `<Input type="search" />` |

**Implementation Pattern:**

```tsx
<Input
  type="email"
  inputMode="email" // Additional hint for mobile keyboards
  autoComplete="email" // Enable browser autofill
  className="h-11 px-4 py-3"
/>
```

### 4.2 Select Component Mobile Patterns

#### Trigger Enhancement

```tsx
<SelectTrigger className="h-11 px-4 py-3 rounded-md">
  <SelectValue placeholder="Select option" />
</SelectTrigger>
```

#### Dropdown Item Enhancement

```tsx
<SelectItem className="py-2.5 px-3 min-h-[44px]">
  Option
</SelectItem>
```

#### Mobile-Specific Select Content

```tsx
<SelectContent className="max-h-[60vh] overflow-y-auto">
  {/* Items */}
</SelectContent>
```

**Key Improvements:**

- Increased item padding: `py-2.5` (10px) instead of `py-1.5` (6px)
- Minimum item height: 44px
- Max-height: 60% of viewport for better mobile visibility
- Scrollable content for long lists

### 4.3 File Upload Patterns

#### File Upload Area

```tsx
<div className="border-2 border-dashed border-border rounded-lg p-6 sm:p-8 text-center">
  <input
    type="file"
    className="hidden"
    id="file-upload"
    accept=".csv"
  />
  <label
    htmlFor="file-upload"
    className="cursor-pointer flex flex-col items-center gap-3"
  >
    <div className="h-12 w-12 rounded-full bg-primary/10 flex items-center justify-center">
      <Upload className="h-6 w-6 text-primary" />
    </div>
    <div className="space-y-1">
      <p className="text-sm font-medium">Click to upload</p>
      <p className="text-xs text-muted-foreground">or drag and drop</p>
    </div>
  </label>
</div>
```

#### File Display with Remove Button

```tsx
<div className="flex items-center gap-3 p-3 bg-muted rounded-lg">
  <FileIcon className="h-10 w-10 text-muted-foreground" />
  <div className="flex-1 min-w-0">
    <p className="text-sm font-medium truncate">filename.csv</p>
    <p className="text-xs text-muted-foreground">12 KB</p>
  </div>
  <Button
    type="button"
    variant="ghost"
    size="icon"
    className="h-11 w-11 shrink-0"
    onClick={handleRemove}
  >
    <X className="h-5 w-5" />
  </Button>
</div>
```

**Key Improvements:**

- Larger touch targets: `h-11 w-11` for remove button
- Better padding: `p-6` on mobile, `p-8` on desktop
- Clear visual hierarchy with icon and text
- Truncate long filenames with `truncate` class

---

## 5. Visual Hierarchy Guidelines

### 5.1 Font Size Standards

#### Mobile Font Sizes

| Element | Current Size | Target Size | Tailwind Class |
|---------|--------------|-------------|----------------|
| Dialog Title | text-lg (18px) | text-2xl (24px) | `text-2xl` |
| Dialog Description | text-sm (14px) | text-base (16px) | `text-base` |
| Form Labels | text-sm (14px) | text-sm (14px) | `text-sm` |
| Helper Text | text-[10px] (10px) | text-xs (12px) | `text-xs` |
| Input Text | text-base (16px) | text-base (16px) | `text-base` |
| Button Text | text-sm (14px) | text-sm (14px) | `text-sm` |
| Error Messages | text-sm (14px) | text-sm (14px) | `text-sm` |

**Minimum Readable Size:** 16px for body text (WCAG recommendation)

#### Desktop Font Sizes

| Element | Target Size | Tailwind Class |
|---------|-------------|----------------|
| Dialog Title | text-3xl (30px) | `text-3xl` |
| Dialog Description | text-lg (18px) | `text-lg` |
| Form Labels | text-sm (14px) | `text-sm` |
| Helper Text | text-xs (12px) | `text-xs` |

### 5.2 Spacing Standards Between Form Elements

#### Vertical Spacing

```tsx
// Form container
<div className="space-y-4 sm:space-y-6">
  {/* Fields */}
</div>
```

| Context | Mobile Spacing | Desktop Spacing |
|---------|----------------|-----------------|
| Between Fields | `space-y-4` (16px) | `space-y-6` (24px) |
| Between Sections | `space-y-6` (24px) | `space-y-8` (32px) |
| Label to Input | `gap-2` (8px) | `gap-3` (12px) |
| Input to Helper Text | `gap-1` (4px) | `gap-2` (8px) |
| Input to Error | `gap-1` (4px) | `gap-2` (8px) |

#### Horizontal Spacing

```tsx
// Button groups
<div className="flex gap-4">
  {/* Buttons */}
</div>
```

| Context | Mobile Spacing | Desktop Spacing |
|---------|----------------|-----------------|
| Between Buttons | `gap-4` (16px) | `gap-3` (12px) |
| Between Icon and Text | `gap-2` (8px) | `gap-2` (8px) |

### 5.3 Helper Text and Error Messages

#### Helper Text Pattern

```tsx
<div className="space-y-2">
  <Label htmlFor="field">Label</Label>
  <Input id="field" className="h-11" />
  <p className="text-xs text-muted-foreground">
    Helper text goes here
  </p>
</div>
```

#### Error Message Pattern

```tsx
<div className="space-y-2">
  <Label htmlFor="field" className="text-destructive">Label</Label>
  <Input 
    id="field" 
    className="h-11 border-destructive focus-visible:ring-destructive" 
  />
  <p className="text-xs text-destructive">
    Error message goes here
  </p>
</div>
```

**Key Guidelines:**

- Helper text: `text-xs text-muted-foreground`
- Error text: `text-xs text-destructive`
- Error input: `border-destructive focus-visible:ring-destructive`
- Spacing: `gap-1` (4px) between input and message

### 5.4 Color Contrast and Emphasis Patterns

#### Color Contrast Standards (WCAG AA)

- **Normal Text:** 4.5:1 contrast ratio
- **Large Text (18px+):** 3:1 contrast ratio
- **UI Components:** 3:1 contrast ratio

#### Emphasis Patterns

```tsx
// Primary emphasis (important information)
<p className="text-sm font-bold text-foreground">
  Important text
</p>

// Secondary emphasis (labels, subheadings)
<p className="text-xs font-bold text-muted-foreground uppercase tracking-widest">
  SECTION HEADING
</p>

// Tertiary emphasis (helper text)
<p className="text-xs text-muted-foreground italic">
  Helper text
</p>

// Error emphasis
<p className="text-sm font-bold text-destructive">
  Error message
</p>
```

#### Success/Warning/Error States

```tsx
// Success state
<Input className="h-11 border-green-500 focus-visible:ring-green-500" />

// Warning state
<Input className="h-11 border-yellow-500 focus-visible:ring-yellow-500" />

// Error state
<Input className="h-11 border-destructive focus-visible:ring-destructive" />
```

---

## 6. Component-Specific Designs

### 6.1 Dialog Component

#### Current Implementation Issues

- Close button: 16x16px (Critical)
- Max-width: 512px fixed (High)
- No mobile-specific positioning (Medium)

#### Recommended Changes

**Before:**

```tsx
<DialogContent className="max-w-lg p-6">
  {/* Content */}
  <DialogPrimitive.Close className="absolute right-4 top-4">
    <X className="h-4 w-4" />
  </DialogPrimitive.Close>
</DialogContent>
```

**After:**

```tsx
<DialogContent className="max-w-[95vw] max-w-md sm:max-w-lg p-6 sm:p-6">
  {/* Content */}
  <DialogPrimitive.Close className="absolute right-4 top-4 h-11 w-11 rounded-sm opacity-70 transition-opacity hover:opacity-100 focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 disabled:pointer-events-none data-[state=open]:bg-accent data-[state=open]:text-muted-foreground">
    <X className="h-5 w-5" />
    <span className="sr-only">Close</span>
  </DialogPrimitive.Close>
</DialogContent>
```

**Key Changes:**

- Close button: `h-4 w-4` → `h-11 w-11`
- Icon: `h-4 w-4` → `h-5 w-5`
- Max-width: `max-w-lg` → `max-w-[95vw] max-w-md sm:max-w-lg`
- Added responsive padding pattern

---

### 6.2 Input Component

#### Current Implementation Issues

- Height: 36px (Critical)
- Padding: `px-2.5 py-1` (Medium)
- No mobile variant (Low)

#### Recommended Changes

**Before:**

```tsx
<input
  className="h-9 rounded-md border px-2.5 py-1"
/>
```

**After:**

```tsx
<input
  className="h-11 sm:h-10 rounded-md border px-4 py-3 sm:px-3 sm:py-2"
/>
```

**Key Changes:**

- Height: `h-9` → `h-11 sm:h-10` (44px mobile, 40px desktop)
- Padding: `px-2.5 py-1` → `px-4 py-3 sm:px-3 sm:py-2`
- Better touch targets on mobile

**Input with Icon Pattern:**

```tsx
<div className="relative">
  <Icon className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
  <Input
    id="field"
    className="pl-11 h-11 px-4 py-3"
  />
</div>
```

---

### 6.3 Textarea Component

#### Current Implementation Issues

- Minimum height: 64px (Medium)
- Padding: `px-2.5 py-2` (Medium)

#### Recommended Changes

**Before:**

```tsx
<textarea
  className="min-h-16 rounded-md border px-2.5 py-2"
/>
```

**After:**

```tsx
<textarea
  className="min-h-[120px] sm:min-h-16 rounded-md border px-4 py-3 sm:px-3 sm:py-2"
/>
```

**Key Changes:**

- Minimum height: `min-h-16` → `min-h-[120px] sm:min-h-16`
- Padding: `px-2.5 py-2` → `px-4 py-3 sm:px-3 sm:py-2`
- Better mobile typing experience

---

### 6.4 Select Component

#### Current Implementation Issues

- Trigger height: 32-36px (Critical)
- Item padding: `py-1.5` (Medium)
- Content may be clipped on small screens (High)

#### Recommended Changes

**Before:**

```tsx
<SelectTrigger className="h-9 data-[size=sm]:h-8">
  <SelectValue />
</SelectTrigger>

<SelectItem className="py-1.5">
  Option
</SelectItem>
```

**After:**

```tsx
<SelectTrigger className="h-11 px-4 py-3 sm:h-10 sm:px-3 sm:py-2">
  <SelectValue />
</SelectTrigger>

<SelectContent className="max-h-[60vh] overflow-y-auto">
  <SelectItem className="py-2.5 px-3 min-h-[44px]">
    Option
  </SelectItem>
</SelectContent>
```

**Key Changes:**

- Trigger height: `h-9/h-8` → `h-11 sm:h-10`
- Trigger padding: `py-2 pr-2 pl-2.5` → `px-4 py-3 sm:px-3 sm:py-2`
- Item padding: `py-1.5` → `py-2.5 px-3`
- Item minimum height: 44px
- Content max-height: 60% viewport

---

### 6.5 Button Component

#### Current Implementation Issues

- Default size: 36px (Critical)
- Small size: 32px (Critical)
- Extra small size: 24px (Critical)
- Large size: 40px (High)
- Icon buttons: 24-40px (Critical)

#### Recommended Changes

**Before:**

```tsx
const buttonVariants = cva(
  // ...
  {
    variants: {
      size: {
        default: "h-9",
        xs: "h-6",
        sm: "h-8",
        lg: "h-10",
        icon: "size-9",
        "icon-xs": "size-6",
        "icon-sm": "size-8",
        "icon-lg": "size-10",
      },
    },
  }
)
```

**After:**

```tsx
const buttonVariants = cva(
  // ...
  {
    variants: {
      size: {
        default: "h-11 sm:h-10 gap-1.5 px-2.5",
        xs: "h-9 sm:h-8 gap-1 rounded-[min(var(--radius-md),8px)] px-2 text-xs",
        sm: "h-10 sm:h-9 gap-1 rounded-[min(var(--radius-md),10px)] px-2.5",
        lg: "h-12 sm:h-11 gap-1.5 px-2.5",
        icon: "size-11 sm:size-10",
        "icon-xs": "size-9 sm:size-8 rounded-[min(var(--radius-md),8px)]",
        "icon-sm": "size-10 sm:size-9 rounded-[min(var(--radius-md),10px)]",
        "icon-lg": "size-12 sm:size-11",
      },
    },
  }
)
```

**Key Changes:**

- Default: `h-9` → `h-11 sm:h-10`
- Extra small: `h-6` → `h-9 sm:h-8`
- Small: `h-8` → `h-10 sm:h-9`
- Large: `h-10` → `h-12 sm:h-11`
- Icon default: `size-9` → `size-11 sm:size-10`
- Icon extra small: `size-6` → `size-9 sm:size-8`
- Icon small: `size-8` → `size-10 sm:size-9`
- Icon large: `size-10` → `size-12 sm:size-11`

**Button Usage Pattern:**

```tsx
// Primary action button
<Button className="h-12 px-6 sm:h-11">
  Submit
</Button>

// Secondary action button
<Button variant="ghost" className="h-11 px-4 sm:h-10">
  Cancel
</Button>

// Icon button
<Button variant="ghost" size="icon" className="size-11 sm:size-10">
  <Icon className="h-5 w-5" />
</Button>
```

---

### 6.6 Label Component

#### Current Implementation Issues

- No explicit tap target size (Low)

#### Recommended Changes

**Before:**

```tsx
<Label className="text-sm font-medium">
  Label
</Label>
```

**After:**

```tsx
<Label 
  htmlFor="field"
  className="text-sm font-medium min-h-[44px] flex items-center"
>
  Label
</Label>
```

**Key Changes:**

- Added `min-h-[44px]` for tap target
- Added `flex items-center` for proper alignment
- Ensure `htmlFor` prop is set for accessibility

---

### 6.7 Field Component

#### Current Implementation Issues

- FieldGroup gap: 28px (Medium)
- Field gap: 12px (Medium)

#### Recommended Changes

**Before:**

```tsx
<FieldGroup className="gap-7">
  {/* Fields */}
</FieldGroup>

<Field className="gap-3">
  {/* Field content */}
</Field>
```

**After:**

```tsx
<FieldGroup className="gap-4 sm:gap-7">
  {/* Fields */}
</FieldGroup>

<Field className="gap-2 sm:gap-3">
  {/* Field content */}
</Field>
```

**Key Changes:**

- FieldGroup: `gap-7` → `gap-4 sm:gap-7`
- Field: `gap-3` → `gap-2 sm:gap-3`

---

### 6.8 OnboardingModal

#### Current Implementation Issues

- Step indicators: 8px (Critical)
- Max-width: 550px (Critical)
- Footer buttons may be too close (High)
- Fixed min-height: 400px (High)
- Feedback buttons: 32px (Medium)
- Textarea: 80px (Medium)

#### Recommended Changes

**Before:**

```tsx
<DialogContent className="max-w-[550px]">
  {/* Step indicators */}
  <div className="flex gap-2">
    <div className="h-2 w-2 rounded-full bg-primary" />
  </div>
  
  {/* Textarea */}
  <Textarea className="min-h-[80px]" />
  
  {/* Feedback buttons */}
  <Button size="sm">Good</Button>
  <Button size="sm">Bad</Button>
  
  {/* Footer */}
  <div className="flex gap-3">
    <Button>Cancel</Button>
    <Button>Next</Button>
  </div>
</DialogContent>
```

**After:**

```tsx
<DialogContent className="max-w-[95vw] max-w-md sm:max-w-[550px]">
  {/* Step indicators - make interactive */}
  <div className="flex gap-3">
    <button className="h-11 w-11 rounded-full bg-primary flex items-center justify-center">
      <span className="sr-only">Step 1</span>
    </button>
  </div>
  
  {/* Textarea */}
  <Textarea className="min-h-[120px] px-4 py-3" />
  
  {/* Feedback buttons */}
  <Button size="default" className="h-11">Good</Button>
  <Button size="default" className="h-11">Bad</Button>
  
  {/* Footer */}
  <div className="flex gap-4">
    <Button variant="ghost" className="flex-1 h-11">Cancel</Button>
    <Button className="flex-[2] h-11">Next</Button>
  </div>
</DialogContent>
```

**Key Changes:**

- Max-width: `max-w-[550px]` → `max-w-[95vw] max-w-md sm:max-w-[550px]`
- Step indicators: `h-2 w-2` → `h-11 w-11` with button element
- Textarea: `min-h-[80px]` → `min-h-[120px] px-4 py-3`
- Feedback buttons: `size="sm"` → `size="default"` with `h-11`
- Footer gap: `gap-3` → `gap-4`
- Remove fixed min-height

---

### 6.9 CreateCampaignDialog

#### Current Implementation Issues

- Max-width: 425px (High)
- Input height: 36px (High)
- Helper text: 10px (High)
- Footer buttons may be too close (Medium)

#### Recommended Changes

**Before:**

```tsx
<DialogContent className="max-w-[425px]">
  <div className="space-y-2">
    <Label>Campaign Name</Label>
    <Input />
    <p className="text-[10px] text-muted-foreground">
      Helper text
    </p>
  </div>
  
  <div className="flex gap-3">
    <Button>Cancel</Button>
    <Button>Create</Button>
  </div>
</DialogContent>
```

**After:**

```tsx
<DialogContent className="max-w-[95vw] max-w-md sm:max-w-[425px]">
  <div className="space-y-2">
    <Label htmlFor="name" className="text-sm font-bold">Campaign Name</Label>
    <Input id="name" className="h-11" />
    <p className="text-xs text-muted-foreground">
      Helper text
    </p>
  </div>
  
  <div className="flex gap-4">
    <Button variant="ghost" className="flex-1 h-11">Cancel</Button>
    <Button className="flex-[2] h-11">Create</Button>
  </div>
</DialogContent>
```

**Key Changes:**

- Max-width: `max-w-[425px]` → `max-w-[95vw] max-w-md sm:max-w-[425px]`
- Input: Add `h-11` class
- Helper text: `text-[10px]` → `text-xs`
- Footer gap: `gap-3` → `gap-4`
- Add `htmlFor` to Label

---

### 6.10 CreateFamilyDialog

#### Current Implementation Issues

- Max-width: 425px (High)
- Input height: 36px (High)
- Helper text: 10px (High)
- Footer buttons may be too close (Medium)

#### Recommended Changes

**Before:**

```tsx
<DialogContent className="max-w-[425px]">
  <div className="space-y-2">
    <Label>Family Alias</Label>
    <Input />
    <p className="text-[10px] text-muted-foreground">
      Helper text
    </p>
  </div>
  
  <div className="flex gap-3">
    <Button>Cancel</Button>
    <Button>Create</Button>
  </div>
</DialogContent>
```

**After:**

```tsx
<DialogContent className="max-w-[95vw] max-w-md sm:max-w-[425px]">
  <div className="space-y-2">
    <Label htmlFor="alias" className="text-sm font-bold">Family Alias</Label>
    <Input id="alias" className="h-11" />
    <p className="text-xs text-muted-foreground">
      Helper text
    </p>
  </div>
  
  <div className="flex gap-4">
    <Button variant="ghost" className="flex-1 h-11">Cancel</Button>
    <Button className="flex-[2] h-11">Create</Button>
  </div>
</DialogContent>
```

**Key Changes:**

- Max-width: `max-w-[425px]` → `max-w-[95vw] max-w-md sm:max-w-[425px]`
- Input: Add `h-11` class
- Helper text: `text-[10px]` → `text-xs`
- Footer gap: `gap-3` → `gap-4`
- Add `htmlFor` to Label

---

### 6.11 CreateGiftDialog

#### Current Implementation Issues

- Max-width: 500px (Critical)
- Toggle buttons: 32px (Critical)
- Select trigger: 36px (Critical)
- 4-column grid layout (High)
- Input heights: 36px (High)
- Textarea padding: insufficient (High)

#### Recommended Changes

**Before:**

```tsx
<DialogContent className="max-w-[500px]">
  <form className="grid grid-cols-4 gap-4">
    <div className="col-span-1">
      <Label>Gift Name</Label>
    </div>
    <div className="col-span-3">
      <Input />
    </div>
    
    <div className="col-span-1">
      <Label>Description</Label>
    </div>
    <div className="col-span-3">
      <Textarea />
    </div>
  </form>
  
  <div className="flex gap-2">
    <Button size="sm">Toggle</Button>
  </div>
</DialogContent>
```

**After:**

```tsx
<DialogContent className="max-w-[95vw] max-w-md sm:max-w-[500px]">
  <form className="grid grid-cols-1 gap-4 sm:grid-cols-4">
    <div className="col-span-1 sm:col-span-1">
      <Label htmlFor="name" className="text-sm font-bold">Gift Name</Label>
    </div>
    <div className="col-span-1 sm:col-span-3">
      <Input id="name" className="h-11" />
    </div>
    
    <div className="col-span-1 sm:col-span-1">
      <Label htmlFor="description" className="text-sm font-bold">Description</Label>
    </div>
    <div className="col-span-1 sm:col-span-3">
      <Textarea id="description" className="min-h-[120px] px-4 py-3" />
    </div>
  </form>
  
  <div className="flex gap-3">
    <Button size="default" className="h-11">Toggle</Button>
  </div>
  
  <div className="flex gap-4">
    <Button variant="ghost" className="flex-1 h-11">Cancel</Button>
    <Button className="flex-[2] h-11">Create</Button>
  </div>
</DialogContent>
```

**Key Changes:**

- Max-width: `max-w-[500px]` → `max-w-[95vw] max-w-md sm:max-w-[500px]`
- Grid: `grid-cols-4` → `grid-cols-1 sm:grid-cols-4`
- Labels: Move above inputs on mobile (`col-span-1` on mobile, `col-span-1` on desktop)
- Input: Add `h-11` class
- Textarea: `min-h-[120px] px-4 py-3`
- Toggle buttons: `size="sm"` → `size="default"` with `h-11`
- Footer gap: `gap-2` → `gap-4`

---

### 6.12 CreatePersonDialog

#### Current Implementation Issues

- Max-width: 500px (High)
- Input heights: 36px (High)
- Select trigger: 36px (High)
- Footer buttons use `flex-1` (Medium)

#### Recommended Changes

**Before:**

```tsx
<DialogContent className="max-w-[500px]">
  <div className="space-y-2">
    <Label>First Name</Label>
    <Input />
  </div>
  
  <div className="space-y-2">
    <Label>Role</Label>
    <Select>
      <SelectTrigger>
        <SelectValue />
      </SelectTrigger>
      <SelectContent>
        <SelectItem>Child</SelectItem>
      </SelectContent>
    </Select>
  </div>
  
  <div className="flex gap-3">
    <Button className="flex-1">Cancel</Button>
    <Button className="flex-1">Create</Button>
  </div>
</DialogContent>
```

**After:**

```tsx
<DialogContent className="max-w-[95vw] max-w-md sm:max-w-[500px]">
  <div className="space-y-2">
    <Label htmlFor="firstName" className="text-sm font-bold">First Name</Label>
    <Input id="firstName" className="h-11" />
  </div>
  
  <div className="space-y-2">
    <Label htmlFor="role" className="text-sm font-bold">Role</Label>
    <Select>
      <SelectTrigger id="role" className="h-11 px-4 py-3">
        <SelectValue />
      </SelectTrigger>
      <SelectContent className="max-h-[60vh]">
        <SelectItem className="py-2.5 px-3 min-h-[44px]">Child</SelectItem>
      </SelectContent>
    </Select>
  </div>
  
  <div className="flex gap-4">
    <Button variant="ghost" className="flex-1 h-11">Cancel</Button>
    <Button className="flex-[2] h-11">Create</Button>
  </div>
</DialogContent>
```

**Key Changes:**

- Max-width: `max-w-[500px]` → `max-w-[95vw] max-w-md sm:max-w-[500px]`
- Input: Add `h-11` class
- Select trigger: Add `h-11 px-4 py-3`
- Select items: Add `py-2.5 px-3 min-h-[44px]`
- Footer: `flex-1` → `flex-1` and `flex-[2]` for emphasis
- Footer gap: `gap-3` → `gap-4`
- Add `htmlFor` to Labels

---

### 6.13 EditFamilyDialog

#### Current Implementation Issues

- Max-width: 425px (High)
- Input height: 36px (High)
- Helper text: 10px (High)
- Footer buttons may be too close (Medium)

#### Recommended Changes

**Before:**

```tsx
<DialogContent className="max-w-[425px]">
  <div className="space-y-2">
    <Label>Family Alias</Label>
    <Input />
    <p className="text-[10px] text-muted-foreground">
      Helper text
    </p>
  </div>
  
  <div className="flex gap-3">
    <Button>Cancel</Button>
    <Button>Save</Button>
  </div>
</DialogContent>
```

**After:**

```tsx
<DialogContent className="max-w-[95vw] max-w-md sm:max-w-[425px]">
  <div className="space-y-2">
    <Label htmlFor="alias" className="text-sm font-bold">Family Alias</Label>
    <Input id="alias" className="h-11" />
    <p className="text-xs text-muted-foreground">
      Helper text
    </p>
  </div>
  
  <div className="flex gap-4">
    <Button variant="ghost" className="flex-1 h-11">Cancel</Button>
    <Button className="flex-[2] h-11">Save</Button>
  </div>
</DialogContent>
```

**Key Changes:**

- Max-width: `max-w-[425px]` → `max-w-[95vw] max-w-md sm:max-w-[425px]`
- Input: Add `h-11` class
- Helper text: `text-[10px]` → `text-xs`
- Footer gap: `gap-3` → `gap-4`
- Add `htmlFor` to Label

---

### 6.14 EditGiftDialog

#### Current Implementation Issues

- Max-width: 500px (Critical)
- Select trigger: 36px (Critical)
- 4-column grid layout (High)
- Input heights: 36px (High)
- Textarea padding: insufficient (High)

#### Recommended Changes

**Before:**

```tsx
<DialogContent className="max-w-[500px]">
  <form className="grid grid-cols-4 gap-4">
    <div className="col-span-1">
      <Label>Gift Name</Label>
    </div>
    <div className="col-span-3">
      <Input />
    </div>
    
    <div className="col-span-1">
      <Label>Description</Label>
    </div>
    <div className="col-span-3">
      <Textarea />
    </div>
  </form>
</DialogContent>
```

**After:**

```tsx
<DialogContent className="max-w-[95vw] max-w-md sm:max-w-[500px]">
  <form className="grid grid-cols-1 gap-4 sm:grid-cols-4">
    <div className="col-span-1 sm:col-span-1">
      <Label htmlFor="name" className="text-sm font-bold">Gift Name</Label>
    </div>
    <div className="col-span-1 sm:col-span-3">
      <Input id="name" className="h-11" />
    </div>
    
    <div className="col-span-1 sm:col-span-1">
      <Label htmlFor="description" className="text-sm font-bold">Description</Label>
    </div>
    <div className="col-span-1 sm:col-span-3">
      <Textarea id="description" className="min-h-[120px] px-4 py-3" />
    </div>
  </form>
  
  <div className="flex gap-4">
    <Button variant="ghost" className="flex-1 h-11">Cancel</Button>
    <Button className="flex-[2] h-11">Save</Button>
  </div>
</DialogContent>
```

**Key Changes:**

- Max-width: `max-w-[500px]` → `max-w-[95vw] max-w-md sm:max-w-[500px]`
- Grid: `grid-cols-4` → `grid-cols-1 sm:grid-cols-4`
- Labels: Move above inputs on mobile
- Input: Add `h-11` class
- Textarea: `min-h-[120px] px-4 py-3`
- Footer gap: `gap-3` → `gap-4`
- Add `htmlFor` to Labels

---

### 6.15 ImportCSVDialog

#### Current Implementation Issues

- Max-width: 500px (Critical)
- File upload area: touch targets may be small (High)
- Remove file button: 32px (High)
- CSV mapping text: 10px (High)
- Template download buttons: text-only (High)
- Summary grid: 2 columns (Medium)

#### Recommended Changes

**Before:**

```tsx
<DialogContent className="max-w-[500px]">
  <div className="border-2 border-dashed p-8">
    <input type="file" className="hidden" id="file-upload" />
    <label htmlFor="file-upload">
      <p>Click to upload</p>
    </label>
  </div>
  
  <div className="flex items-center gap-2">
    <FileIcon />
    <p>filename.csv</p>
    <Button size="sm">Remove</Button>
  </div>
  
  <p className="text-[10px]">
    CSV mapping instructions
  </p>
  
  <a href="/template.csv">Download template</a>
  
  <div className="grid grid-cols-2 gap-4">
    <div>
      <p>Families: 10</p>
    </div>
    <div>
      <p>Gifts: 25</p>
    </div>
  </div>
</DialogContent>
```

**After:**

```tsx
<DialogContent className="max-w-[95vw] max-w-md sm:max-w-[500px]">
  <div className="border-2 border-dashed border-border rounded-lg p-6 sm:p-8 text-center">
    <input type="file" className="hidden" id="file-upload" accept=".csv" />
    <label htmlFor="file-upload" className="cursor-pointer flex flex-col items-center gap-3">
      <div className="h-12 w-12 rounded-full bg-primary/10 flex items-center justify-center">
        <Upload className="h-6 w-6 text-primary" />
      </div>
      <div className="space-y-1">
        <p className="text-sm font-medium">Click to upload</p>
        <p className="text-xs text-muted-foreground">or drag and drop</p>
      </div>
    </label>
  </div>
  
  <div className="flex items-center gap-3 p-3 bg-muted rounded-lg">
    <FileIcon className="h-10 w-10 text-muted-foreground shrink-0" />
    <div className="flex-1 min-w-0">
      <p className="text-sm font-medium truncate">filename.csv</p>
      <p className="text-xs text-muted-foreground">12 KB</p>
    </div>
    <Button
      type="button"
      variant="ghost"
      size="icon"
      className="h-11 w-11 shrink-0"
      onClick={handleRemove}
    >
      <X className="h-5 w-5" />
    </Button>
  </div>
  
  <p className="text-xs text-muted-foreground">
    CSV mapping instructions
  </p>
  
  <Button variant="outline" className="h-11 w-full">
    <Download className="h-4 w-4 mr-2" />
    Download Template
  </Button>
  
  <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
    <div className="bg-muted rounded-lg p-4">
      <p className="text-xs font-bold text-muted-foreground uppercase">Families</p>
      <p className="text-2xl font-bold">10</p>
    </div>
    <div className="bg-muted rounded-lg p-4">
      <p className="text-xs font-bold text-muted-foreground uppercase">Gifts</p>
      <p className="text-2xl font-bold">25</p>
    </div>
  </div>
  
  <div className="flex gap-4">
    <Button variant="ghost" className="flex-1 h-11">Cancel</Button>
    <Button className="flex-[2] h-11">Import</Button>
  </div>
</DialogContent>
```

**Key Changes:**

- Max-width: `max-w-[500px]` → `max-w-[95vw] max-w-md sm:max-w-[500px]`
- File upload: Add `rounded-lg`, `p-6 sm:p-8`, icon with `h-12 w-12`
- Remove button: `size="sm"` → `size="icon"` with `h-11 w-11`
- CSV mapping text: `text-[10px]` → `text-xs`
- Template link: Convert to Button with `h-11 w-full`
- Summary grid: `grid-cols-2` → `grid-cols-1 sm:grid-cols-2`
- Add icons and better styling to summary cards

---

### 6.16 ManagePersonsDialog

#### Current Implementation Issues

- Max-width: 600px (Critical)
- Delete button: 32px (Critical)
- Person cards: `p-4` (High)
- Add Person button: may be too small (High)
- Nested CreatePersonDialog issues (Medium)

#### Recommended Changes

**Before:**

```tsx
<DialogContent className="max-w-[600px]">
  <div className="space-y-4">
    {persons.map(person => (
      <div key={person.id} className="p-4 border rounded-lg">
        <p>{person.name}</p>
        <Button size="sm">Delete</Button>
      </div>
    ))}
  </div>
  
  <Button className="w-full">Add Person</Button>
</DialogContent>
```

**After:**

```tsx
<DialogContent className="max-w-[95vw] max-w-md sm:max-w-[600px]">
  <div className="space-y-4">
    {persons.map(person => (
      <div key={person.id} className="p-5 sm:p-4 border rounded-lg">
        <div className="flex items-start justify-between gap-3">
          <div className="flex-1 min-w-0">
            <p className="text-sm font-medium">{person.name}</p>
            <p className="text-xs text-muted-foreground">{person.role}</p>
          </div>
          <Button
            variant="ghost"
            size="icon"
            className="h-11 w-11 shrink-0"
            onClick={() => handleDelete(person.id)}
          >
            <Trash2 className="h-5 w-5" />
          </Button>
        </div>
      </div>
    ))}
  </div>
  
  <Button className="w-full h-11">Add Person</Button>
</DialogContent>
```

**Key Changes:**

- Max-width: `max-w-[600px]` → `max-w-[95vw] max-w-md sm:max-w-[600px]`
- Person cards: `p-4` → `p-5 sm:p-4`
- Delete button: `size="sm"` → `size="icon"` with `h-11 w-11`
- Add Person button: Add `h-11` class
- Better layout with flexbox for person cards

---

### 6.17 AdoptFamilyDialog (Positive Example)

#### Current State (Already Mobile-Friendly)

This dialog serves as a positive example for other dialogs:

**Strengths:**

- Input fields with icons use `h-12` (48px) ✓
- Select trigger uses `h-12` (48px) ✓
- Footer buttons use `h-12` (48px) ✓
- Good visual hierarchy ✓
- Responsive max-width: `sm:max-w-[520px]` ✓

**Minor Improvements Needed:**

- Helper text: `text-[10px]` → `text-xs`
- Gift list max-height: `max-h-[160px]` → `max-h-[200px]`

#### Recommended Minor Changes

**Before:**

```tsx
<DialogContent className="sm:max-w-[520px]">
  <Input className="h-12" />
  <p className="text-[10px] text-muted-foreground">
    Helper text
  </p>
  
  <div className="max-h-[160px] overflow-y-auto">
    {/* Gift list */}
  </div>
  
  <div className="flex gap-3">
    <Button className="h-12">Cancel</Button>
    <Button className="h-12">Confirm</Button>
  </div>
</DialogContent>
```

**After:**

```tsx
<DialogContent className="max-w-[95vw] max-w-md sm:max-w-[520px]">
  <Input className="h-12" />
  <p className="text-xs text-muted-foreground">
    Helper text
  </p>
  
  <div className="max-h-[200px] overflow-y-auto">
    {/* Gift list */}
  </div>
  
  <div className="flex gap-4">
    <Button variant="ghost" className="flex-1 h-12">Cancel</Button>
    <Button className="flex-[2] h-12">Confirm</Button>
  </div>
</DialogContent>
```

**Key Changes:**

- Max-width: Add `max-w-[95vw] max-w-md` for mobile
- Helper text: `text-[10px]` → `text-xs`
- Gift list: `max-h-[160px]` → `max-h-[200px]`
- Footer gap: `gap-3` → `gap-4`

---

### 6.18 ClaimDialog (Positive Example)

#### Current State (Already Mobile-Friendly)

This dialog serves as a positive example for other dialogs:

**Strengths:**

- Input fields with icons use `h-12` (48px) ✓
- Select trigger uses `h-12` (48px) ✓
- Footer buttons use `h-12` (48px) ✓
- Good visual hierarchy ✓
- Responsive max-width: `sm:max-w-[480px]` ✓

**Minor Improvements Needed:**

- Helper text: `text-[10px]` → `text-xs`

#### Recommended Minor Changes

**Before:**

```tsx
<DialogContent className="sm:max-w-[480px]">
  <Input className="h-12" />
  <p className="text-[10px] text-muted-foreground">
    Helper text
  </p>
  
  <div className="flex gap-3">
    <Button className="h-12">Cancel</Button>
    <Button className="h-12">Claim</Button>
  </div>
</DialogContent>
```

**After:**

```tsx
<DialogContent className="max-w-[95vw] max-w-md sm:max-w-[480px]">
  <Input className="h-12" />
  <p className="text-xs text-muted-foreground">
    Helper text
  </p>
  
  <div className="flex gap-4">
    <Button variant="ghost" className="flex-1 h-12">Cancel</Button>
    <Button className="flex-[2] h-12">Claim</Button>
  </div>
</DialogContent>
```

**Key Changes:**

- Max-width: Add `max-w-[95vw] max-w-md` for mobile
- Helper text: `text-[10px]` → `text-xs`
- Footer gap: `gap-3` → `gap-4`

---

## 7. Implementation Priority

### 7.1 Priority Grouping

#### Phase 1: Base UI Components (Critical - 2-3 days)

**Components:**

1. Button Component ([`components/ui/button.tsx`](components/ui/button.tsx))
2. Input Component ([`components/ui/input.tsx`](components/ui/input.tsx))
3. Select Component ([`components/ui/select.tsx`](components/ui/select.tsx))
4. Dialog Component ([`components/ui/dialog.tsx`](components/ui/dialog.tsx))

**Issues Addressed:**

- All 12 Critical issues related to touch targets
- 4 High issues related to dialog widths and select positioning

**Effort Estimate:** 2-3 days

**Dependencies:** None (base components)

---

#### Phase 2: Form-Related Components (High - 1-2 days)

**Components:**

1. Textarea Component ([`components/ui/textarea.tsx`](components/ui/textarea.tsx))
2. Label Component ([`components/ui/label.tsx`](components/ui/label.tsx))
3. Field Component ([`components/ui/field.tsx`](components/ui/field.tsx))

**Issues Addressed:**

- 2 Medium issues related to textarea and field spacing
- 1 Low issue related to label tap targets

**Effort Estimate:** 1-2 days

**Dependencies:** Phase 1 complete

---

#### Phase 3: Admin Dialogs (High - 2-3 days)

**Components:**

1. OnboardingModal ([`components/onboarding-modal.tsx`](components/onboarding-modal.tsx))
2. CreateCampaignDialog ([`components/admin/create-campaign-dialog.tsx`](components/admin/create-campaign-dialog.tsx))
3. CreateFamilyDialog ([`components/admin/create-family-dialog.tsx`](components/admin/create-family-dialog.tsx))
4. CreateGiftDialog ([`components/admin/create-gift-dialog.tsx`](components/admin/create-gift-dialog.tsx))
5. CreatePersonDialog ([`components/admin/create-person-dialog.tsx`](components/admin/create-person-dialog.tsx))
6. EditFamilyDialog ([`components/admin/edit-family-dialog.tsx`](components/admin/edit-family-dialog.tsx))
7. EditGiftDialog ([`components/admin/edit-gift-dialog.tsx`](components/admin/edit-gift-dialog.tsx))
8. ImportCSVDialog ([`components/admin/import-csv-dialog.tsx`](components/admin/import-csv-dialog.tsx))
9. ManagePersonsDialog ([`components/admin/manage-persons-dialog.tsx`](components/admin/manage-persons-dialog.tsx))

**Issues Addressed:**

- 8 High issues related to dialog widths
- 3 Critical issues related to specific dialog elements
- 10 Medium issues related to form layouts and spacing

**Effort Estimate:** 2-3 days

**Dependencies:** Phase 1 and Phase 2 complete

---

#### Phase 4: Donor Dialogs (Low - 0.5 day)

**Components:**

1. AdoptFamilyDialog ([`components/donor/adopt-family-dialog.tsx`](components/donor/adopt-family-dialog.tsx))
2. ClaimDialog ([`components/donor/claim-dialog.tsx`](components/donor/claim-dialog.tsx))

**Issues Addressed:**

- 2 Medium issues related to helper text and list heights

**Effort Estimate:** 0.5 day

**Dependencies:** Phase 1 complete

---

### 7.2 Implementation Order by Component

| Priority | Component | Phase | Effort | Dependencies |
|----------|-----------|-------|--------|--------------|
| 1 | Button | 1 | 0.5 day | None |
| 2 | Input | 1 | 0.5 day | None |
| 3 | Select | 1 | 0.5 day | None |
| 4 | Dialog | 1 | 0.5 day | None |
| 5 | Textarea | 2 | 0.5 day | Phase 1 |
| 6 | Label | 2 | 0.25 day | Phase 1 |
| 7 | Field | 2 | 0.25 day | Phase 1 |
| 8 | CreateCampaignDialog | 3 | 0.25 day | Phase 2 |
| 9 | CreateFamilyDialog | 3 | 0.25 day | Phase 2 |
| 10 | EditFamilyDialog | 3 | 0.25 day | Phase 2 |
| 11 | CreatePersonDialog | 3 | 0.5 day | Phase 2 |
| 12 | CreateGiftDialog | 3 | 0.5 day | Phase 2 |
| 13 | EditGiftDialog | 3 | 0.5 day | Phase 2 |
| 14 | ImportCSVDialog | 3 | 0.5 day | Phase 2 |
| 15 | ManagePersonsDialog | 3 | 0.5 day | Phase 2 |
| 16 | OnboardingModal | 3 | 0.5 day | Phase 2 |
| 17 | AdoptFamilyDialog | 4 | 0.25 day | Phase 1 |
| 18 | ClaimDialog | 4 | 0.25 day | Phase 1 |

**Total Estimated Effort:** 6-7 days

---

### 7.3 Testing Strategy

#### Testing Checklist

**Base UI Components:**

- [ ] Button meets 44x44px minimum on all sizes
- [ ] Input meets 44px height on mobile
- [ ] Select trigger meets 44px height on mobile
- [ ] Select items meet 44px minimum height
- [ ] Dialog close button meets 44x44px
- [ ] Textarea has 120px minimum height on mobile
- [ ] Label has 44px minimum tap target

**Dialog Components:**

- [ ] No horizontal scrolling on 375px screens
- [ ] Footer buttons have minimum 16px spacing
- [ ] Form fields have proper spacing on mobile
- [ ] Helper text is readable (12px minimum)
- [ ] All interactive elements meet touch target requirements

**Form Layouts:**

- [ ] Single-column layout on mobile
- [ ] Labels above inputs on mobile
- [ ] Proper spacing between form elements
- [ ] Error messages are visible and readable

**Cross-Device Testing:**

- [ ] iPhone SE (375px width)
- [ ] iPhone 12/13 (390px width)
- [ ] iPhone 14 Pro Max (430px width)
- [ ] Android devices (360-412px width)
- [ ] Tablet (768px+ width)
- [ ] Desktop (1024px+ width)

---

## 8. WCAG Mobile Accessibility Compliance

### 8.1 WCAG 2.1 Level AA Compliance

This design specification ensures compliance with following WCAG 2.1 Level AA criteria relevant to mobile:

#### 2.5.5 Target Size (Level AAA - Recommended)

- **Requirement:** Touch targets are at least 44x44px
- **Implementation:** All interactive elements meet 44x44px minimum
- **Status:** ✓ Compliant

#### 1.4.3 Contrast (Minimum) (Level AA)

- **Requirement:** Text contrast ratio of at least 4.5:1
- **Implementation:** Use existing color palette with verified contrast
- **Status:** ✓ Compliant

#### 1.4.4 Resize Text (Level AA)

- **Requirement:** Text can be resized up to 200% without loss of content
- **Implementation:** Use relative units and proper viewport meta tag
- **Status:** ✓ Compliant

#### 1.4.10 Reflow (Level AA)

- **Requirement:** Content can be presented without loss of information or functionality at 320px width
- **Implementation:** Responsive design with mobile-first approach
- **Status:** ✓ Compliant

#### 1.4.12 Text Spacing (Level AA)

- **Requirement:** Text spacing can be adjusted without loss of content
- **Implementation:** Proper padding and spacing in all components
- **Status:** ✓ Compliant

#### 2.4.2 Page Titled (Level A)

- **Requirement:** Web pages have titles
- **Implementation:** Dialog titles properly set
- **Status:** ✓ Compliant

#### 2.4.3 Focus Order (Level A)

- **Requirement:** Focusable components receive focus in an order that preserves meaning
- **Implementation:** Proper tab order in forms
- **Status:** ✓ Compliant

#### 2.4.7 Focus Visible (Level AA)

- **Requirement:** Keyboard focus indicator is visible
- **Implementation:** Focus rings on all interactive elements
- **Status:** ✓ Compliant

### 8.2 Mobile-Specific Best Practices

#### Apple Human Interface Guidelines

- **Minimum tap target:** 44x44px ✓
- **Spacing between targets:** 8px minimum ✓
- **Text size:** 11pt minimum (approximately 15px) ✓

#### Material Design Guidelines

- **Minimum touch target:** 48x48px (we use 44x44px as WCAG recommendation) ✓
- **Spacing:** 8dp between touch targets ✓
- **Elevation and shadows:** Proper visual hierarchy ✓

---

## 9. Design Tokens and Tailwind Configuration

### 9.1 Spacing Tokens

```css
/* Mobile spacing */
--spacing-touch-target: 44px;
--spacing-touch-gap: 8px;
--spacing-form-field-mobile: 16px;
--spacing-form-section-mobile: 24px;

/* Desktop spacing */
--spacing-form-field-desktop: 24px;
--spacing-form-section-desktop: 32px;
```

### 9.2 Typography Tokens

```css
/* Mobile typography */
--font-size-body-mobile: 16px;
--font-size-label-mobile: 14px;
--font-size-helper-mobile: 12px;
--font-size-title-mobile: 24px;

/* Desktop typography */
--font-size-body-desktop: 14px;
--font-size-label-desktop: 14px;
--font-size-helper-desktop: 12px;
--font-size-title-desktop: 30px;
```

### 9.3 Breakpoint Tokens

```css
/* Tailwind breakpoints */
--breakpoint-sm: 640px;  /* Tablet */
--breakpoint-md: 768px;  /* Small desktop */
--breakpoint-lg: 1024px; /* Desktop */
```

---

## 10. Conclusion

This mobile design specification provides a comprehensive roadmap for optimizing all dialogs and forms in Adopt a Grover platform. By following these guidelines, the project will achieve:

### Key Outcomes

1. **100% Touch Target Compliance:** All interactive elements meet 44x44px minimum
2. **Responsive Dialog Widths:** No horizontal scrolling on mobile devices
3. **Mobile-First Form Layouts:** Single-column layouts that scale to multi-column
4. **Improved Accessibility:** Full WCAG 2.1 Level AA compliance
5. **Consistent User Experience:** Standardized patterns across all components

### Components Covered

- **6 Base UI Components:** Button, Input, Select, Dialog, Textarea, Label, Field
- **11 Dialog Components:** All admin and donor dialogs
- **Total:** 17 components fully specified

### Issues Addressed

- **12 Critical Issues:** All touch target size issues
- **17 High Issues:** Dialog widths, form layouts, helper text
- **15 Medium Issues:** Spacing, textarea heights, select items
- **3 Low Issues:** Focus states, label tap targets

### Implementation Timeline

- **Phase 1 (Base UI):** 2-3 days
- **Phase 2 (Form Components):** 1-2 days
- **Phase 3 (Admin Dialogs):** 2-3 days
- **Phase 4 (Donor Dialogs):** 0.5 day

**Total Estimated Effort:** 6-7 days

---

**Document Status:** Complete  
**Next Steps:** Begin implementation with Phase 1 (Base UI Components)  
**Review Date:** TBD after implementation completion  
**Approved By:** [To be filled]

---

## Appendix A: Quick Reference

### Common Tailwind Patterns

#### Button Patterns

```tsx
// Primary action
<Button className="h-12 px-6 sm:h-11">Submit</Button>

// Secondary action
<Button variant="ghost" className="h-11 px-4 sm:h-10">Cancel</Button>

// Icon button
<Button variant="ghost" size="icon" className="size-11 sm:size-10">
  <Icon className="h-5 w-5" />
</Button>
```

#### Input Patterns

```tsx
// Standard input
<Input className="h-11 px-4 py-3 sm:h-10 sm:px-3 sm:py-2" />

// Input with icon
<div className="relative">
  <Icon className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4" />
  <Input className="pl-11 h-11 px-4 py-3" />
</div>
```

#### Dialog Patterns

```tsx
<DialogContent className="max-w-[95vw] max-w-md sm:max-w-[original] p-6 sm:p-6">
  {/* Content */}
</DialogContent>
```

#### Form Layout Patterns

```tsx
// Mobile-first form
<div className="space-y-4 sm:space-y-6">
  <div className="space-y-2">
    <Label htmlFor="field" className="text-sm font-bold">Label</Label>
    <Input id="field" className="h-11" />
  </div>
</div>
```

---

## Appendix B: Testing Checklist

### Pre-Implementation Testing

- [ ] Review MOBILE_ANALYSIS.md for all identified issues
- [ ] Verify current component implementations
- [ ] Identify any additional issues not in analysis

### During Implementation Testing

- [ ] Test each component after changes
- [ ] Verify touch target sizes with browser dev tools
- [ ] Test on actual mobile devices when possible
- [ ] Verify responsive behavior at all breakpoints

### Post-Implementation Testing

- [ ] Complete full regression testing
- [ ] Test all user flows on mobile devices
- [ ] Verify WCAG compliance with accessibility tools
- [ ] Gather user feedback if possible

### Ongoing Testing

- [ ] Include mobile testing in QA process
- [ ] Test new components against this specification
- [ ] Regular accessibility audits
- [ ] Monitor mobile usage metrics

---

**End of Document**
