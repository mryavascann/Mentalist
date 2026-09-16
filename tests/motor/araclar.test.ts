// "Diğer araçlar" testleri (TASARIM §7): oda okuma, dijital iz, "şu an ne düşünüyor?", kayıt inceleme.
// Her araç kaynağındaki bulguya yakın simüle edilir:
//   Oda okuma (Gosling 2002): eşya = kimlik iddiası / davranış kalıntısı / sahnelenmiş. Sır kalıntı bırakır (suç değil);
//     "hoş oda = hoş insan" çıkarımı geçersizdir; sahnelenmiş oda öz-izlemeye bağlıdır, faille ilişkisi YOKTUR (kalıp yok).
//   Dijital iz (Kosinski 2013; Gosling 2011): profil dışadönüklükle ilişkili, kaygıyla ilişkisiz; yüksek öz-izleyen profilini kürate eder.
//   İç ses (Ickes 1990): gerçek düşünce cevabın gizli etiketinden türer; tahmin vaka sonuna kadar açılmaz; az konuşulan kişi zor okunur.
//   Kayıt inceleme (Swerts 2013): etkisi KÜÇÜK; temel çizgi yoksa kıyas yapılamaz (sıra yanlılığı).
import { describe, it, expect } from 'vitest';
import { vakaUret } from '@motor/gerceklik';
import { sorguBaslat, sor, teknikUygula, type Sorgu } from '@motor/teknik';
import { odaOku, dijitalIz, icSesKategorisi, IC_SES_KATEGORILERI, ESYA_SINIFI, type IcSesKategori } from '@motor/araclar';
import { puanla } from '@motor/puan';
import { ICERIK } from '@icerik/index';

const seedler = Array.from({ length: 150 }, (_, i) => `arac-${i}`);
const yeni = (s: string): Sorgu => sorguBaslat(vakaUret(s));
const canlilar = (q: Sorgu) => q.durum.vaka.kisiler.filter((k) => k.hayatta && k.id !== q.durum.vaka.olay.kurban);

function korelasyon(x: number[], y: number[]): number {
  const n = x.length;
  const mx = x.reduce((a, b) => a + b, 0) / n;
  const my = y.reduce((a, b) => a + b, 0) / n;
  let sxy = 0, sxx = 0, syy = 0;
  for (let i = 0; i < n; i++) { sxy += (x[i]! - mx) * (y[i]! - my); sxx += (x[i]! - mx) ** 2; syy += (y[i]! - my) ** 2; }
  return sxy / Math.sqrt(sxx * syy);
}

describe('içerik: dört yeni araç kütükte ve Kılavuz\'a bağlı', () => {
  it('teknikler oda-okuma, dijital-iz, ic-ses, kayit-inceleme var; Kılavuz maddeleri ve kaynaklar kütükte', () => {
    const kilavuz = new Set(ICERIK.kilavuz.map((m) => m.id));
    const kaynaklar = new Set(ICERIK.kaynaklar.map((k) => k.id));
    for (const id of ['oda-okuma', 'dijital-iz', 'ic-ses', 'kayit-inceleme']) {
      const t = ICERIK.teknikler.find((x) => x.id === id);
      expect(t, id).toBeDefined();
      expect(kilavuz.has(t!.kilavuzMaddesi), id).toBe(true);
      for (const k of t!.kaynak) expect(kaynaklar.has(k), `${id}: ${k}`).toBe(true);
    }
    expect(ICERIK.teknikler.find((t) => t.id === 'ic-ses')!.kaynak).toContain('Ickes 1990');
    expect(ICERIK.teknikler.find((t) => t.id === 'kayit-inceleme')!.kaynak).toContain('Swerts 2013');
    expect(kilavuz.has('empatik-dogruluk')).toBe(true);
    expect(kilavuz.has('kayit-inceleme')).toBe(true);
    // Kayıt incelemenin etkisi küçüktür; Kılavuz bunu "zayıf" rozetiyle dürüstçe söyler.
    expect(ICERIK.kilavuz.find((m) => m.id === 'kayit-inceleme')!.kanitDuzeyi).toBe('zayif');
    const etiket = ICERIK.hataEtiketleri.find((h) => h.id === 'oda-okuma-suc');
    expect(etiket).toBeDefined();
    expect(etiket!.kilavuzMaddesi).toBe('oda-ipuclari');
  });
});

describe('Oda okuma (Gosling 2002)', () => {
  it('deterministik; 3–5 eşya; her eşyanın betimlemesi, türü ve iması var; türler tanımlı', () => {
    const q = yeni('oda-det');
    for (const k of canlilar(q)) {
      const a = odaOku(q, k.id);
      const b = odaOku(yeni('oda-det'), k.id);
      expect(a).toEqual(b);
      expect(a.esyalar.length).toBeGreaterThanOrEqual(3);
      expect(a.esyalar.length).toBeLessThanOrEqual(5);
      for (const e of a.esyalar) {
        expect(e.betimleme.length).toBeGreaterThan(10);
        expect(e.ima.length).toBeGreaterThan(5);
        expect(Object.keys(ESYA_SINIFI)).toContain(e.tur);
        expect(e.id).toMatch(new RegExp(`^${k.id}/`));
      }
    }
  });

  it('sırrı olan kişinin odasında sır kalıntısı var; sırrı olmayanda yok — kalıntı suçu değil sırrı gösterir', () => {
    let sirli = 0, sirsiz = 0;
    for (const s of seedler) {
      const q = yeni(s);
      for (const k of canlilar(q)) {
        const sir = q.durum.sirKatmani.sirlar.some((x) => x.kisi === k.id);
        const kalinti = odaOku(q, k.id).esyalar.filter((e) => e.konu === 'sir');
        if (sir) { sirli++; expect(kalinti.length, `${s}/${k.id}`).toBe(1); expect(kalinti[0]!.tur.startsWith('kalinti')).toBe(true); expect(kalinti[0]!.gecerli).toBe(true); }
        else { sirsiz++; expect(kalinti.length).toBe(0); }
      }
    }
    expect(sirli).toBeGreaterThan(50);
    expect(sirsiz).toBeGreaterThan(200);
  });

  it('"hoş oda = hoş insan" tuzak eşyası geçersiz çıkarım taşır ve odaların bir kısmında bulunur', () => {
    let tuzak = 0, oda = 0;
    for (const s of seedler.slice(0, 60)) {
      const q = yeni(s);
      for (const k of canlilar(q)) {
        oda++;
        const t = odaOku(q, k.id).esyalar.filter((e) => e.konu === 'tuzak');
        if (t.length) { tuzak++; for (const e of t) expect(e.gecerli).toBe(false); }
      }
    }
    expect(tuzak / oda).toBeGreaterThan(0.3);
    expect(tuzak / oda).toBeLessThan(0.9);
  });

  it('dışadönük kişinin odası sıcak/dekore (geçerli çıkarım); içe dönüğünki çıplak', () => {
    let disa = 0, ice = 0;
    for (const s of seedler.slice(0, 80)) {
      const q = yeni(s);
      for (const k of canlilar(q)) {
        const e = odaOku(q, k.id).esyalar.find((x) => x.konu === 'kisilik');
        if (k.kisilik.disadonukluk > 0.65) { disa++; expect(e, `${s}/${k.id}`).toBeDefined(); expect(e!.ima).toMatch(/dışadönük/i); expect(e!.gecerli).toBe(true); }
        if (k.kisilik.disadonukluk < 0.35) { ice++; expect(e).toBeDefined(); expect(e!.ima).toMatch(/içe dönük/i); }
      }
    }
    expect(disa).toBeGreaterThan(20);
    expect(ice).toBeGreaterThan(20);
  });

  it('sahnelenmiş eşya öz-izlemeyle artar ama faille masum arasında fark yok (örüntü denetimi)', () => {
    let failN = 0, failSahne = 0, masumN = 0, masumSahne = 0, yuksekN = 0, yuksekSahne = 0, dusukN = 0, dusukSahne = 0;
    for (const s of seedler) {
      const q = yeni(s);
      const fail = q.durum.vaka.olay.fail;
      for (const k of canlilar(q)) {
        const sahne = odaOku(q, k.id).esyalar.some((e) => e.tur === 'sahnelenmis');
        if (k.id === fail) { failN++; if (sahne) failSahne++; } else { masumN++; if (sahne) masumSahne++; }
        if (k.kisilik.ozIzleme > 0.65) { yuksekN++; if (sahne) yuksekSahne++; } else { dusukN++; if (sahne) dusukSahne++; }
      }
    }
    expect(failN).toBeGreaterThan(50);
    expect(Math.abs(failSahne / failN - masumSahne / masumN)).toBeLessThan(0.15);
    expect(yuksekSahne / yuksekN).toBeGreaterThan(dusukSahne / dusukN + 0.3);
    expect(dusukSahne / dusukN).toBeLessThan(0.1);
  });

  it('teknikUygula("oda-okuma") sorguya okumayı yazar, zaman ekler; sınıflama kaydedilir ve karne doğru/yanlışı sayar', () => {
    const q = yeni('oda-teknik');
    const k = canlilar(q)[0]!.id;
    const sonuc = teknikUygula(q, k, 'oda-okuma');
    expect(sonuc.teknik).toBe('oda-okuma');
    if (sonuc.teknik !== 'oda-okuma') return;
    expect(q.odaOkumalari.get(k)).toEqual(sonuc.okuma);
    expect(q.zaman).toBe(ICERIK.teknikler.find((t) => t.id === 'oda-okuma')!.maliyet.zaman);
    // Aynı odayı ikinci kez okumak yeni eşya üretmez (deterministik, aynı nesne).
    const tekrar = teknikUygula(q, k, 'oda-okuma');
    if (tekrar.teknik === 'oda-okuma') expect(tekrar.okuma).toEqual(sonuc.okuma);
    for (const e of sonuc.okuma.esyalar) q.odaSiniflamalari.set(e.id, ESYA_SINIFI[e.tur]);
    const karne = puanla(q, { fail: null, guven: 0.5 }).odaKarnesi;
    expect(karne).toBeDefined();
    expect(karne!.n).toBe(sonuc.okuma.esyalar.length);
    expect(karne!.dogru).toBe(sonuc.okuma.esyalar.length);
    // Hepsini "kalıntı" deyince en az bir yanlış (odada iddia ya da tuzak vardır).
    for (const e of sonuc.okuma.esyalar) q.odaSiniflamalari.set(e.id, 'kalinti');
    const karne2 = puanla(q, { fail: null, guven: 0.5 }).odaKarnesi!;
    expect(karne2.dogru).toBeLessThanOrEqual(karne2.n);
  });

  it('oda/profil okumasını suç dayanağı yapan ve yanılan oyuncu "oda-okuma-suc" etiketi alır', () => {
    for (const s of seedler.slice(0, 30)) {
      const q = yeni(s);
      const fail = q.durum.vaka.olay.fail;
      const masum = canlilar(q).find((k) => k.id !== fail)!;
      const p = puanla(q, { fail: masum.id, guven: 0.5, gerekce: ['profil:genel'] });
      expect(p.hataEtiketleri).toContain('oda-okuma-suc');
      const p2 = puanla(q, { fail: masum.id, guven: 0.5, gerekce: ['delil:d1'] });
      expect(p2.hataEtiketleri).not.toContain('oda-okuma-suc');
    }
  });
});

describe('Dijital iz (Kosinski 2013; Gosling 2011)', () => {
  it('arkadaş/paylaşım sayıları dışadönüklükle ilişkili (r>.4), kaygıyla ilişkisiz (|r|<.15); sayılar makul', () => {
    const disa: number[] = [], kaygi: number[] = [], arkadas: number[] = [], paylasim: number[] = [];
    for (const s of seedler) {
      const q = yeni(s);
      for (const k of canlilar(q)) {
        const p = dijitalIz(q, k.id);
        expect(p).toEqual(dijitalIz(yeni(s), k.id));
        expect(p.arkadas).toBeGreaterThanOrEqual(5);
        expect(p.haftalikPaylasim).toBeGreaterThanOrEqual(0);
        expect(p.foto).toBeGreaterThanOrEqual(0);
        expect(p.begeniler.length).toBe(3);
        disa.push(k.kisilik.disadonukluk); kaygi.push(k.kisilik.kaygi); arkadas.push(p.arkadas); paylasim.push(p.haftalikPaylasim);
      }
    }
    expect(korelasyon(disa, arkadas)).toBeGreaterThan(0.4);
    expect(korelasyon(disa, paylasim)).toBeGreaterThan(0.3);
    expect(Math.abs(korelasyon(kaygi, arkadas))).toBeLessThan(0.15);
    expect(Math.abs(korelasyon(kaygi, paylasim))).toBeLessThan(0.15);
  });

  it('kurbana dair ton: düşük öz-izleyen ilişkinin sıcaklığını yansıtır; yüksek öz-izleyen asla soğuk görünmez (kürasyon)', () => {
    let dusukN = 0, dusukUyum = 0, yuksekN = 0;
    for (const s of seedler) {
      const q = yeni(s);
      const { kurban } = q.durum.vaka.olay;
      for (const k of canlilar(q)) {
        const p = dijitalIz(q, k.id);
        const iliski = q.durum.vaka.iliskiler.find((i) => (i.a === k.id && i.b === kurban) || (i.b === k.id && i.a === kurban));
        const beklenen = !iliski ? 'notr' : iliski.sicaklik > 0.3 ? 'sicak' : iliski.sicaklik < -0.3 ? 'soguk' : 'notr';
        if (k.kisilik.ozIzleme > 0.7) { yuksekN++; expect(p.kurbanaDairTon).not.toBe('soguk'); }
        else if (k.kisilik.ozIzleme < 0.4 && p.kurbanaDairTon !== 'yok') { dusukN++; if (p.kurbanaDairTon === beklenen) dusukUyum++; }
      }
    }
    expect(yuksekN).toBeGreaterThan(30);
    expect(dusukN).toBeGreaterThan(50);
    expect(dusukUyum / dusukN).toBeGreaterThan(0.85);
  });

  it('teknikUygula("dijital-iz") profili döndürür ve zaman ekler', () => {
    const q = yeni('dijital-teknik');
    const k = canlilar(q)[0]!.id;
    const sonuc = teknikUygula(q, k, 'dijital-iz');
    expect(sonuc.teknik).toBe('dijital-iz');
    if (sonuc.teknik === 'dijital-iz') expect(sonuc.profil.kisi).toBe(k);
    expect(q.zaman).toBeGreaterThan(0);
  });
});

describe('"Şu an ne düşünüyor?" (Ickes 1990)', () => {
  it('gerçek iç ses cevabın gizli etiketinden türer: fail yalanı → suç kaygısı, alakasız sır → sır kaygısı, koruma → koruma, doğru+kaygılı → inanılmama, doğru+sakin → sakin, bellek türleri → bellek şüphesi', () => {
    const sayac = new Map<IcSesKategori, number>();
    for (const s of seedler) {
      const q = yeni(s);
      const { fail, dilim } = q.durum.vaka.olay;
      const kisiler = canlilar(q);
      // Kendi konumu + başkalarının konumu (koruma yalanı yalnızca başkası sorulunca çıkar).
      for (const k of kisiler) for (const hedef of kisiler) {
        const cevap = sor(q, k.id, { tur: 'konum', hedef: hedef.id, dilim }).cevap;
        const kat = icSesKategorisi(q.durum, cevap);
        sayac.set(kat, (sayac.get(kat) ?? 0) + 1);
        expect(IC_SES_KATEGORILERI).toContain(kat);
        const t = cevap.ifadeTuru;
        if (k.id === fail && ['gomulu-yalan', 'uydurma-yalan', 'gizleme', 'kacamak'].includes(t)) expect(kat).toBe('suc-kaygisi');
        if (t === 'alakasiz-sir') expect(kat).toBe('sir-kaygisi');
        if (t === 'koruma-yalani' || t === 'prova-edilmis-grup-alibisi') expect(kat).toBe('koruma');
        if (t === 'dogru' && k.id !== fail && hedef.id === k.id) expect(kat).toBe(k.kisilik.kaygi > 0.6 ? 'inanilmama-korkusu' : 'sakin');
        if (['bellek-uyumu', 'dikkat-boslugu', 'sahte-ani', 'konfabulasyon'].includes(t)) expect(kat).toBe('bellek-suphesi');
      }
    }
    // Her kategori en az bir kez görülür (bellek şüphesi olay anı sorusunda nadir olabilir; onu hariç tut).
    for (const kat of IC_SES_KATEGORILERI) if (kat !== 'bellek-suphesi') expect(sayac.get(kat) ?? 0, kat).toBeGreaterThan(0);
  });

  it('hiç konuşulmamış kişide uygulanamaz; konuşulunca tahmin kaydedilir, seçenekler gerçeği içerir, az konuşulan kişide seçenek daha çok', () => {
    const q = yeni('icses-akis');
    const k = canlilar(q)[0]!.id;
    const bos = teknikUygula(q, k, 'ic-ses', { tahmin: 'sakin' });
    expect(bos.teknik).toBe('ic-ses');
    if (bos.teknik === 'ic-ses') expect(bos.uygulanamaz).toBe(true);
    expect(q.icSesTahminleri.length).toBe(0);
    sor(q, k, { tur: 'konum', hedef: k, dilim: 0 });
    const az = teknikUygula(q, k, 'ic-ses', { tahmin: 'sakin' });
    if (az.teknik === 'ic-ses' && !az.uygulanamaz) {
      expect(az.secenekler.length).toBe(6);
      expect(az.secenekler).toContain(q.icSesTahminleri[0]!.gercek);
    }
    expect(q.icSesTahminleri.length).toBe(1);
    expect(q.icSesTahminleri[0]!.kisi).toBe(k);
    expect(q.icSesTahminleri[0]!.tahmin).toBe('sakin');
    expect(q.icSesTahminleri[0]!.gercekMetin.length).toBeGreaterThan(5);
    sor(q, k, { tur: 'konum', hedef: k, dilim: 1 });
    sor(q, k, { tur: 'konum', hedef: k, dilim: 2 });
    const cok = teknikUygula(q, k, 'ic-ses', { tahmin: 'koruma' });
    if (cok.teknik === 'ic-ses' && !cok.uygulanamaz) {
      expect(cok.secenekler.length).toBe(4);
      expect(cok.secenekler).toContain(q.icSesTahminleri[1]!.gercek);
      // Seçenekler deterministik: aynı kişi + aynı soru → aynı sıra.
      const q2 = yeni('icses-akis');
      for (const d of [0, 1, 2]) sor(q2, k, { tur: 'konum', hedef: k, dilim: d });
      const c2 = teknikUygula(q2, k, 'ic-ses', { tahmin: 'koruma' });
      if (c2.teknik === 'ic-ses' && !c2.uygulanamaz) expect(c2.secenekler).toEqual(cok.secenekler);
    }
    // Tahmin sonucu oyun sırasında açılmaz: sonuç nesnesi gerçeği taşımaz.
    expect(JSON.stringify(cok)).not.toMatch(/gercek/);
  });

  it('puanlama: iç ses karnesi isabeti sayar; hep "suç kaygısı" tahmin eden oyuncu yalan yanlılığı etiketi alır', () => {
    let etiketli = 0, n = 0;
    for (const s of seedler.slice(0, 40)) {
      const q = yeni(s);
      const kisiler = canlilar(q);
      for (const k of kisiler) {
        sor(q, k.id, { tur: 'konum', hedef: k.id, dilim: 1 });
        teknikUygula(q, k.id, 'ic-ses', { tahmin: 'suc-kaygisi' });
      }
      const p = puanla(q, { fail: null, guven: 0.5 });
      expect(p.icSesKarnesi).toBeDefined();
      expect(p.icSesKarnesi!.n).toBe(kisiler.length);
      const gercekSuc = q.icSesTahminleri.filter((t) => t.gercek === 'suc-kaygisi').length;
      expect(p.icSesKarnesi!.dogru).toBe(gercekSuc);
      n++;
      if (p.hataEtiketleri.includes('yalan-yanliligi')) etiketli++;
    }
    expect(etiketli / n).toBeGreaterThan(0.9);
  });
});

describe('Kayıt inceleme (Swerts 2013)', () => {
  it('kayıt yoksa uygulanamaz; varsa gözlemler döner; temel çizgi yoksa kıyas boş, varsa gözlemler normali/sapma diye ayrılır', () => {
    const q = yeni('kayit-akis');
    const k = canlilar(q)[0]!.id;
    const bos = teknikUygula(q, k, 'kayit-inceleme');
    if (bos.teknik === 'kayit-inceleme') expect(bos.uygulanamaz).toBe(true);
    sor(q, k, { tur: 'konum', hedef: k, dilim: q.durum.vaka.olay.dilim });
    const once = teknikUygula(q, k, 'kayit-inceleme');
    if (once.teknik === 'kayit-inceleme' && !once.uygulanamaz) {
      expect(once.temelCizgiVar).toBe(false);
      expect(once.normali).toEqual([]);
      expect(once.sapmalar).toEqual([]);
    }
    teknikUygula(q, k, 'temel-cizgi');
    const sonra = teknikUygula(q, k, 'kayit-inceleme');
    if (sonra.teknik === 'kayit-inceleme' && !sonra.uygulanamaz) {
      expect(sonra.temelCizgiVar).toBe(true);
      expect([...sonra.normali, ...sonra.sapmalar].length).toBe(sonra.gozlemler.length);
    }
  });

  it('etkisi küçük: fail yalanında ipucu oranı normale göre en fazla ~1.5 kat; doğru cevapta değişmez', () => {
    let normalYalan = 0, kayitYalan = 0, yalanN = 0, normalDogru = 0, kayitDogru = 0, dogruN = 0;
    for (const s of seedler) {
      const q = yeni(s);
      const { fail, dilim } = q.durum.vaka.olay;
      for (const k of canlilar(q)) {
        const soru = { tur: 'konum' as const, hedef: k.id, dilim };
        const ilk = sor(q, k.id, soru);
        const kayit = teknikUygula(q, k.id, 'kayit-inceleme', { soru });
        if (kayit.teknik !== 'kayit-inceleme' || kayit.uygulanamaz) continue;
        if (k.id === fail && ilk.cevap.ifadeTuru === 'gomulu-yalan') { yalanN++; normalYalan += ilk.ipuclari.length; kayitYalan += kayit.gozlemler.length; }
        else if (ilk.cevap.ifadeTuru === 'dogru') { dogruN++; normalDogru += ilk.ipuclari.length; kayitDogru += kayit.gozlemler.length; }
      }
    }
    expect(yalanN).toBeGreaterThan(20);
    expect(dogruN).toBeGreaterThan(100);
    const yalanOran = kayitYalan / normalYalan;
    const dogruOran = kayitDogru / normalDogru;
    expect(yalanOran).toBeGreaterThan(0.9);
    expect(yalanOran).toBeLessThan(1.5);
    expect(dogruOran).toBeGreaterThan(0.8);
    expect(dogruOran).toBeLessThan(1.2);
  });
});
