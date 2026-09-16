// Görsel kütüğü (src/arayuz/gorseller.ts): Higgsfield görsellerinin varlığı, boyut bütçesi ve portre eşlemesi.
//   - Her portre kaydının dosyası var; takım, mekân (8 tür + sorgu odası), Kılavuz bölümleri, tatbikatlar, delil türleri, diğer.
//   - Boyut bütçesi (K-010 tek dosya): portre ≤ 60 KB, mekân/oda ≤ 150 KB, toplam ≤ 6 MB.
//   - Portre eşlemesi: cinsiyet uyumlu, aynı vakada tekrarsız, deterministik, yaşa yakın; faille ilişkisiz.
import { describe, it, expect } from 'vitest';
import { readdirSync, statSync } from 'node:fs';
import { join } from 'node:path';
import { ICERIK } from '@icerik/index';
import { vakaUret } from '@motor/gerceklik';
import { MEKAN_SABLONLARI } from '@motor/havuzlar';
import { PORTRELER, PORTRE_KAYITLARI, TAKIM_PORTRELERI, MEKANLAR, ODALAR, KILAVUZ_GORSELLERI, TATBIKAT_GORSELLERI, DELIL_GORSELLERI, DIGER, portreEslemesi, portreUrl, mekanGorseli, odaGorseli } from '@arayuz/gorseller';

const KOK = join(process.cwd(), 'assets');
const boyutlar = (klasor: string) => readdirSync(join(KOK, klasor)).filter((f) => f.endsWith('.webp')).map((f) => ({ f, b: statSync(join(KOK, klasor, f)).size }));

describe('görsel varlığı', () => {
  it('her portre kaydının ve dört takım portresinin dosyası var; kayıtlar benzersiz ve cinsiyetler dengeli', () => {
    for (const p of PORTRE_KAYITLARI) expect(PORTRELER[p.id], p.id).toBeTruthy();
    for (const t of Object.values(TAKIM_PORTRELERI)) expect(PORTRELER[t], t).toBeTruthy();
    expect(new Set(PORTRE_KAYITLARI.map((p) => p.id)).size).toBe(PORTRE_KAYITLARI.length);
    expect(PORTRE_KAYITLARI.length).toBeGreaterThanOrEqual(48);
    const kadin = PORTRE_KAYITLARI.filter((p) => p.cinsiyet === 'kadin').length;
    expect(Math.abs(kadin - (PORTRE_KAYITLARI.length - kadin))).toBeLessThanOrEqual(4);
  });

  it('mekân, oda, Kılavuz bölümü, tatbikat, delil türü ve diğer görseller mevcut', () => {
    for (const s of MEKAN_SABLONLARI) expect(mekanGorseli(s.tur), s.tur).toBeTruthy();
    expect(MEKANLAR['sorgu-odasi']).toBeTruthy();
    expect(Object.keys(ODALAR).length).toBeGreaterThanOrEqual(12);
    for (const b of new Set(ICERIK.kilavuz.map((m) => m.bolum))) expect(KILAVUZ_GORSELLERI[b], b).toBeTruthy();
    for (const t of ['kor-secim', 'soguk-okuma', 'taban-orani', 'linda', 'off-beat', 'ince-dilim', 'cift-kor']) expect(TATBIKAT_GORSELLERI[t], t).toBeTruthy();
    for (const d of ['fiziksel', 'dijital', 'belge', 'olmayan']) expect(DELIL_GORSELLERI[d], d).toBeTruthy();
    for (const x of ['ana', 'ana-dikey', 'ana-kare', 'ofis', 'kanepe', 'forer', 'watson', 'mantar', 'suclama', 'ayna-not']) expect(DIGER[x], x).toBeTruthy();
  });

  it('boyut bütçesi: portre ≤ 60 KB, mekân/oda ≤ 150 KB, toplam ≤ 6 MB', () => {
    let toplam = 0;
    for (const { f, b } of boyutlar('portreler')) { expect(b, f).toBeLessThanOrEqual(60_000); toplam += b; }
    for (const k of ['mekanlar', 'odalar']) for (const { f, b } of boyutlar(k)) { expect(b, f).toBeLessThanOrEqual(150_000); toplam += b; }
    for (const k of ['kilavuz', 'tatbikat', 'delil', 'diger']) for (const { b } of boyutlar(k)) toplam += b;
    expect(toplam).toBeLessThanOrEqual(6_000_000);
  });
});

describe('portre eşlemesi', () => {
  it('her kişi cinsiyetine uygun, vakada tekrarsız bir portre alır; deterministik; yaş farkı ortalama < 10', () => {
    let n = 0, yasFarki = 0;
    for (let i = 0; i < 100; i++) {
      const vaka = vakaUret(`gorsel-${i}`);
      const e1 = portreEslemesi(vaka);
      const e2 = portreEslemesi(vakaUret(`gorsel-${i}`));
      expect([...e1.entries()]).toEqual([...e2.entries()]);
      expect(new Set(e1.values()).size).toBe(e1.size);
      for (const k of vaka.kisiler) {
        const id = e1.get(k.id)!;
        expect(id, `${vaka.seed}/${k.id}`).toBeTruthy();
        const kayit = PORTRE_KAYITLARI.find((p) => p.id === id)!;
        expect(kayit.cinsiyet).toBe(k.cinsiyet);
        n++; yasFarki += Math.abs(kayit.yas - k.yas);
        expect(portreUrl(vaka, k.id)).toBe(PORTRELER[id]);
      }
    }
    expect(yasFarki / n).toBeLessThan(10);
  });

  it('örüntü denetimi: failin portre kimliği masumlarınkinden istatistiksel olarak ayırt edilemez', () => {
    // Portre kimliğinin sayısal kısmı ("p07" → 7) failde ve masumda aynı dağılıma sahip olmalı: ortalama farkı küçük.
    let failToplam = 0, failN = 0, masumToplam = 0, masumN = 0;
    for (let i = 0; i < 300; i++) {
      const vaka = vakaUret(`gorsel-oruntu-${i}`);
      const e = portreEslemesi(vaka);
      for (const k of vaka.kisiler) {
        const no = Number(e.get(k.id)!.slice(1));
        if (k.id === vaka.olay.fail) { failToplam += no; failN++; } else { masumToplam += no; masumN++; }
      }
    }
    expect(Math.abs(failToplam / failN - masumToplam / masumN)).toBeLessThan(4);
  });

  it('her mekân şablonunun her odası bir görsel alır (odaya özel ya da mekân genel)', () => {
    for (let i = 0; i < 40; i++) {
      const vaka = vakaUret(`gorsel-oda-${i}`);
      for (const o of vaka.mekan.odalar) expect(odaGorseli(vaka, o.id), `${vaka.mekan.tur}/${o.ad}`).toBeTruthy();
    }
  });
});
