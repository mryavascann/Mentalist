// Mini oyunlar (TASARIM §13): içerik bütünlüğü, puanlama ve depo akışı.
import { describe, it, expect } from 'vitest';
import { MINI_OYUNLAR, sogukOkumaPuanla } from '@icerik/mini_oyunlar';
import { ICERIK } from '@icerik/index';
import { OyunDeposu } from '@arayuz/oyun/depo';

describe('mini oyun içerikleri', () => {
  it('kaynaklar kütükte; kör seçimde 4 profil; soğuk okumada 8 öğe ve her cümlenin geçerli etiketleri var; taban oranında tek doğru', () => {
    const kutuk = new Set(ICERIK.kaynaklar.map((k) => k.id));
    for (const k of [...MINI_OYUNLAR.korSecim.kaynak, ...MINI_OYUNLAR.sogukOkuma.kaynak, ...MINI_OYUNLAR.tabanOrani.kaynak]) expect(kutuk.has(k), k).toBe(true);
    expect(MINI_OYUNLAR.korSecim.profiller.length).toBe(4);
    const ogeIdler = new Set(MINI_OYUNLAR.sogukOkuma.ogeler.map((o) => o.id));
    expect(ogeIdler.size).toBe(8);
    for (const c of MINI_OYUNLAR.sogukOkuma.kayit) {
      expect(c.ogeler.length).toBeGreaterThanOrEqual(1);
      for (const o of c.ogeler) expect(ogeIdler.has(o), `${c.id}: ${o}`).toBe(true);
    }
    expect(MINI_OYUNLAR.tabanOrani.secenekler.filter((s) => s.dogru).length).toBe(1);
    expect(MINI_OYUNLAR.tabanOrani.secenekler.find((s) => s.dogru)!.metin).toContain('%1');
  });

  it('soğuk okuma puanlaması: tam doğru = en yüksek; yanlış etiket düşürür; boş = 0', () => {
    const tam: Record<string, string[]> = {};
    for (const c of MINI_OYUNLAR.sogukOkuma.kayit) tam[c.id] = [...c.ogeler];
    const r = sogukOkumaPuanla(tam);
    expect(r.puan).toBe(r.enYuksek);
    expect(r.cumleler.every((c) => c.yanlis === 0 && c.kacirilan === 0)).toBe(true);
    const bos = sogukOkumaPuanla({});
    expect(bos.puan).toBe(0);
    const yanlis = sogukOkumaPuanla({ c4: ['iltifat', 'gelecek'] });
    expect(yanlis.puan).toBe(-2);
    expect(yanlis.cumleler.find((c) => c.id === 'c4')!.kacirilan).toBe(1);
  });
});

describe('OyunDeposu — tatbikatlar', () => {
  it('kör seçim, soğuk okuma ve taban oranı sonuçları kaydedilir ve dışa/içe aktarımla taşınır', () => {
    const depo = new OyunDeposu();
    depo.basla('Deniz');
    depo.tatbikatAc('kor-secim');
    expect(depo.durum.ekran).toBe('tatbikat');
    expect(depo.durum.tatbikat.aktif).toBe('kor-secim');
    depo.korSecimBitir('zit');
    expect(depo.durum.tatbikat.sonuclar['kor-secim']).toEqual({ tamamlandi: true, puan: null, secim: 'zit' });
    depo.tatbikatAc('soguk-okuma');
    const r = depo.sogukOkumaBitir({ c4: ['olasilik'] });
    expect(r.puan).toBe(1);
    expect(depo.durum.tatbikat.sonuclar['soguk-okuma']!.puan).toBe(1);
    depo.tatbikatAc('taban-orani');
    expect(depo.tabanOraniBitir('c')).toBe(true);
    expect(depo.tabanOraniBitir('a')).toBe(false);
    expect(depo.durum.tatbikat.sonuclar['taban-orani']!.puan).toBe(0);
    const yeni = new OyunDeposu();
    expect(yeni.iceAktar(depo.disaAktar())).toBe(true);
    expect(yeni.durum.tatbikat.sonuclar['soguk-okuma']!.puan).toBe(1);
    expect(yeni.durum.tatbikat.sonuclar['kor-secim']!.secim).toBe('zit');
    depo.tatbikatKapat();
    expect(depo.durum.ekran).toBe('baslik');
  });
});
