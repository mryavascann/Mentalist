// Denge botları (AJAN_PROMPTU §4, TASARIM §16).
// Hedef: sadece davranış ipuçlarına bakan oyuncu şansa yakın kalmalı; yöntem (SUE, CIT, beklenmedik
// soru, SVT) kullanan oyuncu belirgin şekilde daha başarılı olmalı. Herkese inanan ve herkese
// yalancı diyen botlar sınır çizgileridir.
import { describe, it, expect } from 'vitest';
import { vakaUretCozulebilir } from '@motor/cozulebilirlik';
import { sorguBaslat } from '@motor/teknik';
import { puanla } from '@motor/puan';
import { ipucuBotu, yontemBotu, inananBot, supheciBot } from '@motor/botlar';
import type { Bot } from '@motor/botlar';

const N = 200;
const seedler = Array.from({ length: N }, (_, i) => `denge-${i}`);

interface Sonuc { dogruluk: number; ortPuan: number; ortBrier: number; sucSayisi: number }

function kostur(bot: Bot): Sonuc {
  let dogru = 0, puan = 0, brier = 0, suc = 0;
  for (const s of seedler) {
    const { vaka } = vakaUretCozulebilir(s);
    const sorgu = sorguBaslat(vaka);
    const suclama = bot(sorgu);
    const r = puanla(sorgu, suclama);
    if (r.dogru) dogru++;
    puan += r.puan;
    brier += r.kalibrasyon.brier;
    if (vaka.olay.fail) suc++;
  }
  return { dogruluk: dogru / N, ortPuan: puan / N, ortBrier: brier / N, sucSayisi: suc };
}

describe('denge botları', () => {
  const ipucu = kostur(ipucuBotu);
  const yontem = kostur(yontemBotu);
  const inanan = kostur(inananBot);
  const supheci = kostur(supheciBot);

  it('yöntem botu belirgin şekilde üstün: doğruluk > %75 ve ipucu botundan en az 30 puan fazla', () => {
    expect(yontem.dogruluk).toBeGreaterThan(0.75);
    expect(yontem.dogruluk - ipucu.dogruluk).toBeGreaterThan(0.3);
  });

  it('sadece ipuçlarına bakan bot şansa yakın (< %45)', () => {
    expect(ipucu.dogruluk).toBeLessThan(0.45);
  });

  it('herkese inanan bot yalnızca kaza vakalarını "bilir"; şüpheci (rastgele suçlayan) bot şans düzeyinde', () => {
    expect(inanan.dogruluk).toBeCloseTo(1 - ipucu.sucSayisi / N, 1);
    expect(supheci.dogruluk).toBeLessThan(0.35);
  });

  it('yöntem botunun ortalama puanı ve kalibrasyonu diğerlerinden iyi', () => {
    expect(yontem.ortPuan).toBeGreaterThan(ipucu.ortPuan + 20);
    expect(yontem.ortPuan).toBeGreaterThan(inanan.ortPuan);
    expect(yontem.ortPuan).toBeGreaterThan(supheci.ortPuan);
    expect(yontem.ortBrier).toBeLessThan(ipucu.ortBrier);
  });

  it('yöntem botu masumu nadiren suçlar (< %12)', () => {
    let masumSuclama = 0;
    for (const s of seedler) {
      const { vaka } = vakaUretCozulebilir(s);
      const sorgu = sorguBaslat(vaka);
      const suclama = yontemBotu(sorgu);
      if (suclama.fail !== null && suclama.fail !== vaka.olay.fail) masumSuclama++;
    }
    expect(masumSuclama / N).toBeLessThan(0.12);
  });
});
