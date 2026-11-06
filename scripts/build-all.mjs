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

console.log('🚀 [Build Monorepo] Iniciando pipeline multi-sites 100% modular...\n');

// 1. Limpar dist anterior
if (fs.existsSync(outputDist)) {
  fs.rmSync(outputDist, { recursive: true, force: true });
}
fs.mkdirSync(outputDist, { recursive: true });

// 2. Compilar Portal Hub (Vitrine / sites/portal) para a raiz de dist/
if (fs.existsSync(portalPath)) {
  console.log('📦 1/2 Compilando Portal Hub em [sites/portal]...');
  execSync('npm run build', { stdio: 'inherit', cwd: portalPath });

  const portalDist = path.join(portalPath, 'dist');
  if (fs.existsSync(portalDist)) {
    console.log('📂 Copiando arquivos do Portal Hub para a raiz de dist/...');
    fs.cpSync(portalDist, outputDist, { recursive: true });
  }
}

// 3. Garantir arquivo .nojekyll na raiz do dist para o GitHub Pages
fs.writeFileSync(path.join(outputDist, '.nojekyll'), '', 'utf8');

// 4. Compilar cada modelo de site (exceto portal)
console.log('\n📦 2/2 Compilando modelos de sites em [sites/]...');
if (fs.existsSync(sitesDir)) {
  const entries = fs.readdirSync(sitesDir, { withFileTypes: true });
  for (const entry of entries) {
    if (entry.isDirectory() && entry.name !== 'portal') {
      const sitePath = path.join(sitesDir, entry.name);
      const pkgPath = path.join(sitePath, 'package.json');

      if (fs.existsSync(pkgPath)) {
        console.log(`\n➡️  Construindo modelo: [${entry.name}]...`);
        try {
          execSync('npm run build', { stdio: 'inherit', cwd: sitePath });

          const subDist = path.join(sitePath, 'dist');
          const destDist = path.join(outputDist, entry.name);

          if (fs.existsSync(subDist)) {
            console.log(`📂 Copiando artefatos de [${entry.name}] para dist/${entry.name}...`);
            fs.cpSync(subDist, destDist, { recursive: true });
            console.log(`✅ [${entry.name}] integrado com sucesso!`);
          }
        } catch (err) {
          console.error(`❌ Erro ao compilar [${entry.name}]:`, err.message);
          process.exit(1);
        }
      }
    }
  }
}

console.log('\n🎉 [Build Concluído] Todos os modelos e o Portal Hub foram compilados com sucesso!');