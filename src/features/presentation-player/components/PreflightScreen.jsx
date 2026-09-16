import { usePlayerStore } from '../state/PlayerStoreProvider.jsx';
import styles from '../../../player/PresentationPlayer.module.css';

export function PreflightScreen({ onClose }) {
    const metadata = usePlayerStore((state) => state.metadata);
    const start = usePlayerStore((state) => state.start);
    const slideCount = metadata.slides.length;

    return (
        <main className={styles.preflight}>
            <header className={styles.preflightHeader}>
                <div className={styles.preflightBrand}>
                    <span className={styles.preflightMark}>A</span>
                    <span>Armadillo PP in Web</span>
                </div>
                <button
                    className={styles.closePreflight}
                    type="button"
                    onClick={onClose}
                >
                    Cerrar
                </button>
            </header>
            <section className={styles.deckOverview}>
                <p className={styles.overviewLabel}>Presentacion lista</p>
                <h1>{metadata.title}</h1>
                <p className={styles.overviewMeta}>
                    {slideCount}{' '}
                    {slideCount === 1 ? 'diapositiva' : 'diapositivas'}
                    <span />
                    {metadata.viewport.width} x {metadata.viewport.height}
                </p>
                <button
                    className={styles.startButton}
                    type="button"
                    onClick={start}
                >
                    Empezar a presentar
                    <span aria-hidden="true">&#8594;</span>
                </button>
            </section>
            <section className={styles.slideSummary} aria-label="Slides">
                <div className={styles.summaryHeader}>
                    <span>Contenido</span>
                    <span>{slideCount.toString().padStart(2, '0')}</span>
                </div>
                <ol>
                    {metadata.slides.map((slide, index) => (
                        <li key={slide.id}>
                            <span>{(index + 1).toString().padStart(2, '0')}</span>
                            <strong>{slide.title}</strong>
                            {slide.hasNotes && <small>Anotaciones</small>}
                        </li>
                    ))}
                </ol>
            </section>
            <footer className={styles.preflightFooter}>
                <span>Sesion local</span>
                <span className={styles.mobileFuture}>
                    Controlador movil <b>Proximamente</b>
                </span>
            </footer>
        </main>
    );
}
