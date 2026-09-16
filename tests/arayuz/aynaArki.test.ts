// Depo: Ayna arkı. Ayna vakası `ayar.ayna` ile üretilir ve sahnelenmiş delil hedefi eklenir; geçmiş kaydı notu
// saklar; ikinci Ayna vakasının notu öncekinin sonucunu alıntılar; kayıt geri yüklenince AYNI vaka gelir
// (ayar bayrağı kayıtta taşınmalı, yoksa arketip değişir).
import { describe, it, expect } from 'vitest';
import { OyunDeposu, type VakaGecmisi } from '@arayuz/oyun/depo';
import { AYNA_KADANSI } from '@motor/ayna';

const gecmisUret = (n: number, etiketler: string[]): VakaGecmisi[] =>
  Array.from({ length: n }, (_, i) => ({ seed: `g-${i}`, dogru: false, puan: 20, hataEtiketleri: etiketler, brier: 0.6 }));

describe('OyunDeposu — Ayna arkı', () => {
  it('Ayna vakası ayna bayrağıyla üretilir, hedeflere sahnelenmiş delil eklenir; sıradan vakada bayrak yok', () => {
    const d = new OyunDeposu();
    d.basla('Deniz');
    d.yeniVaka('ark-depo-0');
    expect(d.durum.sorgu!.durum.vaka.ayar.ayna).toBeFalsy();

    const a = new OyunDeposu();
    a.basla('Deniz');
    a.durum.gecmis = gecmisUret(AYNA_KADANSI, ['othello-hatasi', 'tek-ipucu']);
    a.yeniVaka('ark-depo-1');
    expect(a.durum.ayna).not.toBeNull();
    expect(a.durum.sorgu!.durum.vaka.ayar.ayna).toBe(true);
    // Orta zorlukta sahnelenmiş delil hedefi 30 denemede sağlanır (adaptif üretim %85+ sağlar; burada tek seed).
    expect(a.durum.hedefler).toContain('sahnelenmis-delil');
    expect(a.durum.sorgu!.deliller.some((x) => x.sahnelenmis)).toBe(true);
  });

  it('geçmiş kaydı notu saklar; ikinci Ayna notu öncekinin sonucunu alıntılar; okunma oranı hesaplanır', () => {
    const depo = new OyunDeposu();
    depo.basla('Deniz');
    depo.durum.gecmis = gecmisUret(AYNA_KADANSI, ['othello-hatasi', 'tek-ipucu']);
    depo.yeniVaka('ark-depo-2');
    const ilkNot = depo.durum.ayna!.not;
    expect(ilkNot).not.toMatch(/geçen sefer/i);
    depo.suclamaYap({ fail: depo.durum.ayna!.tahmin, guven: 0.7 });
    const kayit = depo.durum.gecmis.at(-1)!.ayna!;
    expect(kayit.okundu).toBe(true);
    expect(kayit.not).toBe(ilkNot);
    expect(depo.aynaOkunmaOrani()).toEqual({ n: 1, okundu: 1 });
    // Kadansı doldur: iki sıradan vaka daha, sonra ikinci Ayna vakası.
    for (let i = 0; i < AYNA_KADANSI - 1; i++) depo.durum.gecmis.push({ seed: `ara-${i}`, dogru: false, puan: 20, hataEtiketleri: ['othello-hatasi'], brier: 0.6 });
    depo.yeniVaka('ark-depo-3');
    expect(depo.durum.ayna).not.toBeNull();
    expect(depo.durum.ayna!.not).toMatch(/geçen sefer/i);
    expect(depo.durum.ayna!.karsilasma).toBe(2);
    expect(depo.aynaArki().map((a) => a.not)).toEqual([ilkNot]);
  });

  it('dışa/içe aktarım Ayna vakasını aynı arketiple geri getirir', () => {
    const depo = new OyunDeposu();
    depo.basla('Deniz');
    depo.durum.gecmis = gecmisUret(AYNA_KADANSI, ['hale-etkisi', 'hale-etkisi']);
    depo.yeniVaka('ark-depo-4');
    const v = depo.durum.sorgu!.durum.vaka;
    const kopya = new OyunDeposu();
    expect(kopya.iceAktar(depo.disaAktar())).toBe(true);
    const v2 = kopya.durum.sorgu!.durum.vaka;
    expect(v2.arketip).toBe(v.arketip);
    expect(v2.olay).toEqual(v.olay);
    expect(v2.ayar).toEqual(v.ayar);
    expect(kopya.durum.ayna).toEqual(depo.durum.ayna);
  });
});
