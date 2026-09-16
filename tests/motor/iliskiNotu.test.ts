// Kişi kartında rolle uyumlu ilişki cümlesi ("Üç yıldır avukatı; davalarını o yürütüyor.").
//   - Her kurban dışı kişide var, deterministik, ana RNG akışını değiştirmez (regresyon seed'leri korunur).
//   - Sayılar yaşla çelişmez: eş için evlilik yılı ≤ küçük olanın yaşı − 18; kardeşte yaş farkı gerçek farktır.
//   - Gizli bilgi taşımaz: sır/koruma/fail sözcükleri geçmez.
import { describe, it, expect } from 'vitest';
import { vakaUret } from '@motor/gerceklik';
import { kisiKarti } from '@motor/dil';

const SAYILAR: Record<string, number> = { bir: 1, iki: 2, üç: 3, dört: 4, beş: 5, altı: 6, yedi: 7, sekiz: 8, dokuz: 9, on: 10 };
// Not: JS'de \b Türkçe harfleri (ş, ü) kelime sınırı saymaz; o yüzden sözcüklere bölerek arıyoruz.
function ilkSayi(metin: string): number | null {
  for (const ham of metin.split(/[\s.;,:]+/)) {
    const t = ham.toLocaleLowerCase('tr');
    if (/^\d+$/.test(t)) return Number(t);
    if (t in SAYILAR) return SAYILAR[t]!;
  }
  return null;
}

describe('ilişki notu', () => {
  it('300 vakada her kişide var, kartta görünür, gizli bilgi sızdırmaz, yaşla çelişmez, deterministik', () => {
    for (let s = 0; s < 300; s++) {
      const v = vakaUret(`not-${s}`);
      const kurban = v.kisiler.find((k) => k.id === v.olay.kurban)!;
      expect(kurban.iliskiNotu).toBeUndefined();
      for (const k of v.kisiler) {
        if (k.id === kurban.id) continue;
        expect(k.iliskiNotu, `${v.seed} ${k.id}`).toBeTruthy();
        expect(k.iliskiNotu).toMatch(/\.$/);
        expect(k.iliskiNotu).not.toMatch(/sır|koru|fail|suç|yalan/i);
        expect(kisiKarti(v, k.id)).toContain(k.iliskiNotu!);
        const rol = k.rol.split(' ').slice(1).join(' ');
        const n = ilkSayi(k.iliskiNotu!);
        if (rol === 'eşi' && n !== null && /yıl/.test(k.iliskiNotu!)) expect(n, `${v.seed} ${k.id} ${k.iliskiNotu}`).toBeLessThanOrEqual(Math.min(k.yas, kurban.yas) - 18);
        if (rol === 'kardeşi') {
          const fark = Math.abs(k.yas - kurban.yas);
          if (fark === 0) expect(k.iliskiNotu).toMatch(/İkiz|ikiz/); // /i bayrağı Türkçe İ'yi i ile eşlemez
          else { expect(n).toBe(fark); expect(k.iliskiNotu).toMatch(k.yas > kurban.yas ? /büyük/ : /küçük/); }
        }
        if (/yıl/.test(k.iliskiNotu!) && n !== null) expect(n, `${v.seed} ${k.id} ${k.iliskiNotu}`).toBeLessThanOrEqual(k.yas - 16);
      }
      expect(vakaUret(`not-${s}`).kisiler.map((k) => k.iliskiNotu)).toEqual(v.kisiler.map((k) => k.iliskiNotu));
    }
  });
});
