// Görsel kütüğü: Higgsfield ile üretilen görsellerin (assets/*.webp) koda bağlanması.
//
// İlkeler (brand.md §6, K-010): az sayıda, tek stilde, tekrar kullanılabilir görsel; hepsi derlemede
// tek HTML'e gömülür (vite-plugin-singlefile assetsInlineLimit'i yükseltir → data: URL). Yüz ifadesi oyunda
// ipucu DEĞİLDİR (Barrett 2019): portreler nötr ifadelidir ve kişiye SEED'le deterministik, cinsiyet uyumlu,
// yaşa yakın olacak şekilde atanır; aynı vakada iki kişi aynı portreyi almaz. Fail seçimiyle hiçbir bağı yoktur.
// Görsel bulunamazsa (ör. dosya silinmiş) çağıran taraf yer tutucuya (SVG siluet) düşer.
import { Rastgele } from '@ortak/rastgele';
import type { KisiId, MekanTuru, Vaka } from '@motor/tipler';

/** `../../assets/x/ad.webp` → `ad` anahtarıyla URL sözlüğü. */
function kutuk(kayitlar: Record<string, unknown>): Record<string, string> {
  const sonuc: Record<string, string> = {};
  for (const [yol, url] of Object.entries(kayitlar)) sonuc[yol.split('/').pop()!.replace(/\.webp$/, '')] = String(url);
  return sonuc;
}

export const PORTRELER = kutuk(import.meta.glob('../../assets/portreler/*.webp', { eager: true, query: '?url', import: 'default' }));
export const MEKANLAR = kutuk(import.meta.glob('../../assets/mekanlar/*.webp', { eager: true, query: '?url', import: 'default' }));
export const ODALAR = kutuk(import.meta.glob('../../assets/odalar/*.webp', { eager: true, query: '?url', import: 'default' }));
export const KILAVUZ_GORSELLERI = kutuk(import.meta.glob('../../assets/kilavuz/*.webp', { eager: true, query: '?url', import: 'default' }));
export const TATBIKAT_GORSELLERI = kutuk(import.meta.glob('../../assets/tatbikat/*.webp', { eager: true, query: '?url', import: 'default' }));
export const DELIL_GORSELLERI = kutuk(import.meta.glob('../../assets/delil/*.webp', { eager: true, query: '?url', import: 'default' }));
export const DIGER = kutuk(import.meta.glob('../../assets/diger/*.webp', { eager: true, query: '?url', import: 'default' }));

export interface PortreKaydi { id: string; cinsiyet: 'kadin' | 'erkek'; yas: number }

/** Portre havuzu (assets/HIGGSFIELD_PROMPTLAR.md + ek üretimler): prompt'taki yaş/cinsiyet. Eşleme bunlara bakar. */
export const PORTRE_KAYITLARI: PortreKaydi[] = [
  { id: 'p01', cinsiyet: 'kadin', yas: 28 }, { id: 'p02', cinsiyet: 'erkek', yas: 32 }, { id: 'p03', cinsiyet: 'kadin', yas: 45 }, { id: 'p04', cinsiyet: 'erkek', yas: 50 },
  { id: 'p05', cinsiyet: 'kadin', yas: 22 }, { id: 'p06', cinsiyet: 'erkek', yas: 68 }, { id: 'p07', cinsiyet: 'kadin', yas: 35 }, { id: 'p08', cinsiyet: 'erkek', yas: 40 },
  { id: 'p09', cinsiyet: 'kadin', yas: 63 }, { id: 'p10', cinsiyet: 'erkek', yas: 25 }, { id: 'p11', cinsiyet: 'kadin', yas: 50 }, { id: 'p12', cinsiyet: 'erkek', yas: 35 },
  { id: 'p13', cinsiyet: 'kadin', yas: 44 }, { id: 'p14', cinsiyet: 'erkek', yas: 72 }, { id: 'p15', cinsiyet: 'kadin', yas: 38 }, { id: 'p16', cinsiyet: 'erkek', yas: 45 },
  { id: 'p17', cinsiyet: 'kadin', yas: 30 }, { id: 'p18', cinsiyet: 'erkek', yas: 63 }, { id: 'p19', cinsiyet: 'kadin', yas: 24 }, { id: 'p20', cinsiyet: 'erkek', yas: 55 },
  { id: 'p21', cinsiyet: 'kadin', yas: 54 }, { id: 'p22', cinsiyet: 'erkek', yas: 33 }, { id: 'p23', cinsiyet: 'kadin', yas: 65 }, { id: 'p24', cinsiyet: 'erkek', yas: 44 },
  { id: 'p25', cinsiyet: 'kadin', yas: 40 }, { id: 'p26', cinsiyet: 'erkek', yas: 58 }, { id: 'p27', cinsiyet: 'kadin', yas: 32 }, { id: 'p28', cinsiyet: 'erkek', yas: 25 },
  { id: 'p29', cinsiyet: 'kadin', yas: 72 }, { id: 'p30', cinsiyet: 'erkek', yas: 45 }, { id: 'p31', cinsiyet: 'kadin', yas: 25 }, { id: 'p32', cinsiyet: 'erkek', yas: 63 },
  { id: 'p33', cinsiyet: 'kadin', yas: 48 }, { id: 'p34', cinsiyet: 'erkek', yas: 50 }, { id: 'p35', cinsiyet: 'kadin', yas: 42 }, { id: 'p36', cinsiyet: 'erkek', yas: 28 },
  { id: 'p37', cinsiyet: 'kadin', yas: 63 }, { id: 'p38', cinsiyet: 'erkek', yas: 35 }, { id: 'p39', cinsiyet: 'kadin', yas: 22 }, { id: 'p40', cinsiyet: 'erkek', yas: 55 },
  { id: 'p41', cinsiyet: 'kadin', yas: 55 }, { id: 'p42', cinsiyet: 'erkek', yas: 22 }, { id: 'p43', cinsiyet: 'kadin', yas: 38 }, { id: 'p44', cinsiyet: 'erkek', yas: 68 },
  { id: 'p45', cinsiyet: 'kadin', yas: 33 }, { id: 'p46', cinsiyet: 'erkek', yas: 28 }, { id: 'p47', cinsiyet: 'kadin', yas: 58 }, { id: 'p48', cinsiyet: 'erkek', yas: 44 },
  { id: 'p49', cinsiyet: 'kadin', yas: 22 }, { id: 'p50', cinsiyet: 'erkek', yas: 72 }, { id: 'p51', cinsiyet: 'kadin', yas: 45 }, { id: 'p52', cinsiyet: 'erkek', yas: 60 },
  { id: 'p53', cinsiyet: 'kadin', yas: 32 }, { id: 'p54', cinsiyet: 'erkek', yas: 38 }, { id: 'p55', cinsiyet: 'kadin', yas: 68 }, { id: 'p56', cinsiyet: 'erkek', yas: 22 },
];

/** Takım üyesi rolü → portre dosyası (assets/portreler/t0x). */
export const TAKIM_PORTRELERI: Record<string, string> = { lider: 't01', sorgucu: 't02', inanan: 't03', saha: 't04' };

/**
 * Vaka için kişi → portre kimliği. Cinsiyet eşleşir; yaş yakınlığı ağırlık verir; aynı vakada tekrar yok;
 * seed'le deterministik. Kişi sırası vaka sırasıdır (fail sırasıyla ilgisi yok).
 */
export function portreEslemesi(vaka: Vaka): Map<KisiId, string> {
  const r = new Rastgele(`${vaka.seed}/portre`);
  const kullanilan = new Set<string>();
  const sonuc = new Map<KisiId, string>();
  for (const k of vaka.kisiler) {
    const adaylar = PORTRE_KAYITLARI.filter((p) => p.cinsiyet === k.cinsiyet && !kullanilan.has(p.id) && PORTRELER[p.id]);
    if (adaylar.length === 0) continue;
    // Yaş farkı 4 yılda ağırlık yarıya, 8 yılda beşte bire iner (karesel): portre yaşa yakın kalır, ama seçim yine rastgele.
    const secim = r.agirlikliSec(adaylar.map((p) => ({ deger: p, agirlik: 1 / (1 + ((p.yas - k.yas) / 4) ** 2) })));
    kullanilan.add(secim.id);
    sonuc.set(k.id, secim.id);
  }
  return sonuc;
}

const eslemeBellegi = new Map<string, Map<KisiId, string>>();

/** Kişinin portre URL'si; görsel yoksa null (arayüz siluete düşer). Vaka başına önbelleklenir. */
export function portreUrl(vaka: Vaka, kisiId: KisiId): string | null {
  let esleme = eslemeBellegi.get(vaka.seed);
  if (!esleme) { esleme = portreEslemesi(vaka); eslemeBellegi.set(vaka.seed, esleme); }
  const id = esleme.get(kisiId);
  return id ? PORTRELER[id] ?? null : null;
}

/** Mekân türü → arka plan URL'si. */
export function mekanGorseli(tur: MekanTuru): string | undefined {
  return MEKANLAR[tur];
}

/** Oda adı → assets/odalar dosya adı. Listede olmayan odalar mekân görseline düşer. */
const ODA_ESLEMESI: Record<string, string> = {
  'Kütüphane': 'kutuphane', 'Mutfak': 'mutfak', 'Bahçe': 'bahce', 'Çalışma Odası': 'calisma-odasi', 'Üst Kat Koridoru': 'ust-kat-koridoru', 'Garaj': 'garaj',
  'Toplantı Odası': 'toplanti-odasi', 'Arşiv': 'arsiv', 'Merdiven Boşluğu': 'merdiven', 'Merdiven': 'merdiven',
  'Oturma Odası': 'oturma-odasi', 'Kayıkhane': 'kayikhane', 'Sera': 'sera', 'Yemekhane': 'yemekhane',
  'Oda 412': 'hasta-odasi', 'Oda 7': 'motel-odasi', 'Oda 8': 'motel-odasi', 'Ana Çadır': 'ana-cadir', 'Daire 3B': 'daire', 'Daire 4A': 'daire', 'Bodrum': 'bodrum',
};

/** Odanın görseli: odaya özel varsa o, yoksa mekânın genel görseli. */
export function odaGorseli(vaka: Vaka, odaId: string): string | undefined {
  const oda = vaka.mekan.odalar.find((o) => o.id === odaId);
  const dosya = oda ? ODA_ESLEMESI[oda.ad] : undefined;
  return (dosya && ODALAR[dosya]) || MEKANLAR[vaka.mekan.tur];
}
