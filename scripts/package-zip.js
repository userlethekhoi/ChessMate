import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { execFileSync } from 'node:child_process';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const rootDir = path.resolve(__dirname, '..');
const distDir = path.join(rootDir, 'dist');
const zipPath = path.join(rootDir, 'chessmate-agent.zip');

if (!fs.existsSync(distDir)) {
  console.error('❌ Thư mục dist không tồn tại. Hãy chạy "npm run build" trước.');
  process.exit(1);
}

if (fs.existsSync(zipPath)) {
  fs.unlinkSync(zipPath);
}

// 1. Ensure dist/manifest.json declares "assets/*" in web_accessible_resources
const distManifestPath = path.join(distDir, 'manifest.json');
if (fs.existsSync(distManifestPath)) {
  try {
    const m = JSON.parse(fs.readFileSync(distManifestPath, 'utf8'));
    if (Array.isArray(m.web_accessible_resources)) {
      for (const entry of m.web_accessible_resources) {
        if (Array.isArray(entry.resources)) {
          if (!entry.resources.includes('assets/*')) {
            entry.resources.push('assets/*');
          }
        }
      }
    }
    fs.writeFileSync(distManifestPath, JSON.stringify(m, null, 2), 'utf8');
    console.log('✔ Đã xác thực assets/* trong web_accessible_resources');
  } catch (err) {
    console.warn('Cảnh báo khi sửa dist/manifest.json:', err.message);
  }
}

// 2. Strip "crossorigin" from dist/src/offscreen/offscreen.html to prevent WebKit SecurityError
const offscreenHtmlPath = path.join(distDir, 'src', 'offscreen', 'offscreen.html');
if (fs.existsSync(offscreenHtmlPath)) {
  try {
    let html = fs.readFileSync(offscreenHtmlPath, 'utf8');
    html = html.replace(/\scrossorigin(="[^"]*")?/g, '');
    fs.writeFileSync(offscreenHtmlPath, html, 'utf8');
    console.log('✔ Đã loại bỏ thuộc tính crossorigin trong offscreen.html');
  } catch (err) {
    console.warn('Cảnh báo khi sửa offscreen.html:', err.message);
  }
}

const psScript = `
Add-Type -AssemblyName System.IO.Compression;
Add-Type -AssemblyName System.IO.Compression.FileSystem;

$zipPath = '${zipPath.replace(/'/g, "''")}';
$distDir = '${distDir.replace(/'/g, "''")}';

$zip = [System.IO.Compression.ZipFile]::Open($zipPath, [System.IO.Compression.ZipArchiveMode]::Create);

# Create folder entries first (required by iOS / Safari / Orion zip extractors)
Get-ChildItem -Path $distDir -Recurse | Where-Object { $_.PSIsContainer } | ForEach-Object {
    $relDir = $_.FullName.Substring($distDir.Length + 1).Replace('\\', '/') + '/';
    $zip.CreateEntry($relDir) | Out-Null;
};

# Create file entries
Get-ChildItem -Path $distDir -Recurse | Where-Object { -not $_.PSIsContainer } | ForEach-Object {
    $rel = $_.FullName.Substring($distDir.Length + 1).Replace('\\', '/');
    [System.IO.Compression.ZipFileExtensions]::CreateEntryFromFile($zip, $_.FullName, $rel) | Out-Null;
};

$zip.Dispose();
`;

const tempPs1 = path.join(rootDir, 'scripts', '_temp_pack.ps1');
fs.writeFileSync(tempPs1, psScript, 'utf8');

try {
  execFileSync('powershell', ['-NoProfile', '-ExecutionPolicy', 'Bypass', '-File', tempPs1], { stdio: 'inherit' });
  console.log(`✔ Đã đóng gói thành công file chuẩn UNIX/iOS: ${zipPath}`);
} catch (err) {
  console.error('❌ Lỗi khi đóng gói ZIP:', err.message);
  process.exit(1);
} finally {
  if (fs.existsSync(tempPs1)) {
    fs.unlinkSync(tempPs1);
  }
}
