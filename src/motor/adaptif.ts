// Adaptif vaka üretimi: kör nokta profili → sonraki vaka o zayıflığı çalıştırır (TASARIM §11; Ericsson 1993).
//
// Oyuncuya söylenmez ("fark ettirmeden"). Etiketler yapısal hedeflere çevrilir; üretici seed türevlerini
// deneyerek hem çözülebilir hem hedefi sağlayan ilk vakayı döndürür. Hedef sağlanamazsa çözülebilir olanı verir
// (`saglananHedefler` boş kalır) — oyun asla takılmaz.
import { vakaUret } from './gerceklik';
import { cozulebilirlikDenetle, type CozulebilirlikRaporu } from './cozulebilirlik';
import { cevapla } from './strateji';
import { sorguBaslat, type Sorgu } from './teknik';
import type { Vaka, VakaAyari } from './tipler';

export type VakaHedefi = 'gergin-masum' | 'gomulu-yalan' | 'sizinti' | 'telkine-yatkin-masum' | 'sahnelenmis-delil' | 'suc-var';

/** Hata etiketi → yapısal hedef. Listede olmayan etiketler (aşırı özgüven, tek ipucu…) yapısal hedef gerektirmez. */
const ETIKET_HEDEFI: Record<string, VakaHedefi> = {
  'othello-hatasi': 'gergin-masum',
  'erken-delil': 'gomulu-yalan',
  'gecersiz-gizli-bilgi-testi': 'sizinti',
  'sahte-itiraf-kabulu': 'telkine-yatkin-masum',
  'tanik-kirletme': 'telkine-yatkin-masum',
  'delil-sorgulanmadi': 'sahnelenmis-delil',
  'dogruluk-yanliligi': 'suc-var',
  'ipucu-erisilemez': 'gomulu-yalan',
};

export const HEDEF_ETIKETLERI: readonly string[] = Object.keys(ETIKET_HEDEFI);

const EN_FAZLA_HEDEF = 2;

/** Kör nokta listesinden (sayıya göre sıralı) en fazla iki yapısal hedef. */
export function hedeflerdenAyar(korNoktalar: { etiket: string; sayi: number }[]): VakaHedefi[] {
  const sonuc: VakaHedefi[] = [];
  for (const k of [...korNoktalar].sort((a, b) => b.sayi - a.sayi)) {
    const h = ETIKET_HEDEFI[k.etiket];
    if (h && !sonuc.includes(h)) sonuc.push(h);
    if (sonuc.length >= EN_FAZLA_HEDEF) break;
  }
  return sonuc;
}

/** Vaka verilen yapısal hedefi taşıyor mu? (Taze sorgu üstünde; oyuncunun defterine dokunmaz.) */
export function vakaHedefiSaglar(sorgu: Sorgu, hedef: VakaHedefi): boolean {
  const { vaka, sirKatmani, dagilim } = sorgu.durum;
  const { olay } = vaka;
  switch (hedef) {
    case 'suc-var':
      return olay.fail !== null;
    case 'gergin-masum':
      return sirKatmani.sirlar.some((s) => s.kisi !== olay.fail && s.dilimler.includes(olay.dilim));
    case 'gomulu-yalan': {
      if (!olay.fail) return false;
      const klon = sorguBaslat(vaka);
      return cevapla(klon.durum, olay.fail, { tur: 'konum', hedef: olay.fail, dilim: olay.dilim }).ifadeTuru === 'gomulu-yalan';
    }
    case 'sizinti':
      return olay.fail !== null && dagilim.medyayaSizanKonular.includes('olay-yontemi');
    case 'telkine-yatkin-masum':
      return vaka.kisiler.some((k) => k.hayatta && k.id !== olay.kurban && k.id !== olay.fail && k.kisilik.telkineYatkinlik > 0.7);
    case 'sahnelenmis-delil':
      return sorgu.deliller.some((d) => d.sahnelenmis);
  }
}

export interface HedefliUretim {
  vaka: Vaka;
  rapor: CozulebilirlikRaporu;
  saglananHedefler: VakaHedefi[];
  deneme: number;
}

/**
 * Hedefli üretim: seed ve türevlerini (`seed#n`) dener; çözülebilir ve hedefleri sağlayan ilk vakayı döndürür.
 * Bulunamazsa çözülebilir olanların ilkine düşer.
 */
export function vakaUretHedefli(seed: string | number, hedefler: VakaHedefi[], ayar: VakaAyari, enFazlaDeneme = 30): HedefliUretim {
  let yedek: HedefliUretim | null = null;
  for (let i = 1; i <= enFazlaDeneme; i++) {
    const vaka = vakaUret(i === 1 ? seed : `${seed}#${i}`, ayar);
    const sorgu = sorguBaslat(vaka);
    const rapor = cozulebilirlikDenetle(sorgu);
    if (!rapor.cozulebilir) continue;
    const saglanan = hedefler.filter((h) => vakaHedefiSaglar(sorgu, h));
    const aday = { vaka, rapor, saglananHedefler: saglanan, deneme: i };
    if (saglanan.length === hedefler.length) return aday;
    if (!yedek || saglanan.length > yedek.saglananHedefler.length) yedek = aday;
  }
  if (yedek) return yedek;
  // Hiç çözülebilir bulunamadı (pratikte olmaz): son denemeyi döndür.
  const vaka = vakaUret(`${seed}#${enFazlaDeneme}`, ayar);
  const sorgu = sorguBaslat(vaka);
  return { vaka, rapor: cozulebilirlikDenetle(sorgu), saglananHedefler: [], deneme: enFazlaDeneme };
}
