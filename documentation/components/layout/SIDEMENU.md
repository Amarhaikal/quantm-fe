# Sidemenu Component

A high-performance, responsive sidemenu built with **Angular v20+**, **Signals**, and **PrimeNG**. It features smooth animations, dynamic menu data fetching, and an automatic auto-hide mechanism for smaller screens.

## 📍 Location

`src/app/layout/components/sidemenu/`

## 🚀 Usage

The Sidemenu is a core layout component usually placed within the `MainLayoutComponent`. It receives user profile data via an input signal.

```html
<app-sidemenu [userData]="userData()" />
```

## 🛠 Features

- **Dynamic Menu Data**: Fetches menu hierarchy (parents and children) from `MenuService`.
- **Signals Powered**: Uses `input()` and `signal()` for reactive state management.
- **Smooth Animations**: Native Angular animations (`@expandCollapse`) for sliding submenus.
- **Automatic Auto-hide**: Automatically hides/collapses when screen width is **1300px or below** using a native `MediaQueryList` listener.
- **Logo Navigation**: Clicking the logo navigates the user back to the root (`/`) path.
- **Active State Styling**: Automatically highlights the active route with `indigo-400` font color.
- **Accessibility**: Includes ARIA labels and follows semantic HTML structures.

## ⚙️ API

### Inputs

| Property   | Type                                                                  | Default | Description                                                |
| :--------- | :-------------------------------------------------------------------- | :------ | :--------------------------------------------------------- |
| `userData` | `input<{ fullname, shortname, username, profile_image_url } \| null>` | `null`  | Current user details for the profile section (if enabled). |

### Services Used

- **`MenuService`**: Provides access to menu data and manages the sidebar's overall visibility state (`isSidebarVisible`).

## 💡 Implementation Details

### Responsiveness

The component utilizes a native `window.matchMedia` listener (implemented in `MenuService`) to handle the **1300px breakpoint**. This ensures the UI remains clean on smaller laptops and tablets without additional heavy libraries.

### State Persistence

Menu expansion states are tracked using a `Signal<Set<number>>`, ensuring that UI updates are localized and efficient.

### Best Practices:

- **`ChangeDetectionStrategy.OnPush`**: Optimized for performance.
- **Standalone Architecture**: Easily maintainable and decoupled.
- **`routerLinkActive`**: Handles visual feedback for navigation automatically.
