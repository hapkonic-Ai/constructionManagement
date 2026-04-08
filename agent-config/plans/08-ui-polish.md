# Phase 8 — UI/UX Polish & Design System (Week 11–12)

[← Back to Master Tracker](./tracker.md)

Final aesthetic refinements and shared component library development.

## 8.1 Design Language — Velocity Nexus
- **Palette**: Primary `zinc-900`, Surface `stone-100/stone-950`, Accent `amber-500`
- **Typography**: Display — `DM Serif Display`; Body — `DM Sans`; Mono — `JetBrains Mono`
- **Radius**: `rounded-xl` for cards, `rounded-md` for inputs
- **Shadows**: Subtle layered `shadow-sm` on cards, `shadow-lg` on modals
- **Motion**: Framer Motion — page transitions (slide-in), toast micro-animations, Gantt bar animations

## 8.2 Shared Component Library (`/components/ui`)
- `<RoleBadge role={...} />` — pill with role colour coding
- `<Avatar src={...} name={...} size={...} />` — fallback initials
- `<GanttChart tasks={[...]} />`
- `<CostTable items={[...]} editable={bool} />`
- `<DeviationCard deviation={...} />`
- `<NotificationPanel />`
- `<AuditLogTable logs={[...]} />`
- `<StatCard label title value delta />`

## 8.3 Responsive Design
- Mobile-first; all dashboards usable on tablet (COO onsite use case)
- Sidebar collapses to bottom nav on mobile
- Photo upload works on mobile camera
