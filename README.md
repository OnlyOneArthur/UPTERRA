# UPTERRA

Eco-tech waste management app built with React + Vite + Tailwind CSS v4.

## Branch: `feat/glassmorphism-ui`

This branch introduces a full **glassmorphism UI redesign** powered by **Framer Motion (Motion)**.

### What's changed

| File | Change |
|---|---|
| `package.json` | Added `motion` (Framer Motion) dependency |
| `src/components/layout/Navbar.jsx` | Full glass navbar with Framer Motion spring animations, animated active pill, hover lifts |
| `src/pages/Onboarding.jsx` | Slide entrance/exit animations, swipe gesture, animated dots, glass card container |
| `src/components/layout/PageWrapper.jsx` | Reusable wrapper with background blobs, page slide-up entrance, embeds `<Navbar />` |
| `src/components/layout/ProtectedRoute.jsx` | Auth guard redirect helper |

### Install & run

```bash
npm install
npm run dev
```

### How to use `PageWrapper` on any page

```jsx
import PageWrapper from "../components/layout/PageWrapper";

export default function Home() {
  return (
    <PageWrapper>
      <div className="px-4 pt-6">
        {/* your content */}
      </div>
    </PageWrapper>
  );
}
```

> `hideNav={true}` hides the Navbar (useful for Login / Register / Onboarding pages).
