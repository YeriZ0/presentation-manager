import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import { AcademicSoberCatalog } from './components/AcademicSoberCatalog.jsx';
import '../../src/styles/reset.css';
import './styles/tokens.css';
import './styles/catalog-layout.css';
import './styles/specimens.css';

createRoot(document.getElementById('root')).render(
    <StrictMode>
        <AcademicSoberCatalog />
    </StrictMode>,
);
