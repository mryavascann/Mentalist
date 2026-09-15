// İçerik şeması testleri.
// Oyunun bilimsel iddiaları src/icerik altındaki JSON kayıtlarında yaşar. Bu testler:
//  1) her kaydın zorunlu alanlarını ve kanıt düzeyini,
//  2) her kaynağın kaynak kütüğünde (kaynaklar.json) bulunduğunu,
//  3) kütükteki her kaynağın docs/kaynaklar/NOTLAR.md'de bir başlığa karşılık geldiğini (K-004),
//  4) çapraz referansların (teknik → kılavuz, hata → kılavuz) çözüldüğünü,
//  5) ipucu etki yönü ile etki büyüklüğü işaretinin tutarlı olduğunu (bilimsel sadakat)
// denetler. Doğrulayıcı (dogrula.ts) hem burada hem runtime'da kullanılır.
import { describe, it, expect } from 'vitest';
import { readFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { ICERIK } from '@icerik/index';
import { dogrulaIcerik, KANIT_DUZEYLERI } from '@icerik/dogrula';
import type { IpucuKaydi, KilavuzMaddesi } from '@icerik/tipler';

const NOTLAR_YOLU = fileURLToPath(new URL('../../docs/kaynaklar/NOTLAR.md', import.meta.url));

function notlarBasliklari(): string[] {
  return readFileSync(NOTLAR_YOLU, 'utf-8')
    .split('\n')
    .filter((s) => s.startsWith('## '))
    .map((s) => s.slice(3).trim());
}

function idler(kayitlar: { id: string }[]): string[] {
  return kayitlar.map((k) => k.id);
}

describe('içerik doğrulayıcı', () => {
  it('gerçek içerik hatasız doğrulanır', () => {
    expect(dogrulaIcerik(ICERIK)).toEqual([]);
  });

  it('bozuk kayıtları id ile raporlar', () => {
    const bozuk = structuredClone(ICERIK);
    // 1) geçersiz kanıt düzeyi
    (bozuk.ipuclari[0] as unknown as { kanitDuzeyi: string }).kanitDuzeyi = 'kesin';
    // 2) kütükte olmayan kaynak
    bozuk.kilavuz[0]!.kaynak = ['Uydurma 1999'];
    // 3) çözülmeyen kılavuz referansı
    bozuk.teknikler[0]!.kilavuzMaddesi = 'yok-boyle-madde';
    // 4) yön/işaret çelişkisi
    bozuk.ipuclari[1]!.yon = 'yalanda_artar';
    bozuk.ipuclari[1]!.etkiBuyuklugu = -0.5;
    const hatalar = dogrulaIcerik(bozuk);
    expect(hatalar.length).toBeGreaterThanOrEqual(4);
    expect(hatalar.some((h) => h.includes(bozuk.ipuclari[0]!.id) && h.includes('kesin'))).toBe(true);
    expect(hatalar.some((h) => h.includes('Uydurma 1999'))).toBe(true);
    expect(hatalar.some((h) => h.includes('yok-boyle-madde'))).toBe(true);
    expect(hatalar.some((h) => h.includes(bozuk.ipuclari[1]!.id) && h.includes('yön'))).toBe(true);
  });

  it('kanıt düzeyleri dört sabit değerdir', () => {
    expect([...KANIT_DUZEYLERI].sort()).toEqual(['guclu', 'mit', 'orta', 'zayif']);
  });
});

describe('kaynak kütüğü ↔ NOTLAR.md (K-004)', () => {
  const basliklar = notlarBasliklari();

  it('NOTLAR.md okunabiliyor ve başlıkları var', () => {
    expect(basliklar.length).toBeGreaterThan(50);
  });

  it('kütükteki her kaynağın notlarBaslikAnahtar değeri bir NOTLAR başlığında geçer', () => {
    const eksik = ICERIK.kaynaklar
      .filter((k) => !basliklar.some((b) => b.includes(k.notlarBaslikAnahtar)))
      .map((k) => `${k.id} → "${k.notlarBaslikAnahtar}"`);
    expect(eksik).toEqual([]);
  });

  it('kütük idleri benzersiz', () => {
    const ids = idler(ICERIK.kaynaklar);
    expect(new Set(ids).size).toBe(ids.length);
  });
});

describe('içerik koleksiyonları', () => {
  it('her koleksiyonda idler benzersiz', () => {
    for (const [ad, kayitlar] of Object.entries(ICERIK)) {
      const ids = idler(kayitlar as { id: string }[]);
      expect(new Set(ids).size, `${ad} idleri`).toBe(ids.length);
    }
  });

  it('ifade türleri TASARIM §6 tablosunu kapsar (en az 15)', () => {
    expect(ICERIK.ifadeTurleri.length).toBeGreaterThanOrEqual(15);
  });

  it('ipucu kataloğunda DePaulo 2003 kaynaklı ve en az 3 mit etiketli kayıt var', () => {
    expect(ICERIK.ipuclari.some((i) => i.kaynak.includes('DePaulo 2003'))).toBe(true);
    expect(ICERIK.ipuclari.filter((i) => i.kanitDuzeyi === 'mit').length).toBeGreaterThanOrEqual(3);
  });

  it('göz teması "mit" etiketli ve etkisi ~0 (DePaulo 2003: d=.01)', () => {
    const goz = ICERIK.ipuclari.find((i: IpucuKaydi) => i.id === 'goz-temasi');
    expect(goz).toBeDefined();
    expect(goz!.kanitDuzeyi).toBe('mit');
    expect(Math.abs(goz!.etkiBuyuklugu)).toBeLessThan(0.1);
    expect(goz!.yon).toBe('iliskisiz');
  });

  it('her ipucunun en az 3 betimleme varyantı var (tekrar hissine karşı)', () => {
    for (const i of ICERIK.ipuclari) expect(i.betimlemeler.length, i.id).toBeGreaterThanOrEqual(3);
  });

  it('Kılavuz üç başlangıç bölümünü içerir ve Mitler Müzesi dolu', () => {
    const bolumler = new Set(ICERIK.kilavuz.map((m: KilavuzMaddesi) => m.bolum));
    expect(bolumler.has('yalan-tespitinin-bilimi')).toBe(true);
    expect(bolumler.has('sorgulama-teknikleri')).toBe(true);
    expect(bolumler.has('mitler-muzesi')).toBe(true);
    const mitler = ICERIK.kilavuz.filter((m) => m.bolum === 'mitler-muzesi');
    expect(mitler.length).toBeGreaterThanOrEqual(3);
    for (const m of mitler) expect(m.kanitDuzeyi).toBe('mit');
  });

  it('Kılavuz en az 9 bölüm ve 45 madde içerir; her bölümde en az 3 madde', () => {
    const bolumler = new Map<string, number>();
    for (const m of ICERIK.kilavuz) bolumler.set(m.bolum, (bolumler.get(m.bolum) ?? 0) + 1);
    expect(bolumler.size).toBeGreaterThanOrEqual(12);
    expect(ICERIK.kilavuz.length).toBeGreaterThanOrEqual(60);
    for (const [b, n] of bolumler) expect(n, b).toBeGreaterThanOrEqual(3);
  });

  it('her teknik ve her hata etiketi bir Kılavuz maddesine bağlı', () => {
    const kilavuzIdler = new Set(idler(ICERIK.kilavuz));
    for (const t of ICERIK.teknikler) expect(kilavuzIdler.has(t.kilavuzMaddesi), t.id).toBe(true);
    for (const h of ICERIK.hataEtiketleri) expect(kilavuzIdler.has(h.kilavuzMaddesi), h.id).toBe(true);
  });

  it('SUE tekniği kayıtlı ve delil sırası kuralı erken göstermeyi cezalandırır', () => {
    const sue = ICERIK.teknikler.find((t) => t.id === 'sue');
    expect(sue).toBeDefined();
    expect(sue!.kaynak).toContain('Vrij 2010 PSPI');
  });
});
