import { resolve, dirname } from 'node:path'
import { fileURLToPath } from 'node:url'
import { defineConfig } from 'vite'
import tailwindcss from '@tailwindcss/vite'
import htmlInjection from 'vite-plugin-html-inject'

const __dirname = dirname(fileURLToPath(import.meta.url))

const getEntries = () => {
  const pageFolders = [
    'true-or-do',
    'text-tools',
    'svg-editor',
    'speed-read',
    'schema-markup',
    'recipe',
    'piu',
    'clean-semantics'
  ]

  const input: Record<string, string> = {
    main: resolve(__dirname, 'src', 'index.html'), // Абсолютный путь
  }

  pageFolders.forEach(folder => {
    input[folder] = resolve(__dirname, 'src', folder, 'index.html')
  })

  return input
}

export default defineConfig({
  root: resolve(__dirname, 'src'), // корень — src
  base: '/',
  plugins: [
    tailwindcss(),
    htmlInjection(),
  ],
  resolve: {
    alias: [{ find: '@', replacement: '/src' }],
  },
  build: {
    outDir: resolve(__dirname, 'dist'),
    emptyOutDir: true,
    rollupOptions: {
      input: getEntries(),
    },
  },
})
