// Sırlar ve koruma ilişkileri.
//
// Gerçekçi vakada herkesin saklayacak bir şeyi olabilir; çoğu suçla ilgisizdir. Fail de masumla aynı
// olasılıkla alakasız sır taşır (kalıp kırıcı ilke). Bu katman:
//   - suçla ilgisiz sırlar üretir (gizli ilişki, gizli ziyaret, borç, iş kaybı, bağımlılık, sabıka)
//     → "gergin masum": Othello hatasının ana kaynağı (Ekman; Navarro'nun bekçi vakası),
//   - koruma ilişkileri üretir: borç (Cialdini karşılıklılık), aile/eş/sevgili sadakati, ortak sır
//     → koruma yalanları; korunan kişi fail olmak zorunda değil (koruma ≠ suç ortaklığı).
// Sırlar gerçekle tutarlıdır: gizli ilişki dilimlerinde iki kişi zaman çizelgesinde gerçekten aynı odadadır.
import { Rastgele } from '@ortak/rastgele';
import type { KisiId, Vaka } from './tipler';

export const SIR_TURLERI = ['gizli-iliski', 'gizli-ziyaret', 'gizli-borc', 'is-kaybi', 'bagimlilik', 'sabika'] as const;
export type SirTuru = (typeof SIR_TURLERI)[number];

export interface Sir {
  kisi: KisiId;
  tur: SirTuru;
  aciklama: string;
  /** gizli-iliski için: kiminle. */
  ortak?: KisiId;
  /** Sırrın "yaşandığı" ardışık dilimler; kişi bu dilimlerdeki konumunu/eylemini saklar. */
  dilimler: number[];
}

export type KorumaNedeni = 'borc' | 'aile' | 'es' | 'sevgili' | 'ortak-sir';

export interface Koruma {
  koruyan: KisiId;
  korunan: KisiId;
  neden: KorumaNedeni;
}

export interface SirKatmani {
  sirlar: Sir[];
  korumalar: Koruma[];
}

const SIR_AGIRLIKLARI: { tur: SirTuru; agirlik: number; aciklamalar: string[] }[] = [
  { tur: 'gizli-iliski', agirlik: 25, aciklamalar: ['gizli bir ilişki yaşıyor', 'eski sevgilisiyle gizlice görüşüyor'] },
  { tur: 'gizli-ziyaret', agirlik: 20, aciklamalar: ['kimseye söylemeden birini ziyaret etti', 'gizlice dışarı çıkıp bir görüşme yaptı'] },
  { tur: 'gizli-borc', agirlik: 15, aciklamalar: ['tefeciye borcu var', 'kumar borcunu saklıyor'] },
  { tur: 'is-kaybi', agirlik: 15, aciklamalar: ['işten çıkarıldığını kimseye söylemedi', 'şirketten zimmet şüphesiyle uzaklaştırıldı'] },
  { tur: 'bagimlilik', agirlik: 15, aciklamalar: ['gizlice içiyor', 'reçetesiz ilaç kullanıyor'] },
  { tur: 'sabika', agirlik: 10, aciklamalar: ['eski bir sabıkasını saklıyor', 'başka bir şehirde açık davası var'] },
];

/** Sır, kişinin o dilimlerde NEREDE olduğunu saklamasını gerektiriyor mu? (Yoksa sadece ne yaptığını.) */
export function odaYalaniGerektirir(tur: SirTuru): boolean {
  return tur === 'gizli-iliski' || tur === 'gizli-ziyaret';
}

/** İki kişinin aynı odada olduğu ardışık dilim dizileri. */
function ortakDilimDizileri(vaka: Vaka, a: KisiId, b: KisiId): number[][] {
  const konum = (kisi: KisiId, d: number) => vaka.zamanCizelgesi.find((z) => z.kisi === kisi && z.dilim === d)!.oda;
  const diziler: number[][] = [];
  let mevcut: number[] = [];
  for (let d = 0; d < vaka.dilimler.length; d++) {
    if (konum(a, d) === konum(b, d)) mevcut.push(d);
    else { if (mevcut.length) diziler.push(mevcut); mevcut = []; }
  }
  if (mevcut.length) diziler.push(mevcut);
  return diziler;
}

export function sirlarUret(vaka: Vaka): SirKatmani {
  const r = new Rastgele(vaka.seed).altUret('sirlar');
  const sirlar: Sir[] = [];
  const korumalar: Koruma[] = [];
  const { olay } = vaka;
  const adaylar = vaka.kisiler.filter((k) => k.hayatta && k.id !== olay.kurban);
  const mesgul = new Set<KisiId>(); // sırrı olan ya da bir sırrın ortağı olanlar

  // 1) Sırlar
  for (const k of adaylar) {
    if (mesgul.has(k.id)) continue;
    // Fail ve masum için AYNI olasılık: aksi halde "sırrı olan masumdur" kalıbı doğar (örüntü denetçisi).
    const p = 0.45;
    if (!r.sans(p)) continue;
    let sablon = r.agirlikliSec(SIR_AGIRLIKLARI.map((s) => ({ deger: s, agirlik: s.agirlik })));
    let ortak: KisiId | undefined;
    let dilimler: number[] = [];

    if (sablon.tur === 'gizli-iliski') {
      // Ortak: meşgul olmayan, kurban olmayan, hayatta başka biri; aynı odada bulundukları bir dizi gerekir.
      const ortakAdaylari = r.karistir(adaylar.filter((x) => x.id !== k.id && !mesgul.has(x.id)));
      for (const aday of ortakAdaylari) {
        const diziler = ortakDilimDizileri(vaka, k.id, aday.id);
        if (diziler.length === 0) continue;
        const dizi = r.sec(diziler);
        const uzunluk = Math.min(dizi.length, r.tamsayi(1, 3));
        const baslangic = r.tamsayi(0, dizi.length - uzunluk);
        dilimler = dizi.slice(baslangic, baslangic + uzunluk);
        ortak = aday.id;
        break;
      }
      // Uygun ortak yoksa gizli ziyarete düş.
      if (!ortak) sablon = SIR_AGIRLIKLARI.find((s) => s.tur === 'gizli-ziyaret')!;
    }

    if (dilimler.length === 0) {
      const uzunluk = r.tamsayi(1, 3);
      const baslangic = r.tamsayi(0, vaka.dilimler.length - uzunluk);
      dilimler = Array.from({ length: uzunluk }, (_, i) => baslangic + i);
    }

    const sir: Sir = { kisi: k.id, tur: sablon.tur, aciklama: r.sec(sablon.aciklamalar), dilimler };
    if (ortak) sir.ortak = ortak;
    sirlar.push(sir);
    mesgul.add(k.id);
    if (ortak) mesgul.add(ortak);
  }

  // 2) Korumalar
  const hayattaMi = (id: KisiId) => vaka.kisiler.find((k) => k.id === id)!.hayatta;
  const ekle = (koruyan: KisiId, korunan: KisiId, neden: KorumaNedeni) => {
    if (koruyan === korunan) return;
    if (koruyan === olay.kurban || korunan === olay.kurban) return;
    if (!hayattaMi(koruyan) || !hayattaMi(korunan)) return;
    if (korumalar.some((c) => c.koruyan === koruyan && c.korunan === korunan)) return;
    korumalar.push({ koruyan, korunan, neden });
  };
  // Ortak sır: karşılıklı koruma (önce eklenir; en güçlü bağ).
  for (const s of sirlar) {
    if (s.tur === 'gizli-iliski' && s.ortak) { ekle(s.kisi, s.ortak, 'ortak-sir'); ekle(s.ortak, s.kisi, 'ortak-sir'); }
  }
  // Borç: ağır borç %80 koruma doğurur (karşılıklılık).
  for (const b of vaka.borclar) {
    if (b.agirlik > 0.5 && r.sans(0.8)) ekle(b.borclu, b.alacakli, 'borc');
  }
  // Aile / eş / sevgili: sıcaksa %40 (tek yönlü; yön rastgele).
  for (const i of vaka.iliskiler) {
    if (!['aile', 'es', 'sevgili'].includes(i.tur) || i.sicaklik <= 0.2) continue;
    if (!r.sans(0.4)) continue;
    const [koruyan, korunan] = r.sans(0.5) ? [i.a, i.b] : [i.b, i.a];
    ekle(koruyan, korunan, i.tur as KorumaNedeni);
  }

  return { sirlar, korumalar };
}
