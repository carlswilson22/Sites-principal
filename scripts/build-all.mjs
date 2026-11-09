import { execSync } from 'child_process';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const rootDir = path.resolve(__dirname, '..');
const sitesDir = path.join(rootDir, 'sites');
const outputDist = path.join(rootDir, 'dist');
const portalPath = path.join(sitesDir, 'portal');

function removeIntermediateBuild(directory) {
  const resolved = path.resolve(directory);
  const relative = path.relative(sitesDir, resolved);
  if (!relative || relative.startsWith('..') || path.isAbsolute(relative) || path.basename(resolved) !== 'dist') {
    throw new Error(`Diretório intermediário inválido: ${resolved}`);
  }
  fs.rmSync(resolved, { recursive: true, force: true });
}

// Determina base path baseado no repositório GitHub Pages
const repoName = process.env.GITHUB_REPOSITORY ? process.env.GITHUB_REPOSITORY.split('/')[1] : 'Sites-principal';
const baseRoot = `/${repoName}/`;

console.log(`🚀 [Build Monorepo] Iniciando pipeline multi-sites para [${repoName}] (base: ${baseRoot})...\n`);

// 1. Limpar dist anterior
if (fs.existsSync(outputDist)) {
  fs.rmSync(outputDist, { recursive: true, force: true });
}
fs.mkdirSync(outputDist, { recursive: true });

// 2. Compilar Portal Hub (Vitrine / sites/portal) para a raiz de dist/
if (fs.existsSync(portalPath)) {
  console.log(`📦 1/2 Compilando Portal Hub com base [${baseRoot}] em [sites/portal]...`);
  try {
    execSync(`npm run build --workspace=portal -- --base ${baseRoot}`, {
      stdio: 'inherit',
      cwd: rootDir,
      env: { ...process.env, BASE_PATH: baseRoot }
    });

    const portalDist = path.join(portalPath, 'dist');
    if (fs.existsSync(portalDist)) {
      console.log('📂 Copiando arquivos do Portal Hub para a raiz de dist/...');
      fs.cpSync(portalDist, outputDist, { recursive: true });
      removeIntermediateBuild(portalDist);
    }
  } catch (err) {
    console.error(`❌ Erro ao compilar Portal Hub:`);
    if (err.stdout) console.error(err.stdout.toString());
    if (err.stderr) console.error(err.stderr.toString());
    console.error(err.message);
    process.exit(1);
  }
}

// 3. Garantir arquivo .nojekyll na raiz do dist para o GitHub Pages
fs.writeFileSync(path.join(outputDist, '.nojekyll'), '', 'utf8');

// 4. Compilar cada modelo de site (exceto portal)
console.log('\n📦 2/2 Compilando modelos de sites em [sites/]...');
const models = ['auto-dealership', 'luxury-dealership', 'popular-dealership'];

for (const modelName of models) {
  const sitePath = path.join(sitesDir, modelName);
  if (fs.existsSync(sitePath)) {
    const modelBase = `${baseRoot}${modelName}/`;
    console.log(`\n➡️  Construindo modelo: [${modelName}] com base [${modelBase}]...`);
    try {
      execSync(`npm run build --workspace=${modelName} -- --base ${modelBase}`, {
        stdio: 'inherit',
        cwd: rootDir,
        env: { ...process.env, BASE_PATH: modelBase }
      });

      const subDist = path.join(sitePath, 'dist');
      const destDist = path.join(outputDist, modelName);

      if (fs.existsSync(subDist)) {
        console.log(`📂 Copiando artefatos de [${modelName}] para dist/${modelName}...`);
        fs.cpSync(subDist, destDist, { recursive: true });
        removeIntermediateBuild(subDist);
        console.log(`✅ [${modelName}] integrado com sucesso!`);
      }
    } catch (err) {
      console.error(`❌ Erro ao compilar [${modelName}]:`);
      if (err.stdout) console.error(err.stdout.toString());
      if (err.stderr) console.error(err.stderr.toString());
      console.error(err.message);
      process.exit(1);
    }
  }
}

console.log('\n🎉 [Build Concluído] Todos os modelos e o Portal Hub foram compilados com sucesso!');
