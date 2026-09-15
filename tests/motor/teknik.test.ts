// Teknik motoru testleri: oyuncunun araçları (teknikler.json) motor üstünde nasıl çalışır?
// Her teknik kaynağındaki bulguya yakın simüle edilir:
//   SUE (Vrij 2010): delil sona saklanırsa fail çelişir; erken gösterilirse hikâyesini delile uydurur.
//   Bilişsel yük: yalanda ipuçları büyür, yalancı bazen kendi defteriyle çelişir; doğrucu çelişmez.
//   Beklenmedik soru: gömülü yalan söyleyen, iddia ettiği odadaki kişileri bilemez; uydurursa yakalanır.
//   CIT (Vrij & Verschuere 2014): sızmış bilgide geçersiz; sızmamışsa bilen tanır, bilmeyen tanımaz.
//   SVT: "bilmiyorum" diyen bilen kişi iki seçenekte şans altında kalır.
//   Yönlendirici soru (Loftus): telkine yatkın ve bilgisiz tanık öneriyi benimser; kontaminasyon kaydedilir.
//   Suçlayıcı ton: herkes gerilir (Othello), telkine yatkın masum sahte itiraf verebilir.
import { describe, it, expect } from 'vitest';
import { vakaUret } from '@motor/gerceklik';
import { kimBiliyor } from '@motor/bilgi';
import { sorguBaslat, sor, delilGoster, teknikUygula } from '@motor/teknik';
import type { Sorgu } from '@motor/teknik';
import { ICERIK } from '@icerik/index';

const seedler = Array.from({ length: 120 }, (_, i) => `teknik-${i}`);
const yeni = (s: string): Sorgu => sorguBaslat(vakaUret(s));
const konum = (q: Sorgu, kisi: string, dilim: number) => q.durum.vaka.zamanCizelgesi.find((z) => z.kisi === kisi && z.dilim === dilim)!.oda;
const failDelili = (q: Sorgu) => q.deliller.find((d) => d.gosterir.tur === 'konum' && d.gosterir.kisi === q.durum.vaka.olay.fail && d.gosterir.dilim === q.durum.vaka.olay.dilim)!;
const masumlar = (q: Sorgu) => q.durum.vaka.kisiler.filter((k) => k.hayatta && k.id !== q.durum.vaka.olay.fail && k.id !== q.durum.vaka.olay.kurban);

describe('sorguBaslat / sor / zaman', () => {
  it('sorgu vaka durumu, deliller, boş kayıtlar ve sıfır zamanla başlar', () => {
    const q = yeni('baslat');
    expect(q.durum.vaka.seed).toBe('baslat');
    expect(q.deliller.length).toBeGreaterThan(0);
    expect(q.zaman).toBe(0);
    expect(q.kontaminasyon).toEqual([]);
    expect(q.gecmis).toEqual([]);
  });

  it('her teknik uygulanabilir ve zaman maliyetini ekler', () => {
    const q = yeni('zaman');
    const k = masumlar(q)[0]!.id;
    let beklenen = 0;
    for (const t of ICERIK.teknikler) {
      const sonuc = teknikUygula(q, k, t.id, { dilim: 2, delilId: q.deliller[0]!.id, konu: 'olay-yontemi', onerilenOda: q.durum.vaka.mekan.odalar[0]!.id, uydurmaAd: 'Cemil Aktaş' });
      expect(sonuc.teknik).toBe(t.id);
      beklenen += t.maliyet.zaman;
      expect(q.zaman).toBeCloseTo(beklenen, 5);
    }
    expect(q.gecmis.length).toBe(ICERIK.teknikler.length);
  });

  it('bilinmeyen teknik hata fırlatır', () => {
    const q = yeni('hata');
    expect(() => teknikUygula(q, masumlar(q)[0]!.id, 'yok-boyle-teknik')).toThrow();
  });

  it('sor(): delil gösterilmemişse cevap strateji katmanıyla aynı; ipuçları ve çelişen deliller döner', () => {
    const q = yeni('sor');
    const k = masumlar(q)[0]!.id;
    const s = sor(q, k, { tur: 'konum', hedef: k, dilim: 1 });
    expect(s.cevap.kisi).toBe(k);
    expect(Array.isArray(s.ipuclari)).toBe(true);
    expect(Array.isArray(s.celisenDeliller)).toBe(true);
  });
});

describe('SUE — stratejik delil kullanımı', () => {
  it('delil sona saklanırsa failin gömülü yalanı çelişir; erken gösterilirse hikâyesini delile uydurur', () => {
    let gec = 0, erken = 0;
    for (const s of seedler) {
      const gecQ = yeni(s);
      const f = gecQ.durum.vaka.olay.fail;
      if (!f) continue;
      const delil = failDelili(gecQ);
      // Geç: önce anlattır, sonra göster.
      const ilk = sor(gecQ, f, { tur: 'konum', hedef: f, dilim: gecQ.durum.vaka.olay.dilim });
      if (ilk.cevap.ifadeTuru !== 'gomulu-yalan') continue;
      const gecSonuc = teknikUygula(gecQ, f, 'sue', { delilId: delil.id });
      expect(gecSonuc.teknik).toBe('sue');
      if (gecSonuc.teknik === 'sue') { expect(gecSonuc.erkenGosterildi).toBe(false); expect(gecSonuc.celiski).toBe(true); gec++; }
      // Erken: aynı vakada önce göster, sonra sor.
      const erkenQ = yeni(s);
      delilGoster(erkenQ, f, delil.id);
      const erkenSonuc = teknikUygula(erkenQ, f, 'sue', { delilId: delil.id });
      if (erkenSonuc.teknik === 'sue') {
        expect(erkenSonuc.erkenGosterildi).toBe(true);
        expect(erkenSonuc.celiski).toBe(false);
        expect(erkenSonuc.once.cevap.ifadeTuru).toBe('kacamak');
        expect(erkenSonuc.once.cevap.icerik).toBe(erkenQ.durum.vaka.olay.oda);
        erken++;
      }
    }
    expect(gec).toBeGreaterThan(20);
    expect(erken).toBe(gec);
  });

  it('masumun doğru cevabı delille çelişmez; SUE çelişki bulmaz', () => {
    for (const s of seedler.slice(0, 40)) {
      const q = yeni(s);
      for (const d of q.deliller) {
        if (d.gosterir.tur !== 'konum') continue;
        const k = q.durum.vaka.kisiler.find((x) => x.id === (d.gosterir as { kisi: string }).kisi)!;
        if (!k.hayatta || k.id === q.durum.vaka.olay.fail) continue;
        if (q.durum.sirKatmani.sirlar.some((x) => x.kisi === k.id)) continue;
        const sonuc = teknikUygula(q, k.id, 'sue', { delilId: d.id });
        if (sonuc.teknik === 'sue') expect(sonuc.celiski).toBe(false);
      }
    }
  });
});

describe('Bilişsel yük — ters sırayla anlatım', () => {
  it('doğrucu hiç çelişmez; yalancılar bazen kendi defteriyle çelişir', () => {
    let dogruAnlatim = 0, yalanciSayi = 0, celisenYalanci = 0;
    for (const s of seedler) {
      const q = yeni(s);
      for (const k of q.durum.vaka.kisiler) {
        if (!k.hayatta) continue;
        const sonuc = teknikUygula(q, k.id, 'bilissel-yuk-ters-sira');
        if (sonuc.teknik !== 'bilissel-yuk-ters-sira') continue;
        expect(sonuc.anlatim.length).toBe(q.durum.vaka.dilimler.length);
        expect(sonuc.anlatim[0]!.cevap.soru.tur === 'konum' && sonuc.anlatim[0]!.cevap.soru.dilim).toBe(q.durum.vaka.dilimler.length - 1);
        const yalanVar = sonuc.anlatim.some((a) => ['gomulu-yalan', 'alakasiz-sir'].includes(a.cevap.ifadeTuru));
        if (!yalanVar) { dogruAnlatim++; expect(sonuc.celiskiler).toEqual([]); }
        else { yalanciSayi++; if (sonuc.celiskiler.length > 0) celisenYalanci++; }
        for (const c of sonuc.celiskiler) expect(c.ilk).not.toBe(c.simdi);
      }
    }
    expect(dogruAnlatim).toBeGreaterThan(100);
    expect(celisenYalanci / yalanciSayi).toBeGreaterThan(0.15);
    expect(celisenYalanci / yalanciSayi).toBeLessThan(0.8);
  });

  it('yük altında yalan cevaplarda "artar" ipuçları normalden daha sık', () => {
    const artanlar = new Set(ICERIK.ipuclari.filter((i) => i.betimlemeYonu === 'artar').map((i) => i.id));
    let normalYalan = 0, normalIp = 0, yukYalan = 0, yukIp = 0;
    for (const s of seedler) {
      const q = yeni(s);
      const f = q.durum.vaka.olay.fail;
      if (!f) continue;
      const d = q.durum.vaka.olay.dilim;
      const normal = sor(yeni(s), f, { tur: 'konum', hedef: f, dilim: d });
      if (normal.cevap.ifadeTuru !== 'gomulu-yalan') continue;
      normalYalan++; normalIp += normal.ipuclari.filter((g) => artanlar.has(g.ipucuId)).length;
      const yuk = teknikUygula(q, f, 'bilissel-yuk-ters-sira');
      if (yuk.teknik !== 'bilissel-yuk-ters-sira') continue;
      const a = yuk.anlatim.find((x) => x.cevap.soru.tur === 'konum' && x.cevap.soru.dilim === d)!;
      yukYalan++; yukIp += a.ipuclari.filter((g) => artanlar.has(g.ipucuId)).length;
    }
    expect(normalYalan).toBeGreaterThan(20);
    expect(yukIp / yukYalan).toBeGreaterThan(normalIp / normalYalan);
  });
});

describe('Beklenmedik soru — "o odada başka kim vardı?"', () => {
  it('doğru cevap verenin saydığı herkes gerçekten o odadaydı; gömülü yalancı bazen olmayan kişi sayar', () => {
    let dogruSayim = 0, yalanciSayi = 0, yakalanan = 0;
    for (const s of seedler) {
      const q = yeni(s);
      for (const k of q.durum.vaka.kisiler) {
        if (!k.hayatta) continue;
        const d = q.durum.vaka.olay.dilim;
        const sonuc = teknikUygula(q, k.id, 'beklenmedik-soru', { dilim: d });
        if (sonuc.teknik !== 'beklenmedik-soru') continue;
        const iddia = sonuc.iddiaEdilenOda;
        if (iddia === null) continue;
        const odadakiler = new Set(q.durum.vaka.zamanCizelgesi.filter((z) => z.dilim === d && z.oda === iddia && z.kisi !== k.id).map((z) => z.kisi));
        if (iddia === konum(q, k.id, d)) {
          dogruSayim++;
          for (const ad of sonuc.adiGecenler) expect(odadakiler.has(ad), `${s}: ${k.id} olmayan kişi saydı`).toBe(true);
          expect(sonuc.ifadeTuru).toBe('dogru');
        } else {
          yalanciSayi++;
          if (sonuc.adiGecenler.some((ad) => !odadakiler.has(ad))) { yakalanan++; expect(sonuc.ifadeTuru).toBe('uydurma-yalan'); }
        }
      }
    }
    expect(dogruSayim).toBeGreaterThan(200);
    expect(yalanciSayi).toBeGreaterThan(30);
    expect(yakalanan / yalanciSayi).toBeGreaterThan(0.2);
  });
});

describe('Gizli bilgi testi (CIT)', () => {
  it('sızmış konuda geçersiz; sızmamışsa fail tanır (>%70), bilmeyen masum tanımaz (<%20)', () => {
    let failN = 0, failTanidi = 0, masumN = 0, masumTanidi = 0;
    for (const s of seedler) {
      const q = yeni(s);
      const f = q.durum.vaka.olay.fail;
      if (!f) continue;
      const sonuc = teknikUygula(q, f, 'gizli-bilgi-testi', { konu: 'olay-yontemi' });
      if (sonuc.teknik !== 'gizli-bilgi-testi') continue;
      const sizdi = q.durum.dagilim.medyayaSizanKonular.includes('olay-yontemi');
      expect(sonuc.gecerli).toBe(!sizdi && kimBiliyor(q.durum.dagilim, 'olay-yontemi').every((id) => id === f || id === q.durum.vaka.olay.kurban || q.durum.dagilim.bilgiler.some((b) => b.kisi === id && b.konu === 'olay-yontemi' && b.kaynak === 'gordu')));
      if (sizdi) continue;
      failN++; if (sonuc.tepki === 'tanima') failTanidi++;
      for (const m of masumlar(q)) {
        if (kimBiliyor(q.durum.dagilim, 'olay-yontemi').includes(m.id)) continue;
        const ms = teknikUygula(q, m.id, 'gizli-bilgi-testi', { konu: 'olay-yontemi' });
        if (ms.teknik !== 'gizli-bilgi-testi') continue;
        masumN++; if (ms.tepki === 'tanima') masumTanidi++;
      }
    }
    expect(failN).toBeGreaterThan(30);
    expect(failTanidi / failN).toBeGreaterThan(0.7);
    expect(masumTanidi / masumN).toBeLessThan(0.2);
  });

  it('sızmış konuda medyadan bilen masum da tanıma tepkisi verir (geçersiz test masumu yakar)', () => {
    let n = 0, tanidi = 0;
    for (const s of seedler) {
      const q = yeni(s);
      if (!q.durum.vaka.olay.fail || !q.durum.dagilim.medyayaSizanKonular.includes('olay-yontemi')) continue;
      for (const m of masumlar(q)) {
        const ms = teknikUygula(q, m.id, 'gizli-bilgi-testi', { konu: 'olay-yontemi' });
        if (ms.teknik !== 'gizli-bilgi-testi') continue;
        expect(ms.gecerli).toBe(false);
        n++; if (ms.tepki === 'tanima') tanidi++;
      }
    }
    expect(n).toBeGreaterThan(20);
    expect(tanidi / n).toBeGreaterThan(0.6);
  });
});

describe('Zorunlu iki seçenek (SVT)', () => {
  it('bilip "bilmiyorum" diyen fail çoğunlukla şans altında; gerçekten bilmeyen masum nadiren', () => {
    let failN = 0, failAlti = 0, masumN = 0, masumAlti = 0;
    for (const s of seedler) {
      const q = yeni(s);
      const f = q.durum.vaka.olay.fail;
      if (!f || q.durum.dagilim.medyayaSizanKonular.includes('olay-yontemi')) continue;
      const fs = teknikUygula(q, f, 'zorunlu-iki-secenek', { konu: 'olay-yontemi' });
      if (fs.teknik === 'zorunlu-iki-secenek' && fs.skor !== null) { failN++; expect(fs.n).toBe(12); if (fs.sansAlti) failAlti++; }
      for (const m of masumlar(q)) {
        if (kimBiliyor(q.durum.dagilim, 'olay-yontemi').includes(m.id)) continue;
        const ms = teknikUygula(q, m.id, 'zorunlu-iki-secenek', { konu: 'olay-yontemi' });
        if (ms.teknik === 'zorunlu-iki-secenek' && ms.skor !== null) { masumN++; if (ms.sansAlti) masumAlti++; }
      }
    }
    expect(failN).toBeGreaterThan(30);
    expect(failAlti / failN).toBeGreaterThan(0.7);
    expect(masumAlti / masumN).toBeLessThan(0.15);
  });
});

describe('Şaşkınlık testi', () => {
  it('bilen (fail) bilmeyenden daha az şaşırır', () => {
    let failN = 0, failSasirdi = 0, masumN = 0, masumSasirdi = 0;
    for (const s of seedler) {
      const q = yeni(s);
      const f = q.durum.vaka.olay.fail;
      if (!f) continue;
      const fs = teknikUygula(q, f, 'saskinlik-testi', { konu: 'olay-yontemi' });
      if (fs.teknik === 'saskinlik-testi') { failN++; if (fs.sasirdi) failSasirdi++; }
      for (const m of masumlar(q)) {
        if (kimBiliyor(q.durum.dagilim, 'olay-yontemi').includes(m.id)) continue;
        const ms = teknikUygula(q, m.id, 'saskinlik-testi', { konu: 'olay-yontemi' });
        if (ms.teknik === 'saskinlik-testi') { masumN++; if (ms.sasirdi) masumSasirdi++; }
      }
    }
    expect(failSasirdi / failN).toBeLessThan(masumSasirdi / masumN - 0.3);
  });
});

describe('Yönlendirici soru ve sahte bilgi yemi — kontaminasyon', () => {
  it('telkine yatkın ve bilgisiz tanık öneriyi benimser (sahte anı) ve kontaminasyon kaydı düşer; bilgili tanık etkilenmez', () => {
    let benimsedi = 0, etkilenmedi = 0;
    for (const s of seedler) {
      const q = yeni(s);
      for (const k of masumlar(q)) {
        const hedef = q.durum.vaka.kisiler.find((x) => x.id !== k.id && x.hayatta)!;
        const d = 3;
        const bilgi = q.durum.dagilim.bilgiler.find((b) => b.kisi === k.id && b.konu === 'konum' && b.hedefKisi === hedef.id && b.hedefDilim === d);
        // Koruyan kişi bilgisiz olsa da öneriyi değil koruma yalanını söyler; bu test onu kapsamaz.
        if (q.durum.sirKatmani.korumalar.some((c) => c.koruyan === k.id && c.korunan === hedef.id)) continue;
        const oneri = q.durum.vaka.mekan.odalar[1]!.id;
        const once = q.kontaminasyon.length;
        const sonuc = teknikUygula(q, k.id, 'yonlendirici-soru', { dilim: d, hedef: hedef.id, onerilenOda: oneri });
        if (sonuc.teknik !== 'yonlendirici-soru') continue;
        if (!bilgi && k.kisilik.telkineYatkinlik > 0.65) {
          benimsedi++;
          expect(sonuc.kontamineOldu).toBe(true);
          expect(sonuc.sonuc.cevap.icerik).toBe(oneri);
          expect(sonuc.sonuc.cevap.ifadeTuru).toBe('sahte-ani');
          expect(q.kontaminasyon.length).toBe(once + 1);
        } else if (bilgi && bilgi.kaynak === 'gordu') {
          etkilenmedi++;
          expect(sonuc.kontamineOldu).toBe(false);
          expect(sonuc.sonuc.cevap.icerik).toBe(bilgi.icerik);
        }
      }
    }
    expect(benimsedi).toBeGreaterThan(20);
    expect(etkilenmedi).toBeGreaterThan(20);
  });

  it('sahte bilgi yemi: telkine yatkın masum onaylayabilir (sahte anı), düşük telkinli masum reddeder; fail bazen uydurur', () => {
    let yatkinOnay = 0, yatkinN = 0, dusukN = 0, failOnay = 0, failN = 0;
    for (const s of seedler) {
      const q = yeni(s);
      for (const k of q.durum.vaka.kisiler) {
        if (!k.hayatta || k.id === q.durum.vaka.olay.kurban) continue;
        const sonuc = teknikUygula(q, k.id, 'sahte-bilgi-yemi', { uydurmaAd: 'Cemil Aktaş' });
        if (sonuc.teknik !== 'sahte-bilgi-yemi') continue;
        if (k.id === q.durum.vaka.olay.fail) { failN++; if (sonuc.onayladi) { failOnay++; expect(sonuc.ifadeTuru).toBe('uydurma-yalan'); } }
        else if (k.kisilik.telkineYatkinlik > 0.65) { yatkinN++; if (sonuc.onayladi) { yatkinOnay++; expect(sonuc.ifadeTuru).toBe('sahte-ani'); } }
        else if (k.kisilik.telkineYatkinlik < 0.4) { dusukN++; expect(sonuc.onayladi).toBe(false); expect(sonuc.ifadeTuru).toBe('dogru'); }
      }
    }
    expect(yatkinOnay / yatkinN).toBeGreaterThan(0.5);
    expect(dusukN).toBeGreaterThan(50);
    expect(failOnay / failN).toBeGreaterThan(0.1);
    expect(failOnay / failN).toBeLessThan(0.6);
  });
});

describe('Suçlayıcı ton', () => {
  it('stres birikir; masumun doğru cevabında bile gerginlik ipuçları artar (Othello); telkine yatkın masum sahte itiraf verebilir', () => {
    let sakinGergin = 0, sakinN = 0, stresliGergin = 0, stresliN = 0, sahteItiraf = 0;
    for (const s of seedler) {
      const q = yeni(s);
      for (const k of masumlar(q)) {
        if (q.durum.sirKatmani.sirlar.some((x) => x.kisi === k.id)) continue;
        const soru = { tur: 'konum' as const, hedef: k.id, dilim: 0 };
        const once = sor(yeni(s), k.id, soru);
        sakinN++; if (once.ipuclari.some((g) => g.ipucuId === 'genel-gerginlik')) sakinGergin++;
        const t1 = teknikUygula(q, k.id, 'suclayici-ton');
        const t2 = teknikUygula(q, k.id, 'suclayici-ton');
        if (t1.teknik === 'suclayici-ton' && t2.teknik === 'suclayici-ton') {
          expect(t2.stres).toBeGreaterThan(t1.stres);
          if (t2.sahteItiraf) {
            sahteItiraf++;
            expect(k.kisilik.telkineYatkinlik).toBeGreaterThan(0.7);
            const itiraf = sor(q, k.id, { tur: 'olay-bilgisi', konu: 'fail-kimligi' });
            expect(itiraf.cevap.ifadeTuru).toBe('sahte-itiraf');
            expect(itiraf.cevap.icerik).toBe(k.id);
            expect(itiraf.cevap.dogru).toBe(false);
          }
        }
        const sonra = sor(q, k.id, soru);
        expect(sonra.cevap.icerik).toBe(once.cevap.icerik); // cevap değişmez, davranış değişir
        stresliN++; if (sonra.ipuclari.some((g) => g.ipucuId === 'genel-gerginlik')) stresliGergin++;
      }
    }
    expect(stresliGergin / stresliN).toBeGreaterThan(sakinGergin / sakinN + 0.1);
    expect(sahteItiraf).toBeGreaterThan(3);
  });
});

describe('Diğer araçlar', () => {
  it('temel çizgi: tarafsız sorulardan gözlemler döner; şeytanın avukatı v0\'da uygulanamaz', () => {
    const q = yeni('diger');
    const k = masumlar(q)[0]!.id;
    const tc = teknikUygula(q, k, 'temel-cizgi');
    if (tc.teknik === 'temel-cizgi') expect(tc.gozlemler.length).toBeGreaterThanOrEqual(0);
    const sa = teknikUygula(q, k, 'seytanin-avukati');
    if (sa.teknik === 'seytanin-avukati') expect(sa.uygulanamaz).toBe(true);
    const au = teknikUygula(q, k, 'acik-uclu-anlatim');
    if (au.teknik === 'acik-uclu-anlatim') expect(au.anlatim.length).toBe(q.durum.vaka.dilimler.length);
  });
});
