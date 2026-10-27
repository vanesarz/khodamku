import fs from 'fs';
import path from 'path';
import { execSync } from 'child_process';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const rootDir = path.resolve(__dirname, '..');

const mdPath = path.join(rootDir, 'docs', 'Project_Documentation.md');
const htmlOutputPath = path.join(rootDir, 'docs', 'Project_Documentation_Build.html');
const pdfOutputPath = path.join(rootDir, 'docs', 'Project_Documentation.pdf');
const rootPdfPath = path.join(rootDir, 'Project_Documentation.pdf');

console.log('Reading markdown documentation...');
let mdContent = fs.readFileSync(mdPath, 'utf8');

// Load diagram images as Base64
const flowchartPath = path.join(rootDir, 'docs', 'Flowchart.png');
const erdPath = path.join(rootDir, 'docs', 'ERD.png');

let flowchartBase64 = '';
if (fs.existsSync(flowchartPath)) {
  flowchartBase64 = `data:image/png;base64,${fs.readFileSync(flowchartPath).toString('base64')}`;
}

let erdBase64 = '';
if (fs.existsSync(erdPath)) {
  erdBase64 = `data:image/png;base64,${fs.readFileSync(erdPath).toString('base64')}`;
}

// Replace mermaid blocks with high-res diagram images
const flowchartFigure = `
<div class="figure-container">
  <img src="${flowchartBase64}" alt="Flowchart Diagram Sistem KhodamKu" style="max-height: 200mm; object-fit: contain;" />
  <div class="figure-caption">Gambar 5.1: Diagram Alur Transaksi Pemanggilan & Pelepasan Khodam (Flowchart Sistem)</div>
</div>
`;

const erdFigure = `
<div class="figure-container">
  <img src="${erdBase64}" alt="Entity Relationship Diagram (ERD) KhodamKu" style="max-height: 160mm; object-fit: contain;" />
  <div class="figure-caption">Gambar 5.2: Entity Relationship Diagram (ERD) Normalisasi 3NF Sistem KhodamKu</div>
</div>
`;

mdContent = mdContent.replace(/```mermaid\s+flowchart TD[\s\S]*?```/, flowchartFigure);
mdContent = mdContent.replace(/```mermaid\s+erDiagram[\s\S]*?```/, erdFigure);

// Remove the redundant top h1 because it will be in the cover
mdContent = mdContent.replace(/^# DOKUMENTASI PROYEK[\s\S]*?---\s*/m, '');

// Save temp processed markdown
const tempMdPath = path.join(rootDir, 'docs', 'temp_processed.md');
fs.writeFileSync(tempMdPath, mdContent);

// Convert with npx marked
console.log('Converting Markdown to HTML with marked...');
const tempHtmlPath = path.join(rootDir, 'docs', 'temp_marked.html');
execSync(`npx -y marked -i "${tempMdPath}" -o "${tempHtmlPath}" --gfm`, { cwd: rootDir });

let bodyHtml = fs.readFileSync(tempHtmlPath, 'utf8');

// Clean up temporary files
fs.unlinkSync(tempMdPath);
fs.unlinkSync(tempHtmlPath);

// Beautify badges and section breaks
bodyHtml = bodyHtml.replace(/<strong>TERPENUHI<\/strong>/g, '<span class="badge-terpenuhi"><span class="badge-dot"></span>TERPENUHI</span>');

// Add page break classes before major chapters
bodyHtml = bodyHtml.replace(/<h1 id="([1-9]-[^"]+)">(\d+)\.\s*(.*?)<\/h1>/g, (match, id, num, title) => {
  return `<div class="page-break"></div><h1 id="${id}" class="chapter-heading"><span class="chap-badge">BAB ${num}</span> ${title}</h1>`;
});

// Wrap tables in table-container
bodyHtml = bodyHtml.replace(/<table>/g, '<div class="table-wrapper"><table>');
bodyHtml = bodyHtml.replace(/<\/table>/g, '</table></div>');

const fullHtml = `<!DOCTYPE html>
<html lang="id">
<head>
<meta charset="utf-8">
<title>Dokumentasi Proyek KhodamKu - Kelompok 11</title>
<style>
@import url('https://fonts.googleapis.com/css2?family=Cinzel:wght@600;700;800;900&family=Plus+Jakarta+Sans:wght@300;400;500;600;700;800&family=JetBrains+Mono:wght@400;500;600&display=swap');

@page {
  size: A4 portrait;
  margin: 18mm 16mm 18mm 16mm;
  @top-left {
    content: "KhodamKu — Dokumentasi Teknis Sistem (Project Documentation)";
    font-family: 'Plus Jakarta Sans', sans-serif;
    font-size: 7.5pt;
    color: #64748b;
    font-weight: 500;
    text-transform: uppercase;
    letter-spacing: 0.5px;
  }
  @top-right {
    content: "Kelompok 11 · Sertifikasi Web Developer";
    font-family: 'Plus Jakarta Sans', sans-serif;
    font-size: 7.5pt;
    font-weight: 600;
    color: #b45309;
  }
  @bottom-left {
    content: "Dokumen Rekayasa Perangkat Lunak & Spesifikasi RESTful API";
    font-family: 'Plus Jakarta Sans', sans-serif;
    font-size: 7.5pt;
    color: #94a3b8;
  }
  @bottom-right {
    content: "Halaman " counter(page);
    font-family: 'Plus Jakarta Sans', sans-serif;
    font-size: 8pt;
    font-weight: 700;
    color: #1e293b;
  }
}

@page:first {
  margin: 0;
  @top-left { content: normal; }
  @top-right { content: normal; }
  @bottom-left { content: normal; }
  @bottom-right { content: normal; }
}

* {
  box-sizing: border-box;
  -webkit-print-color-adjust: exact !important;
  print-color-adjust: exact !important;
}

body {
  font-family: 'Plus Jakarta Sans', -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif;
  font-size: 9pt;
  line-height: 1.6;
  color: #1e293b;
  background: #ffffff;
  margin: 0;
  padding: 0;
}

.page-break {
  page-break-before: always;
  break-before: page;
}

/* COVER PAGE STYLING */
.cover-page {
  width: 210mm;
  min-height: 297mm;
  padding: 30mm 24mm;
  background: radial-gradient(circle at top right, #1f1b13 0%, #0d0c0a 100%);
  color: #f8fafc;
  display: flex;
  flex-direction: column;
  justify-content: space-between;
  position: relative;
  overflow: hidden;
  page-break-after: always;
}

.cover-decor-pattern {
  position: absolute;
  top: -60px;
  right: -60px;
  width: 320px;
  height: 320px;
  background: radial-gradient(circle, rgba(216, 177, 104, 0.18) 0%, transparent 70%);
  pointer-events: none;
}

.cover-decor-bottom {
  position: absolute;
  bottom: -40px;
  left: -40px;
  width: 260px;
  height: 260px;
  background: radial-gradient(circle, rgba(216, 177, 104, 0.12) 0%, transparent 70%);
  pointer-events: none;
}

.cover-top-badge {
  display: inline-flex;
  align-items: center;
  gap: 8px;
  background: rgba(216, 177, 104, 0.12);
  border: 1px solid rgba(216, 177, 104, 0.35);
  color: #d8b168;
  padding: 6px 14px;
  border-radius: 9999px;
  font-size: 8pt;
  font-weight: 700;
  letter-spacing: 1px;
  text-transform: uppercase;
  width: fit-content;
}

.cover-brand {
  margin: 40px 0 20px 0;
}

.cover-main-title {
  font-family: 'Cinzel', serif;
  font-size: 38pt;
  font-weight: 900;
  letter-spacing: 2px;
  margin: 0;
  line-height: 1.1;
  color: #ffffff;
}

.cover-main-title span {
  color: #d8b168;
}

.cover-tagline {
  font-size: 13pt;
  font-style: italic;
  color: #e2e8f0;
  margin-top: 10px;
  font-weight: 400;
  letter-spacing: 0.5px;
}

.cover-gold-divider {
  width: 80px;
  height: 3px;
  background: linear-gradient(90deg, #d8b168 0%, transparent 100%);
  margin: 20px 0;
}

.cover-doc-name {
  font-size: 12pt;
  font-weight: 800;
  color: #d8b168;
  letter-spacing: 1px;
  text-transform: uppercase;
  margin-bottom: 8px;
}

.cover-desc {
  font-size: 9.5pt;
  color: #94a3b8;
  max-width: 500px;
  line-height: 1.5;
}

.cover-cards-grid {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 16px;
  margin-top: 40px;
}

.cover-card {
  background: rgba(255, 255, 255, 0.04);
  border: 1px solid rgba(255, 255, 255, 0.1);
  border-radius: 10px;
  padding: 16px;
  backdrop-filter: blur(10px);
}

.cover-card-title {
  font-size: 8pt;
  text-transform: uppercase;
  letter-spacing: 1px;
  color: #d8b168;
  font-weight: 700;
  margin-bottom: 10px;
  border-bottom: 1px solid rgba(216, 177, 104, 0.2);
  padding-bottom: 6px;
}

.team-list {
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.team-item {
  display: flex;
  justify-content: space-between;
  align-items: baseline;
  font-size: 8pt;
}

.team-item-name {
  font-weight: 700;
  color: #f1f5f9;
}

.team-item-role {
  font-size: 7pt;
  color: #94a3b8;
  display: block;
}

.team-item-nim {
  font-family: 'JetBrains Mono', monospace;
  font-size: 7.5pt;
  color: #d8b168;
  background: rgba(216, 177, 104, 0.1);
  padding: 2px 6px;
  border-radius: 4px;
}

.meta-row {
  display: flex;
  justify-content: space-between;
  font-size: 8pt;
  padding: 4px 0;
  border-bottom: 1px dotted rgba(255, 255, 255, 0.08);
}

.meta-label {
  color: #94a3b8;
}

.meta-val {
  font-weight: 600;
  color: #f8fafc;
}

.cover-footer {
  margin-top: 30px;
  padding-top: 15px;
  border-top: 1px solid rgba(255, 255, 255, 0.1);
  display: flex;
  justify-content: space-between;
  font-size: 7.5pt;
  color: #64748b;
}

/* DOCUMENT BODY TYPOGRAPHY */
h1.chapter-heading {
  font-size: 15pt;
  font-weight: 800;
  color: #0f172a;
  border-bottom: 2px solid #e2e8f0;
  padding-bottom: 8px;
  margin-top: 0;
  margin-bottom: 14px;
  display: flex;
  align-items: center;
  gap: 10px;
  page-break-after: avoid;
  break-after: avoid;
}

.chap-badge {
  background: #0f172a;
  color: #d8b168;
  padding: 3px 10px;
  border-radius: 6px;
  font-size: 9pt;
  letter-spacing: 0.5px;
}

h2 {
  font-size: 11.5pt;
  font-weight: 700;
  color: #0f172a;
  margin-top: 18px;
  margin-bottom: 8px;
  border-left: 3.5px solid #d8b168;
  padding-left: 8px;
  page-break-after: avoid;
  break-after: avoid;
}

h3 {
  font-size: 9.8pt;
  font-weight: 700;
  color: #334155;
  margin-top: 14px;
  margin-bottom: 6px;
  page-break-after: avoid;
  break-after: avoid;
}

h4 {
  font-size: 9pt;
  font-weight: 700;
  color: #475569;
  margin-top: 10px;
  margin-bottom: 4px;
  page-break-after: avoid;
  break-after: avoid;
}

p {
  margin-top: 0;
  margin-bottom: 8px;
  text-align: justify;
}

ul, ol {
  margin-top: 0;
  margin-bottom: 10px;
  padding-left: 20px;
}

li {
  margin-bottom: 4px;
}

hr {
  border: none;
  border-top: 1px solid #e2e8f0;
  margin: 18px 0;
}

/* TABLES */
.table-wrapper {
  margin: 10px 0 16px 0;
  page-break-inside: avoid;
  break-inside: avoid;
}

table {
  width: 100%;
  border-collapse: collapse;
  font-size: 8pt;
  line-height: 1.45;
  page-break-inside: avoid;
}

th, td {
  border: 1px solid #cbd5e1;
  padding: 6px 9px;
  text-align: left;
  vertical-align: top;
}

th {
  background-color: #0f172a;
  color: #f8fafc;
  font-weight: 700;
  letter-spacing: 0.3px;
}

tr:nth-child(even) td {
  background-color: #f8fafc;
}

/* CODE & MONOSPACE */
code {
  font-family: 'JetBrains Mono', 'Courier New', monospace;
  font-size: 7.8pt;
  background-color: #f1f5f9;
  color: #0f172a;
  padding: 1.5px 4.5px;
  border-radius: 4px;
  border: 1px solid #e2e8f0;
}

pre {
  background-color: #0f172a;
  color: #e2e8f0;
  padding: 9px 12px;
  border-radius: 6px;
  border: 1px solid #334155;
  font-family: 'JetBrains Mono', monospace;
  font-size: 7.1pt;
  line-height: 1.36;
  overflow-x: auto;
  page-break-inside: avoid;
  break-inside: avoid;
  margin: 8px 0 12px 0;
}

pre code {
  background: transparent;
  color: inherit;
  padding: 0;
  border: none;
  font-size: inherit;
}

/* BADGES */
.badge-terpenuhi {
  display: inline-flex;
  align-items: center;
  gap: 4px;
  background-color: #ecfdf5;
  color: #047857;
  border: 1px solid #a7f3d0;
  font-size: 7.2pt;
  font-weight: 800;
  padding: 2px 7px;
  border-radius: 9999px;
  letter-spacing: 0.5px;
  white-space: nowrap;
}

.badge-dot {
  width: 5px;
  height: 5px;
  background-color: #059669;
  border-radius: 50%;
}

/* FIGURES & DIAGRAMS */
.figure-container {
  text-align: center;
  margin: 14px 0;
  page-break-inside: avoid;
  break-inside: avoid;
}

.figure-container img {
  max-width: 100%;
  border: 1px solid #cbd5e1;
  border-radius: 6px;
  box-shadow: 0 2px 6px rgba(0,0,0,0.06);
}

.figure-caption {
  font-size: 7.5pt;
  color: #64748b;
  margin-top: 6px;
  font-weight: 600;
}

/* LINKS */
a {
  color: #b45309;
  text-decoration: none;
  font-weight: 600;
}

a:hover {
  text-decoration: underline;
}

/* CALLOUTS */
blockquote {
  border-left: 3px solid #d8b168;
  background: #fdfbf7;
  padding: 8px 12px;
  margin: 10px 0;
  color: #475569;
  font-style: italic;
  font-size: 8.5pt;
}
</style>
</head>
<body>

<!-- HALAMAN SAMPUL (COVER) -->
<div class="cover-page">
  <div class="cover-decor-pattern"></div>
  <div class="cover-decor-bottom"></div>

  <div class="cover-top">
    <div class="cover-top-badge">
      Tugas Akhir Pelatihan & Sertifikasi Web Developer
    </div>
    
    <div class="cover-brand">
      <h1 class="cover-main-title">KHODAM<span>KU</span></h1>
      <div class="cover-tagline">“Sewa Khodam, Hidup Lebih Tenang”</div>
      <div class="cover-gold-divider"></div>
      <div class="cover-doc-name">Project Technical Documentation</div>
      <div class="cover-desc">
        Dokumen teknis komprehensif mencakup spesifikasi arsitektur fullstack decoupled, kamus data dan relasi basis data (1:1, 1:N, N:M), dokumentasi endpoint RESTful API, penegakan matriks 19 ketentuan soal, serta hasil pengujian mutu (QA).
      </div>
    </div>
  </div>

  <div class="cover-cards-grid">
    <div class="cover-card">
      <div class="cover-card-title">Tim Pengembang (Kelompok 11)</div>
      <div class="team-list">
        <div class="team-item">
          <div>
            <span class="team-item-name">Vanesa Rizka Alfatihah</span>
            <span class="team-item-role">Frontend & UI/UX Specialist</span>
          </div>
          <span class="team-item-nim">102022300121</span>
        </div>
        <div class="team-item">
          <div>
            <span class="team-item-name">Taufik Qurohman</span>
            <span class="team-item-role">Backend Developer & DB Architect</span>
          </div>
          <span class="team-item-nim">102022300211</span>
        </div>
        <div class="team-item">
          <div>
            <span class="team-item-name">Ahmad Akmal Amran</span>
            <span class="team-item-role">Fullstack & System Analyst</span>
          </div>
          <span class="team-item-nim">102022300010</span>
        </div>
      </div>
    </div>

    <div class="cover-card">
      <div class="cover-card-title">Informasi Dokumen</div>
      <div class="meta-row">
        <span class="meta-label">Nama Proyek:</span>
        <span class="meta-val">KhodamKu</span>
      </div>
      <div class="meta-row">
        <span class="meta-label">Versi:</span>
        <span class="meta-val">1.0 (Final)</span>
      </div>
      <div class="meta-row">
        <span class="meta-label">Tanggal Rilis:</span>
        <span class="meta-val">Oktober 2026</span>
      </div>
      <div class="meta-row">
        <span class="meta-label">Stack Backend:</span>
        <span class="meta-val">Laravel 13.x (PHP 8.4)</span>
      </div>
      <div class="meta-row">
        <span class="meta-label">Stack Frontend:</span>
        <span class="meta-val">Next.js 16 (React 19)</span>
      </div>
      <div class="meta-row">
        <span class="meta-label">Status UAT:</span>
        <span class="meta-val" style="color: #10b981;">30/30 Lulus (100%)</span>
      </div>
    </div>
  </div>

  <div class="cover-footer">
    <span>Repositori: github.com/vanesarz/khodamku</span>
    <span>Hak Cipta © 2026 Kelompok 11 · All Rights Reserved</span>
  </div>
</div>

<!-- KONTEN DOKUMEN -->
<div class="document-content">
${bodyHtml}
</div>

</body>
</html>
`;

console.log('Writing styled HTML to docs/Project_Documentation_Build.html...');
fs.writeFileSync(htmlOutputPath, fullHtml);

console.log('Rendering PDF using Chrome Headless...');
const chromePath = '/Applications/Google Chrome.app/Contents/MacOS/Google Chrome';
const chromeCmd = `"${chromePath}" --headless --disable-gpu --no-pdf-header-footer --print-to-pdf="${pdfOutputPath}" "${htmlOutputPath}"`;

execSync(chromeCmd);

if (fs.existsSync(pdfOutputPath)) {
  fs.copyFileSync(pdfOutputPath, rootPdfPath);
  const stats = fs.statSync(pdfOutputPath);
  console.log(`SUCCESS! Generated PDF: ${pdfOutputPath} (${Math.round(stats.size / 1024)} KB)`);
  console.log(`Also copied to root: ${rootPdfPath}`);
} else {
  console.error('Failed to generate PDF!');
  process.exit(1);
}
