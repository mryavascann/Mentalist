// Doğruluk grafiği üreticisi ("önce gerçek").
//
// Bu modül vakanın GERÇEĞİNİ üretir: mekân, kişiler, ilişki ve borç grafiği, olay çekirdeği ve
// herkesin her zaman dilimindeki gerçek konumu. İfade, yalan, ipucu üretimi burada YOKTUR;
// onlar sonraki katmanlarda bu gerçeğe bakarak üretilir ve ona karşı test edilir.
//
// Kalıp kırıcı ilke: fail, kurban dışındaki adaylar arasından DÜZGÜN dağılımla seçilir ve
// kişilik parametreleri failden bağımsız üretilir. Böylece "en gergin / ilk sıradaki /
// en sempatik" gibi meta-tahminlerin istatistiksel dayanağı olmaz (tests/motor/gerceklik.test.ts).
//
// Her katman ayrı bir alt akış (altUret) kullanır; bir katmandaki değişiklik diğerini kaydırmaz.
import { Rastgele } from '@ortak/rastgele';
import { tamlayan } from '@ortak/turkce';
import type { Borc, Iliski, IliskiTuru, Kisi, Konum, Mekan, OlayCekirdegi, Vaka, VakaAyari, ZamanDilimi } from './tipler';
import {
  EYLEMLER, ILISKI_SABLONLARI, MEKAN_SABLONLARI, MOTIVASYONLAR,
  TR_ERKEK_ADLARI, TR_KADIN_ADLARI, TR_SOYADLARI, YABANCI_ERKEK_ADLARI, YABANCI_KADIN_ADLARI, YABANCI_SOYADLARI, uygunRoller,
} from './havuzlar';
import { mekanaUygunArketipler, type Arketip } from './arketipler';
import { AYNA_ARKETIPLERI, AYNA_ARKETIP_CARPANI } from './ayna';

/** Akşam 19:00'dan itibaren 30 dakikalık 8 dilim (19:00–23:00). */
export const DILIM_SAYISI = 8;
const ILK_SAAT = 19;

/** 0–1 aralığına kırpar. */
const kirp01 = (x: number) => Math.min(1, Math.max(0, x));

function dilimleriUret(): ZamanDilimi[] {
  return Array.from({ length: DILIM_SAYISI }, (_, i) => {
    const saat = ILK_SAAT + Math.floor(i / 2);
    const dakika = i % 2 === 0 ? '00' : '30';
    return { index: i, baslangic: `${String(saat).padStart(2, '0')}:${dakika}` };
  });
}

function mekanUret(r: Rastgele): Mekan {
  const sablon = r.sec(MEKAN_SABLONLARI);
  return {
    ad: r.sec(sablon.adlar),
    tur: sablon.tur,
    ulke: sablon.ulke,
    odalar: sablon.odalar.map((ad, i) => ({ id: `oda-${i}`, ad })),
  };
}

/**
 * Kişileri üretir. Adlar tekrarsız; kişilik parametreleri normal dağılımdan (ort .5, sapma .18)
 * çekilip 0–1'e kırpılır. Rol ve hayatta bilgisi ilişkiler/olay katmanında doldurulur.
 */
function kisileriUret(r: Rastgele, ulke: Mekan['ulke']): Kisi[] {
  const sayi = r.tamsayi(5, 8);
  const kadinHavuz = r.karistir(ulke === 'TR' ? TR_KADIN_ADLARI : YABANCI_KADIN_ADLARI);
  const erkekHavuz = r.karistir(ulke === 'TR' ? TR_ERKEK_ADLARI : YABANCI_ERKEK_ADLARI);
  const soyadHavuz = r.karistir(ulke === 'TR' ? TR_SOYADLARI : YABANCI_SOYADLARI);
  const kisiler: Kisi[] = [];
  let k = 0, e = 0;
  for (let i = 0; i < sayi; i++) {
    const cinsiyet = r.sans(0.5) ? 'kadin' : 'erkek';
    const ad = cinsiyet === 'kadin' ? kadinHavuz[k++] : erkekHavuz[e++];
    kisiler.push({
      id: `k${i + 1}`,
      ad: `${ad} ${soyadHavuz[i % soyadHavuz.length]}`,
      yas: r.tamsayi(19, 74),
      cinsiyet,
      rol: '',
      hayatta: true,
      kisilik: {
        disadonukluk: kirp01(r.normal(0.5, 0.18)),
        kaygi: kirp01(r.normal(0.5, 0.18)),
        ozIzleme: kirp01(r.normal(0.5, 0.18)),
        telkineYatkinlik: kirp01(r.normal(0.5, 0.18)),
      },
      yalanBecerisi: kirp01(r.normal(0.5, 0.2)),
    });
  }
  return kisiler;
}

/** Kurban-merkezli ilişki grafiği: herkesin kurbanla bir bağı var; artı rastgele yan bağlar. */
function iliskileriUret(r: Rastgele, kisiler: Kisi[], kurban: Kisi): { iliskiler: Iliski[]; borclar: Borc[] } {
  const iliskiler: Iliski[] = [];
  const borclar: Borc[] = [];
  let esVar = false;
  for (const k of kisiler) {
    if (k.id === kurban.id) continue;
    // Tek eş kuralı: ikinci "eş" çıkarsa aile/tanıdık'a düşür.
    let sablon = r.agirlikliSec(ILISKI_SABLONLARI.map((s) => ({ deger: s, agirlik: s.agirlik })));
    if (sablon.tur === 'es' && esVar) sablon = ILISKI_SABLONLARI.find((s) => s.tur === 'aile')!;
    if (sablon.tur === 'es') esVar = true;
    // Rol, kişinin yaşı/cinsiyetiyle tutarlı seçilir (havuzlar.ts ROL_KOSULLARI); RNG tüketimi değişmez.
    k.rol = `${tamlayan(kurban.ad.split(' ')[0]!)} ${r.sec(uygunRoller(sablon, k, kurban))}`; // "Nazlı'nın kardeşi"
    iliskiler.push({ a: k.id, b: kurban.id, tur: sablon.tur, sicaklik: sicaklikUret(r, sablon.tur) });
  }
  // Yan bağlar: kurban dışı çiftler arasında %30 olasılıkla.
  const digerleri = kisiler.filter((k) => k.id !== kurban.id);
  for (let i = 0; i < digerleri.length; i++) {
    for (let j = i + 1; j < digerleri.length; j++) {
      if (!r.sans(0.3)) continue;
      const turler: IliskiTuru[] = ['is', 'arkadas', 'rakip', 'tanidik', 'aile', 'sevgili'];
      const tur = r.sec(turler);
      iliskiler.push({ a: digerleri[i]!.id, b: digerleri[j]!.id, tur, sicaklik: sicaklikUret(r, tur) });
    }
  }
  // Borçlar: her kişi %35 olasılıkla başka birine borçlu (koruma yalanı tohumu).
  for (const k of kisiler) {
    if (!r.sans(0.35)) continue;
    const alacakliAdaylari = kisiler.filter((x) => x.id !== k.id);
    const alacakli = r.sec(alacakliAdaylari);
    borclar.push({ alacakli: alacakli.id, borclu: k.id, tur: r.sec(['iyilik', 'para', 'sir'] as const), agirlik: kirp01(r.normal(0.6, 0.2)) });
  }
  return { iliskiler, borclar };
}

/** İlişki türüne göre sıcaklık; rakipte düşük, aile/eşte geniş dağılım (gerçekçi çeşitlilik). */
function sicaklikUret(r: Rastgele, tur: IliskiTuru): number {
  const ort = tur === 'rakip' ? -0.4 : tur === 'tanidik' ? 0.1 : 0.3;
  return Math.min(1, Math.max(-1, r.normal(ort, 0.4)));
}

/** Olay çekirdeği: tür, kurban, fail (kaza ise yok), yer, zaman, yöntem, motivasyon. Tür ve yöntem arketipten. */
function olayUret(r: Rastgele, kisiler: Kisi[], iliskiler: Iliski[], mekan: Mekan, kurban: Kisi, arketip: Arketip): OlayCekirdegi {
  const sablon = { tur: arketip.olayTuru, yontemler: arketip.yontemler };
  const adaylar = kisiler.filter((k) => k.id !== kurban.id);
  // DÜZGÜN dağılım: kalıp kırıcı ilkenin kalbi.
  const fail = sablon.tur === 'kaza' ? null : r.sec(adaylar);
  let motivasyon = '';
  if (fail) {
    const iliski = iliskiler.find((i) => i.a === fail.id && i.b === kurban.id)!;
    // İlişki motivasyonu + arketip teması: "aldatılma öfkesi; vasiyetin değiştirilme tehdidi"
    motivasyon = `${r.sec(MOTIVASYONLAR[iliski.tur])}; ${r.sec(arketip.motivasyonlar)}`;
  }
  return {
    tur: sablon.tur,
    kurban: kurban.id,
    fail: fail ? fail.id : null,
    dilim: r.tamsayi(1, DILIM_SAYISI - 2),
    oda: r.sec(mekan.odalar).id,
    yontem: r.sec(sablon.yontemler),
    motivasyon,
  };
}

/**
 * Gerçek zaman çizelgesi: herkes her dilimde tam bir odada. Süreklilik için %60 aynı odada kalır.
 * Sonra olay kısıtları uygulanır: kurban ve fail olay anında olay odasında; cinayette ceset kalır.
 */
function zamanCizelgesiUret(r: Rastgele, kisiler: Kisi[], mekan: Mekan, olay: OlayCekirdegi): Konum[] {
  const cizelge: Konum[] = [];
  for (const k of kisiler) {
    let oda = r.sec(mekan.odalar).id;
    for (let d = 0; d < DILIM_SAYISI; d++) {
      if (d > 0 && !r.sans(0.6)) {
        const digerOdalar = mekan.odalar.filter((o) => o.id !== oda);
        oda = r.sec(digerOdalar).id;
      }
      cizelge.push({ kisi: k.id, dilim: d, oda, eylem: r.sec(EYLEMLER) });
    }
  }
  const sabitle = (kisi: string, dilim: number, oda: string, eylem: string) => {
    const kayit = cizelge.find((z) => z.kisi === kisi && z.dilim === dilim)!;
    kayit.oda = oda;
    kayit.eylem = eylem;
  };
  sabitle(olay.kurban, olay.dilim, olay.oda, olay.tur === 'kaza' ? 'kazaya uğradı' : 'olayın kurbanı oldu');
  if (olay.fail) sabitle(olay.fail, olay.dilim, olay.oda, `${olay.yontem} — olayı gerçekleştirdi`);
  if (olay.tur === 'cinayet') {
    for (let d = olay.dilim + 1; d < DILIM_SAYISI; d++) sabitle(olay.kurban, d, olay.oda, 'cansız bedeni orada kaldı');
  }
  return cizelge;
}

/** Seed'den vakanın gerçeğini üretir. Aynı seed + aynı ayar → birebir aynı vaka. Varsayılan zorluk: orta. */
export function vakaUret(seed: number | string, ayar: VakaAyari = { zorluk: 'orta' }): Vaka {
  const kok = new Rastgele(seed);
  const mekan = mekanUret(kok.altUret('mekan'));
  const kisiler = kisileriUret(kok.altUret('kisiler'), mekan.ulke);
  const kurban = kok.altUret('kurban').sec(kisiler);
  kurban.rol = 'kurban';
  const { iliskiler, borclar } = iliskileriUret(kok.altUret('iliskiler'), kisiler, kurban);
  // Arketip mekâna göre, ağırlıklı ve düzgün karıştırılır; olay türü/yöntemi buradan gelir (TASARIM §15).
  const arketipR = kok.altUret('arketip');
  // Ayna vakasında (TASARIM §14) sahne/manipülasyon arketipleri ağır basar; aynı seed'de mekân ve kişiler aynı kalır.
  const carpan = (id: string) => (ayar.ayna && AYNA_ARKETIPLERI.includes(id) ? AYNA_ARKETIP_CARPANI : 1);
  const arketip = arketipR.agirlikliSec(mekanaUygunArketipler(mekan.tur).map((a) => ({ deger: a, agirlik: a.agirlik * carpan(a.id) })));
  const olay = olayUret(kok.altUret('olay'), kisiler, iliskiler, mekan, kurban, arketip);
  if (olay.tur === 'cinayet') kurban.hayatta = false;
  const zamanCizelgesi = zamanCizelgesiUret(kok.altUret('zaman'), kisiler, mekan, olay);
  return {
    seed: String(seed),
    ayar: { ...ayar },
    arketip: arketip.id,
    mekan,
    kisiler,
    iliskiler,
    borclar,
    dilimler: dilimleriUret(),
    zamanCizelgesi,
    olay,
  };
}
