// dist/index.html'i file:// altında yerel Chrome/Edge ile açar, başlık ve bir vaka akışını doğrular (K-010).
import { chromium } from 'playwright';
import { pathToFileURL } from 'node:url';
import { resolve } from 'node:path';
const url = pathToFileURL(resolve('dist/index.html')).href;
let browser;
for (const channel of ['chrome', 'msedge']) {
  try { browser = await chromium.launch({ channel, headless: true }); break; } catch (e) { console.log(`${channel}: yok`); }
}
if (!browser) { console.log('KONTROL: yerel tarayıcı bulunamadı; atlandı'); process.exit(0); }
const page = await browser.newPage();
const hatalar = [];
page.on('pageerror', (e) => hatalar.push(String(e)));
page.on('console', (m) => { if (m.type() === 'error') hatalar.push(m.text()); });
await page.goto(url);
await page.fill('input[placeholder^="Adını"]', 'Deniz');
await page.fill('input[placeholder^="örn."]', 'dosya-kontrol');
await page.getByRole('button', { name: 'Yeni vaka' }).click();
// İlk vakadan önce Forer dersi
await page.getByRole('button', { name: 'Analizimi hazırla' }).click();
await page.getByRole('button', { name: 'Puanla' }).click();
await page.getByRole('button', { name: 'Anladım, dosyaya geç' }).click();
await page.waitForSelector('text=Olay yeri delilleri');
await page.getByRole('button', { name: 'Görüş' }).first().click();
await page.waitForSelector('text=Neredeydin?');
const dugme = page.locator('.panel .dugmeler button').first();
await dugme.click();
await page.waitForSelector('.satir .cevap');
const cevap = await page.locator('.satir .cevap').first().innerText();
console.log(`KONTROL: url=${url}`);
console.log(`KONTROL: ilk cevap="${cevap}"`);
console.log(`KONTROL: hata sayısı=${hatalar.length} ${hatalar.join(' | ')}`);
await browser.close();
process.exit(hatalar.length ? 1 : 0);
