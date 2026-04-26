import { defineConfig } from 'vitest/config'
import react from '@vitejs/plugin-react'

export default defineConfig({
  plugins: [react()],
  server: {
    host: true,  // listen on 0.0.0.0 so phones/tablets on the LAN can reach it
  },
  test: {
    environment: 'node',
    globals: true,
    pool: 'forks',  // worker_threads has a Windows init bug in Vitest 4
  },
})
