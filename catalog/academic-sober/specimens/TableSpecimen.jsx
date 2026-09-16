export function TableSpecimen() {
    return (
        <div className="table-body">
            <table>
                <caption>Comparacion de alternativas de despliegue</caption>
                <thead><tr><th scope="col">Criterio</th><th scope="col">Local</th><th scope="col">Nube</th><th scope="col">Hibrido</th></tr></thead>
                <tbody>
                    <tr><th scope="row">Control</th><td>Alto</td><td>Medio</td><td className="table-emphasis">Alto</td></tr>
                    <tr><th scope="row">Escala</th><td>Limitada</td><td className="table-emphasis">Alta</td><td className="table-emphasis">Flexible</td></tr>
                    <tr><th scope="row">Costo inicial</th><td>Medio</td><td>Bajo</td><td>Medio</td></tr>
                    <tr><th scope="row">Complejidad</th><td>Baja</td><td>Media</td><td>Alta</td></tr>
                </tbody>
            </table>
            <p>La alternativa hibrida conserva control y permite escalar con menor rigidez.</p>
        </div>
    );
}
