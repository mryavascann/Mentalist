// Sekiz çalışma masası özelliğinin gerçek Chromium üzerinde uçtan uca kontrolü.
import { chromium } from 'playwright';
import { pathToFileURL } from 'node:url';
import { mkdirSync } from 'node:fs';
import assert from 'node:assert/strict';
const browser = await chromium.launch({ headless: true });
const page = await browser.newPage({ viewport: { width: 1440, height: 1000 } });
const errors = [];
page.on('pageerror', e => errors.push(e.message));
await page.addInitScript(() => {
  window.sesDenetimi = [];
  const Orijinal = window.AudioContext;
  window.AudioContext = class extends Orijinal { constructor(...a) { super(...a); window.sesDenetimi.push(this); } };
});
try {
  await page.goto(pathToFileURL(process.cwd() + '/dist/index.html').href);
  await page.evaluate(() => localStorage.clear()); await page.reload();
  await page.emulateMedia({ reducedMotion: 'reduce' });
  assert.equal(await page.evaluate(() => window.sesDenetimi.length), 0);
  await page.getByPlaceholder(/Adını yaz/).fill('Deniz');
  await page.getByPlaceholder(/örn\./).fill('masa-tarayici');
  await page.getByRole('button', { name: 'Yeni vaka', exact: true }).click();
  await page.getByRole('button', { name: 'Analizimi hazırla' }).click();
  await page.getByRole('button', { name: 'Puanla', exact: true }).click();
  await page.getByRole('button', { name: 'Anladım, dosyaya geç' }).click();
  await page.getByRole('button', { name: 'Deftere ekle', exact: true }).first().click();
  await page.getByRole('button', { name: 'Görüş', exact: true }).first().click();
  await page.getByRole('button', { name: /Sohbet \/ temel çizgi/ }).click();
  await page.getByRole('button', { name: 'Deftere ekle', exact: true }).first().click();
  await page.getByRole('button', { name: 'Dedektif defterini aç' }).click();
  const defter = page.getByRole('dialog', { name: 'Dedektif defteri' });
  await defter.getByLabel('Yeni not').fill('Açık soru: kamera kaydı ifadeyle uyuşuyor mu?');
  await defter.getByRole('button', { name: 'Notu kaydet' }).click();
  assert.equal(await defter.locator('.defter-notu').count(), 3);
  await page.keyboard.press('Escape');
  await page.getByRole('button', { name: 'Karşılaştır', exact: true }).click();
  assert.equal(await page.locator('.karsilastirma-izgarasi .dosya').count(), 2);
  await page.getByLabel('Karşılaştırılacak saat').selectOption('0');
  await page.getByText('Bu saat henüz sorulmadı.').first().waitFor();
  await page.getByRole('button', { name: 'Zaman çizelgesi', exact: true }).click();
  await page.getByLabel('Defterden seç').selectOption({ index: 1 });
  await page.getByLabel('Olay saati', { exact: true }).selectOption('2');
  await page.getByRole('button', { name: 'Yerleştir' }).click();
  await page.getByLabel('Doğrulama dayanağın').fill('İkinci bağımsız kaydı kontrol ettim.');
  await page.getByLabel('Saati değiştir').selectOption('3');
  await page.reload();
  await page.getByRole('heading', { name: 'Kaldığın yerden.' }).waitFor();
  assert.equal(await page.getByLabel('Doğrulama dayanağın').inputValue(), 'İkinci bağımsız kaydı kontrol ettim.');
  assert.equal(await page.getByLabel('Saati değiştir').inputValue(), '3');
  await page.getByRole('button', { name: 'Özeti kapat' }).click();
  await page.getByRole('button', { name: 'Okuma ve ses ayarları' }).click();
  await page.getByLabel('Yazı boyutu').selectOption('1.3');
  await page.getByLabel('Satır aralığı').selectOption('2.2');
  await page.getByRole('button', { name: 'Ortam seslerini aç', exact: true }).click();
  assert.equal(await page.evaluate(() => window.sesDenetimi.at(-1).state), 'running');
  await page.getByRole('button', { name: 'Kâğıt sesini dene' }).click();
  await page.getByRole('button', { name: 'Fincan sesini dene' }).click();
  await page.getByRole('button', { name: 'Ortam seslerini kapat', exact: true }).click();
  await page.waitForFunction(() => window.sesDenetimi.at(-1).state === 'closed');
  await page.getByRole('button', { name: 'Ayarları kapat' }).click();
  await page.getByRole('button', { name: 'Sorgu', exact: true }).click();
  await page.getByRole('button', { name: 'Odak görünümü', exact: true }).click();
  assert.equal(await page.locator('.kenar-cubugu').isVisible(), false);
  await page.getByRole('button', { name: 'Odaktan çık', exact: true }).click();
  await page.getByRole('button', { name: 'Suçlama', exact: true }).click();
  await page.getByLabel(/Suç yok/).check();
  await page.getByRole('button', { name: 'Suçlamayı ver' }).click();
  await page.getByRole('button', { name: 'Vaka arşivi', exact: true }).click();
  await page.locator('.arsiv-dosyasi').first().click();
  await page.locator('.arsiv-detayi').getByText('Açık soru: kamera kaydı ifadeyle uyuşuyor mu?', { exact: true }).waitFor();
  mkdirSync('artifacts/ui', { recursive: true });
  await page.screenshot({ path: 'artifacts/ui/archive-detail.png', fullPage: true });
  await page.getByRole('button', { name: 'Gelişim', exact: true }).click();
  await page.getByRole('heading', { name: 'Güvenin ile doğruluğun' }).waitFor();
  await page.screenshot({ path: 'artifacts/ui/progress.png', fullPage: true });
  for (const width of [320, 768, 1440]) {
    await page.setViewportSize({ width, height: 900 });
    for (const name of ['Karşılaştır', 'Zaman çizelgesi', 'Vaka arşivi', 'Gelişim', 'Sorgu']) {
      await page.getByRole('navigation', { name: 'Ekranlar' }).getByRole('button', { name, exact: true }).click();
      assert.equal(await page.evaluate(() => document.documentElement.scrollWidth > innerWidth), false, `${width}px ${name} taşma`);
    }
  }
  await page.reload();
  assert.equal(await page.evaluate(() => window.sesDenetimi.length), 0);
  assert.equal(await page.evaluate(() => document.documentElement.style.getPropertyValue('--okuma-olcegi')), '1.3');
  assert.deepEqual(errors, []);
  console.log('Sekiz özellik doğrulandı: kaynaklı defter, karşılaştırma, çizelge, arşiv, dönüş özeti, ses, okuma/odak, gelişim.');
} finally { await browser.close(); }

