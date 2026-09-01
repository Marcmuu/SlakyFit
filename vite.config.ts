import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// BASE_PATH is set by the GitHub Pages workflow to /<repo-name>/ so the
// build works as a GitHub Pages project site regardless of the repo name.
export default defineConfig({
  plugins: [react()],
  base: process.env.BASE_PATH || '/',
})
