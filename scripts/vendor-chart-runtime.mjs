import {
    cpSync,
    existsSync,
    mkdirSync,
    readFileSync,
    writeFileSync,
} from 'node:fs';
import { resolve } from 'node:path';
import process from 'node:process';

const [library, destination = 'assets/vendor'] = process.argv.slice(2);
const runtimes = {
    chartjs: {
        packagePath: 'chart.js',
        source: 'dist/chart.umd.min.js',
        output: 'chart.umd.min.js',
        license: 'LICENSE.md',
        sourceUrl: 'https://github.com/chartjs/Chart.js',
    },
    echarts: {
        packagePath: 'echarts',
        source: 'dist/echarts.min.js',
        output: 'echarts.min.js',
        license: 'LICENSE',
        sourceUrl: 'https://github.com/apache/echarts',
    },
};

const runtime = runtimes[library];
if (!runtime) {
    throw new Error('Uso: node scripts/vendor-chart-runtime.mjs chartjs|echarts [destino]');
}

const sourceRoot = resolve('node_modules', runtime.packagePath);
const targetRoot = resolve(destination, library);
mkdirSync(targetRoot, { recursive: true });
cpSync(resolve(sourceRoot, runtime.source), resolve(targetRoot, runtime.output));
cpSync(resolve(sourceRoot, runtime.license), resolve(targetRoot, 'LICENSE.txt'));

const packageJson = JSON.parse(
    readFileSync(resolve(sourceRoot, 'package.json'), 'utf8'),
);
const attributionPath = resolve(destination, '..', 'ATTRIBUTIONS.md');
const attribution = `### ${library}\n\n- Version: ${packageJson.version}\n- Source: ${runtime.sourceUrl}\n- License: ${runtime.license}\n- Copied asset: assets/vendor/${library}/${runtime.output}\n`;
const existing = existsSync(attributionPath)
    ? readFileSync(attributionPath, 'utf8')
    : '# Asset attributions\n\n';
const sectionPattern = new RegExp(
    `\\n?### ${library}\\n[\\s\\S]*?(?=\\n### |$)`,
    'g',
);
const updated = `${existing.replace(sectionPattern, '').trimEnd()}\n\n${attribution}`;
writeFileSync(attributionPath, updated, 'utf8');

process.stdout.write(`${library} copiado a ${targetRoot}\n`);
