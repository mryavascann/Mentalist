// Dil katmanı (K-009): yapısal cevap → Türkçe diyalog metni + davranış betimlemesi.
//
// Runtime'da dil modeli yok. Her cümle şablon havuzlarından seedli seçimle kurulur; şablonlar
// yer tutucuları (oda, saat, kişi adı, eylem, yöntem) Türkçe ek yardımcılarıyla çekimler.
// İlkeler:
//   - Metin gizli etiketi ELE VERMEZ: yalan söyleyen kişi "yalan söylüyorum" demez; şablonlar
//     ifade türüne göre farklı ama masum görünümlü kalır. (Test: yasak kelime listesi.)
//   - Üslup kişiye özgü: dolgu sözcükleri (kaygıyla artar), cümle uzunluğu (dışadönüklükle),
//     resmîlik (öz-izlemeyle). Bu, "temel çizgi" mekaniğinin metin ayağıdır: kişi ZATEN "açıkçası"
//     diyorsa bu bir ipucu değildir.
//   - Varyant belleği aynı kalıbı art arda tekrarlamaz.
import { Rastgele } from '@ortak/rastgele';
import { basHarfBuyut, belirtme, bulunma } from '@ortak/turkce';
import type { IpucuGozlemi } from './ipucu';
import { soruAnahtari, type Cevap } from './strateji';
import type { KisiId, Vaka } from './tipler';
import { ARKETIPLER } from './arketipler';

export interface KisiUslubu {
  /** Dedektife hitap; resmî kişilerde "Dedektif", diğerlerinde boş. */
  hitap: string;
  cumleUzunlugu: 'kisa' | 'orta' | 'uzun';
  /** 0–1: "siz"li, ölçülü konuşma eğilimi. */
  resmilik: number;
  /** Cümleye dolgu sözcüğüyle başlama olasılığı (kaygıyla artar). */
  dolguOlasiligi: number;
  dolguSozcukleri: string[];
}

const DOLGU_HAVUZU = ['Açıkçası', 'Yani', 'Şey', 'İşte', 'Doğrusu', 'Hani', 'Valla', 'Bakın'];

/** Kişilikten üslup türetir (deterministik). */
export function uslupUret(vaka: Vaka, kisiId: KisiId): KisiUslubu {
  const kisi = vaka.kisiler.find((k) => k.id === kisiId)!;
  const r = new Rastgele(`${vaka.seed}/uslup/${kisiId}`);
  const { disadonukluk, kaygi, ozIzleme } = kisi.kisilik;
  const cumleUzunlugu = disadonukluk < 0.35 ? 'kisa' : disadonukluk > 0.65 ? 'uzun' : 'orta';
  const dolguOlasiligi = Math.min(1, Math.max(0, 0.1 + kaygi * 0.6 + r.sayi() * 0.1));
  const resmilik = Math.min(1, Math.max(0, ozIzleme * 0.6 + r.sayi() * 0.4));
  const dolguSozcukleri = r.karistir(DOLGU_HAVUZU).slice(0, r.tamsayi(1, 2));
  return { hitap: resmilik > 0.6 ? 'Dedektif' : '', cumleUzunlugu, resmilik, dolguOlasiligi, dolguSozcukleri };
}

/** Aynı kategoride art arda aynı şablonu seçmemek için bellek. */
export class VaryantBellegi {
  private son = new Map<string, number>();
  sec(anahtar: string, adaySayisi: number, r: Rastgele): number {
    let indeks = r.tamsayi(0, adaySayisi - 1);
    const onceki = this.son.get(anahtar);
    if (adaySayisi > 1 && onceki === indeks) indeks = (indeks + 1) % adaySayisi;
    this.son.set(anahtar, indeks);
    return indeks;
  }
}

// ---------------------------------------------------------------------------------------------
// Şablonlar. "||" sonrası bölüm isteğe bağlıdır: kısa cümle üslubunda atılır.
// Yer tutucular: {saat} {odaB} (bulunma) {eylem} (1. tekil) {hedefAd} {hedefB} {yontem} {failAd} {kendiAd} {hitap}

const SABLONLAR: Record<string, string[]> = {
  'kendi-dogru': [
    '{saat} civarı {odaB}. {Eylem}.',
    '{OdaB}; {eylem}.|| Kayda değer bir şey olmadı.',
    'O saatte {odaB}. {Eylem}, başka bir şey hatırlamıyorum.',
    'Bütün o yarım saat {odaB}. {Eylem}.|| Sonra da yerimden kalkmadım.',
      '{saat} sularında {odaB}. {Eylem}; başka kimseyle ilgilenmedim.',
    'Hatırlıyorum, {odaB}. {Eylem}.|| Saate bakmıştım, {saat} civarıydı.',
],
  'kendi-gizleme': [
    '{saat} sularında {odaB}.|| Sıradan bir akşamdı.',
    '{OdaB}. Kendi işimle meşguldüm.',
    'O sırada {odaB}. Özel bir şey yoktu.',
      '{saat} civarı {odaB}. Anlatacak bir şey yok.',
    '{OdaB}. Sıkıcı bir yarım saat.',
],
  'kendi-kacamak': [
    'Evet, {odaB}. Ama bir dakikalığına uğradım, hemen çıktım.',
    '{OdaB}, doğru. Kısa süre. Kimse yoktu.',
    'Oradaydım, {odaB}. Ne olduysa ben çıktıktan sonra oldu.',
      '{OdaB}. Girip çıktım, o kadar.',
    'Kabul, {odaB}. Ama görülecek bir şey yoktu.',
],
  'kendi-gomulu': [
    '{saat} civarı {odaB}. Aynı akşam, aynı yer; biraz oturdum.',
    '{OdaB}. Bunu net hatırlıyorum, çünkü oraya daha önce de geçmiştim.',
    'O saatte {odaB}. Kimseyle konuşmadım.',
      '{saat} gibi {odaB}. Aynı sandalyede oturdum.',
    '{OdaB}. Kesin. O akşam hep oradaydım.',
],
  'kendi-alakasiz-sir': [
    '{OdaB}. Yalnızdım.',
    '{saat} gibi {odaB}. Neden sorduğunuzu anlamadım.',
    '{OdaB}. Bunun olayla ne ilgisi var?',
      '{OdaB}. Neden ısrar ediyorsunuz?',
    '{saat} civarı {odaB}, evet. Başka soru?',
],
  'kendi-null': ['Hatırlamıyorum.', 'O saati çıkaramıyorum.', 'Bilmiyorum, sanırım oradan oraya gidiyordum.', 'Aklımda değil.', 'O saat karışık; söyleyemem.'],
  'baska-dogru': [
    '{hedefAd} {odaB}. {saat} civarıydı.',
    '{hedefB} {odaB} gördüm.',
    '{saat} civarı {hedefAd} {odaB}, eminim.',
      '{hedefB} {saat} civarı {odaB} gördüm.',
    '{hedefAd} {odaB}; yanından geçtim.',
],
  'baska-bellek-uyumu': [
    'Sanırım {hedefAd} {odaB}. Öyle duymuştum.',
    '{hedefAd} {odaB} olmalı; herkes öyle diyor.',
    'Galiba {hedefAd} {odaB}. Ben görmedim ama öyle konuşuldu.',
      '{hedefAd} {odaB} olmalı; öyle söylendi.',
    'Bana {odaB} dediler, {hedefAd}.',
],
  'baska-sahte-ani': [
    'Evet… şimdi hatırlıyorum, {hedefAd} {odaB}.',
    'Doğru, {hedefAd} {odaB}. Nasıl unutmuşum.',
    'Şimdi düşününce evet, {hedefAd} {odaB}.',
      'Evet, {hedefAd} {odaB}. Kesin gördüm.',
    '{hedefAd}… evet, {odaB}. Şimdi net.',
],
  'baska-koruma': [
    '{hedefAd} benimleydi, {odaB}. Bütün o süre boyunca.',
    'Yanımdaydı. {hedefAd} ve ben, {odaB}.',
    '{hedefAd} {odaB}, benimle birlikte. Bundan eminim.',
      '{hedefAd} yanımdaydı, {odaB}. Ayrılmadık.',
    'İkimiz {odaB}. {hedefAd} hiç çıkmadı.',
],
  'baska-null-dogru': ['Görmedim.', '{hedefB} o saatte görmedim.', 'Bilmiyorum, nerede olduğunu görmedim.', '{hedefB} görmedim.', 'Yolum kesişmedi.'],
  'baska-null-dikkat': [
    'O sırada {eylem}; {hedefB} fark etmedim.',
    'Dikkat etmedim. {Eylem}.',
    'Görmüş olabilirim ama {eylem}, aklımda kalmamış.',
      '{eylem}; kim girdi çıktı bakmadım.',
    'Kafam başka yerdeydi; {eylem}.',
],
  'yontem-dogru': ['Duyduğum kadarıyla {yontem}.', 'Herkes "{yontem}" diyor.', 'Söylenen şu: {yontem}. Ben de öyle duydum.', '{yontem} diyorlar; ben de öyle biliyorum.', 'Koridorda konuşulan şu: {yontem}.'],
  'yontem-null-dogru': ['Bilmiyorum.', 'Kimse bana bir şey söylemedi.', 'Hiçbir fikrim yok, gerçekten.', 'Bana söylenmedi.', 'Duymadım.'],
  'yontem-gizleme': ['Hiçbir fikrim yok. Bana kimse bir şey söylemedi.', 'Ne olduğunu bilmiyorum.', 'Bunu benden değil polisten öğrenmelisiniz.', 'Bilmem. Size söylemişlerdir.', 'Bunu ben nereden bileyim?'],
  'fail-dogru': ['{failB} gördüm. {failAd} oradaydı.', 'Oradaki kişi {failAd}. Kendi gözlerimle gördüm.', '{failAd}. Söylemek istemezdim ama gördüm.', '{failAd}. Evet, oradaydı.', 'Gördüm: {failAd}.'],
  'fail-null-dogru': ['Bilmiyorum.', 'Keşke bilseydim.', 'Kimseyi görmedim.', 'Görmedim.', 'Bir şey görmedim.'],
  'fail-gizleme': ['Keşke bilseydim.', 'Hiçbir fikrim yok.', 'Ben de sizin kadar şaşkınım.', 'Kimseyi görmedim.', 'Bilmiyorum.'],
  'fail-koruma': ['Kimseyi görmedim.', 'Görmedim, sadece sesler duydum.', 'Orada kimse yoktu.', 'Karanlıktı, kimseyi seçemedim.', 'Ben oradayken kimse yoktu.'],
  'fail-itiraf': ['Tamam… ben yaptım. Yazın: {kendiAd}.', 'Ben yaptım. {kendiAd}. Artık bırakın.', 'Evet, bendim. {kendiAd}.', 'Bendim. {kendiAd}. Bitirin şunu.', 'Ben yaptım. {kendiAd} yaptı.'],
};

const UZUN_EKLER = ['Hepsi bu.', 'Dediğim gibi.', 'Başka bir şey yok.', 'Hatırladığım bu kadar.', 'Bu kadar.', 'Başka ne diyeyim.'];

/** Şablon kategorileri (test ve içerik denetimi için). */
export const SABLON_KATEGORILERI: string[] = Object.keys(SABLONLAR);
export function sablonSayisi(kategori: string): number { return SABLONLAR[kategori]?.length ?? 0; }

function kategori(cevap: Cevap): string {
  const { soru, ifadeTuru, icerik } = cevap;
  if (soru.tur === 'olay-bilgisi') {
    if (soru.konu === 'olay-yontemi') return icerik ? 'yontem-dogru' : ifadeTuru === 'gizleme' ? 'yontem-gizleme' : 'yontem-null-dogru';
    if (ifadeTuru === 'sahte-itiraf' || (icerik && icerik === cevap.kisi)) return 'fail-itiraf';
    if (icerik) return 'fail-dogru';
    if (ifadeTuru === 'koruma-yalani') return 'fail-koruma';
    if (ifadeTuru === 'gizleme') return 'fail-gizleme';
    return 'fail-null-dogru';
  }
  const kendi = soru.hedef === cevap.kisi;
  if (kendi) {
    if (icerik === null) return 'kendi-null';
    switch (ifadeTuru) {
      case 'gizleme': return 'kendi-gizleme';
      case 'kacamak': return 'kendi-kacamak';
      case 'gomulu-yalan': return 'kendi-gomulu';
      case 'alakasiz-sir': return 'kendi-alakasiz-sir';
      default: return 'kendi-dogru';
    }
  }
  if (icerik === null) return ifadeTuru === 'dikkat-boslugu' ? 'baska-null-dikkat' : 'baska-null-dogru';
  switch (ifadeTuru) {
    case 'bellek-uyumu': return 'baska-bellek-uyumu';
    case 'sahte-ani': return 'baska-sahte-ani';
    case 'koruma-yalani': return 'baska-koruma';
    default: return 'baska-dogru';
  }
}

function birinciTekil(eylem: string): string {
  return eylem.replace(/yordu$/, 'yordum');
}

/** Cevabı, kişinin üslubuyla Türkçe diyalog metnine çevirir. */
export function cevapMetni(vaka: Vaka, cevap: Cevap, uslup: KisiUslubu, bellek: VaryantBellegi): string {
  const kat = kategori(cevap);
  const havuz = SABLONLAR[kat]!;
  const r = new Rastgele(`${vaka.seed}/dil/${cevap.kisi}/${soruAnahtari(cevap.soru)}`);
  const sablon = havuz[bellek.sec(`${cevap.kisi}:${kat}`, havuz.length, r)]!;
  const kisi = vaka.kisiler.find((k) => k.id === cevap.kisi)!;
  const odaAd = cevap.icerik && cevap.soru.tur === 'konum' ? vaka.mekan.odalar.find((o) => o.id === cevap.icerik)?.ad ?? '' : '';
  const dilim = cevap.soru.tur === 'konum' ? cevap.soru.dilim : vaka.olay.dilim;
  const saat = vaka.dilimler[dilim]?.baslangic ?? '';
  const kendiEylem = birinciTekil(vaka.zamanCizelgesi.find((z) => z.kisi === cevap.kisi && z.dilim === dilim)?.eylem ?? 'bekliyordu');
  const hedefId = cevap.soru.tur === 'konum' ? cevap.soru.hedef : '';
  const hedefAd = hedefId ? vaka.kisiler.find((k) => k.id === hedefId)!.ad.split(' ')[0]! : '';
  const failAd = cevap.soru.tur === 'olay-bilgisi' && cevap.icerik ? vaka.kisiler.find((k) => k.id === cevap.icerik)?.ad.split(' ')[0] ?? '' : '';
  const yontem = cevap.soru.tur === 'olay-bilgisi' && cevap.soru.konu === 'olay-yontemi' ? cevap.icerik ?? '' : '';
  const odaB = odaAd ? bulunma(odaAd) : '';
  // Dolgu sözcüğü kararı önce verilir. Yer tutucular her zaman cümle başı kuralıyla büyütülür
  // ("Evinde. Eşya topluyordum."); dolgu eklenince yalnızca şablonun kendi ilk sözcüğü küçültülür
  // ("Valla, o saatte…"), oda adıyla başlayan şablonlar olduğu gibi kalır ("Hani, Bodrumda…").
  const dolguVar = uslup.dolguOlasiligi > 0 && r.sans(uslup.dolguOlasiligi);
  const basBuyut = (x: string) => basHarfBuyut(x);

  let metin = sablon
    .replace(/\{saat\}/g, saat)
    .replace(/\{OdaB\}/g, basBuyut(odaB))
    .replace(/\{odaB\}/g, odaB)
    .replace(/\{Eylem\}/g, basBuyut(kendiEylem))
    .replace(/\{eylem\}/g, kendiEylem)
    .replace(/\{hedefAd\}/g, hedefAd)
    .replace(/\{hedefB\}/g, hedefAd ? belirtme(hedefAd) : '')
    .replace(/\{failAd\}/g, failAd)
    .replace(/\{failB\}/g, failAd ? belirtme(failAd) : '')
    .replace(/\{Yontem\}/g, basBuyut(yontem))
    .replace(/\{yontem\}/g, yontem)
    .replace(/\{kendiAd\}/g, kisi.ad.split(' ')[0]!)
    .replace(/\{hitap\}/g, uslup.hitap);

  // İsteğe bağlı bölüm: kısa üslupta atılır, diğerlerinde kalır.
  const [zorunlu, istege] = metin.split('||');
  metin = uslup.cumleUzunlugu === 'kisa' || !istege ? zorunlu!.trim() : `${zorunlu!.trim()} ${istege.trim()}`;
  if (uslup.cumleUzunlugu === 'uzun' && r.sans(0.5)) metin = `${metin} ${r.sec(UZUN_EKLER)}`;
  if (dolguVar) {
    const odaylaBasliyor = sablon.startsWith('{OdaB}') || sablon.startsWith('{hedef') || sablon.startsWith('{fail') || sablon.startsWith('{saat}');
    const govde = odaylaBasliyor ? metin : `${metin[0]!.toLocaleLowerCase('tr')}${metin.slice(1)}`;
    metin = `${r.sec(uslup.dolguSozcukleri)}, ${govde}`;
  }
  return metin.replace(/\s+/g, ' ').trim();
}

/** İpucu gözlemlerini tek bir betimleme paragrafına birleştirir. */
export function betimlemeMetni(gozlemler: IpucuGozlemi[]): string {
  return gozlemler.map((g) => g.betimleme).join(' ');
}

const OLAY_METNI: Record<string, string> = {
  cinayet: 'ölü bulundu',
  hirsizlik: 'soyuldu',
  sabotaj: 'bir sabotaja uğradı',
  kaza: 'bir kaza geçirdi',
};

/** Vaka açılış brifingi. Fail adı geçmez. */
export function vakaBrifingi(vaka: Vaka): string {
  const kurban = vaka.kisiler.find((k) => k.id === vaka.olay.kurban)!;
  const oda = vaka.mekan.odalar.find((o) => o.id === vaka.olay.oda)!.ad;
  const saat = vaka.dilimler[vaka.olay.dilim]!.baslangic;
  const ilk = vaka.dilimler[0]!.baslangic;
  const son = vaka.dilimler[vaka.dilimler.length - 1]!.baslangic;
  const gorusulebilir = vaka.kisiler.filter((k) => k.hayatta && k.id !== kurban.id).length;
  const arketip = ARKETIPLER.find((a) => a.id === vaka.arketip);
  const ek = arketip ? ` ${arketip.brifingEki}` : '';
  return `${vaka.mekan.ad}. Akşam ${ilk}–${son} arası. ${kurban.ad} ${OLAY_METNI[vaka.olay.tur]}; olay yeri ${bulunma(oda)}, saat ${saat} civarı.${ek} ${gorusulebilir} kişiyle görüşülebilir. Herkes o akşam oradaydı.`;
}

/** Kişi kartı metni (oyuncuya görünen kısım; gizli parametreler yok). */
export function kisiKarti(vaka: Vaka, kisiId: KisiId): string {
  const k = vaka.kisiler.find((x) => x.id === kisiId)!;
  const kurban = vaka.kisiler.find((x) => x.id === vaka.olay.kurban)!;
  if (k.id === kurban.id) return `${k.ad}, ${k.yas}. Kurban.${k.hayatta ? '' : ' Hayatta değil.'}`;
  return `${k.ad}, ${k.yas}. ${basHarfBuyut(k.rol)}.`;
}
