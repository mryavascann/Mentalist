// İpucu üretimi: cevaba eşlik eden davranış betimlemeleri.
//
// Model (basit, test edilebilir, kaynağa sadık):
//   Her ipucu için gizli bir "davranış şiddeti" z ~ N(mu, 1) çekilir; z > ESIK ise ipucu gözlenir.
//   mu = kişilik temel çizgisi + (yalan ise etki kayması) + (suç sorusu ise gerginlik bağlamı)
//   Etki kayması katalogdaki Cohen d'den gelir (DePaulo 2003): koşula göre (ihlal / motivasyon)
//   alternatif d kullanılır; iyi yalancı (yalanBecerisi) kaymayı %50'ye kadar söndürür (Vrij 2010).
//   "iliskisiz" ipuçları (göz teması, duraksama, gecikme, kıpırdanma, mikroifade) yalanla HİÇ kaymaz;
//   sadece kişilik temel çizgisinden beslenir → oyuncu bunlara bakarsa şans düzeyinde kalır.
//
// Sonuç: masumlar da ipucu üretir (kaygı, içe dönüklük), yalancılar biraz daha çok; fark küçük ve
// olasılıksaldır. Bu, "Pinokyo'nun burnu yok" ilkesinin (TASARIM §8) motor karşılığıdır.
import { Rastgele } from '@ortak/rastgele';
import { ICERIK } from '@icerik/index';
import type { IpucuKaydi, Kanal } from '@icerik/tipler';
import type { Kisilik, KisiId } from './tipler';
import { soruAnahtari, type Cevap, type VakaDurumu } from './strateji';

export interface IpucuGozlemi {
  ipucuId: string;
  kanal: Kanal;
  betimleme: string;
}

/** Aldatma içeren ifade türleri; diğerleri (dogru, bellek-uyumu, dikkat-boslugu…) dürüst ama belki yanlıştır. */
export const YALAN_IFADE_TURLERI: ReadonlySet<string> = new Set([
  'uydurma-yalan', 'gomulu-yalan', 'gizleme', 'kacamak', 'koruma-yalani', 'alakasiz-sir', 'prova-edilmis-grup-alibisi', 'sahte-itiraf',
]);

/** Gözlenme eşiği: mu=0 için taban oran ≈ %16. */
const ESIK = 1.0;
/** İyi yalancının etki kaymasını söndürme payı (0.5 → beceri 1.0'da kayma yarıya iner). */
const BECERI_SONDURME = 0.5;
/** Gizleme (bilgi saklama) uydurmadan daha az iz bırakır (Ekman 1996; DePaulo 2003). */
const GIZLEME_CARPANI = 0.6;
/** Suç sorusu herkesi gerer (Othello): gerginlik ipuçlarına kaygı oranında ek kayma. */
const SUC_SORUSU_GERGINLIK = 0.3;
const GERGINLIK_IPUCLARI = new Set(['genel-gerginlik', 'ses-perdesi-yukselme']);

/** Kişilik → ipucu temel çizgisi (mu kayması). Yalanla ilgisi yok; kişinin "normali". */
const KISILIK_TEMELI: Record<string, (k: Kisilik) => number> = {
  'goz-temasi': (k) => (0.5 - k.disadonukluk) * 1.5,
  'duraksama': (k) => (0.5 - k.disadonukluk) * 1.0 + (k.kaygi - 0.5) * 0.5,
  'cevap-gecikmesi': (k) => (k.kaygi - 0.5) * 0.5,
  'genel-gerginlik': (k) => (k.kaygi - 0.5) * 2.0,
  'ses-perdesi-yukselme': (k) => (k.kaygi - 0.5) * 1.2,
  'ayak-el-kipirdanma': (k) => (k.kaygi - 0.5) * 1.5,
  'illustrator-azalmasi': (k) => (0.5 - k.disadonukluk) * 1.2,
  'detay-azligi': (k) => (0.5 - k.disadonukluk) * 0.8,
  'sozel-vokal-yakinlik-azligi': (k) => (0.5 - k.disadonukluk) * 0.8,
  'mikroifade': (k) => (0.5 - k.ozIzleme) * 0.5,
};

/** Standart normal dağılım CDF'i (Abramowitz-Stegun 7.1.26 yaklaşımı, hata < 1.5e-7). */
function normalCdf(x: number): number {
  const t = 1 / (1 + 0.3275911 * Math.abs(x));
  const y = 1 - (((((1.061405429 * t - 1.453152027) * t) + 1.421413741) * t - 0.284496736) * t + 0.254829592) * t * Math.exp(-x * x / 2);
  return x >= 0 ? 0.5 + 0.5 * y : 0.5 - 0.5 * y;
}

/** Bu cevap için ipucunun etkin d değeri (koşul + beceri + ifade türü çarpanları). */
function etkinKayma(ipucu: IpucuKaydi, durum: VakaDurumu, cevap: Cevap, beceri: number): number {
  if (ipucu.betimlemeYonu === 'iliskisiz') return 0;
  if (!YALAN_IFADE_TURLERI.has(cevap.ifadeTuru)) return 0;
  const failYalani = cevap.kisi === durum.vaka.olay.fail;
  let d = Math.abs(ipucu.etkiBuyuklugu);
  // Koşullar: failin suç yalanı = ihlal; masumun sır/koruma yalanı = kimlik/itibar motivasyonu.
  if (failYalani && ipucu.kosullar?.ihlal !== undefined) d = Math.abs(ipucu.kosullar.ihlal);
  else if (!failYalani && ipucu.kosullar?.motivasyon !== undefined) d = Math.abs(ipucu.kosullar.motivasyon);
  if (cevap.ifadeTuru === 'gizleme') d *= GIZLEME_CARPANI;
  d *= 1 - BECERI_SONDURME * beceri;
  return ipucu.betimlemeYonu === 'artar' ? d : -d;
}

function sucSorusuMu(durum: VakaDurumu, cevap: Cevap): boolean {
  return cevap.soru.tur === 'olay-bilgisi' || cevap.soru.dilim === durum.vaka.olay.dilim;
}

/** Teknik motorunun ipucu üretimine müdahale kanalları. */
export interface IpucuSecenekleri {
  /** Bilişsel yük: yalan kaymasını çarpar (1 = normal, 1.6 = ters sıra anlatım). */
  kaymaCarpani?: number;
  /** Suçlayıcı tonla biriken stres: gerginlik ipuçlarına doğrudan eklenir (herkeste; Othello). */
  ekGerginlik?: number;
  /** RNG akışını ayırmak için etiket (aynı soru farklı teknikle sorulunca farklı gözlem). */
  etiket?: string;
}

/** Cevaba eşlik eden gözlemler; aynı (kişi, soru, etiket) için deterministik. */
export function ipucuUret(durum: VakaDurumu, cevap: Cevap, secenekler: IpucuSecenekleri = {}): IpucuGozlemi[] {
  const kisi = durum.vaka.kisiler.find((k) => k.id === cevap.kisi)!;
  const r = new Rastgele(`${durum.vaka.seed}/ipucu/${cevap.kisi}|${soruAnahtari(cevap.soru)}${secenekler.etiket ? `|${secenekler.etiket}` : ''}`);
  const sucSorusu = sucSorusuMu(durum, cevap);
  const kaymaCarpani = secenekler.kaymaCarpani ?? 1;
  const ekGerginlik = secenekler.ekGerginlik ?? 0;
  const gozlemler: IpucuGozlemi[] = [];
  for (const ipucu of ICERIK.ipuclari) {
    let mu = KISILIK_TEMELI[ipucu.id]?.(kisi.kisilik) ?? 0;
    mu += etkinKayma(ipucu, durum, cevap, kisi.yalanBecerisi) * kaymaCarpani;
    if (sucSorusu && GERGINLIK_IPUCLARI.has(ipucu.id)) mu += SUC_SORUSU_GERGINLIK * kisi.kisilik.kaygi;
    if (ekGerginlik > 0 && GERGINLIK_IPUCLARI.has(ipucu.id)) mu += ekGerginlik;
    const z = r.normal(mu, 1);
    const betimleme = r.sec(ipucu.betimlemeler); // her ipucu için çekilir ki akış sabit kalsın
    if (z > ESIK) gozlemler.push({ ipucuId: ipucu.id, kanal: ipucu.kanal, betimleme });
  }
  return gozlemler;
}

/**
 * Kişinin temel çizgisi: tarafsız (suç dışı) ve dürüst bir cevapta her ipucunun beklenen gözlenme olasılığı.
 * "Sohbet / temel çizgi" tekniği bu tabloyu (gürültülü biçimde) oyuncuya açar.
 */
export function temelCizgi(durum: VakaDurumu, kisiId: KisiId): Map<string, number> {
  const kisi = durum.vaka.kisiler.find((k) => k.id === kisiId)!;
  const sonuc = new Map<string, number>();
  for (const ipucu of ICERIK.ipuclari) {
    const mu = KISILIK_TEMELI[ipucu.id]?.(kisi.kisilik) ?? 0;
    sonuc.set(ipucu.id, 1 - normalCdf(ESIK - mu));
  }
  return sonuc;
}
