// "Watson'a anlat" (TASARIM §9): oyuncu pano maddelerini takım arkadaşına adım adım anlatır; sorgucu her
// adımda "gözlem mi, çıkarım mı? test ettin mi?" diye sorar. Oyuncunun kendi sınıflaması kaydedilir; pano
// sütunuyla çelişen sınıflama (çıkarımı gözlem sanma) işaretlenir (Priory Okulu dersi). Öğreterek öğrenme.
import { describe, it, expect } from 'vitest';
import { OyunDeposu } from '@arayuz/oyun/depo';
import { watsonSorusu } from '@arayuz/oyun/takim';

function hazir() {
  const depo = new OyunDeposu();
  depo.basla('Deniz');
  depo.yeniVaka('watson-1');
  depo.panoEkle('gozlem', 'Kapı zorlanmamış');
  depo.panoEkle('cikarim', 'Fail içeriden biri');
  depo.panoEkle('hipotez', 'Eş yaptı');
  depo.panoEkle('olmayan', 'Köpek havlamadı');
  return depo;
}

describe('watsonSorusu', () => {
  it('her pano türü için sorgucu sorusu üretir; deterministik', () => {
    for (const tur of ['gozlem', 'cikarim', 'hipotez', 'olmayan'] as const) {
      const a = watsonSorusu(tur, 'x', 0);
      expect(a.length).toBeGreaterThan(10);
      expect(watsonSorusu(tur, 'x', 0)).toBe(a);
    }
  });
});

describe('OyunDeposu — Watson akışı', () => {
  it('anlatım başlar, pano maddelerini sırayla sunar; her adımda oyuncu sınıflar; sonuç raporu çelişkileri sayar', () => {
    const depo = hazir();
    depo.watsonBasla();
    expect(depo.durum.ekran).toBe('watson');
    const w = depo.durum.watson;
    expect(w.adimlar.length).toBe(4);
    expect(w.indeks).toBe(0);
    // 1. adım gözlem: doğru sınıfla
    depo.watsonCevapla({ sinif: 'gozlem', testEdildi: true });
    // 2. adım çıkarım: yanlış (gözlem) sınıfla → çelişki
    depo.watsonCevapla({ sinif: 'gozlem', testEdildi: false });
    // 3. hipotez
    depo.watsonCevapla({ sinif: 'hipotez', testEdildi: false });
    // 4. olmayan → gözlem sayılır
    depo.watsonCevapla({ sinif: 'gozlem', testEdildi: true });
    const r = depo.durum.watson;
    expect(r.bitti).toBe(true);
    expect(r.indeks).toBe(4);
    expect(r.celiskiler).toEqual(['Fail içeriden biri']);
    expect(r.testEdilmemisCikarim).toEqual(['Fail içeriden biri']);
    depo.watsonKapat();
    expect(depo.durum.ekran).toBe('pano');
  });

  it('pano boşsa anlatım başlamaz; cevaplar kayıtla taşınmaz (oturumluk) ama pano taşınır', () => {
    const depo = new OyunDeposu();
    depo.basla('Deniz');
    depo.yeniVaka('watson-2');
    expect(depo.watsonBasla()).toBe(false);
    const dolu = hazir();
    dolu.watsonBasla();
    dolu.watsonCevapla({ sinif: 'gozlem', testEdildi: true });
    const yeni = new OyunDeposu();
    expect(yeni.iceAktar(dolu.disaAktar())).toBe(true);
    expect(yeni.durum.pano.gozlem).toEqual(['Kapı zorlanmamış']);
    expect(yeni.durum.watson.adimlar).toEqual([]);
    expect(yeni.durum.ekran).not.toBe('watson');
  });
});
