import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vitejs.dev/config/
export default defineConfig({
    plugins: [react()],
    server: {
        proxy: {
            '/apis': 'http://localhost:3000',
            '/projects': 'http://localhost:3000',
            '/mock': 'http://localhost:3000'
        }
    }
})
