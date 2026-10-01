import { createHash } from 'node:crypto';
import {
    cpSync,
    existsSync,
    mkdirSync,
    readFileSync,
    rmSync,
    writeFileSync,
} from 'node:fs';
import { resolve } from 'node:path';
import process from 'node:process';

const packageRoot = resolve('node_modules/dom-to-pptx');
const packageJsonPath = resolve(packageRoot, 'package.json');
const bundlePath = resolve(packageRoot, 'dist/dom-to-pptx.bundle.js');
const licensePath = resolve(packageRoot, 'LICENSE');
const outputRoot = resolve('public/generated/pptx');

for (const path of [packageJsonPath, bundlePath, licensePath]) {
    if (!existsSync(path)) {
        throw new Error(
            `No se encontró un archivo necesario para exportar: ${path}`,
        );
    }
}

const packageJson = JSON.parse(readFileSync(packageJsonPath, 'utf8'));
const bundleHash = createHash('sha256')
    .update(readFileSync(bundlePath))
    .digest('hex');

mkdirSync(outputRoot, { recursive: true });
for (const filename of [
    'dom-to-pptx.bundle.js',
    'LICENSE.txt',
    'manifest.json',
]) {
    const path = resolve(outputRoot, filename);
    if (existsSync(path)) rmSync(path);
}

cpSync(bundlePath, resolve(outputRoot, 'dom-to-pptx.bundle.js'));
cpSync(licensePath, resolve(outputRoot, 'LICENSE.txt'));
writeFileSync(
    resolve(outputRoot, 'manifest.json'),
    `${JSON.stringify(
        {
            name: packageJson.name,
            version: packageJson.version,
            license: packageJson.license,
            source: packageJson.repository.url,
            bundle: 'dom-to-pptx.bundle.js',
            sha256: bundleHash,
        },
        null,
        2,
    )}\n`,
);

process.stdout.write(
    `Runtime PPTX ${packageJson.version} preparado en ${outputRoot}\n`,
);
