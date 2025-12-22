# Giftify Style Guide

A comprehensive guide to the visual design system for Giftify.

---

## Design Philosophy

**Warm Tech** - Our design avoids cold, minimal Apple-style aesthetics in favor of a warm, inviting, and playful approach that feels approachable to a broad audience.

Key principles:
- **Warmth over coldness** - Cream backgrounds, coral accents, soft shadows
- **Playful sophistication** - Animations and depth without being childish
- **Clarity first** - Clear hierarchy, readable typography, obvious actions

---

## Color Palette

### Light Mode

| Token | Value | Usage |
|-------|-------|-------|
| `--background` | `oklch(0.98 0.008 85)` | Warm cream page background |
| `--foreground` | `oklch(0.22 0.02 50)` | Rich warm charcoal text |
| `--card` | `oklch(0.995 0.005 85)` | Warm white card surfaces |
| `--primary` | `oklch(0.65 0.2 25)` | Coral - buttons, links, accents |
| `--primary-foreground` | `oklch(0.99 0 0)` | White text on primary |
| `--secondary` | `oklch(0.94 0.02 80)` | Warm sand for secondary buttons |
| `--muted` | `oklch(0.95 0.015 80)` | Subtle backgrounds |
| `--muted-foreground` | `oklch(0.5 0.02 50)` | Secondary text |
| `--border` | `oklch(0.90 0.02 80)` | Soft warm borders |
| `--destructive` | `oklch(0.577 0.245 27.325)` | Error red |

### Dark Mode

| Token | Value | Usage |
|-------|-------|-------|
| `--background` | `oklch(0.18 0.015 50)` | Rich warm charcoal |
| `--foreground` | `oklch(0.95 0.01 80)` | Warm off-white text |
| `--card` | `oklch(0.22 0.02 50)` | Elevated surfaces |
| `--primary` | `oklch(0.72 0.18 25)` | Brighter coral for visibility |
| `--muted-foreground` | `oklch(0.65 0.02 70)` | Subdued text |

### Accent Colors (for icons/badges)

```css
/* Amber/Orange */
from-amber-400 to-orange-500
shadow-amber-500/25

/* Rose/Pink */
from-rose-400 to-pink-500
shadow-rose-500/25

/* Emerald/Teal */
from-emerald-400 to-teal-500
shadow-emerald-500/25

/* Blue */
from-blue-100 to-blue-200

/* Purple */
from-purple-100 to-purple-200
```

---

## Typography

### Font Families

| Font | Variable | Usage |
|------|----------|-------|
| **Outfit** | `--font-outfit` | Headings, display text, brand |
| **DM Sans** | `--font-dm-sans` | Body text, UI elements |
| **Geist Mono** | `--font-geist-mono` | Code, technical content |

### Font Usage

```tsx
// Headings - use Outfit
<h1 className="font-[family-name:var(--font-outfit)] text-5xl md:text-7xl font-bold tracking-tight">

// Body - DM Sans is default via --font-sans
<p className="text-lg text-muted-foreground">
```

### Type Scale

| Size | Class | Usage |
|------|-------|-------|
| 7xl | `text-7xl` | Hero headlines (desktop) |
| 5xl | `text-5xl` | Hero headlines (mobile) |
| 4xl | `text-4xl` | Section headers |
| 3xl | `text-3xl` | Card titles, sub-headers |
| 2xl | `text-2xl` | Form headers |
| xl | `text-xl` | Feature titles |
| lg | `text-lg` | Lead paragraphs |
| base | `text-base` | Body text, buttons |
| sm | `text-sm` | Labels, captions |
| xs | `text-xs` | Badges, fine print |

---

## Spacing & Layout

### Border Radius

| Token | Value | Usage |
|-------|-------|-------|
| `rounded-full` | 9999px | Badges, avatars, pills |
| `rounded-3xl` | ~1.5rem | Cards, containers |
| `rounded-2xl` | ~1rem | Icons, buttons, inputs |
| `rounded-xl` | ~0.75rem | Small elements |

### Container Widths

```tsx
max-w-6xl  // Full-width sections
max-w-5xl  // Hero content
max-w-4xl  // Focused content
max-w-3xl  // CTA sections
max-w-md   // Auth forms (448px)
```

### Standard Spacing

```tsx
// Section padding
py-24 px-4

// Card padding
p-8 md:p-12

// Form spacing
space-y-6  // Between form groups
space-y-2  // Label to input
gap-4      // Button groups
```

---

## Components

### Buttons

**Primary Button**
```tsx
<Button className="h-12 rounded-xl text-base font-semibold shadow-lg shadow-primary/25 hover:shadow-xl hover:shadow-primary/30 transition-all hover:-translate-y-0.5">
  Label
  <ArrowRight className="ml-2 w-4 h-4" />
</Button>
```

**Secondary/Outline Button**
```tsx
<Button variant="outline" className="h-12 rounded-xl text-base font-medium hover:bg-secondary transition-all">
  Label
</Button>
```

**Ghost Button**
```tsx
<Button variant="ghost" className="font-medium">
  Label
</Button>
```

### Input Fields

```tsx
<div className="relative">
  <Icon className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
  <Input
    className="h-12 pl-11 rounded-xl bg-muted/50 border-border/50 focus:bg-background transition-colors"
  />
</div>
```

### Cards

**Feature Card**
```tsx
<div className="group relative p-8 rounded-3xl bg-card border border-border/50 shadow-sm hover:shadow-xl hover:shadow-primary/5 transition-all duration-300 hover:-translate-y-2">
  <div className="absolute inset-0 rounded-3xl bg-gradient-to-br from-primary/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
  <div className="relative">
    {/* Content */}
  </div>
</div>
```

**Auth Card**
```tsx
<div className="bg-card border border-border/50 rounded-3xl shadow-xl shadow-black/5 overflow-hidden">
  {/* Header + Form */}
</div>
```

### Badges

**Primary Badge**
```tsx
<div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-primary/10 border border-primary/20 text-sm font-medium text-primary">
  <Sparkles className="w-4 h-4" />
  <span>Label</span>
</div>
```

**Status Badge**
```tsx
// Available
<div className="px-3 py-1 rounded-full bg-muted text-muted-foreground text-xs font-medium">
  Available
</div>

// Claimed (success)
<div className="px-3 py-1 rounded-full bg-emerald-500/10 text-emerald-600 text-xs font-medium">
  Claimed
</div>
```

### Icon Containers

**Large Feature Icon**
```tsx
<div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-amber-400 to-orange-500 flex items-center justify-center shadow-lg shadow-amber-500/25 group-hover:scale-110 transition-transform">
  <Icon className="w-7 h-7 text-white" />
</div>
```

**Logo Icon**
```tsx
<div className="relative flex items-center justify-center w-10 h-10 rounded-2xl bg-gradient-to-br from-primary to-primary/80 text-primary-foreground shadow-lg shadow-primary/25 transition-transform group-hover:scale-105">
  <Gift className="w-5 h-5" />
  <div className="absolute inset-0 rounded-2xl bg-white/20 opacity-0 group-hover:opacity-100 transition-opacity" />
</div>
```

---

## Visual Effects

### Background Blobs

Animated organic shapes that float in the background:

```tsx
<div className="fixed inset-0 -z-10 overflow-hidden">
  <div
    className="absolute -top-40 -right-40 w-[500px] h-[500px] rounded-full opacity-30 animate-blob"
    style={{
      background: "linear-gradient(135deg, oklch(0.8 0.15 25), oklch(0.85 0.12 50))",
    }}
  />
  {/* Additional blobs with different positions, sizes, and animation delays */}
</div>
```

### Noise Overlay

Adds subtle texture to pages:

```tsx
<div className="noise-overlay">
  {/* Content */}
</div>
```

### Glass Effect

For floating headers:

```tsx
<header className="glass fixed top-0 left-0 right-0 z-50">
  {/* Applies backdrop blur and semi-transparent background */}
</header>
```

### Gradient Text

For emphasized headlines:

```tsx
<span className="gradient-text">what to gift</span>
```

---

## Animations

### Entrance Animations

```css
.animate-fade-up {
  animation: fade-up 0.8s ease-out forwards;
}

/* With stagger delays */
.delay-100 { animation-delay: 100ms; }
.delay-200 { animation-delay: 200ms; }
.delay-300 { animation-delay: 300ms; }
```

Usage:
```tsx
<h1 className="opacity-0 animate-fade-up delay-100">
```

### Continuous Animations

```css
.animate-blob      /* Morphing blob shapes, 8s */
.animate-float     /* Gentle floating, 6s */
.animate-gradient  /* Background position shift, 8s */
```

### Hover Transitions

```tsx
// Lift on hover
hover:-translate-y-1
hover:-translate-y-2

// Scale on hover
group-hover:scale-105
group-hover:scale-110

// Shadow intensify
shadow-lg shadow-primary/25 hover:shadow-xl hover:shadow-primary/30

// Background reveal
opacity-0 group-hover:opacity-100 transition-opacity
```

---

## Iconography

Using **Lucide React** icons.

Common icons:
- `Gift` - Brand, wishlists
- `Users` - Friends, social
- `Sparkles` - Special features
- `ArrowRight` - CTAs, navigation
- `Heart` - Favorites, love
- `Eye` / `EyeOff` - Visibility, secrets
- `Mail` - Email fields
- `Lock` - Password fields
- `User` - Profile, name fields
- `Loader2` - Loading states (with `animate-spin`)

Icon sizing:
```tsx
w-4 h-4   // Inline with text, buttons
w-5 h-5   // Button icons, small UI
w-7 h-7   // Feature icons
w-8 h-8   // Large logo icons
```

---

## Responsive Breakpoints

Following Tailwind defaults:

| Prefix | Min Width | Usage |
|--------|-----------|-------|
| (none) | 0px | Mobile first |
| `sm:` | 640px | Large phones |
| `md:` | 768px | Tablets |
| `lg:` | 1024px | Desktops |

Common patterns:
```tsx
// Typography scaling
text-5xl md:text-7xl

// Layout changes
flex-col sm:flex-row
grid md:grid-cols-3

// Spacing adjustments
p-8 md:p-12
py-24 md:py-32
```

---

## Accessibility

- All interactive elements have visible focus states via `focus-visible:ring`
- Color contrast meets WCAG AA standards
- Form inputs have associated labels
- Buttons have descriptive text (avoid icon-only without aria-label)
- Loading states use both visual spinner and text ("Signing in...")

---

## File Structure

```
src/
├── app/
│   ├── globals.css          # Theme variables, animations, utilities
│   ├── layout.tsx           # Root layout with fonts
│   ├── page.tsx             # Landing page
│   └── (auth)/
│       ├── layout.tsx       # Auth layout with blobs
│       ├── login/page.tsx
│       └── signup/page.tsx
└── components/
    └── ui/
        ├── button.tsx
        ├── input.tsx
        ├── card.tsx
        └── ...
```
