// Türkçe ek yardımcıları.
//
// Dil katmanı oda ve kişi adlarını çekimler: "Mutfakta", "Çalışma Odasında", "Oda 412'de",
// "Nazlı'nın", "Kerem'i". Kurallar: büyük ünlü uyumu, küçük ünlü uyumu (-ı/-i/-u/-ü),
// ünsüz sertleşmesi (f s t k ç ş h p → -ta/-te), kaynaştırma (-y-, -n-), iyelikli tamlamalarda -n-,
// rakam/harf kodu ve özel adlarda kesme işareti. Rakamlar okunuşuna göre çekimlenir (412 → "on iki" → -de).
// Kapsam bilinçli olarak dar: oyunun isim/oda havuzları için yeterli, genel bir çekimleyici değil.

const UNLULER = 'aeıioöuüAEIİOÖUÜ';
const KALIN = 'aıouAIOU';
const YUVARLAK = 'oöuüOÖUÜ';
const SERT_UNSUZLER = 'fstkçşhpFSTKÇŞHP';

/** Rakamların okunuşundaki son ünlü. */
const RAKAM_SON_UNLU: Record<string, string> = { '0': 'ı', '1': 'i', '2': 'i', '3': 'ü', '4': 'ö', '5': 'e', '6': 'ı', '7': 'i', '8': 'i', '9': 'u' };
const ONLAR_SON_UNLU: Record<string, string> = { '1': 'o', '2': 'i', '3': 'u', '4': 'ı', '5': 'i', '6': 'ı', '7': 'i', '8': 'e', '9': 'a' };

function sayininSonUnlusu(sayi: string): string {
  if (/00$/.test(sayi)) return /000$/.test(sayi) ? 'i' : 'ü'; // bin / yüz
  if (sayi.endsWith('0')) return ONLAR_SON_UNLU[sayi[sayi.length - 2]!] ?? 'ı';
  return RAKAM_SON_UNLU[sayi[sayi.length - 1]!] ?? 'i';
}

/** Son sözcük rakam ya da rakam+harf kodu mu ("412", "3B", "7")? */
function kodMu(son: string): boolean {
  return /^\d+[A-Za-z]?$/.test(son);
}

function sonSozcuk(ad: string): string {
  const parcalar = ad.trim().split(/\s+/);
  return parcalar[parcalar.length - 1]!;
}

/** Kelimenin (ya da kodun okunuşunun) son ünlüsü. */
export function sonUnlu(ad: string): string {
  const son = sonSozcuk(ad);
  if (kodMu(son)) {
    const sonKarakter = son[son.length - 1]!;
    if (/[A-Za-z]/.test(sonKarakter)) {
      const kucuk = sonKarakter.toLocaleLowerCase('tr');
      return UNLULER.includes(kucuk) ? kucuk : 'e'; // "be", "ce", "de"…
    }
    return sayininSonUnlusu(son);
  }
  for (let i = son.length - 1; i >= 0; i--) if (UNLULER.includes(son[i]!)) return son[i]!.toLocaleLowerCase('tr');
  return 'e';
}

/** -a/-e türü ek ünlüsü (büyük ünlü uyumu). */
function aUnlusu(unlu: string): string {
  return KALIN.includes(unlu) ? 'a' : 'e';
}

/** -ı/-i/-u/-ü türü ek ünlüsü (küçük ünlü uyumu). */
function iUnlusu(unlu: string): string {
  const kalin = KALIN.includes(unlu);
  const yuvarlak = YUVARLAK.includes(unlu);
  return kalin ? (yuvarlak ? 'u' : 'ı') : yuvarlak ? 'ü' : 'i';
}

function unluyleBitiyor(ad: string): boolean {
  const son = sonSozcuk(ad);
  if (kodMu(son)) {
    const c = son[son.length - 1]!;
    return /[A-Za-z]/.test(c) ? UNLULER.includes(c.toLocaleLowerCase('tr')) : false;
  }
  return UNLULER.includes(son[son.length - 1]!);
}

function sertBitiyor(ad: string): boolean {
  const son = sonSozcuk(ad);
  return !kodMu(son) && SERT_UNSUZLER.includes(son[son.length - 1]!);
}

/** İyelikli tamlama mı ("Çalışma Odası", "Havuz Başı")? Kaba kural: iki+ sözcük ve son sözcük ünlüyle bitiyor. */
function iyelikliTamlamaMi(ad: string): boolean {
  const parcalar = ad.trim().split(/\s+/);
  return parcalar.length >= 2 && !kodMu(parcalar[parcalar.length - 1]!) && unluyleBitiyor(ad);
}

function kesme(ad: string, ozel: boolean): string {
  return ozel || kodMu(sonSozcuk(ad)) ? "'" : '';
}

/** Bulunma durumu: -da/-de/-ta/-te (iyelikli tamlamada -nda/-nde). */
export function bulunma(ad: string, ozel = false): string {
  const unlu = sonUnlu(ad);
  const a = aUnlusu(unlu);
  const kod = kodMu(sonSozcuk(ad));
  if (!kod && iyelikliTamlamaMi(ad)) return `${ad}${kesme(ad, ozel)}nd${a}`;
  const unsuz = sertBitiyor(ad) ? 't' : 'd';
  return `${ad}${kesme(ad, ozel)}${unsuz}${a}`;
}

/** Yönelme durumu: -a/-e (ünlüden sonra -ya/-ye; iyelikli tamlamada -na/-ne). */
export function yonelme(ad: string, ozel = false): string {
  const a = aUnlusu(sonUnlu(ad));
  const kod = kodMu(sonSozcuk(ad));
  if (!kod && iyelikliTamlamaMi(ad)) return `${ad}${kesme(ad, ozel)}n${a}`;
  if (unluyleBitiyor(ad)) return `${ad}${kesme(ad, ozel)}y${a}`;
  return `${ad}${kesme(ad, ozel)}${a}`;
}

/** Belirtme durumu (özel ad varsayılan): -ı/-i/-u/-ü, ünlüden sonra -yı/-yi/-yu/-yü. */
export function belirtme(ad: string, ozel = true): string {
  const i = iUnlusu(sonUnlu(ad));
  if (!kodMu(sonSozcuk(ad)) && iyelikliTamlamaMi(ad)) return `${ad}${kesme(ad, ozel)}n${i}`;
  if (unluyleBitiyor(ad)) return `${ad}${kesme(ad, ozel)}y${i}`;
  return `${ad}${kesme(ad, ozel)}${i}`;
}

/** Tamlayan (ilgi) durumu (özel ad varsayılan): -ın/-in/-un/-ün, ünlüden sonra -nın/-nin/-nun/-nün. */
export function tamlayan(ad: string, ozel = true): string {
  const i = iUnlusu(sonUnlu(ad));
  if (unluyleBitiyor(ad)) return `${ad}${kesme(ad, ozel)}n${i}n`;
  return `${ad}${kesme(ad, ozel)}${i}n`;
}

/** İlk harfi büyütür (Türkçe i/ı doğru). */
export function basHarfBuyut(metin: string): string {
  if (!metin) return metin;
  return metin[0]!.toLocaleUpperCase('tr') + metin.slice(1);
}
