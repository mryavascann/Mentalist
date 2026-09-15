// Forer tutorial'ı testleri (TASARIM §13): açılış dersi — herkes aynı "kişisel" profili alır.
import { describe, it, expect } from 'vitest';
import { OyunDeposu } from '@arayuz/oyun/depo';
import { FORER } from '@icerik/forer';
import { ICERIK } from '@icerik/index';

describe('Forer içeriği', () => {
  it('13 profil maddesi, 6+ soru, kaynaklar kütükte, ifşa metni ve 1949 ortalaması var', () => {
    expect(FORER.profil.length).toBe(13);
    expect(FORER.sorular.length).toBeGreaterThanOrEqual(6);
    for (const k of FORER.kaynak) expect(ICERIK.kaynaklar.some((x) => x.id === k), k).toBe(true);
    expect(FORER.ifsa.length).toBeGreaterThan(50);
    expect(FORER.ortalama1949).toBeCloseTo(4.26, 2);
  });

  it('Kılavuz\'da Forer/Barnum maddesi var ve soğuk okuma bölümünde', () => {
    const m = ICERIK.kilavuz.find((x) => x.id === 'forer-barnum');
    expect(m).toBeDefined();
    expect(m!.bolum).toBe('soguk-okuma');
    expect(m!.kaynak).toContain('Forer 1949');
  });
});

describe('OyunDeposu — Forer akışı', () => {
  it('cevaplar ne olursa olsun aynı profil üretilir; puanlama kaydedilir; tamamlanınca bir daha zorunlu değil', () => {
    const depo = new OyunDeposu();
    depo.basla('Deniz');
    expect(depo.durum.forer.tamamlandi).toBe(false);
    depo.forerBasla();
    expect(depo.durum.ekran).toBe('forer');
    const profilA = depo.forerCevapla(['a', 'b', 'c', 'd', 'e', 'f', 'g', 'h']);
    const baska = new OyunDeposu();
    baska.basla('Ege');
    baska.forerBasla();
    const profilB = baska.forerCevapla(['x', 'y', 'z', 'x', 'y', 'z', 'x', 'y']);
    expect(profilA).toEqual(profilB);
    expect(profilA).toEqual(FORER.profil);
    depo.forerPuanla(5);
    expect(depo.durum.forer).toEqual({ tamamlandi: true, puan: 5, asama: 'ifsa' });
    depo.forerBitir();
    expect(depo.durum.ekran).toBe('baslik');
    expect(depo.durum.forer.tamamlandi).toBe(true);
  });

  it('puan 1–5 aralığına kırpılır ve kayıt dışa/içe aktarımla taşınır', () => {
    const depo = new OyunDeposu();
    depo.basla('Deniz');
    depo.forerBasla();
    depo.forerCevapla([]);
    depo.forerPuanla(9);
    expect(depo.durum.forer.puan).toBe(5);
    const yeni = new OyunDeposu();
    expect(yeni.iceAktar(depo.disaAktar())).toBe(true);
    expect(yeni.durum.forer.tamamlandi).toBe(true);
    expect(yeni.durum.forer.puan).toBe(5);
  });
});
