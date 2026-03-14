import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// Set base to your GitHub repo name so assets resolve correctly on GH Pages.
// e.g. if your repo is github.com/you/sigma-editable-table, base = '/sigma-editable-table/'
// Change this to match YOUR repo name before deploying.
const REPO_NAME = 'sigma-plugin-input-table'

export default defineConfig({
  plugins: [react()],
  base: `/${REPO_NAME}/`,
})
