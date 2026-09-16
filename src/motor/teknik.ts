// Teknik motoru: oyuncunun araçları (src/icerik/teknikler.json) motor üstünde nasıl çalışır?
//
// Sorgu nesnesi bir vakanın "oyun içi" durumunu taşır: hangi delil kime gösterildi, hangi tanık
// hangi ayrıntıyla kirletildi, kimde ne kadar stres birikti, kaç soruşturma saati harcandı.
// Her teknik kaynağındaki bulguya yakın simüle edilir; bulgu ve sınırlar Kılavuz maddesinde anlatılır.
//
// Metin üretilmez: yapısal sonuçlar döner (K-009). Arayüz bunları şablonlarla giydirir.
import { Rastgele } from '@ortak/rastgele';
import { ICERIK } from '@icerik/index';
import { citGecerliMi, kimBiliyor, type BilgiKonusu } from './bilgi';
import { celisenDeliller, delilUret, type Delil } from './delil';
import { ipucuUret, YALAN_IFADE_TURLERI, type IpucuGozlemi } from './ipucu';
import { cevapla, soruAnahtari, vakaDurumuKur, type Cevap, type Soru, type VakaDurumu } from './strateji';
import { dijitalIz, icSesTahminEt, kayitIncele, odaOku, type DijitalProfil, type EsyaSinifi, type IcSesKategori, type IcSesSonucu, type IcSesTahmini, type KayitSonucu, type OdaOkumasi } from './araclar';
import type { KisiId, OdaId, Vaka } from './tipler';

export interface SorSonucu {
  cevap: Cevap;
  ipuclari: IpucuGozlemi[];
  /** Kişinin kendi konum iddiasıyla çelişen deliller (oyuncu görsün görmesin; arayüz süzer). */
  celisenDeliller: Delil[];
  /** Bu soru bu kişiye kaçıncı kez soruldu (1 = ilk). */
  tekrar: number;
}

/**
 * Tekrar sorulan soruda yalan kaymasının çarpanı (Swerts 2013: ikinci yalan denemesi daha çok ipucu verir,
 * %53 → %62; DePaulo: kasıtlı çaba ele verir). Küçük tutulur; doğru cevapta kayma zaten sıfırdır.
 */
export const TEKRAR_CARPANI = 1.2;

export interface KontaminasyonKaydi {
  kisi: KisiId;
  ayrinti: string;
  kaynak: 'oyuncu';
  teknik: string;
}

export interface Sorgu {
  durum: VakaDurumu;
  deliller: Delil[];
  /** Kişiye gösterilmiş delil idleri (SUE sırası için). */
  gosterilen: Map<KisiId, Set<string>>;
  kontaminasyon: KontaminasyonKaydi[];
  /** Suçlayıcı tonla biriken stres (0–2). */
  stres: Map<KisiId, number>;
  /** Harcanan soruşturma saati. */
  zaman: number;
  gecmis: { kisi: KisiId; teknik: string; ozet: string }[];
  /** Oda okuma (araclar.ts): kişi → okunan eşyalar; gizli türler vaka sonunda açılır. */
  odaOkumalari: Map<KisiId, OdaOkumasi>;
  /** Oyuncunun eşya sınıflamaları: eşya id → iddia / kalıntı / sahnelenmiş. */
  odaSiniflamalari: Map<string, EsyaSinifi>;
  /** "Şu an ne düşünüyor?" tahminleri; gerçek kategori burada durur ama arayüz vaka sonuna kadar göstermez. */
  icSesTahminleri: IcSesTahmini[];
  /** `${kisi}|${soruAnahtari}` → kaç kez soruldu ("ikinci kez sor" mekaniği). */
  soruSayaci: Map<string, number>;
}

export interface TeknikParametreleri {
  dilim?: number;
  hedef?: KisiId;
  delilId?: string;
  konu?: 'olay-yontemi' | 'fail-kimligi';
  onerilenOda?: OdaId;
  uydurmaAd?: string;
  /** İç ses / kayıt inceleme: hangi cevabın kaydı; verilmezse kişiye verilen son cevap. */
  soru?: Soru;
  /** İç ses: oyuncunun tahmini. */
  tahmin?: IcSesKategori;
}

export type TeknikSonucu =
  | { teknik: 'temel-cizgi'; gozlemler: IpucuGozlemi[] }
  | { teknik: 'acik-uclu-anlatim'; anlatim: SorSonucu[] }
  | { teknik: 'yonlendirici-soru'; sonuc: SorSonucu; kontamineOldu: boolean }
  | { teknik: 'sue'; once: SorSonucu; delil: Delil; celiski: boolean; erkenGosterildi: boolean }
  | { teknik: 'bilissel-yuk-ters-sira'; anlatim: SorSonucu[]; celiskiler: { dilim: number; ilk: string | null; simdi: string | null }[] }
  | { teknik: 'beklenmedik-soru'; dilim: number; iddiaEdilenOda: OdaId | null; adiGecenler: KisiId[]; ifadeTuru: string }
  | { teknik: 'gizli-bilgi-testi'; konu: BilgiKonusu; gecerli: boolean; tepki: 'tanima' | 'yok' }
  | { teknik: 'zorunlu-iki-secenek'; konu: BilgiKonusu; skor: number | null; n: number; sansAlti: boolean }
  | { teknik: 'saskinlik-testi'; konu: BilgiKonusu; sasirdi: boolean }
  | { teknik: 'sahte-bilgi-yemi'; uydurmaAd: string; onayladi: boolean; ifadeTuru: string }
  | { teknik: 'seytanin-avukati'; uygulanamaz: true; neden: string }
  | { teknik: 'suclayici-ton'; stres: number; sahteItiraf: boolean; itiraf: boolean }
  | { teknik: 'oda-okuma'; okuma: OdaOkumasi }
  | { teknik: 'dijital-iz'; profil: DijitalProfil }
  | IcSesSonucu
  | KayitSonucu;

const SVT_SORU_SAYISI = 12;
const SVT_SANS_ALTI_ESIGI = 3;
const YUK_CARPANI = 1.6;
const STRES_ADIMI = 0.5;
const STRES_TAVANI = 2;

export function sorguBaslat(vaka: Vaka): Sorgu {
  const durum = vakaDurumuKur(vaka);
  return { durum, deliller: delilUret(vaka, durum.dagilim), gosterilen: new Map(), kontaminasyon: [], stres: new Map(), zaman: 0, gecmis: [], odaOkumalari: new Map(), odaSiniflamalari: new Map(), icSesTahminleri: [], soruSayaci: new Map() };
}

function rng(sorgu: Sorgu, kisi: KisiId, etiket: string): Rastgele {
  return new Rastgele(`${sorgu.durum.vaka.seed}/teknik/${kisi}/${etiket}`);
}

function kisiKaydi(sorgu: Sorgu, kisi: KisiId) {
  return sorgu.durum.vaka.kisiler.find((k) => k.id === kisi)!;
}

/** Bir kişiye delil göstermek: sonraki cevaplar delile uyarlanır (erken gösterme = SUE hatası). */
export function delilGoster(sorgu: Sorgu, kisi: KisiId, delilId: string): void {
  if (!sorgu.gosterilen.has(kisi)) sorgu.gosterilen.set(kisi, new Set());
  sorgu.gosterilen.get(kisi)!.add(delilId);
}

function gosterilmisKonumDelili(sorgu: Sorgu, kisi: KisiId, dilim: number): Delil | undefined {
  const idler = sorgu.gosterilen.get(kisi);
  if (!idler) return undefined;
  return sorgu.deliller.find((d) => idler.has(d.id) && d.gosterir.tur === 'konum' && d.gosterir.kisi === kisi && d.gosterir.dilim === dilim);
}

/**
 * Soru sormak. Strateji katmanının cevabını alır; kişiye daha önce o dilim için delil gösterildiyse ve
 * doğal cevabı yalan olacaksa, hikâyesini delile uydurur (kaçamak). Defterdeki eski cevap varsa o kalır.
 * Aynı soru ikinci kez sorulunca cevap aynı kalır ama gözlemler yeni bir akışla (`tekrarN`) çekilir ve
 * yalan kayması TEKRAR_CARPANI ile büyür (teknik etiketi verilmişse o akış korunur).
 */
export function sor(sorgu: Sorgu, kisi: KisiId, soru: Soru, secenekler: { kaymaCarpani?: number; etiket?: string } = {}): SorSonucu {
  const { durum } = sorgu;
  const anahtar = `${kisi}|${soruAnahtari(soru)}`;
  const tekrar = (sorgu.soruSayaci.get(anahtar) ?? 0) + 1;
  sorgu.soruSayaci.set(anahtar, tekrar);
  const tekrarMi = tekrar > 1 && !secenekler.etiket;
  let cevap: Cevap;
  if (durum.defter.has(anahtar)) {
    cevap = durum.defter.get(anahtar)!;
  } else {
    cevap = cevapla(durum, kisi, soru);
    if (soru.tur === 'konum' && soru.hedef === kisi && YALAN_IFADE_TURLERI.has(cevap.ifadeTuru)) {
      const delil = gosterilmisKonumDelili(sorgu, kisi, soru.dilim);
      if (delil && delil.gosterir.tur === 'konum') {
        cevap = { ...cevap, ifadeTuru: 'kacamak', icerik: delil.gosterir.oda, dogru: true, not: `delil önce gösterildi (${delil.id}); hikâyesini delile uydurdu` };
        durum.defter.set(anahtar, cevap);
      }
    }
  }
  const ipuclari = ipucuUret(durum, cevap, {
    kaymaCarpani: (secenekler.kaymaCarpani ?? 1) * (tekrarMi ? TEKRAR_CARPANI : 1),
    ekGerginlik: sorgu.stres.get(kisi) ?? 0,
    etiket: secenekler.etiket ?? (tekrarMi ? `tekrar${tekrar}` : undefined),
  });
  return { cevap, ipuclari, celisenDeliller: celisenDeliller(sorgu.deliller, cevap), tekrar };
}

export function teknikUygula(sorgu: Sorgu, kisi: KisiId, teknikId: string, p: TeknikParametreleri = {}): TeknikSonucu {
  const teknik = ICERIK.teknikler.find((t) => t.id === teknikId);
  if (!teknik) throw new Error(`Bilinmeyen teknik: ${teknikId}`);
  const sonuc = uygula(sorgu, kisi, teknikId, p);
  sorgu.zaman += teknik.maliyet.zaman;
  sorgu.gecmis.push({ kisi, teknik: teknikId, ozet: ozetle(sonuc) });
  return sonuc;
}

function ozetle(s: TeknikSonucu): string {
  switch (s.teknik) {
    case 'sue': return s.celiski ? 'çelişki' : s.erkenGosterildi ? 'erken gösterildi' : 'çelişki yok';
    case 'gizli-bilgi-testi': return `${s.gecerli ? 'geçerli' : 'GEÇERSİZ'} / ${s.tepki}`;
    case 'zorunlu-iki-secenek': return s.skor === null ? 'uygulanamadı' : `${s.skor}/${s.n}`;
    case 'suclayici-ton': return `stres ${s.stres}${s.sahteItiraf ? ' / SAHTE İTİRAF' : ''}${s.itiraf ? ' / itiraf' : ''}`;
    case 'oda-okuma': return `${s.okuma.esyalar.length} eşya`;
    case 'dijital-iz': return `ton ${s.profil.kurbanaDairTon}`;
    case 'ic-ses': return s.uygulanamaz ? 'uygulanamadı' : 'tahmin kaydedildi';
    case 'kayit-inceleme': return s.uygulanamaz ? 'uygulanamadı' : s.temelCizgiVar ? 'temel çizgiyle kıyas' : 'temel çizgisiz';
    default: return s.teknik;
  }
}

function uygula(sorgu: Sorgu, kisi: KisiId, teknikId: string, p: TeknikParametreleri): TeknikSonucu {
  const { durum } = sorgu;
  const { vaka, dagilim } = durum;
  const { olay } = vaka;
  const kayit = kisiKaydi(sorgu, kisi);
  const fail = kisi === olay.fail;

  switch (teknikId) {
    case 'temel-cizgi': {
      // Dört tarafsız soru: suç dışı, dürüst cevap; sadece kişilik temel çizgisi görünür.
      const gozlemler: IpucuGozlemi[] = [];
      for (let i = 0; i < 4; i++) {
        const sanal: Cevap = { kisi, soru: { tur: 'konum', hedef: kisi, dilim: 100 + i }, ifadeTuru: 'dogru', icerik: null, dogru: true, not: 'temel çizgi sohbeti' };
        gozlemler.push(...ipucuUret(durum, sanal, { etiket: 'temel-cizgi' }));
      }
      return { teknik: 'temel-cizgi', gozlemler };
    }

    case 'acik-uclu-anlatim': {
      const anlatim = vaka.dilimler.map((d) => sor(sorgu, kisi, { tur: 'konum', hedef: kisi, dilim: d.index }));
      return { teknik: 'acik-uclu-anlatim', anlatim };
    }

    case 'yonlendirici-soru': {
      const dilim = p.dilim ?? olay.dilim;
      const hedef = p.hedef ?? kisi;
      const oneri = p.onerilenOda ?? olay.oda;
      const soru: Soru = { tur: 'konum', hedef, dilim };
      const anahtar = `${kisi}|${soruAnahtari(soru)}`;
      const dogal = cevapla(durum, kisi, soru);
      const bilgisiz = dogal.icerik === null || dogal.ifadeTuru === 'bellek-uyumu';
      let kontamineOldu = false;
      if (bilgisiz && !fail && kayit.kisilik.telkineYatkinlik > 0.65) {
        const gercek = vaka.zamanCizelgesi.find((z) => z.kisi === hedef && z.dilim === dilim)!.oda;
        const yeni: Cevap = { ...dogal, ifadeTuru: 'sahte-ani', icerik: oneri, dogru: oneri === gercek, not: `yönlendirici soru: "${oneri}" önerisini benimsedi (telkine yatkın, bilgisiz)` };
        durum.defter.set(anahtar, yeni);
        sorgu.kontaminasyon.push({ kisi, ayrinti: `${hedef} @ dilim ${dilim} → ${oneri}`, kaynak: 'oyuncu', teknik: 'yonlendirici-soru' });
        kontamineOldu = true;
      }
      return { teknik: 'yonlendirici-soru', sonuc: sor(sorgu, kisi, soru), kontamineOldu };
    }

    case 'sue': {
      const delil = sorgu.deliller.find((d) => d.id === p.delilId);
      if (!delil || delil.gosterir.tur !== 'konum') throw new Error('SUE için konum gösteren bir delil gerekir');
      const { dilim } = delil.gosterir;
      const soru: Soru = { tur: 'konum', hedef: kisi, dilim };
      const anahtar = `${kisi}|${soruAnahtari(soru)}`;
      const erkenGosterildi = !!gosterilmisKonumDelili(sorgu, kisi, dilim) && !durum.defter.has(anahtar);
      const once = sor(sorgu, kisi, soru); // 1–2: delili açmadan anlattır
      delilGoster(sorgu, kisi, delil.id);   // 3: delili aç
      const celiski = delil.gosterir.kisi === kisi && once.cevap.icerik !== null && once.cevap.icerik !== delil.gosterir.oda;
      return { teknik: 'sue', once, delil, celiski, erkenGosterildi };
    }

    case 'bilissel-yuk-ters-sira': {
      const r = rng(sorgu, kisi, 'yuk');
      const anlatim: SorSonucu[] = [];
      const celiskiler: { dilim: number; ilk: string | null; simdi: string | null }[] = [];
      for (let d = vaka.dilimler.length - 1; d >= 0; d--) {
        const s = sor(sorgu, kisi, { tur: 'konum', hedef: kisi, dilim: d }, { kaymaCarpani: YUK_CARPANI, etiket: 'yuk' });
        anlatim.push(s);
        // Yük altında konum yalanı söyleyen bazen defterinden sapar (Vrij 2010: ters sıra tespiti %42→%60).
        // Yalnızca ODA yalanı (dogru=false) çelişebilir; gizleme/kaçamak doğru odayı söyler, çelişki üretmez.
        if (YALAN_IFADE_TURLERI.has(s.cevap.ifadeTuru) && s.cevap.icerik !== null && !s.cevap.dogru && r.sans((1 - kayit.yalanBecerisi) * 0.6)) {
          const simdi = r.sec(vaka.mekan.odalar.filter((o) => o.id !== s.cevap.icerik)).id;
          celiskiler.push({ dilim: d, ilk: s.cevap.icerik, simdi });
        }
      }
      return { teknik: 'bilissel-yuk-ters-sira', anlatim, celiskiler };
    }

    case 'beklenmedik-soru': {
      const dilim = p.dilim ?? olay.dilim;
      const iddia = sor(sorgu, kisi, { tur: 'konum', hedef: kisi, dilim }).cevap;
      if (iddia.icerik === null) return { teknik: 'beklenmedik-soru', dilim, iddiaEdilenOda: null, adiGecenler: [], ifadeTuru: 'dogru' };
      if (iddia.dogru) {
        // Gördüklerini sayar (dikkat boşluğu zaten bilgi katmanında).
        const gorulenler = dagilim.bilgiler.filter((b) => b.kisi === kisi && b.konu === 'konum' && b.kaynak === 'gordu' && b.hedefDilim === dilim && b.icerik === iddia.icerik).map((b) => b.hedefKisi!);
        return { teknik: 'beklenmedik-soru', dilim, iddiaEdilenOda: iddia.icerik, adiGecenler: [...new Set(gorulenler)], ifadeTuru: 'dogru' };
      }
      // Yalan iddia: o odada kimin olduğunu bilmez; prova dışı soru → ya uydurur ya "hatırlamıyorum".
      const r = rng(sorgu, kisi, `beklenmedik-${dilim}`);
      if (r.sans(0.5)) {
        const aday = r.sec(vaka.kisiler.filter((k) => k.id !== kisi && k.id !== olay.kurban));
        return { teknik: 'beklenmedik-soru', dilim, iddiaEdilenOda: iddia.icerik, adiGecenler: [aday.id], ifadeTuru: 'uydurma-yalan' };
      }
      return { teknik: 'beklenmedik-soru', dilim, iddiaEdilenOda: iddia.icerik, adiGecenler: [], ifadeTuru: 'kacamak' };
    }

    case 'gizli-bilgi-testi': {
      const konu: BilgiKonusu = p.konu ?? 'olay-yontemi';
      const gecerli = citGecerliMi(vaka, dagilim, konu);
      const biliyor = kimBiliyor(dagilim, konu).includes(kisi);
      const r = rng(sorgu, kisi, `cit-${konu}`);
      const tepki = r.sans(biliyor ? 0.85 : 0.1) ? 'tanima' : 'yok';
      return { teknik: 'gizli-bilgi-testi', konu, gecerli, tepki };
    }

    case 'zorunlu-iki-secenek': {
      const konu = p.konu ?? 'olay-yontemi';
      const cevap = sor(sorgu, kisi, { tur: 'olay-bilgisi', konu }).cevap;
      if (cevap.icerik !== null) return { teknik: 'zorunlu-iki-secenek', konu, skor: null, n: SVT_SORU_SAYISI, sansAlti: false };
      const r = rng(sorgu, kisi, `svt-${konu}`);
      // Bilip saklayan doğru seçenekten kaçınır (p≈.2); gerçekten bilmeyen şans (p=.5).
      const pDogru = cevap.dogru ? 0.5 : 0.2;
      let skor = 0;
      for (let i = 0; i < SVT_SORU_SAYISI; i++) if (r.sans(pDogru)) skor++;
      return { teknik: 'zorunlu-iki-secenek', konu, skor, n: SVT_SORU_SAYISI, sansAlti: skor <= SVT_SANS_ALTI_ESIGI };
    }

    case 'saskinlik-testi': {
      const konu: BilgiKonusu = p.konu ?? 'olay-yontemi';
      const biliyor = kimBiliyor(dagilim, konu).includes(kisi);
      const r = rng(sorgu, kisi, `saskinlik-${konu}`);
      // Bilmeyen %90 şaşırır; bilen genelde şaşırmaz ama yüksek öz-izleyen şaşırmış rolü yapabilir.
      const sasirdi = biliyor ? r.sans(kayit.kisilik.ozIzleme > 0.7 ? 0.6 : 0.15) : r.sans(0.9);
      return { teknik: 'saskinlik-testi', konu, sasirdi };
    }

    case 'sahte-bilgi-yemi': {
      const uydurmaAd = p.uydurmaAd ?? 'Cemil Aktaş';
      const r = rng(sorgu, kisi, `yem-${uydurmaAd}`);
      let onayladi = false;
      let ifadeTuru = 'dogru';
      if (fail && r.sans(0.3)) { onayladi = true; ifadeTuru = 'uydurma-yalan'; }
      else if (!fail && kayit.kisilik.telkineYatkinlik > 0.65 && r.sans(0.75)) { onayladi = true; ifadeTuru = 'sahte-ani'; }
      if (onayladi) sorgu.kontaminasyon.push({ kisi, ayrinti: `uydurma kişi "${uydurmaAd}" onaylandı`, kaynak: 'oyuncu', teknik: 'sahte-bilgi-yemi' });
      return { teknik: 'sahte-bilgi-yemi', uydurmaAd, onayladi, ifadeTuru };
    }

    case 'seytanin-avukati':
      return { teknik: 'seytanin-avukati', uygulanamaz: true, neden: 'Görüş/niyet ifadeleri için; v0 soru türleri olay anlatımıyla sınırlı.' };

    case 'suclayici-ton': {
      const stres = Math.min(STRES_TAVANI, (sorgu.stres.get(kisi) ?? 0) + STRES_ADIMI);
      sorgu.stres.set(kisi, stres);
      let sahteItiraf = false;
      let itiraf = false;
      const anahtar = `${kisi}|${soruAnahtari({ tur: 'olay-bilgisi', konu: 'fail-kimligi' })}`;
      if (!fail && kisi !== olay.kurban && kayit.kisilik.telkineYatkinlik > 0.7 && stres >= 1.0 && olay.fail) {
        sahteItiraf = true;
        durum.defter.set(anahtar, { kisi, soru: { tur: 'olay-bilgisi', konu: 'fail-kimligi' }, ifadeTuru: 'sahte-itiraf', icerik: kisi, dogru: false, not: 'baskı altında sahte itiraf (telkine yatkın)' });
      } else if (fail && kayit.yalanBecerisi < 0.3 && stres >= 1.5) {
        itiraf = true;
        durum.defter.set(anahtar, { kisi, soru: { tur: 'olay-bilgisi', konu: 'fail-kimligi' }, ifadeTuru: 'dogru', icerik: kisi, dogru: true, not: 'baskı altında itiraf (düşük beceri)' });
      }
      return { teknik: 'suclayici-ton', stres, sahteItiraf, itiraf };
    }

    // --- Diğer araçlar (araclar.ts): kişilik ve sır okur, suç değil ---
    case 'oda-okuma': {
      // Aynı oda ikinci kez okununca aynı eşyalar döner (deterministik); zaman yine harcanır.
      const okuma = sorgu.odaOkumalari.get(kisi) ?? odaOku(sorgu, kisi);
      sorgu.odaOkumalari.set(kisi, okuma);
      return { teknik: 'oda-okuma', okuma };
    }
    case 'dijital-iz':
      return { teknik: 'dijital-iz', profil: dijitalIz(sorgu, kisi) };
    case 'ic-ses':
      return icSesTahminEt(sorgu, kisi, p.tahmin, p.soru);
    case 'kayit-inceleme':
      return kayitIncele(sorgu, kisi, p.soru);

    default:
      throw new Error(`Teknik uygulanmadı: ${teknikId}`);
  }
}
