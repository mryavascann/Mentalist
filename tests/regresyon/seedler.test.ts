// Regresyon seed'leri (AJAN_PROMPTU §4): üreticinin bilinçsizce değişmesini yakalar.
// Üretim BİLEREK değiştirildiğinde (yeni katman, yeni havuz) bu anlık görüntüler güncellenir ve günlüğe yazılır.
// Anlık görüntü tarihi: 2026-09-16 (arketip havuzu sonrası).
import { describe, it, expect } from 'vitest';
import { vakaUret } from '@motor/gerceklik';
import { sorguBaslat } from '@motor/teknik';
import { cozulebilirlikDenetle } from '@motor/cozulebilirlik';

const ANLIK: Record<string, { mekan: string; arketip: string; kisi: number; kurban: string; fail: string | null; dilim: number; oda: string; yontem: string; delil: number; sir: number; cozulebilir: boolean; zorluk: number }> = {
  'reg-1': { mekan: 'ciftlik', arketip: 'tarikat-ici-olum', kisi: 6, kurban: 'k6', fail: 'k5', dilim: 3, oda: 'oda-0', yontem: 'ilaç dozu', delil: 16, sir: 3, cozulebilir: true, zorluk: 0.85 },
  'reg-2': { mekan: 'malikane', arketip: 'sahte-medyum', kisi: 5, kurban: 'k3', fail: 'k2', dilim: 4, oda: 'oda-6', yontem: 'mücevher değiştirme', delil: 9, sir: 1, cozulebilir: true, zorluk: 0.7 },
  'reg-3': { mekan: 'sahil-evi', arketip: 'miras-kavgasi', kisi: 7, kurban: 'k2', fail: 'k3', dilim: 6, oda: 'oda-0', yontem: 'zehir', delil: 13, sir: 2, cozulebilir: true, zorluk: 0.25 },
  'reg-4': { mekan: 'hastane', arketip: 'hastane-yanlis-doz', kisi: 6, kurban: 'k6', fail: 'k2', dilim: 4, oda: 'oda-1', yontem: 'ilaç dozu', delil: 12, sir: 2, cozulebilir: true, zorluk: 0.6 },
  'reg-5': { mekan: 'apartman', arketip: 'kiskanclik-ucgeni', kisi: 5, kurban: 'k5', fail: 'k1', dilim: 6, oda: 'oda-3', yontem: 'küt darbe', delil: 9, sir: 1, cozulebilir: true, zorluk: 0.55 },
  'reg-6': { mekan: 'malikane', arketip: 'kiskanclik-ucgeni', kisi: 5, kurban: 'k4', fail: 'k2', dilim: 3, oda: 'oda-6', yontem: 'küt darbe', delil: 15, sir: 2, cozulebilir: true, zorluk: 0.35 },
};

describe('regresyon seedleri', () => {
  for (const [seed, beklenen] of Object.entries(ANLIK)) {
    it(`${seed} anlık görüntüyle aynı`, () => {
      const v = vakaUret(seed);
      const q = sorguBaslat(v);
      const r = cozulebilirlikDenetle(q);
      expect({ mekan: v.mekan.tur, arketip: v.arketip, kisi: v.kisiler.length, kurban: v.olay.kurban, fail: v.olay.fail, dilim: v.olay.dilim, oda: v.olay.oda, yontem: v.olay.yontem, delil: q.deliller.length, sir: q.durum.sirKatmani.sirlar.length, cozulebilir: r.cozulebilir, zorluk: r.zorluk }).toEqual(beklenen);
    });
  }
});
