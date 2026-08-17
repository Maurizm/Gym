<!-- BEGIN:nextjs-agent-rules -->
# This is NOT the Next.js you know

This version has breaking changes — APIs, conventions, and file structure may all differ from your training data. Read the relevant guide in `node_modules/next/dist/docs/` before writing any code. Heed deprecation notices.
<!-- END:nextjs-agent-rules -->

# GymApp Quality Standards

This project enforces premium design engineering standards. See `.cursor/rules/` for comprehensive rules.

## Non-Negotiable Rules
1. **Animations**: Every state change must have a purposeful CSS transition. Never use `transition: all`. Never use `linear` easing. Use `cubic-bezier(0.16, 1, 0.3, 1)` for entrances.
2. **Anti-Slop**: No generic UI. No pure black/white. No Bootstrap-looking buttons. Enforce visual hierarchy through typography scale, spacing, and color weight.
3. **Dark Mode First**: Background `hsl(0 0% 3.9%)`, not `#000`. Text `hsl(0 0% 98%)`, not `#fff`. Test dark mode before light mode.
4. **Performance**: Use Server Components by default. `'use client'` only at leaf boundaries. Lazy-load heavy components. Target 60fps animations.
5. **TypeScript Strict**: No `any`. No `@ts-ignore`. Use `interface` for object shapes, `type` for unions.
6. **Accessibility**: Semantic HTML, keyboard navigation, focus management, `prefers-reduced-motion` support.
7. **Mobile First**: All layouts start at 375px. This is primarily a phone app.
