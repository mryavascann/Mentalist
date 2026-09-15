// Saf yardımcılar: ifade çizelgesi (kişi × dilim, oyuncuya söylenen) ve kalibrasyon özeti (karar günlüğü).
import type { Sorgu } from '@motor/teknik';
import type { KisiId } from '@motor/tipler';
import type { VakaGecmisi } from './depo';

export interface IfadeCizelgesi {
  kisiler: { id: KisiId; ad: string }[];
  dilimler: string[];
  /** kişi → dilim indeksi → iddia edilen oda adı | 'bilmiyor' | null (sorulmadı). */
  hucreler: Map<KisiId, (string | null)[]>;
}

/** Oyuncuya söylenen konum iddiaları (defterden); gerçek değil, İFADE. */
export function ifadeCizelgesi(sorgu: Sorgu): IfadeCizelgesi {
  const { vaka, defter } = sorgu.durum;
  const kisiler = vaka.kisiler.filter((k) => k.hayatta && k.id !== vaka.olay.kurban).map((k) => ({ id: k.id, ad: k.ad }));
  const odaAdi = (id: string) => vaka.mekan.odalar.find((o) => o.id === id)?.ad ?? id;
  const hucreler = new Map<KisiId, (string | null)[]>();
  for (const k of kisiler) {
    hucreler.set(k.id, vaka.dilimler.map((d) => {
      const c = defter.get(`${k.id}|konum:${k.id}:${d.index}`);
      if (!c) return null;
      return c.icerik === null ? 'bilmiyor' : odaAdi(c.icerik);
    }));
  }
  return { kisiler, dilimler: vaka.dilimler.map((d) => d.baslangic), hucreler };
}

export interface KalibrasyonKovasi { kova: string; sayi: number; beyanOrt: number; dogrulukOrani: number }

/**
 * Karar günlüğü → kalibrasyon: geçmişteki her vakada beyan edilen güven, Brier'dan geri türetilir
 * (brier = (güven − sonuç)²), güven kovalarına ayrılır ve kovadaki gerçek doğruluk oranıyla karşılaştırılır.
 * Tversky & Kahneman 1974: kişi kendi kalibrasyonunu keşfedemez; dış kayıt şart.
 */
export function kalibrasyonOzeti(gecmis: VakaGecmisi[]): KalibrasyonKovasi[] {
  const kovalar: { ad: string; alt: number; ust: number }[] = [
    { ad: '0.50–0.65', alt: 0.5, ust: 0.65 },
    { ad: '0.65–0.85', alt: 0.65, ust: 0.85 },
    { ad: '0.85–1.00', alt: 0.85, ust: 1.0001 },
  ];
  const toplam = kovalar.map(() => ({ sayi: 0, beyan: 0, dogru: 0 }));
  for (const g of gecmis) {
    const guven = g.dogru ? 1 - Math.sqrt(g.brier) : Math.sqrt(g.brier);
    const i = kovalar.findIndex((k) => guven >= k.alt && guven < k.ust);
    if (i < 0) continue;
    toplam[i]!.sayi++;
    toplam[i]!.beyan += guven;
    if (g.dogru) toplam[i]!.dogru++;
  }
  return kovalar
    .map((k, i) => ({ kova: k.ad, sayi: toplam[i]!.sayi, beyanOrt: toplam[i]!.sayi ? toplam[i]!.beyan / toplam[i]!.sayi : 0, dogrulukOrani: toplam[i]!.sayi ? toplam[i]!.dogru / toplam[i]!.sayi : 0 }))
    .filter((k) => k.sayi > 0);
}
