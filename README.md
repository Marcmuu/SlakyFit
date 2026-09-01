# SlakyFit

App de gimnasio mobile-first: recomienda el entrenamiento, tú decides, los datos reales mandan.

React + Vite + TypeScript + Tailwind. Sin backend: todo se guarda en el `localStorage` del navegador.

## Desarrollo local

```bash
npm install
npm run dev
```

## Publicar gratis en GitHub Pages

1. Crea un repositorio nuevo en GitHub (público o privado) y súbele este proyecto:

   ```bash
   git remote add origin https://github.com/<tu-usuario>/<nombre-repo>.git
   git branch -M main
   git push -u origin main
   ```

2. En GitHub, ve a **Settings → Pages** del repositorio y en "Build and deployment" elige **Source: GitHub Actions**.
3. Cada `git push` a `main` compila la app y la publica automáticamente (workflow en `.github/workflows/deploy.yml`). La URL final será `https://<tu-usuario>.github.io/<nombre-repo>/`.
4. Desde el iPhone, abre esa URL en Safari y usa "Compartir → Añadir a pantalla de inicio" para tener un icono como si fuera una app.

> Los datos se guardan por navegador/dispositivo (no hay sincronización todavía entre tu iPhone y el ordenador — está previsto para una fase futura).
