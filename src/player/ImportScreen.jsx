import { useState } from 'react';
import { Link } from 'react-router-dom';
import formatGuideUrl from '../../docs/presentation-format.md?url';
import styles from './ImportScreen.module.css';
import { Button } from '@/components/ui/button';
import { useMobileViewport } from '../hooks/useMobileViewport.js';

export function ImportScreen({ onOpenPicker, onSelectFile, error, isLoading }) {
    const [isDragging, setIsDragging] = useState(false);
    const isMobile = useMobileViewport();

    function handleDrop(event) {
        event.preventDefault();
        setIsDragging(false);
        if (isLoading) return;
        const file = event.dataTransfer.files?.[0];
        if (!file) return;

        onSelectFile(file);
    }

    return (
        <main
            className={`${styles.screen} ${isDragging ? styles.dragging : ''}`}
            onDragEnter={(event) => {
                event.preventDefault();
                setIsDragging(true);
            }}
            onDragOver={(event) => event.preventDefault()}
            onDragLeave={(event) => {
                if (event.currentTarget === event.target) setIsDragging(false);
            }}
            onDrop={handleDrop}
            aria-busy={isLoading}
        >
            <section className={styles.shell} aria-labelledby="welcome-title">
                <header className={styles.header}>
                    <div className={styles.brand}>
                        <span className={styles.brandMark} aria-hidden="true">
                            A
                        </span>
                        <span>Armadillo PP in Web</span>
                    </div>
                    <span className={styles.version}>
                        v0.1 / reproductor local
                    </span>
                </header>

                <div className={styles.divider} />

                <div className={styles.content}>
                    <div className={styles.headingBlock}>
                        <span className={styles.eyebrow}>
                            Espacio de presentación
                        </span>
                        <h1 id="welcome-title">Abre una diapositiva Web</h1>
                        <p className={styles.lede}>
                            Importa un paquete ZIP para comenzar. Tus archivos
                            permanecen en esta sesión del navegador.
                        </p>
                    </div>

                    <div className={styles.importCard}>
                        <div className={styles.cardIcon} aria-hidden="true">
                            <svg viewBox="0 0 24 24" fill="none">
                                <path
                                    d="M12 16V4m0 0L8 8m4-4 4 4M5 14v4a2 2 0 0 0 2 2h10a2 2 0 0 0 2-2v-4"
                                    stroke="currentColor"
                                    strokeWidth="1.6"
                                    strokeLinecap="round"
                                    strokeLinejoin="round"
                                />
                            </svg>
                        </div>
                        <div className={styles.cardCopy}>
                            <strong>
                                {isDragging
                                    ? 'Suelta tu paquete aquí'
                                    : 'Elige un archivo de presentación'}
                            </strong>
                            <span>
                                Solo archivos ZIP, con <code>deck.json</code> en
                                la raíz
                            </span>
                        </div>
                        <Button
                            size="touch"
                            type="button"
                            onClick={onOpenPicker}
                            disabled={isLoading}
                        >
                            {isLoading
                                ? 'Validando paquete...'
                                : 'Buscar archivo'}
                        </Button>
                    </div>

                    <div className={styles.requirements}>
                        <span>Requiere</span>
                        <span className={styles.pill}>deck.json</span>
                        <span className={styles.pill}>HTML</span>
                        <span className={styles.pill}>CSS</span>
                        <span className={styles.pill}>JS</span>
                    </div>
                    {isMobile ? (
                        <Button
                            variant="link"
                            size="touch"
                            className="justify-self-start"
                            asChild
                        >
                            <Link to="/controller">
                                Volver al controlador móvil
                            </Link>
                        </Button>
                    ) : null}
                    {error && (
                        <p className={styles.error} role="alert">
                            {error}
                        </p>
                    )}
                </div>
            </section>
            <footer className={styles.footer}>
                <span>local + en linea</span>
                <a
                    className={styles.docsLink}
                    href={formatGuideUrl}
                    target="_blank"
                    rel="noreferrer"
                >
                    Leer la guía de formato <span aria-hidden="true">↗</span>
                </a>
            </footer>
        </main>
    );
}
