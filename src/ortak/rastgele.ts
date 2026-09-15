// Seedli, tekrar üretilebilir rastgelelik.
//
// Neden kendi RNG'miz var? Math.random() seed almaz; "aynı seed → aynı vaka" güvencesi
// (tasarım §4, regresyon seedleri) ancak deterministik bir üreteçle sağlanır.
// Algoritma: mulberry32 (32 bit durum, hızlı, istatistiksel kalitesi oyun için fazlasıyla yeterli).
// Metin seedler FNV-1a ile 32 bite indirgenir.
//
// Alt akışlar (altUret): vaka üreticisinin katmanları (kişiler, olaylar, deliller...) ayrı
// akışlar kullanır. Böylece bir katmanın kaç sayı çektiği diğerini kaydırmaz; küçük bir
// değişiklik tüm vakayı değiştirmez ve hata ayıklama kolaylaşır.

/** Metni 32 bitlik işaretsiz tamsayıya indirger (FNV-1a). Aynı metin → aynı sayı. */
export function seedHash(metin: string): number {
  let h = 0x811c9dc5;
  for (let i = 0; i < metin.length; i++) {
    h ^= metin.charCodeAt(i);
    // 32 bit FNV çarpanı (16777619) ile çarpma; Math.imul taşmayı doğru yönetir.
    h = Math.imul(h, 0x01000193);
  }
  return h >>> 0;
}

/** Ağırlıklı seçim için giriş: ağırlık 0 olan eleman asla seçilmez. */
export interface AgirlikliAday<T> {
  deger: T;
  agirlik: number;
}

export class Rastgele {
  private durum: number;
  /** Alt akış türetmek için kök seed'in metin hali saklanır. */
  private readonly kok: string;
  /** Box-Muller iki değer üretir; ikincisi bir sonraki normal() çağrısı için bekletilir. */
  private bekleyenNormal: number | null = null;

  constructor(seed: number | string) {
    this.kok = String(seed);
    this.durum = typeof seed === 'number' ? seed >>> 0 : seedHash(seed);
  }

  /** [0, 1) aralığında sayı. mulberry32 çekirdeği. */
  sayi(): number {
    this.durum = (this.durum + 0x6d2b79f5) >>> 0;
    let t = this.durum;
    t = Math.imul(t ^ (t >>> 15), t | 1);
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  }

  /** min ve max dahil tamsayı. */
  tamsayi(min: number, max: number): number {
    if (min > max) throw new Error(`tamsayi: min (${min}) > max (${max})`);
    return min + Math.floor(this.sayi() * (max - min + 1));
  }

  /** p olasılıkla true. */
  sans(p: number): boolean {
    if (p <= 0) return false;
    if (p >= 1) return true;
    return this.sayi() < p;
  }

  /** Diziden eşit olasılıkla bir eleman. */
  sec<T>(dizi: readonly T[]): T {
    if (dizi.length === 0) throw new Error('sec: boş diziden seçim yapılamaz');
    return dizi[this.tamsayi(0, dizi.length - 1)] as T;
  }

  /** Fisher-Yates; kaynağı değiştirmez, yeni dizi döndürür. */
  karistir<T>(dizi: readonly T[]): T[] {
    const kopya = [...dizi];
    for (let i = kopya.length - 1; i > 0; i--) {
      const j = this.tamsayi(0, i);
      [kopya[i], kopya[j]] = [kopya[j] as T, kopya[i] as T];
    }
    return kopya;
  }

  /** Ağırlıklara orantılı seçim. Ağırlıklar negatif olamaz, toplam sıfır olamaz. */
  agirlikliSec<T>(adaylar: readonly AgirlikliAday<T>[]): T {
    let toplam = 0;
    for (const a of adaylar) {
      if (a.agirlik < 0) throw new Error('agirlikliSec: negatif ağırlık');
      toplam += a.agirlik;
    }
    if (toplam <= 0) throw new Error('agirlikliSec: toplam ağırlık sıfır');
    let esik = this.sayi() * toplam;
    for (const a of adaylar) {
      if (a.agirlik === 0) continue;
      esik -= a.agirlik;
      if (esik < 0) return a.deger;
    }
    // Kayan nokta artığı: son sıfır olmayan ağırlıklı adayı döndür.
    for (let i = adaylar.length - 1; i >= 0; i--) {
      const a = adaylar[i] as AgirlikliAday<T>;
      if (a.agirlik > 0) return a.deger;
    }
    throw new Error('agirlikliSec: seçim yapılamadı');
  }

  /** Normal dağılım (Box-Muller). Karakter parametreleri (duygu profili vb.) için. */
  normal(ort = 0, sapma = 1): number {
    if (this.bekleyenNormal !== null) {
      const z = this.bekleyenNormal;
      this.bekleyenNormal = null;
      return ort + z * sapma;
    }
    let u1 = 0;
    while (u1 === 0) u1 = this.sayi(); // log(0) yasak
    const u2 = this.sayi();
    const r = Math.sqrt(-2 * Math.log(u1));
    const z0 = r * Math.cos(2 * Math.PI * u2);
    this.bekleyenNormal = r * Math.sin(2 * Math.PI * u2);
    return ort + z0 * sapma;
  }

  /**
   * Etiketle adlandırılmış, ebeveynden bağımsız alt akış.
   * Aynı kök seed + aynı etiket → her zaman aynı akış; ebeveynin ne kadar tükettiği önemsiz.
   */
  altUret(etiket: string): Rastgele {
    return new Rastgele(seedHash(`${this.kok}/${etiket}`));
  }
}
