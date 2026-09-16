// Temel çizgi sohbeti: gözlemler tarafsız sohbete uygun ayrı betimlemelerden gelir.
//   - Sorgu betimlemeleri ("Aynı konuda önce bir şey söyledi, sonra tersini ima etti") anlatım odaklıdır;
//     tarafsız sohbette tuhaf kaçar. Her ipucunun `temelBetimlemeler` seti alışkanlık dilinde yazılır.
//   - Bağlam yalnızca metni değiştirir; hangi ipucunun gözlendiği (RNG akışı) aynı kalır.
import { describe, it, expect } from 'vitest';
import { ICERIK } from '@icerik/index';
import { vakaUret } from '@motor/gerceklik';
import { sorguBaslat, teknikUygula } from '@motor/teknik';
import { ipucuUret } from '@motor/ipucu';

const ANLATIM_ODAKLI = /soru|cevap|hikâye|hayır|üzüldüm|o akşam|bu konuda|burada|diğer konularda|diğer sorularda/i;

describe('ipucu kataloğu — temel çizgi betimlemeleri', () => {
  it('her ipucunun en az 3 temel çizgi betimlemesi var ve hiçbiri anlatım/soru odaklı değil', () => {
    for (const i of ICERIK.ipuclari) {
      expect(i.temelBetimlemeler?.length ?? 0, i.id).toBeGreaterThanOrEqual(3);
      for (const b of i.temelBetimlemeler!) expect(b, `${i.id}: ${b}`).not.toMatch(ANLATIM_ODAKLI);
    }
  });

  it("sorgu betimlemeleri cevaba yapışmayan alıntı taşımaz ('çok üzüldüm' konum cevabına uymaz)", () => {
    for (const i of ICERIK.ipuclari) for (const b of i.betimlemeler) expect(b, i.id).not.toMatch(/üzüldüm/);
  });
});

describe('temel çizgi tekniği', () => {
  it('gözlemler temelBetimlemeler kümesinden gelir; ipucu kümesi bağlamsız çekimle aynı (50 vaka)', () => {
    const temelKume = new Map(ICERIK.ipuclari.map((i) => [i.id, new Set(i.temelBetimlemeler)]));
    let toplam = 0;
    for (let s = 0; s < 50; s++) {
      const q = sorguBaslat(vakaUret(`temel-${s}`));
      for (const k of q.durum.vaka.kisiler) {
        if (k.id === q.durum.vaka.olay.kurban) continue;
        const sonuc = teknikUygula(q, k.id, 'temel-cizgi');
        if (sonuc.teknik !== 'temel-cizgi') throw new Error('teknik uygulanamadı');
        for (const g of sonuc.gozlemler) { expect(temelKume.get(g.ipucuId)!.has(g.betimleme), `${g.ipucuId}: ${g.betimleme}`).toBe(true); toplam++; }
        // Aynı etiketle bağlamsız çekim: ipucu kimlikleri birebir aynı (metin dışında hiçbir şey değişmez).
        const sanal = { kisi: k.id, soru: { tur: 'konum' as const, hedef: k.id, dilim: 100 }, ifadeTuru: 'dogru', icerik: null, dogru: true, not: '' };
        const a = ipucuUret(q.durum, sanal, { etiket: 'temel-cizgi', baglam: 'temel-cizgi' }).map((g) => g.ipucuId);
        const b = ipucuUret(q.durum, sanal, { etiket: 'temel-cizgi' }).map((g) => g.ipucuId);
        expect(a).toEqual(b);
      }
    }
    expect(toplam).toBeGreaterThan(50);
  });
});
