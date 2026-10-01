import { fileURLToPath } from 'node:url';
import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import tailwindcss from '@tailwindcss/vite';

export default defineConfig({
    plugins: [react(), tailwindcss()],
    resolve: {
        alias: { '@': fileURLToPath(new URL('./src/', import.meta.url)) },
    },
    build: {
        rollupOptions: {
            input: {
                app: fileURLToPath(new URL('./index.html', import.meta.url)),
                academicSoberCatalog: fileURLToPath(
                    new URL(
                        './catalog/academic-sober/index.html',
                        import.meta.url,
                    ),
                ),
            },
        },
    },
});
