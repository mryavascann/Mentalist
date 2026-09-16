// Gözle kalite turu 2 (teknik çıktıları) düzeltmeleri:
//   - SUE, kişinin kendisi hakkında olmayan delille de çalışır: "X'i nerede gördün?" sorulur, koruma yalanı çelişebilir.
//   - Oda okuma eşyaları vaka içinde tekildir (iki kişinin odasında aynı "gülümseyen aile fotoğrafı" çıkmaz).
//   - Uygulanamayan teknik (şeytanın avukatı v0, kayıtsız kayıt inceleme) zaman düşmez.
//   - Serbest anlatımda aynı odada kalınan ardışık dilimler kısa devam cümlesiyle verilir; tam kalıp tekrarlanmaz.
import { describe, it, expect } from 'vitest';
import { vakaUret } from '@motor/gerceklik';
import { sorguBaslat, teknikUygula } from '@motor/teknik';
import { odaOku } from '@motor/araclar';
import { anlatimSatirlari, uslupUret, VaryantBellegi } from '@motor/dil';
import { bulunma } from '@ortak/turkce';

const yeni = (s: string) => sorguBaslat(vakaUret(s));

describe('SUE — tanık ifadesi', () => {
  it('başkası hakkındaki delille SUE o kişiyi sorar; doğru tanık çelişmez, koruma yalanı bazen çelişir (80 vaka)', () => {
    let koruma = 0, korumaCeliski = 0, dogru = 0;
    for (let s = 0; s < 80; s++) {
      const q = yeni(`sue-tanik-${s}`);
      const v = q.durum.vaka;
      for (const d of q.deliller) {
        if (d.gosterir.tur !== 'konum' || d.sahnelenmis) continue;
        const hedef = d.gosterir.kisi;
        for (const k of v.kisiler) {
          if (k.id === hedef || !k.hayatta || k.id === v.olay.kurban) continue;
          const sonuc = teknikUygula(q, k.id, 'sue', { delilId: d.id });
          if (sonuc.teknik !== 'sue') throw new Error('sue bekleniyordu');
          expect(sonuc.once.cevap.soru.tur === 'konum' && sonuc.once.cevap.soru.hedef).toBe(hedef);
          expect(sonuc.erkenGosterildi).toBe(false);
          if (sonuc.once.cevap.icerik === null) { expect(sonuc.celiski).toBe(false); continue; }
          if (sonuc.once.cevap.dogru) { dogru++; expect(sonuc.celiski, `${v.seed} ${k.id}→${hedef}`).toBe(false); }
          if (sonuc.once.cevap.ifadeTuru === 'koruma-yalani') { koruma++; if (sonuc.celiski) korumaCeliski++; }
        }
      }
    }
    expect(dogru).toBeGreaterThan(50);
    expect(koruma).toBeGreaterThan(5);
    expect(korumaCeliski).toBeGreaterThan(0);
  });
});

describe('oda okuma — vaka içinde tekillik', () => {
  it('100 vakada farklı kişilerin odalarında aynı betimleme neredeyse hiç tekrarlanmaz', () => {
    let tekrar = 0;
    for (let s = 0; s < 100; s++) {
      const q = yeni(`oda-tekil-${s}`);
      const gorulen = new Map<string, string>();
      for (const k of q.durum.vaka.kisiler) {
        if (!k.hayatta || k.id === q.durum.vaka.olay.kurban) continue;
        for (const e of odaOku(q, k.id).esyalar) {
          const onceki = gorulen.get(e.betimleme);
          if (onceki && onceki !== k.id) tekrar++;
          gorulen.set(e.betimleme, k.id);
        }
      }
    }
    // Havuzlar 8'er eşya; kişi sayısı en fazla 8. Küçük sır havuzlarında nadir çakışma olabilir.
    expect(tekrar, `tekrar sayısı ${tekrar}`).toBeLessThanOrEqual(10);
  });
});

describe('uygulanamayan teknik zaman düşmez', () => {
  it('şeytanın avukatı (v0) ve kayıtsız kayıt inceleme zamanı değiştirmez; temel çizgi düşer', () => {
    const q = yeni('zaman-1');
    const k = q.durum.vaka.kisiler.find((x) => x.hayatta && x.id !== q.durum.vaka.olay.kurban)!;
    const z0 = q.zaman;
    const s1 = teknikUygula(q, k.id, 'seytanin-avukati');
    expect(s1.teknik === 'seytanin-avukati' && s1.uygulanamaz).toBe(true);
    expect(q.zaman).toBe(z0);
    const s2 = teknikUygula(q, k.id, 'kayit-inceleme');
    expect(s2.teknik === 'kayit-inceleme' && s2.uygulanamaz).toBe(true);
    expect(q.zaman).toBe(z0);
    teknikUygula(q, k.id, 'temel-cizgi');
    expect(q.zaman).toBeGreaterThan(z0);
  });
});

describe('anlatım satırları — aynı odada kalınan dilimler kısa devam cümlesi', () => {
  it('40 vakada: her dilime bir satır; devam satırı kısa kalıptan, tam kalıp tekrarlanmaz; ilk satır tam; ters sırada da çalışır', () => {
    const DEVAM = /^(Hâlâ|Oradan|Aynı yer|Yine|Değişen)/;
    let devamSayisi = 0, tamSayisi = 0;
    for (let s = 0; s < 40; s++) {
      const q = yeni(`anlatim-${s}`);
      const v = q.durum.vaka;
      for (const k of v.kisiler) {
        if (!k.hayatta || k.id === v.olay.kurban) continue;
        const uslup = uslupUret(v, k.id);
        for (const teknikId of ['acik-uclu-anlatim', 'bilissel-yuk-ters-sira'] as const) {
          const sonuc = teknikUygula(q, k.id, teknikId);
          if (sonuc.teknik !== teknikId) throw new Error('anlatım bekleniyordu');
          const cevaplar = sonuc.anlatim.map((a) => a.cevap);
          const satirlar = anlatimSatirlari(v, cevaplar, uslup, new VaryantBellegi());
          expect(satirlar.length).toBe(cevaplar.length);
          expect(DEVAM.test(satirlar[0]!)).toBe(false);
          for (let i = 0; i < satirlar.length; i++) {
            const satir = satirlar[i]!;
            expect(satir[0]).toBe(satir[0]!.toLocaleUpperCase('tr'));
            expect(satir).not.toMatch(/yalan|undefined|\[object/);
            const onceki = i > 0 ? cevaplar[i - 1]! : null;
            const c = cevaplar[i]!;
            const ayniOdaAyniTur = !!onceki && c.icerik !== null && c.icerik === onceki.icerik && c.ifadeTuru === onceki.ifadeTuru;
            if (ayniOdaAyniTur) {
              devamSayisi++;
              expect(DEVAM.test(satir), `${v.seed} ${k.id} ${i}: ${satir}`).toBe(true);
              expect(satir).not.toMatch(/Saate bakmıştım|Kayda değer/);
              // Doğru anlatımda devam cümlesi odayı ya da eylemi taşır; yalan kategorilerinde oda adı verilmez.
              if (c.ifadeTuru === 'dogru') { const odaAd = v.mekan.odalar.find((o) => o.id === c.icerik)!.ad; expect(satir.includes(bulunma(odaAd)) || /;|,/.test(satir)).toBe(true); }
            } else if (c.icerik !== null && !DEVAM.test(satir)) tamSayisi++;
          }
        }
      }
    }
    expect(devamSayisi).toBeGreaterThan(200);
    expect(tamSayisi).toBeGreaterThan(200);
  });
});
