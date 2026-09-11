# monart

An ikas code components project.

## Getting Started

1. Install dependencies:
   ```bash
   npm install
   ```

2. Start the development server:
   ```bash
   npm run dev
   ```

3. Open the ikas editor and connect to the dev server from the Dev Components panel.

## Commands

- `npm run dev` - Start development server with live editor updates
- `npm run build` - Build components for production
- `npm run add` - Add a new component to the project

## Project Structure

```
monart/
├── src/
│   ├── components/
│   │   ├── ExampleComponent/  # A child component (type: "component")
│   │   │   ├── index.tsx
│   │   │   ├── styles.css
│   │   │   └── types.ts
│   │   ├── ExampleSection/    # A page-level section (type: "section")
│   │   │   ├── index.tsx
│   │   │   ├── styles.css
│   │   │   └── types.ts
│   │   └── index.ts
│   ├── global.css             # Unscoped global styles
│   └── global-types.ts        # Auto-generated shared enum types
├── ikas.config.json
├── package.json
├── tsconfig.json
└── vite.config.ts
```

## Building for Production

Run `npm run build` to compile your components. The output will be ready to upload to the ikas editor.
