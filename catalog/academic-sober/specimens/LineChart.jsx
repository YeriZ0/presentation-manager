import { useEffect, useRef } from 'react';

const data = [22, 26, 29, 35, 43, 51, 66, 81];

export function LineChart() {
    const chartRef = useRef(null);

    useEffect(() => {
        let disposed = false;
        let chart;

        import('echarts').then(({ init }) => {
            if (disposed) return;
            chart = init(chartRef.current, null, { renderer: 'svg' });
            chart.setOption({
                animation: false,
                grid: { left: 90, right: 50, top: 40, bottom: 80 },
                xAxis: {
                    type: 'category',
                    data: [
                        'Ene',
                        'Feb',
                        'Mar',
                        'Abr',
                        'May',
                        'Jun',
                        'Jul',
                        'Ago',
                    ],
                    axisLine: { lineStyle: { color: '#dbe1e8' } },
                    axisLabel: { color: '#596273', fontSize: 20 },
                },
                yAxis: {
                    type: 'value',
                    min: 0,
                    max: 100,
                    name: 'Adopcion (%)',
                    nameTextStyle: { color: '#596273', fontSize: 20 },
                    axisLabel: { color: '#596273', fontSize: 18 },
                    splitLine: { lineStyle: { color: '#dbe1e8' } },
                },
                series: [
                    {
                        type: 'line',
                        data,
                        smooth: false,
                        symbol: 'circle',
                        symbolSize: 14,
                        lineStyle: { color: '#35658c', width: 5 },
                        itemStyle: {
                            color: '#ffffff',
                            borderColor: '#35658c',
                            borderWidth: 4,
                        },
                        label: {
                            show: true,
                            color: '#111827',
                            fontSize: 18,
                            formatter: '{c}%',
                        },
                    },
                ],
            });
        });

        return () => {
            disposed = true;
            chart?.dispose();
        };
    }, []);

    return (
        <div
            className="chart-body"
            role="img"
            aria-labelledby="line-chart-title line-chart-summary"
            data-chart-runtime="echarts"
        >
            <h3 id="line-chart-title">
                La adopción crece de 22% a 81% entre enero y agosto
            </h3>
            <div className="echarts-stage" ref={chartRef} />
            <p id="line-chart-summary">
                Fuente: panel de adopción, 2026. La serie aumenta 59 puntos
                porcentuales durante el período.
            </p>
            <table className="chart-data-table">
                <caption>Datos de adopción mensual</caption>
                <thead>
                    <tr>
                        <th scope="col">Mes</th>
                        {[
                            'Ene',
                            'Feb',
                            'Mar',
                            'Abr',
                            'May',
                            'Jun',
                            'Jul',
                            'Ago',
                        ].map((month) => (
                            <th scope="col" key={month}>
                                {month}
                            </th>
                        ))}
                    </tr>
                </thead>
                <tbody>
                    <tr>
                        <th scope="row">Adopcion (%)</th>
                        {data.map((value) => (
                            <td key={value}>{value}</td>
                        ))}
                    </tr>
                </tbody>
            </table>
        </div>
    );
}
