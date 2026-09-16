import { fileURLToPath } from 'node:url';
import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig({
    plugins: [react()],
    build: {
        rollupOptions: {
            input: {
                app: fileURLToPath(new URL('./index.html', import.meta.url)),
                academicSoberCatalog: fileURLToPath(
                    new URL('./catalog/academic-sober/index.html', import.meta.url),
                ),
            },
        },
    },
    test: {
        exclude: ['tests/e2e/**', '**/node_modules/**', '**/dist/**'],
    },
});
