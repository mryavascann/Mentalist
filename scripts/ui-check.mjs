import { chromium } from 'playwright';
import { pathToFileURL } from 'node:url';
import { mkdirSync } from 'node:fs';
import assert from 'node:assert/strict';
// Derlenmiş tek HTML'i çevrimdışı açar; ekran görüntüleri ve gerçek oyun akışı denetimi.
const browser = await chromium.launch({ headless: true });
const page = await browser.newPage({ viewport: { width: 1440, height: 1050 }, deviceScaleFactor: 1 });
const errors = [];
const tasmaKontrolu = async (ekran) => {
  assert.equal(await page.evaluate(() => document.documentElement.scrollWidth > innerWidth), false, `${ekran}: yatay taşma`);
};
page.on('pageerror', e => errors.push(e.message));
await page.goto(pathToFileURL(process.cwd() + '/dist/index.html').href);
await page.evaluate(() => { localStorage.clear(); });
await page.reload();
await page.getByRole('heading', { name: /Herkes bir/ }).waitFor();
await page.emulateMedia({ reducedMotion: 'reduce' });
mkdirSync('artifacts/ui', { recursive: true });
await page.screenshot({ path: 'artifacts/ui/desktop-home.png', fullPage: true, animations: 'disabled' });
await page.getByRole('button', { name: 'Karanlık moda geç' }).click();
await page.screenshot({ path: 'artifacts/ui/dark-home.png', fullPage: true, animations: 'disabled' });
await page.getByRole('button', { name: 'Aydınlık moda geç' }).click();
await page.setViewportSize({ width: 390, height: 844 });
await page.screenshot({ path: 'artifacts/ui/mobile-home.png', fullPage: true, animations: 'disabled' });
console.log('mobile home overflow', await page.evaluate(() => document.documentElement.scrollWidth > innerWidth));
await tasmaKontrolu('ana sayfa');
await page.getByPlaceholder(/Adını yaz/).fill('Deniz');
await page.getByPlaceholder(/örn\./).fill('tasarim-kontrol');
await page.getByRole('button', { name: 'Yeni vaka', exact: true }).click();
await page.getByRole('button', { name: 'Analizimi hazırla' }).click();
await page.getByRole('button', { name: 'Puanla', exact: true }).click();
await page.getByRole('button', { name: 'Anladım, dosyaya geç' }).click();
await page.screenshot({ path: 'artifacts/ui/mobile-case.png', fullPage: true, animations: 'disabled' });
console.log('mobile case overflow', await page.evaluate(() => document.documentElement.scrollWidth > innerWidth));
await tasmaKontrolu('vaka');
await page.setViewportSize({ width: 1440, height: 1050 });
await page.screenshot({ path: 'artifacts/ui/desktop-case.png', fullPage: true, animations: 'disabled' });
await page.getByRole('button', { name: 'Görüş', exact: true }).first().click();
await page.getByRole('button', { name: /Sohbet \/ temel çizgi/ }).click();
await page.getByRole('button', { name: 'Kişiyi oku', exact: true }).click();
await page.getByRole('button', { name: /Odasını oku/ }).click();
await page.getByRole('button', { name: 'Deliller', exact: true }).click();
assert.equal(await page.getByRole('combobox', { name: 'Gösterilecek delil' }).count(), 1);
await page.getByRole('button', { name: 'Sorular', exact: true }).click();
await page.screenshot({ path: 'artifacts/ui/desktop-interview.png', fullPage: true, animations: 'disabled' });
await page.setViewportSize({ width: 390, height: 844 });
await page.screenshot({ path: 'artifacts/ui/mobile-interview.png', fullPage: true, animations: 'disabled' });
console.log('mobile interview overflow', await page.evaluate(() => document.documentElement.scrollWidth > innerWidth));
await tasmaKontrolu('sorgu');
await page.getByRole('button', { name: 'Kılavuz', exact: true }).click();
await page.getByRole('searchbox').fill('TEMEL ÇİZGİ');
await page.getByRole('button', { name: /Temel çizgi/ }).first().click();
await page.screenshot({ path: 'artifacts/ui/mobile-guide.png', fullPage: true, animations: 'disabled' });
console.log('mobile guide overflow', await page.evaluate(() => document.documentElement.scrollWidth > innerWidth));
await tasmaKontrolu('kılavuz');
await page.setViewportSize({ width: 1440, height: 1050 });
await page.screenshot({ path: 'artifacts/ui/desktop-guide.png', fullPage: true, animations: 'disabled' });
await page.getByRole('button', { name: 'Pano', exact: true }).click();
await page.getByPlaceholder('ekle…').first().fill('İfade bağımsız delille doğrulanmalı.');
await page.getByPlaceholder('ekle…').first().press('Enter');
await page.screenshot({ path: 'artifacts/ui/desktop-board.png', fullPage: true, animations: 'disabled' });
await page.getByRole('button', { name: 'Suçlama', exact: true }).click();
await page.getByLabel(/Suç yok/).check();
await page.getByRole('button', { name: 'Suçlamayı ver' }).click();
await page.getByText('Aslında ne oldu', { exact: true }).waitFor();
await page.screenshot({ path: 'artifacts/ui/desktop-analysis.png', fullPage: true, animations: 'disabled' });
for (const width of [320, 768, 1024, 1440]) {
  await page.setViewportSize({ width, height: 900 });
  for (const name of ['Dedektif masası', 'Dosya', 'Sorgu', 'Pano', 'Suçlama', 'Analiz', 'Kılavuz']) {
    await page.getByRole('navigation', { name: 'Ekranlar' }).getByRole('button', { name, exact: true }).click();
    await tasmaKontrolu(`${width}px ${name}`);
  }
}
console.log('page errors', errors);
assert.deepEqual(errors, []);
console.log('Başarılı: 4 ekran genişliği, 7 ana ekran, kayıtlı oyun akışı ve kılavuz araması.');
await browser.close();

