// Kalan tatbikatlar (TASARIM §13): Linda tuzağı, kaybolan top / off-beat, ince dilim, çift kör test tasarla.
// İçerik bütünlüğü, puanlama kuralları, Kılavuz bağları ve depo akışı.
import { describe, it, expect } from 'vitest';
import { MINI_OYUNLAR, lindaPuanla, offBeatPuanla, inceDilimPuanla, ciftKorPuanla } from '@icerik/mini_oyunlar';
import { ICERIK } from '@icerik/index';
import { OyunDeposu } from '@arayuz/oyun/depo';

const kutuk = new Set(ICERIK.kaynaklar.map((k) => k.id));

describe('Linda tuzağı içeriği', () => {
  it('kaynaklar kütükte; ≥4 çift; her çiftte tek doğru; birleşimde kısa, ayrıkta uzun seçenek doğru; en az bir ayrık çift var', () => {
    const { linda } = MINI_OYUNLAR;
    for (const k of linda.kaynak) expect(kutuk.has(k), k).toBe(true);
    expect(linda.ciftler.length).toBeGreaterThanOrEqual(4);
    let ayrik = 0;
    for (const c of linda.ciftler) {
      expect(c.secenekler.length).toBe(2);
      const dogru = c.secenekler.filter((s) => s.dogru);
      expect(dogru.length, c.id).toBe(1);
      const yanlis = c.secenekler.find((s) => !s.dogru)!;
      // Birleşim (VE) yanılgısında ayrıntılı seçenek daha az olasıdır → kısa olan doğru.
      // Ayrık (YA DA) olayda tersine uzun olan daha olasıdır → "hep kısayı seç" kalıbı kırılır.
      if (c.tur === 'birlesim') expect(dogru[0]!.metin.length, c.id).toBeLessThan(yanlis.metin.length);
      else { expect(c.tur).toBe('ayrik'); ayrik++; expect(dogru[0]!.metin.length, c.id).toBeGreaterThan(yanlis.metin.length); }
      expect(c.aciklama.length).toBeGreaterThan(20);
    }
    expect(ayrik).toBeGreaterThanOrEqual(1);
    expect(ICERIK.kilavuz.some((m) => m.id === 'birlesim-yanilgisi')).toBe(true);
  });

  it('puanlama: hepsi doğru = çift sayısı; boş = 0; yanlışlar listelenir', () => {
    const { linda } = MINI_OYUNLAR;
    const tam: Record<string, string> = {};
    for (const c of linda.ciftler) tam[c.id] = c.secenekler.find((s) => s.dogru)!.id;
    expect(lindaPuanla(tam).puan).toBe(linda.ciftler.length);
    expect(lindaPuanla({}).puan).toBe(0);
    const ilk = linda.ciftler[0]!;
    const r = lindaPuanla({ [ilk.id]: ilk.secenekler.find((s) => !s.dogru)!.id });
    expect(r.puan).toBe(0);
    expect(r.yanlislar).toContain(ilk.id);
  });
});

describe('Kaybolan top / off-beat içeriği', () => {
  it('sahne ≥4 an; 3 soru, her birinde tek doğru; ilk sorunun doğrusu bir "an" kimliği; Kılavuz bağları geçerli', () => {
    const { offBeat } = MINI_OYUNLAR;
    for (const k of offBeat.kaynak) expect(kutuk.has(k), k).toBe(true);
    expect(offBeat.anlar.length).toBeGreaterThanOrEqual(4);
    expect(offBeat.sorular.length).toBe(3);
    const anIdler = new Set(offBeat.anlar.map((a) => a.id));
    for (const s of offBeat.sorular) {
      expect(s.secenekler.filter((x) => x.dogru).length, s.id).toBe(1);
      expect(s.aciklama.length).toBeGreaterThan(20);
    }
    const ilk = offBeat.sorular[0]!;
    for (const s of ilk.secenekler) expect(anIdler.has(s.id), s.id).toBe(true);
    const kilavuzIdler = new Set(ICERIK.kilavuz.map((m) => m.id));
    for (const k of offBeat.kilavuz) expect(kilavuzIdler.has(k), k).toBe(true);
  });

  it('puanlama: her doğru 1; en yüksek 3', () => {
    const { offBeat } = MINI_OYUNLAR;
    const tam: Record<string, string> = {};
    for (const s of offBeat.sorular) tam[s.id] = s.secenekler.find((x) => x.dogru)!.id;
    const r = offBeatPuanla(tam);
    expect(r.puan).toBe(3);
    expect(r.enYuksek).toBe(3);
    expect(offBeatPuanla({}).puan).toBe(0);
  });
});

describe('İnce dilim içeriği', () => {
  it('≥2 kişi; her kişide sıcaklık, baskınlık ve yalan boyutu; yalan boyutunun doğrusu "bilinemez"', () => {
    const { inceDilim } = MINI_OYUNLAR;
    for (const k of inceDilim.kaynak) expect(kutuk.has(k), k).toBe(true);
    expect(inceDilim.kisiler.length).toBeGreaterThanOrEqual(2);
    for (const k of inceDilim.kisiler) {
      expect(k.betimleme.length).toBeGreaterThan(80);
      const boyutlar = k.boyutlar.map((b) => b.id);
      expect(boyutlar).toEqual(expect.arrayContaining(['sicaklik', 'baskinlik', 'yalan']));
      const yalan = k.boyutlar.find((b) => b.id === 'yalan')!;
      expect(yalan.dogru).toBe('bilinemez');
      expect(yalan.secenekler.map((s) => s.id)).toContain('bilinemez');
      for (const b of k.boyutlar) expect(b.secenekler.some((s) => s.id === b.dogru), `${k.id}/${b.id}`).toBe(true);
    }
  });

  it('puanlama: kişilik boyutlarında doğru +1; yalan sorusunda "bilinemez" +1, evet/hayır 0 ve aşırı genelleme sayılır', () => {
    const { inceDilim } = MINI_OYUNLAR;
    const tam: Record<string, Record<string, string>> = {};
    for (const k of inceDilim.kisiler) { tam[k.id] = {}; for (const b of k.boyutlar) tam[k.id]![b.id] = b.dogru; }
    const r = inceDilimPuanla(tam);
    expect(r.puan).toBe(r.enYuksek);
    expect(r.asiriGenelleme).toBe(0);
    const ilk = inceDilim.kisiler[0]!;
    const yanlis = inceDilimPuanla({ [ilk.id]: { yalan: 'evet' } });
    expect(yanlis.puan).toBe(0);
    expect(yanlis.asiriGenelleme).toBe(1);
  });
});

describe('Çift kör test tasarla içeriği', () => {
  it('≥5 gerekli ve ≥5 tuzak madde; kimlikler benzersiz; her maddenin açıklaması var; Kılavuz maddesi mevcut', () => {
    const { ciftKor } = MINI_OYUNLAR;
    for (const k of ciftKor.kaynak) expect(kutuk.has(k), k).toBe(true);
    const gerekli = ciftKor.maddeler.filter((m) => m.tur === 'gerekli');
    const tuzak = ciftKor.maddeler.filter((m) => m.tur === 'tuzak');
    expect(gerekli.length).toBeGreaterThanOrEqual(5);
    expect(tuzak.length).toBeGreaterThanOrEqual(5);
    expect(new Set(ciftKor.maddeler.map((m) => m.id)).size).toBe(ciftKor.maddeler.length);
    for (const m of ciftKor.maddeler) expect(m.aciklama.length, m.id).toBeGreaterThan(20);
    expect(ICERIK.kilavuz.some((m) => m.id === 'cift-kor-test')).toBe(true);
  });

  it('puanlama: gerekli +1, tuzak −1; hepsi seçilirse gerekli−tuzak; sadece gerekliler = en yüksek', () => {
    const { ciftKor } = MINI_OYUNLAR;
    const gerekli = ciftKor.maddeler.filter((m) => m.tur === 'gerekli').map((m) => m.id);
    const tuzak = ciftKor.maddeler.filter((m) => m.tur === 'tuzak').map((m) => m.id);
    const tam = ciftKorPuanla(gerekli);
    expect(tam.puan).toBe(gerekli.length);
    expect(tam.enYuksek).toBe(gerekli.length);
    expect(tam.kacirilan.length).toBe(0);
    const hepsi = ciftKorPuanla([...gerekli, ...tuzak]);
    expect(hepsi.puan).toBe(gerekli.length - tuzak.length);
    expect(hepsi.tuzaklar.length).toBe(tuzak.length);
    expect(ciftKorPuanla([]).puan).toBe(0);
  });
});

describe('OyunDeposu — kalan tatbikatlar', () => {
  it('dört tatbikatın sonuçları kaydedilir, ekran akışı çalışır ve dışa/içe aktarımla taşınır', () => {
    const depo = new OyunDeposu();
    depo.basla('Deniz');
    const { linda, offBeat, inceDilim, ciftKor } = MINI_OYUNLAR;

    depo.tatbikatAc('linda');
    expect(depo.durum.ekran).toBe('tatbikat');
    const lindaTam: Record<string, string> = {};
    for (const c of linda.ciftler) lindaTam[c.id] = c.secenekler.find((s) => s.dogru)!.id;
    expect(depo.lindaBitir(lindaTam).puan).toBe(linda.ciftler.length);
    expect(depo.durum.tatbikat.sonuclar['linda']!.puan).toBe(linda.ciftler.length);

    depo.tatbikatAc('off-beat');
    const obTam: Record<string, string> = {};
    for (const s of offBeat.sorular) obTam[s.id] = s.secenekler.find((x) => x.dogru)!.id;
    expect(depo.offBeatBitir(obTam).puan).toBe(3);

    depo.tatbikatAc('ince-dilim');
    const idTam: Record<string, Record<string, string>> = {};
    for (const k of inceDilim.kisiler) { idTam[k.id] = {}; for (const b of k.boyutlar) idTam[k.id]![b.id] = b.dogru; }
    const idR = depo.inceDilimBitir(idTam);
    expect(idR.puan).toBe(idR.enYuksek);

    depo.tatbikatAc('cift-kor');
    const gerekli = ciftKor.maddeler.filter((m) => m.tur === 'gerekli').map((m) => m.id);
    expect(depo.ciftKorBitir(gerekli).puan).toBe(gerekli.length);

    const yeni = new OyunDeposu();
    expect(yeni.iceAktar(depo.disaAktar())).toBe(true);
    expect(yeni.durum.tatbikat.sonuclar['linda']!.puan).toBe(linda.ciftler.length);
    expect(yeni.durum.tatbikat.sonuclar['off-beat']!.puan).toBe(3);
    expect(yeni.durum.tatbikat.sonuclar['ince-dilim']!.tamamlandi).toBe(true);
    expect(yeni.durum.tatbikat.sonuclar['cift-kor']!.puan).toBe(gerekli.length);

    depo.tatbikatKapat();
    expect(depo.durum.ekran).toBe('baslik');
  });
});
