import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import path from 'path'

export default defineConfig({
  plugins: [react()],
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src'),
    },
  },
  server: {
    port: 3000,
    open: true,
    proxy: {
      // Proxy LeetCode GraphQL API to bypass CORS
      '/leetcode-graphql': {
        target: 'https://leetcode.com',
        changeOrigin: true,
        rewrite: (path) => path.replace(/^\/leetcode-graphql/, '/graphql'),
        secure: true,
        headers: {
          'Referer': 'https://leetcode.com',
          'Origin': 'https://leetcode.com',
        },
      },
      // Proxy JSearch API
      '/jsearch-api': {
        target: 'https://jsearch.p.rapidapi.com',
        changeOrigin: true,
        rewrite: (path) => path.replace(/^\/jsearch-api/, ''),
        secure: true,
      },
      // Proxy Adzuna API
      '/adzuna-api': {
        target: 'https://api.adzuna.com',
        changeOrigin: true,
        rewrite: (path) => path.replace(/^\/adzuna-api/, ''),
        secure: true,
      },
      // Proxy Remotive API
      '/remotive-api': {
        target: 'https://remotive.com/api',
        changeOrigin: true,
        rewrite: (path) => path.replace(/^\/remotive-api/, ''),
        secure: true,
      },
    },
  },
})

