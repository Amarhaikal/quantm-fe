# Sidemenu Component

A high-performance, responsive dual-mode sidemenu built with **Angular v20+**, **Signals**, and **PrimeNG**. It features smooth transitions between expanded and mini modes, dynamic menu data fetching, and intelligent desktop/mobile behavior.

## 📍 Location

`src/app/layout/components/sidemenu/`

## 🚀 Usage

The Sidemenu is a core layout component placed within the `MainLayoutComponent`. It intelligently handles desktop mini-expansion and mobile drawer behaviors.

```html
<app-sidemenu [userData]="userData()" />
```

## 🛠 Features

- **Dual-Mode Desktop Interface**:
  - **Expanded (300px)**: Default view showing full menu labels and submenus.
  - **Mini (80px)**: Compact view showing icons only, ideal for maximizing workspace.
- **Intelligent Mini Mode**:
  - Automatically flattens the menu hierarchy to show only clickable routes.
  - Displays a square compact logo (`logo.png`) instead of the full brand logo.
  - Hides complex user profile details to maintain a clean vertical strip.
- **Interactive Tooltips**: In Mini mode, hovering over an icon reveals the menu name via a polished **PrimeNG Tooltip** (localized via Transloco).
- **Global Layout Synchronization**: Communicates with `MainLayoutComponent` to adjust content padding (`300px` vs `80px`) seamlessly.
- **Signals Powered**: Uses computed signals (`isMini`, `miniMenuItems`, `isSidebarExpanded`) for highly efficient UI updates.
- **Smooth Animations**: Native Angular animations for sliding submenus and CSS transitions for width adjustments.
- **Logo Branding**: Automatically switches between full and compact logos based on the sidebar state.
- **Active State Styling**: Highlights active routes with a vibrant `indigo-400` color.

## ⚙️ API

### Inputs

| Property   | Type                                                                  | Default | Description                                   |
| :--------- | :-------------------------------------------------------------------- | :------ | :-------------------------------------------- |
| `userData` | `input<{ fullname, shortname, username, profile_image_url } \| null>` | `null`  | Current user details for the profile section. |

### Signals & Computeds

- **`isMini`**: Returns `true` if on desktop and the sidebar is collapsed.
- **`isSidebarExpanded`**: Reflects the current toggle state.
- **`miniMenuItems`**: A flattened list of all clickable menu items (with URLs) for the icon-only view.

## 💡 Implementation Details

### Responsive Behavior (Desktop vs Mobile)

The `MenuService` manages two primary state signals:

1. `isDesktop`: True if screen is > 1300px.
2. `isSidebarVisible`: Toggles the expanded state.

**Desktop Logic**: Toggling hides the full labels and shrinks the sidebar to an **80px mini strip**.
**Mobile Logic**: Toggling follows the standard overlay drawer pattern (hides completely when closed).

### Styling System

- **Transition**: Uses `cubic-bezier(0.4, 0, 0.2, 1)` for premium-feeling width shifts.
- **Tooltip Customization**: Global styles in `styles.css` enhance the tooltip with custom padding (`p-2`), rounded corners, and theme-matching colors.
- **Mini-Logo Positioning**: Adjusts top padding dynamically (`pt-4` in mini mode) for visual balance.

### Best Practices:

- **`ChangeDetectionStrategy.OnPush`**: Ensures minimal re-renders.
- **Standalone Architecture**: Modular and easy to test.
- **Z-Index Layering**: Content is layered carefully to ensure tooltips and ripples appear above background elements.
- **Manual Cleanup**: Ensure `matchMedia` listeners are properly managed to prevent memory leaks in SSR environments.
