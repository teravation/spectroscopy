import { defineConfig } from 'vitest/config'
import react from '@vitejs/plugin-react'

export default defineConfig({
  plugins: [react()],
  test: {
    environment: 'node',
    globals: true,
    pool: 'forks',  // worker_threads has a Windows init bug in Vitest 4
  },
})
