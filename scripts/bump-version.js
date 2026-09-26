import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const rootDir = path.resolve(__dirname, '..');

const newVersion = process.argv[2];

if (!newVersion) {
  console.error('❌ Vui lòng nhập số phiên bản mới. Ví dụ: node scripts/bump-version.js 0.1.1');
  process.exit(1);
}

// 1. Update package.json
const pkgPath = path.join(rootDir, 'package.json');
const pkg = JSON.parse(fs.readFileSync(pkgPath, 'utf8'));
pkg.version = newVersion;
fs.writeFileSync(pkgPath, JSON.stringify(pkg, null, 2) + '\n', 'utf8');
console.log(`✔ Đã cập nhật package.json -> ${newVersion}`);

// 2. Update manifest.json
const manifestPath = path.join(rootDir, 'manifest.json');
const manifest = JSON.parse(fs.readFileSync(manifestPath, 'utf8'));
manifest.version = newVersion;
fs.writeFileSync(manifestPath, JSON.stringify(manifest, null, 2) + '\n', 'utf8');
console.log(`✔ Đã cập nhật manifest.json -> ${newVersion}`);

// 3. Update version.json
const versionJsonPath = path.join(rootDir, 'version.json');
const versionJson = JSON.parse(fs.readFileSync(versionJsonPath, 'utf8'));
versionJson.version = newVersion;
versionJson.releaseDate = new Date().toISOString().slice(0, 10);
fs.writeFileSync(versionJsonPath, JSON.stringify(versionJson, null, 2) + '\n', 'utf8');
console.log(`✔ Đã cập nhật version.json -> ${newVersion}`);

// 4. Update updates.xml
const updatesXmlPath = path.join(rootDir, 'updates.xml');
if (fs.existsSync(updatesXmlPath)) {
  let xml = fs.readFileSync(updatesXmlPath, 'utf8');
  xml = xml.replace(/version='[^']*'/, `version='${newVersion}'`);
  fs.writeFileSync(updatesXmlPath, xml, 'utf8');
  console.log(`✔ Đã cập nhật updates.xml -> ${newVersion}`);
}

console.log(`\n🎉 Sẵn sàng! Tiếp theo bạn chỉ cần commit và tạo git tag:`);
console.log(`   git commit -am "chore: release v${newVersion}"`);
console.log(`   git tag v${newVersion}`);
console.log(`   git push origin main --tags`);
