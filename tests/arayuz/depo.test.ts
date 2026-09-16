// Oyun deposu testleri (arayüzden bağımsız, Node ortamı).
// Depo, motor katmanlarını tek bir oyun akışında birleştirir: başlık → vaka açılışı → sorgu →
// pano → suçlama → analiz. React bileşenleri yalnızca bu depoyu okur ve eylem gönderir.
import { describe, it, expect } from 'vitest';
import { OyunDeposu } from '@arayuz/oyun/depo';
import { teknikSonucMetni } from '@arayuz/oyun/metinler';
import { ICERIK } from '@icerik/index';

function hazirOyun(seed = 'depo-1') {
  const depo = new OyunDeposu();
  depo.basla('Deniz');
  depo.yeniVaka(seed);
  return depo;
}

describe('OyunDeposu — akış', () => {
  it('başlangıçta başlık ekranı; kahraman adı girilince vaka açılışı için hazır', () => {
    const depo = new OyunDeposu();
    expect(depo.durum.ekran).toBe('baslik');
    depo.basla('');
    expect(depo.durum.kahramanAdi).toBe('Okuyucu');
    depo.basla('Deniz');
    expect(depo.durum.kahramanAdi).toBe('Deniz');
  });

  it('yeniVaka çözülebilir bir vaka kurar, ekran vaka açılışına geçer, brifing ve kişi kartları hazır', () => {
    const depo = hazirOyun();
    const d = depo.durum;
    expect(d.ekran).toBe('vaka-acilis');
    expect(d.sorgu).not.toBeNull();
    expect(d.rapor?.cozulebilir).toBe(true);
    expect(d.brifing.length).toBeGreaterThan(20);
    expect(d.kisiKartlari.length).toBe(d.sorgu!.durum.vaka.kisiler.length);
    expect(d.zaman).toBe(0);
    expect(d.zamanButcesi).toBeGreaterThan(0);
  });

  it('abone olanlar her eylemde bildirilir', () => {
    const depo = new OyunDeposu();
    let sayac = 0;
    const iptal = depo.abone(() => sayac++);
    depo.basla('A');
    depo.yeniVaka('abone');
    expect(sayac).toBe(2);
    iptal();
    depo.ekranaGit('pano');
    expect(sayac).toBe(2);
  });

  it('kişi seçip soru sorunca konuşma kaydı büyür: soru metni, cevap metni, betimleme', () => {
    const depo = hazirOyun();
    const kisi = depo.gorusulebilirler()[0]!;
    depo.kisiSec(kisi.id);
    expect(depo.durum.ekran).toBe('sorgu');
    depo.sor({ tur: 'konum', hedef: kisi.id, dilim: 2 });
    const k = depo.durum.konusmalar.get(kisi.id)!;
    expect(k.length).toBe(1);
    expect(k[0]!.soru.length).toBeGreaterThan(3);
    expect(k[0]!.cevap.length).toBeGreaterThan(3);
    expect(typeof k[0]!.betimleme).toBe('string');
    expect(k[0]!.tur).toBe('soru');
    expect(k[0]!.gozlemler.length).toBe(k[0]!.ipucuIdler.length);
    for (const g of k[0]!.gozlemler) expect(k[0]!.betimleme).toContain(g.betimleme);
  });

  it('aynı soru tekrar sorulunca aynı cevap metni gelir (yalan defteri arayüze kadar tutarlı)', () => {
    const depo = hazirOyun();
    const kisi = depo.gorusulebilirler()[0]!;
    depo.kisiSec(kisi.id);
    depo.sor({ tur: 'konum', hedef: kisi.id, dilim: depo.durum.sorgu!.durum.vaka.olay.dilim });
    depo.sor({ tur: 'konum', hedef: kisi.id, dilim: depo.durum.sorgu!.durum.vaka.olay.dilim });
    const k = depo.durum.konusmalar.get(kisi.id)!;
    expect(k[1]!.cevap).toBe(k[0]!.cevap);
  });

  it('teknik uygulamak zamanı artırır ve konuşmaya teknik kaydı düşer; her teknik için metin üretilir', () => {
    const depo = hazirOyun('depo-teknik');
    const kisi = depo.gorusulebilirler()[0]!;
    depo.kisiSec(kisi.id);
    const delil = depo.durum.sorgu!.deliller.find((d) => d.gosterir.tur === 'konum')!;
    for (const t of ICERIK.teknikler) {
      const once = depo.durum.zaman;
      const sonuc = depo.teknikSonucu(t.id, { dilim: 1, delilId: delil.id, konu: 'olay-yontemi', onerilenOda: depo.durum.sorgu!.durum.vaka.mekan.odalar[0]!.id, uydurmaAd: 'Cemil Aktaş' })!;
      expect(sonuc).not.toBeNull();
      // Uygulanamayan teknik (şeytanın avukatı v0, tahminsiz iç ses) zaman düşmez; diğerleri zamanı artırır.
      const uygulanamadi = 'uygulanamaz' in sonuc && sonuc.uygulanamaz === true;
      if (uygulanamadi) expect(depo.durum.zaman).toBe(once);
      else expect(depo.durum.zaman).toBeGreaterThan(once);
    }
    const k = depo.durum.konusmalar.get(kisi.id)!;
    expect(k.filter((x) => x.tur === 'teknik').length).toBe(ICERIK.teknikler.length);
    for (const x of k) { expect(x.cevap).not.toMatch(/undefined|\[object|NaN/); expect(x.cevap.length).toBeGreaterThan(0); }
  });

  it('pano: gözlem/çıkarım/hipotez/olmayan ekleme ve silme; hipotez limiti 7', () => {
    const depo = hazirOyun();
    depo.panoEkle('gozlem', 'Kapı zorlanmamış');
    depo.panoEkle('cikarim', 'İçeriden biri');
    for (let i = 0; i < 9; i++) depo.panoEkle('hipotez', `Hipotez ${i}`);
    depo.panoEkle('olmayan', 'Köpek havlamadı');
    const p = depo.durum.pano;
    expect(p.gozlem).toEqual(['Kapı zorlanmamış']);
    expect(p.cikarim).toEqual(['İçeriden biri']);
    expect(p.hipotez.length).toBe(7);
    expect(p.olmayan).toEqual(['Köpek havlamadı']);
    depo.panoSil('hipotez', 0);
    expect(p.hipotez.length).toBe(6);
    expect(depo.panoEkle('gozlem', '   ')).toBe(false);
  });

  it('suçlama: puan raporu üretir, analiz ekranına geçer, gerçeğin anlatımı fail ve motivasyonu içerir', () => {
    let depo = hazirOyun('depo-suclama-0');
    for (let i = 1; !depo.durum.sorgu!.durum.vaka.olay.fail && i < 20; i++) depo = hazirOyun(`depo-suclama-${i}`);
    const fail = depo.durum.sorgu!.durum.vaka.olay.fail!;
    expect(fail).toBeTruthy();
    depo.suclamaYap({ fail, guven: 0.8, gerekce: ['delil:d1'] });
    expect(depo.durum.ekran).toBe('analiz');
    expect(depo.durum.puan?.dogru).toBe(true);
    expect(depo.durum.gercekAnlatimi).toContain(depo.durum.sorgu!.durum.vaka.kisiler.find((k) => k.id === fail)!.ad);
    expect(depo.durum.gercekAnlatimi).toContain(depo.durum.sorgu!.durum.vaka.olay.motivasyon);
    // İfade-gerçek tablosu: herkes listede; sorulmayanlar işaretli; fail sorulmuşsa etiketi doğru
    const tablo = depo.durum.ifadeKarsilastirma;
    expect(tablo.length).toBe(depo.gorusulebilirler().length);
    expect(tablo.every((r) => !r.soruldu && r.etiket === 'sorulmadı')).toBe(true);
  });

  it('ifade-gerçek tablosu: sorulan kişi için söylenen oda ve ifade türü adı; temel çizgi notu kişi başına saklanır', () => {
    // Suçlu (fail'li) bir vaka bul; bazı seed'ler kaza üretir.
    let depo = hazirOyun('depo-tablo-0');
    for (let i = 1; !depo.durum.sorgu!.durum.vaka.olay.fail && i < 20; i++) depo = hazirOyun(`depo-tablo-${i}`);
    const f = depo.durum.sorgu!.durum.vaka.olay.fail!;
    expect(f).toBeTruthy();
    depo.kisiSec(f);
    depo.sor({ tur: 'konum', hedef: f, dilim: depo.durum.sorgu!.durum.vaka.olay.dilim });
    depo.teknik('temel-cizgi');
    expect(depo.durum.temelCizgiNotlari.get(f)).toMatch(/^Normali:/);
    depo.suclamaYap({ fail: f, guven: 0.8 });
    const satir = depo.durum.ifadeKarsilastirma.find((r) => r.kisi === f)!;
    expect(satir.soruldu).toBe(true);
    expect(['Gömülü yalan', 'Kaçamak / teknik olarak doğru']).toContain(satir.etiket);
    const json = depo.disaAktar();
    const yeni = new OyunDeposu();
    yeni.iceAktar(json);
    expect(yeni.durum.ifadeKarsilastirma.length).toBe(depo.durum.ifadeKarsilastirma.length);
    expect(yeni.durum.temelCizgiNotlari.get(f)).toBe(depo.durum.temelCizgiNotlari.get(f));
  });

  it('suçlamadan sonra soru sorulamaz; yeni vaka her şeyi sıfırlar', () => {
    const depo = hazirOyun('depo-sonra');
    const kisi = depo.gorusulebilirler()[0]!;
    depo.suclamaYap({ fail: null, guven: 0.5 });
    depo.kisiSec(kisi.id);
    expect(depo.sor({ tur: 'konum', hedef: kisi.id, dilim: 0 })).toBe(false);
    depo.yeniVaka('depo-sonra-2');
    expect(depo.durum.puan).toBeNull();
    expect(depo.durum.konusmalar.size).toBe(0);
    expect(depo.durum.pano.gozlem).toEqual([]);
  });

  it('kaydı dışa/içe aktarma: JSON metni pano, kahraman adı, seed ve konuşmaları taşır', () => {
    const depo = hazirOyun('depo-kayit');
    const kisi = depo.gorusulebilirler()[0]!;
    depo.kisiSec(kisi.id);
    depo.sor({ tur: 'konum', hedef: kisi.id, dilim: 1 });
    depo.panoEkle('gozlem', 'Not');
    const json = depo.disaAktar();
    const yeni = new OyunDeposu();
    expect(yeni.iceAktar(json)).toBe(true);
    expect(yeni.durum.kahramanAdi).toBe('Deniz');
    expect(yeni.durum.sorgu!.durum.vaka.seed).toBe(depo.durum.sorgu!.durum.vaka.seed);
    expect(yeni.durum.pano.gozlem).toEqual(['Not']);
    expect(yeni.durum.konusmalar.get(kisi.id)!.length).toBe(1);
    expect(yeni.iceAktar('{bozuk')).toBe(false);
  });

  it('adaptif üretim: Othello kör noktası olan oyuncunun sonraki vakası gergin masum içerir ve analizde hedef açıklanır', () => {
    const depo = new OyunDeposu();
    depo.basla('Deniz');
    // Yapay geçmiş: üç kez Othello hatası
    depo.durum.gecmis.push({ seed: 'x', dogru: false, puan: 0, hataEtiketleri: ['othello-hatasi'], brier: 0.8 });
    depo.durum.gecmis.push({ seed: 'y', dogru: false, puan: 0, hataEtiketleri: ['othello-hatasi'], brier: 0.8 });
    depo.yeniVaka('adaptif-depo-1');
    expect(depo.durum.hedefler).toContain('gergin-masum');
    const { vaka, sirKatmani } = depo.durum.sorgu!.durum;
    expect(sirKatmani.sirlar.some((s) => s.kisi !== vaka.olay.fail && s.dilimler.includes(vaka.olay.dilim))).toBe(true);
    const yeni = new OyunDeposu();
    expect(yeni.iceAktar(depo.disaAktar())).toBe(true);
  });

  it('kör nokta geçmişi: her vaka sonunda hata etiketleri birikir', () => {
    const depo = hazirOyun('depo-kor');
    const masum = depo.gorusulebilirler().find((k) => k.id !== depo.durum.sorgu!.durum.vaka.olay.fail)!;
    depo.suclamaYap({ fail: masum.id, guven: 0.95 });
    expect(depo.durum.gecmis.length).toBe(1);
    expect(depo.durum.gecmis[0]!.hataEtiketleri.length).toBeGreaterThan(0);
    expect(depo.korNoktalar().length).toBeGreaterThan(0);
  });
});

describe('teknikSonucMetni', () => {
  it('her teknik sonucu için oyuncuya dönük metin üretir ve gizli bilgiyi (CIT geçerliliği) sızdırmaz', () => {
    const depo = hazirOyun('depo-metin');
    const kisi = depo.gorusulebilirler()[0]!;
    depo.kisiSec(kisi.id);
    const sonuc = depo.durum.sorgu && depo.teknikSonucu('gizli-bilgi-testi', { konu: 'olay-yontemi' });
    expect(sonuc).not.toBeNull();
    const m = teknikSonucMetni(sonuc!, depo.durum.sorgu!.durum.vaka);
    expect(m.length).toBeGreaterThan(5);
    expect(m.toLocaleLowerCase('tr')).not.toMatch(/geçersiz|geçerli/);
  });
});
