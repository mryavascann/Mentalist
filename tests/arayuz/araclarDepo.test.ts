// Depo katmanı: dört yeni aracın oyun akışına bağlanması.
//   - Oda okuma: kayıt düşer, eşyalar depoda görünür, oyuncu sınıflar; Analiz karnesi dolar.
//   - Dijital iz ve kayıt inceleme: kayıt düşer, metin gizli etiket sızdırmaz.
//   - İç ses: tahmin kaydedilir, sonuç vaka sonuna kadar açılmaz; kayıt dışa/içe aktarımla taşınır.
//   - Suçlama gerekçesi "profil:genel" ile yanılınca oda-okuma-suc etiketi ve tatbikat önerisi.
import { describe, it, expect } from 'vitest';
import { OyunDeposu } from '@arayuz/oyun/depo';
import { tatbikatOner } from '@arayuz/oyun/tatbikat_onerisi';
import { ESYA_SINIFI, IC_SES_SECENEKLERI } from '@motor/araclar';

function hazir(seed = 'arac-depo-1') {
  const depo = new OyunDeposu();
  depo.basla('Deniz');
  depo.yeniVaka(seed);
  const kisi = depo.gorusulebilirler()[0]!;
  depo.kisiSec(kisi.id);
  return { depo, kisi };
}

describe('OyunDeposu — oda okuma', () => {
  it('odasını oku: teknik kaydı düşer, eşyalar depoda; sınıflama kaydedilir; analizde karne', () => {
    const { depo, kisi } = hazir();
    expect(depo.teknik('oda-okuma')).toBe(true);
    const okuma = depo.durum.sorgu!.odaOkumalari.get(kisi.id)!;
    expect(okuma.esyalar.length).toBeGreaterThanOrEqual(3);
    const kayit = depo.durum.konusmalar.get(kisi.id)!.find((k) => k.teknikId === 'oda-okuma')!;
    expect(kayit.cevap).toContain(okuma.esyalar[0]!.betimleme);
    // Metin gizli türü sızdırmaz.
    // Oyun sırasında eşyanın gerçek türü yazılmaz (ESYA_TURU_ADLARI yalnızca vaka sonunda görünür).
    expect(kayit.cevap).not.toMatch(/sahnelenmi|kimlik iddias|kalıntı|verdiği mesaj|alışkanlık izi|hayatının izi|göstermelik düzen/i);
    for (const e of okuma.esyalar) depo.esyaSinifla(e.id, ESYA_SINIFI[e.tur]);
    expect(depo.durum.sorgu!.odaSiniflamalari.size).toBe(okuma.esyalar.length);
    depo.suclamaYap({ fail: null, guven: 0.5 });
    expect(depo.durum.puan!.odaKarnesi!.dogru).toBe(okuma.esyalar.length);
    // Suçlama sonrası sınıflama kilitlenir.
    expect(depo.esyaSinifla(okuma.esyalar[0]!.id, 'sahnelenmis')).toBe(false);
  });
});

describe('OyunDeposu — dijital iz, kayıt inceleme, iç ses', () => {
  it('dijital iz metni profil sayılarını içerir; kayıt inceleme önce uygulanamaz sonra gözlem döker', () => {
    const { depo, kisi } = hazir('arac-depo-2');
    depo.teknik('dijital-iz');
    const kayitlar = () => depo.durum.konusmalar.get(kisi.id)!;
    const dij = kayitlar().find((k) => k.teknikId === 'dijital-iz')!;
    expect(dij.cevap).toMatch(/arkadaş/);
    depo.teknik('kayit-inceleme');
    expect(kayitlar().find((k) => k.teknikId === 'kayit-inceleme')!.cevap).toMatch(/kayıt yok/i);
    depo.sor({ tur: 'konum', hedef: kisi.id, dilim: 1 });
    depo.teknik('kayit-inceleme');
    const son = kayitlar().filter((k) => k.teknikId === 'kayit-inceleme').at(-1)!;
    expect(son.cevap).not.toMatch(/kayıt yok/i);
    expect(son.cevap).toMatch(/temel çizgi/i);
    for (const k of kayitlar()) expect(k.cevap).not.toMatch(/undefined|NaN|\[object/);
  });

  it('iç ses: tahmin kaydedilir, oyun sırasında gerçek açılmaz; dışa/içe aktarım tahminleri ve sınıflamaları taşır', () => {
    const { depo, kisi } = hazir('arac-depo-3');
    depo.sor({ tur: 'konum', hedef: kisi.id, dilim: 2 });
    expect(depo.teknik('ic-ses', { tahmin: 'sakin' })).toBe(true);
    const s = depo.durum.sorgu!;
    expect(s.icSesTahminleri.length).toBe(1);
    const kayit = depo.durum.konusmalar.get(kisi.id)!.find((k) => k.teknikId === 'ic-ses')!;
    expect(kayit.cevap).toMatch(/vaka sonunda/i);
    // Sızma kontrolü: metin yalnızca tahmini yazar; tahmin yanlışsa gerçek cümle metinde geçmez.
    const t = s.icSesTahminleri[0]!;
    expect(kayit.cevap).toContain(IC_SES_SECENEKLERI[t.tahmin]);
    if (t.tahmin !== t.gercek) expect(kayit.cevap).not.toContain(t.gercekMetin);
    expect(kayit.cevap).not.toMatch(/Gerçek:/);
    depo.teknik('oda-okuma');
    const esya = s.odaOkumalari.get(kisi.id)!.esyalar[0]!;
    depo.esyaSinifla(esya.id, 'iddia');
    const json = depo.disaAktar();
    const yeni = new OyunDeposu();
    expect(yeni.iceAktar(json)).toBe(true);
    const s2 = yeni.durum.sorgu!;
    expect(s2.icSesTahminleri).toEqual(s.icSesTahminleri);
    expect([...s2.odaSiniflamalari.entries()]).toEqual([...s.odaSiniflamalari.entries()]);
    expect(s2.odaOkumalari.get(kisi.id)).toEqual(s.odaOkumalari.get(kisi.id));
    // Analiz: iç ses karnesi
    yeni.suclamaYap({ fail: null, guven: 0.5 });
    expect(yeni.durum.puan!.icSesKarnesi!.n).toBe(1);
  });

  it('profil dayanağıyla yanılan oyuncu oda-okuma-suc etiketi alır; tatbikat önerisi ince dilim', () => {
    const { depo } = hazir('arac-depo-4');
    const vaka = depo.durum.sorgu!.durum.vaka;
    const masum = depo.gorusulebilirler().find((k) => k.id !== vaka.olay.fail)!;
    depo.suclamaYap({ fail: masum.id, guven: 0.7, gerekce: ['profil:genel'] });
    expect(depo.durum.puan!.hataEtiketleri).toContain('oda-okuma-suc');
    expect(tatbikatOner(['oda-okuma-suc']).map((o) => o.tatbikat)).toEqual(['ince-dilim']);
  });
});
