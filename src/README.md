# Readme for Code

Code is broken down into the following structure

```
TPH-Calculator/

├── src/                          # Source code
│   ├── assets/                   # Images, logos, or static resources
│   ├── components/               # Reusable UI components (e.g., AntSwitch, Dialogs)
│   ├── pages/                    # Page-level components (e.g., Home, Orders, Slot)
│   ├── hooks/                    # Custom React hooks (e.g., useWarehouseData)
│   ├── utils/                    # Helper functions (e.g., time calculations, sort logic)
│   ├── context/                  # React context for global state (e.g., warehouse context)
│   ├── data/                     # Static or mock JSON data (e.g., samplePickingList.json)
│   ├── styles/                   # Global styles, theme settings (CSS/SCSS/StyledComponents)
│   ├── App.jsx                   # Root component
│   ├── main.jsx                  # React app entry point
│   └── index.css                 # Base styling
│
├── .gitignore                    # Ignore node_modules, etc.
├── package.json                  # Dependencies and scripts
├── vite.config.js /              # Or webpack.config.js (depending on bundler)
├── README.md                     # Project overview and instructions
└── tsconfig.json / jsconfig.json # (If using TypeScript or path aliases)
