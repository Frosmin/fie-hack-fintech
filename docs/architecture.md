# Arquitectura del Sistema

## Estructura de Carpetas

```
├─ backend/
│  ├─ package.json
│  ├─ prisma/
│  │  ├─ schema.prisma
│  │  ├─ seed.js
│  │  ├─ migrations/
│  │  └─ seeds/
│  └─ src/
│     ├─ app.js
│     ├─ server.js
│     ├─ config/
│     │  ├─ constants.js
│     │  ├─ crawler.js
│     │  ├─ env.js
│     │  └─ prisma.js
│     ├─ controllers/
│     │  ├─ auth.controller.js
│     ├─ services/
│     │  ├─ auth.service.js
│     │  └─ users.service.js
│     ├─ repositories/
│     │  ├─ auth.repository.js
│     │  └─ users.repository.js
│     ├─ routes/
│     │  ├─ auth.routes.js
│     │  ├─ users.routes.js
│     │  └─ index.js
│     ├─ middlewares/
│     ├─ errors/
│     │  ├─ appError.js
│     └─ helpers/
│
├─ frontend/
│  ├─ package.json
│  ├─ tsconfig.json
│  ├─ .env.example
│  └─ src/
│     ├─ main.tsx
│     ├─ App.tsx
│     ├─ app/
│     │  ├─ router.tsx
│     │  ├─ providers.tsx
│     │  └─ store.ts
│     ├─ shared/
│     │  ├─ api/
│     │  │  └─ httpClient.ts
│     │  ├─ components/
│     │  ├─ hooks/
│     │  ├─ types/
│     │  ├─ css/
│     │  └─ utils/
│     ├─ features/
│     │  ├─ auth/
│     │  │  ├─ api/
│     │  │  ├─ components/
│     │  │  ├─ hooks/
│     │  │  ├─ pages/
│     │  │  ├─ types/
|     │     ├─ css/
│     │  │  └─ index.ts
│
```

## Tecnologías

- **Frontend**: React + TypeScript + CSS
- **Backend**: Express + TypeScript + Prisma
