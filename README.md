# Stepper Assignment

This repository contains a small React component library demonstrating:

- Compound components pattern: `<Stepper><Step>...</Step></Stepper>`
- Render props for customizing step content
- Internal synchronization without prop drilling via context (`data`, `setData` exposed by `Stepper`)
- Keyboard navigation (ArrowLeft/ArrowRight/Home/End) and ARIA attributes

Quick start:

```bash
npm install
npm run dev
```

Open `http://localhost:5173` to see the demo.
