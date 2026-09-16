// "Diğer araçlar" (TASARIM §7): oda okuma, dijital iz, "şu an ne düşünüyor?", kayıt inceleme.
//
// Bu dört araç sorgu sorusu değildir; kişinin çevresine, izine ve iç dünyasına bakar. Ortak ilke:
// hepsi KİŞİLİK ve SIR hakkında bilgi verir, SUÇ hakkında değil. Oyuncu bunları suç kanıtı sayarsa
// puan.ts "oda-okuma-suc" etiketini basar. Her araç kaynağındaki bulguya yakın simüle edilir:
//   - Oda okuma (Gosling 2002 "A Room With a Cue"): her eşya kimlik iddiası (kendine / başkalarına),
//     davranış kalıntısı (iç / dış) ya da sahnelenmiştir. Sır kalıntı bırakır (sır ≠ suç). "Hoş oda = hoş
//     insan" halk inancı geçersizdir (uyumluluk doğruluğu −.04). Sahnelenmiş oda öz-izlemeye bağlıdır,
//     faille ilgisi yoktur (örüntü denetimi: kalıp = hata).
//   - Dijital iz (Kosinski 2013; Gosling 2011): arkadaş/paylaşım sayıları dışadönüklükle ilişkili (.4–.5),
//     kaygıyla ilişkisiz (nevrotiklik −.13). Yüksek öz-izleyen profilini kürate eder: soğuk görünmez.
//   - İç ses (Ickes 1990): gerçek düşünce cevabın gizli etiketinden türer; tahmin vaka sonuna kadar açılmaz.
//     Az konuşulan kişi zor okunur (soru sorma oranı doğrulukla +.29 ilişkili) → seçenek sayısı artar.
//   - Kayıt inceleme (Swerts 2013): yavaşlatma/yüz bölgesi gizleme etkisi KÜÇÜKtür (%49→%53); asıl fayda
//     temel çizgiyle kıyastır. Temel çizgi yoksa "ilk izlenen normal sayılır" sıra yanlılığı uyarısı verilir.
//
// Metin üretilmez; yapısal sonuçlar döner (K-009). Arayüz metinler.ts ile giydirir.
import { Rastgele } from '@ortak/rastgele';
import { ipucuUret, temelCizgi, YALAN_IFADE_TURLERI, type IpucuGozlemi } from './ipucu';
import { soruAnahtari, type Cevap, type Soru, type VakaDurumu } from './strateji';
import type { Sorgu } from './teknik';
import type { KisiId } from './tipler';
import type { SirTuru } from './sirlar';

// ---------------------------------------------------------------------------------------------
// Oda okuma

/** Gosling 2002'nin dört mekanizması + sahnelenmiş (izlenim için düzenlenmiş) eşya. */
export type EsyaTuru = 'kimlik-iddiasi-kendine' | 'kimlik-iddiasi-baskalarina' | 'kalinti-ic' | 'kalinti-dis' | 'sahnelenmis';
/** Oyuncunun seçtiği kaba sınıf. */
export type EsyaSinifi = 'iddia' | 'kalinti' | 'sahnelenmis';
/** Eşyanın neyi ele verdiği (analiz ve testler için; oyuncuya oyun sırasında gösterilmez). */
export type EsyaKonusu = 'kisilik' | 'kaygi' | 'sir' | 'sahne' | 'iddia' | 'tuzak' | 'gurultu';

export const ESYA_SINIFI: Record<EsyaTuru, EsyaSinifi> = {
  'kimlik-iddiasi-kendine': 'iddia',
  'kimlik-iddiasi-baskalarina': 'iddia',
  'kalinti-ic': 'kalinti',
  'kalinti-dis': 'kalinti',
  sahnelenmis: 'sahnelenmis',
};

export const ESYA_SINIF_ADLARI: Record<EsyaSinifi, string> = {
  iddia: 'Kimlik iddiası',
  kalinti: 'Davranış kalıntısı',
  sahnelenmis: 'Sahnelenmiş',
};

export const ESYA_TURU_ADLARI: Record<EsyaTuru, string> = {
  'kimlik-iddiasi-kendine': 'Kimlik iddiası (kendine)',
  'kimlik-iddiasi-baskalarina': 'Kimlik iddiası (başkalarına)',
  'kalinti-ic': 'İç davranış kalıntısı',
  'kalinti-dis': 'Dış davranış kalıntısı',
  sahnelenmis: 'Sahnelenmiş',
};

export interface OdaEsyasi {
  /** `${kisi}/${sıra}` — sınıflama kaydının anahtarı. */
  id: string;
  /** Oyuncunun gördüğü betimleme; gizli türü ele vermez. */
  betimleme: string;
  tur: EsyaTuru;
  konu: EsyaKonusu;
  /** Dikkatli okuyucunun çıkarımı (vaka sonunda açılır). */
  ima: string;
  /** Çıkarım Gosling'e göre geçerli mi? Tuzak eşyada false. */
  gecerli: boolean;
}

export interface OdaOkumasi {
  kisi: KisiId;
  esyalar: OdaEsyasi[];
}

const SIR_KALINTILARI: Record<SirTuru, { tur: EsyaTuru; betimlemeler: string[]; ima: string }> = {
  'gizli-iliski': {
    tur: 'kalinti-ic',
    betimlemeler: ['İki fincan, ikisi de yıkanmamış; yastığın altında ona ait olmayan bir çakmak.', 'Lavaboda iki diş fırçası; dolapta ona küçük gelecek bir ceket.'],
    ima: 'Biriyle gizlice görüşüyor olabilir: "o akşam kiminleydin?" diye sor. Sır ≠ suç.',
  },
  'gizli-ziyaret': {
    tur: 'kalinti-dis',
    betimlemeler: ['Ceketin cebinde başka bir semtin otobüs bileti; ayakkabıda taze çamur.', 'Masada sonradan buruşturulmuş bir adres notu; anahtarlıkta tanımadığın bir anahtar.'],
    ima: 'Söylemediği bir yere gitmiş: nereye, kimi görmeye? Sır ≠ suç.',
  },
  'gizli-borc': {
    tur: 'kalinti-dis',
    betimlemeler: ['Çekmecede el yazısıyla vade tarihleri; açılmamış banka zarfları.', 'Rehin dükkânı makbuzu; boş bir mücevher kutusu.'],
    ima: 'Para sıkıntısı saklıyor: sorulacak konu, suçun kanıtı değil. Sır ≠ suç.',
  },
  'is-kaybi': {
    tur: 'kalinti-dis',
    betimlemeler: ['Ütülü gömlekler hazır ama takvimde iki haftadır boş günler; kartvizitlerin yarısı çöpte.', 'Masada açık iş ilanları; şirket kimlik kartı çekmecenin dibinde.'],
    ima: 'İşiyle ilgili bir şey saklıyor: "işler nasıl?" diye sor, cevabı temel çizgiyle kıyasla. Sır ≠ suç.',
  },
  bagimlilik: {
    tur: 'kalinti-ic',
    betimlemeler: ['Dolabın arkasında boş şişeler; ağız spreyi ve naneli şeker paketleri.', 'Reçetesiz ilaç kutuları; sürekli yenilenen bir su sürahisi.'],
    ima: 'Bir bağımlılığı saklıyor olabilir: gerginliğinin kaynağı bu olabilir (Othello). Sır ≠ suç.',
  },
  sabika: {
    tur: 'kalinti-dis',
    betimlemeler: ['Kilitli küçük bir kutu; eski tarihli, resmi görünüşlü bir zarf.', 'Başka bir şehirden gelmiş avukat mektubu; sayfaları çok kez katlanmış.'],
    ima: 'Geçmişinde sakladığı bir şey var: sabıka gerginlik yaratır, suç kanıtı değildir. Sır ≠ suç.',
  },
};

const SICAK_ODA = ['Oda sıcak ve dekore: duvarda fotoğraflar, iki misafir koltuğu, masada ikramlık.', 'Kapı açık; içeride konuk sandalyeleri, duvarda konser afişleri, radyo çalıyor.', 'Davetkâr bir köşe: kilim, minderler, yarısı dolu bir ziyaretçi defteri.'];
const CIPLAK_ODA = ['Oda çıplak: tek sandalye, duvarda hiçbir şey, kapı hep kapalı.', 'Masada tek bir kalem ve defter; konuk oturacak yer yok.', 'Perdeler çekili, tek kişilik düzen; her şey kendine dönük.'];
const KAYGI_KALINTISI = ['Komodinde papatya çayı kutuları ve uyku damlası; not defterinde üstü çizilip yeniden yazılmış listeler.', 'Kapının arkasında iki ayrı kilit; takvimde her randevu üç kez işaretlenmiş.', 'Masada tırnakla oyulmuş bir silgi; ilaç dolabında sakinleştirici bitki çayları.'];
const SAHNE = ['Kitaplık kusursuz dizilmiş, ama raftaki toz izleri kitapların dün yerinden oynatıldığını söylüyor.', 'Masada açık bir felsefe kitabı; sırtı hiç kırılmamış, sayfa köşeleri dümdüz.', 'Çerçeveli takdir belgeleri tam göz hizasında; arkalarındaki boya duvarın kalanından açık, yeni asılmış.'];
const BASKALARINA_IDDIA = ['Masanın üstünde konuklara dönük diploma ve ödül; kişisel hiçbir şey görünürde değil.', 'Girişte özenle sergilenmiş sertifikalar; çalışma masası ise bomboş.'];
const TUZAK = ['Renkli minderler, neşeli bir tablo, pencerede taze çiçek.', 'Duvarda gülümseyen aile fotoğrafları, masada şekerleme kâsesi.', 'Yumuşak ışık, rahat koltuk, kapıda el yapımı "hoş geldiniz" yazısı.'];
const GURULTU: { betimleme: string; tur: EsyaTuru; ima: string }[] = [
  { betimleme: 'Pencere kenarında küçük bir çakıl taşı ve bir deniz kabuğu.', tur: 'kimlik-iddiasi-kendine', ima: 'Kendine yönelik kimlik iddiası (kişisel anlamlı nesne): ona bir şey ifade eder, sana bir şey söylemez.' },
  { betimleme: 'Yarım kalmış bir bulmaca ve soğumuş çay.', tur: 'kalinti-ic', ima: 'Tekrarlanan bir alışkanlığın kalıntısı; vakayla ilgisi yok.' },
  { betimleme: 'Raflarda şiir, astronomi ve aşçılık kitapları yan yana.', tur: 'kalinti-ic', ima: 'Kitap ÇEŞİTLİLİĞİ deneyime açıklığın geçerli ipucudur (miktar değil çeşitlilik); vakayla ilgisi yok.' },
  { betimleme: 'Askıda bir yağmurluk ve kullanılmış bir sinema bileti.', tur: 'kalinti-dis', ima: 'Dış davranış kalıntısı: dışarıda ne yaptığını gösterir; hangi gün olduğunu sorabilirsin.' },
];

/** Bir kişinin odasını okur; seed + kişi ile deterministik. Sırrı olan tek bir sır kalıntısı bırakır. */
export function odaOku(sorgu: Sorgu, kisi: KisiId): OdaOkumasi {
  const { vaka, sirKatmani } = sorgu.durum;
  const kayit = vaka.kisiler.find((k) => k.id === kisi)!;
  const r = new Rastgele(`${vaka.seed}/oda/${kisi}`);
  const esyalar: Omit<OdaEsyasi, 'id'>[] = [];
  const { disadonukluk, kaygi, ozIzleme } = kayit.kisilik;

  // 1) Dışadönüklük: sıcak/dekore oda geçerli ipucu (Gosling 2002: ofiste .24, davetkârlık ipucu).
  if (disadonukluk > 0.65) esyalar.push({ betimleme: r.sec(SICAK_ODA), tur: 'kalinti-ic', konu: 'kisilik', gecerli: true, ima: 'Dışadönük: sıcak, dekore, davetkâr oda dışadönüklüğün geçerli ipucudur. Konuşkanlığı ve göz teması onun normali; suçla ilgisi yok.' });
  else if (disadonukluk < 0.35) esyalar.push({ betimleme: r.sec(CIPLAK_ODA), tur: 'kalinti-ic', konu: 'kisilik', gecerli: true, ima: 'Çıplak, kendine dönük oda: içe dönük kişinin kalıntısı. Az konuşması, göz kaçırması onun normali; yalan ipucu değil.' });

  // 2) Kaygı: yatak odasından duygusal denge orta düzeyde okunur (.36); gergin masum uyarısı.
  if (kaygi > 0.65 && r.sans(0.8)) esyalar.push({ betimleme: r.sec(KAYGI_KALINTISI), tur: 'kalinti-ic', konu: 'kaygi', gecerli: true, ima: 'Kaygı eğilimi: gerginliği onun normali olabilir. Sorguda gerilirse Othello hatasına dikkat.' });

  // 3) Sır kalıntısı: sırrı olan herkes (fail de masum da) tek bir iz bırakır. Sır ≠ suç.
  const sir = sirKatmani.sirlar.find((s) => s.kisi === kisi);
  if (sir) {
    const k = SIR_KALINTILARI[sir.tur];
    esyalar.push({ betimleme: r.sec(k.betimlemeler), tur: k.tur, konu: 'sir', gecerli: true, ima: k.ima });
  }

  // 4) Öz-izleme: yüksekse oda izlenim için düzenlenmiş olabilir (sahnelenmiş) ya da başkalarına yönelik iddia taşır.
  //    Faille ilişkisi yok; sadece kişilikten. (Kalıp = hata.)
  if (ozIzleme > 0.65) {
    if (r.sans(0.7)) esyalar.push({ betimleme: r.sec(SAHNE), tur: 'sahnelenmis', konu: 'sahne', gecerli: true, ima: 'Oda izlenim için düzenlenmiş: başkalarına yönelik stratejik iddia. Yüksek öz-izleme; okunması zor kişi. Dürüst görünme çabası suç kanıtı değildir.' });
    else esyalar.push({ betimleme: r.sec(BASKALARINA_IDDIA), tur: 'kimlik-iddiasi-baskalarina', konu: 'iddia', gecerli: true, ima: 'Başkalarına yönelik kimlik iddiası: kendini nasıl göstermek istediğini söyler, ne olduğunu değil.' });
  }

  // 5) Tuzak: "hoş oda = hoş insan" (uyumluluk doğruluğu −.04). Kişilikten bağımsız; herkesin odasında olabilir.
  if (r.sans(0.6)) esyalar.push({ betimleme: r.sec(TUZAK), tur: 'kimlik-iddiasi-kendine', konu: 'tuzak', gecerli: false, ima: '"Hoş oda = hoş, uyumlu insan" halk inancı: Gosling 2002\'de geçersiz çıktı. Sevimli oda güven vermez; sevimsiz oda şüphe.' });

  // 6) Gürültü: en az 3 eşya olsun diye ilgisiz kalıntı/iddia.
  const havuz = r.karistir([...GURULTU]);
  while (esyalar.length < 3 && havuz.length) {
    const g = havuz.pop()!;
    esyalar.push({ betimleme: g.betimleme, tur: g.tur, konu: 'gurultu', gecerli: true, ima: g.ima });
  }

  const sirali = r.karistir(esyalar).slice(0, 5);
  return { kisi, esyalar: sirali.map((e, i) => ({ id: `${kisi}/${i}`, ...e })) };
}

/** Oyuncu sınıflamalarının karnesi: kaç eşya, kaçı doğru sınıflandı. Sınıflanmayan eşya yanlış sayılmaz, sadece n'e girer. */
export function odaKarnesi(sorgu: Sorgu): { n: number; dogru: number; sinifsiz: number } | undefined {
  if (sorgu.odaOkumalari.size === 0) return undefined;
  let n = 0, dogru = 0, sinifsiz = 0;
  for (const okuma of sorgu.odaOkumalari.values()) {
    for (const e of okuma.esyalar) {
      n++;
      const s = sorgu.odaSiniflamalari.get(e.id);
      if (!s) sinifsiz++;
      else if (s === ESYA_SINIFI[e.tur]) dogru++;
    }
  }
  return { n, dogru, sinifsiz };
}

// ---------------------------------------------------------------------------------------------
// Dijital iz

export type KurbanTonu = 'sicak' | 'notr' | 'soguk' | 'yok';

export interface DijitalProfil {
  kisi: KisiId;
  arkadas: number;
  haftalikPaylasim: number;
  foto: number;
  grup: number;
  /** Dolaylı sinyaller (Kosinski: "Curly Fries" → zekâ); oyunda renk, çıkarım değil. */
  begeniler: string[];
  /** Kurbana dair son paylaşımın tonu; yüksek öz-izleyen kürate eder (asla soğuk görünmez). */
  kurbanaDairTon: KurbanTonu;
}

const BEGENI_HAVUZU = ['Gök gürültülü fırtınalar', 'Kıvırcık patates', 'Bilim belgeselleri', 'Klasik müzik', 'Gece yürüyüşleri', 'Kahve sanatı', 'Eski filmler', 'Şiir sayfaları', 'Motor sporları', 'Bahçe işleri', 'Bulmaca grupları', 'Yerel tiyatro'];

/** Kişinin dijital profili; dışadönüklükle ilişkili, kaygıyla ilişkisiz (Gosling 2011: nevrotiklik görünmez). */
export function dijitalIz(sorgu: Sorgu, kisi: KisiId): DijitalProfil {
  const { vaka } = sorgu.durum;
  const kayit = vaka.kisiler.find((k) => k.id === kisi)!;
  const r = new Rastgele(`${vaka.seed}/dijital/${kisi}`);
  const { disadonukluk, ozIzleme } = kayit.kisilik;
  const arkadas = Math.max(5, Math.round(60 + 420 * disadonukluk + r.normal(0, 110)));
  const haftalikPaylasim = Math.max(0, Math.round(0.5 + 9 * disadonukluk + r.normal(0, 3)));
  const foto = Math.max(0, Math.round(15 + 220 * disadonukluk + r.normal(0, 70)));
  const grup = Math.max(0, Math.round(1 + 9 * disadonukluk + r.normal(0, 3)));
  const begeniler = r.karistir([...BEGENI_HAVUZU]).slice(0, 3);

  const { kurban } = vaka.olay;
  const iliski = vaka.iliskiler.find((i) => (i.a === kisi && i.b === kurban) || (i.b === kisi && i.a === kurban));
  const gercekTon: KurbanTonu = !iliski ? 'notr' : iliski.sicaklik > 0.3 ? 'sicak' : iliski.sicaklik < -0.3 ? 'soguk' : 'notr';
  let kurbanaDairTon: KurbanTonu;
  if (r.sans(0.15)) kurbanaDairTon = 'yok';
  else if (gercekTon === 'soguk' && r.sans(ozIzleme)) kurbanaDairTon = ozIzleme > 0.7 ? (r.sans(0.6) ? 'sicak' : 'yok') : 'notr'; // kürasyon: soğukluğu saklar
  else kurbanaDairTon = gercekTon;
  if (ozIzleme > 0.7 && kurbanaDairTon === 'soguk') kurbanaDairTon = 'notr';
  return { kisi, arkadas, haftalikPaylasim, foto, grup, begeniler, kurbanaDairTon };
}

// ---------------------------------------------------------------------------------------------
// "Şu an ne düşünüyor?" (Ickes 1990)

export const IC_SES_KATEGORILERI = ['suc-kaygisi', 'sir-kaygisi', 'koruma', 'inanilmama-korkusu', 'sakin', 'bellek-suphesi'] as const;
export type IcSesKategori = (typeof IC_SES_KATEGORILERI)[number];

/** Oyuncuya sunulan seçenek cümleleri (kategori başına sabit; ad vermez, sızdırmaz). */
export const IC_SES_SECENEKLERI: Record<IcSesKategori, string> = {
  'suc-kaygisi': '"Ne kadarını biliyorlar? Delili bulmuş olabilirler mi?"',
  'sir-kaygisi': '"Bunun olayla ilgisi yok; o konuyu açmasınlar yeter."',
  koruma: '"Ona soru sormasınlar. Ben sustukça o da güvende."',
  'inanilmama-korkusu': '"Bana inanmıyor. Gergin görünüyorum, bu daha da kötü."',
  sakin: '"Çay soğudu. Bu ne zaman biter?"',
  'bellek-suphesi': '"Gerçekten o saatte miydi? Emin değilim ama böyle demiştim."',
};

const BELLEK_TURLERI = new Set(['bellek-uyumu', 'dikkat-boslugu', 'sahte-ani', 'konfabulasyon']);
const KORUMA_TURLERI = new Set(['koruma-yalani', 'prova-edilmis-grup-alibisi']);

/** Cevabın gizli etiketinden gerçek iç ses kategorisi. Vaka sonunda açılır; oyun sırasında gösterilmez. */
export function icSesKategorisi(durum: VakaDurumu, cevap: Cevap): IcSesKategori {
  const { vaka } = durum;
  const kisi = vaka.kisiler.find((k) => k.id === cevap.kisi)!;
  const fail = cevap.kisi === vaka.olay.fail;
  const t = cevap.ifadeTuru;
  if (t === 'alakasiz-sir') return 'sir-kaygisi';
  if (KORUMA_TURLERI.has(t)) return 'koruma';
  if (t === 'sahte-itiraf') return 'inanilmama-korkusu';
  if (BELLEK_TURLERI.has(t)) return 'bellek-suphesi';
  if (YALAN_IFADE_TURLERI.has(t)) return fail ? 'suc-kaygisi' : 'sir-kaygisi';
  // Dürüst cevap: fail suç sorusunda yine suçu düşünür; masum kaygılıysa inanılmamaktan korkar.
  const sucSorusu = cevap.soru.tur === 'olay-bilgisi' || cevap.soru.dilim === vaka.olay.dilim;
  if (fail && sucSorusu) return 'suc-kaygisi';
  return kisi.kisilik.kaygi > 0.6 ? 'inanilmama-korkusu' : 'sakin';
}

/** Gerçek iç sesin vaka sonunda açılan metni; kategoriye göre kişiye özgü ayrıntı ekler. */
export function icSesMetni(durum: VakaDurumu, cevap: Cevap, kategori: IcSesKategori): string {
  const { vaka, sirKatmani } = durum;
  const ilkAd = (id: KisiId) => vaka.kisiler.find((k) => k.id === id)?.ad.split(' ')[0] ?? id;
  switch (kategori) {
    case 'koruma': {
      const k = sirKatmani.korumalar.find((c) => c.koruyan === cevap.kisi);
      return k ? `"${ilkAd(k.korunan)} için söylüyorum bunu. Ona sormasınlar."` : IC_SES_SECENEKLERI.koruma;
    }
    case 'sir-kaygisi': {
      const s = sirKatmani.sirlar.find((x) => x.kisi === cevap.kisi);
      return s ? `"Olayla ilgisi yok ama şunu öğrenmesinler: ${s.aciklama}."` : IC_SES_SECENEKLERI['sir-kaygisi'];
    }
    default:
      return IC_SES_SECENEKLERI[kategori];
  }
}

export interface IcSesTahmini {
  kisi: KisiId;
  soruAnahtari: string;
  tahmin: IcSesKategori;
  gercek: IcSesKategori;
  gercekMetin: string;
}

/** Bu kişiye verilen son cevap (yalan defterinin ekleme sırası). */
export function sonCevap(sorgu: Sorgu, kisi: KisiId, soru?: Soru): Cevap | undefined {
  if (soru) return sorgu.durum.defter.get(`${kisi}|${soruAnahtari(soru)}`);
  let son: Cevap | undefined;
  for (const [anahtar, cevap] of sorgu.durum.defter) if (anahtar.startsWith(`${kisi}|`)) son = cevap;
  return son;
}

/** Bu kişiyle kaç soru konuşuldu (defter kayıtları). */
function konusmaSayisi(sorgu: Sorgu, kisi: KisiId): number {
  let n = 0;
  for (const anahtar of sorgu.durum.defter.keys()) if (anahtar.startsWith(`${kisi}|`)) n++;
  return n;
}

const IC_SES_AZ_KONUSMA = 3;

export type IcSesSonucu =
  | { teknik: 'ic-ses'; uygulanamaz: true; neden: string }
  | { teknik: 'ic-ses'; uygulanamaz: false; tahmin: IcSesKategori; secenekler: IcSesKategori[] };

/**
 * Oyuncunun tahminini kaydeder; gerçeği sonuca YAZMAZ (vaka sonunda açılır).
 * Az konuşulan kişide (3 sorudan az) altı seçenek, yeterince konuşulanda dört: Ickes'te soru sormak doğruluğu artırır.
 */
export function icSesTahminEt(sorgu: Sorgu, kisi: KisiId, tahmin: IcSesKategori | undefined, soru?: Soru): IcSesSonucu {
  const cevap = sonCevap(sorgu, kisi, soru);
  if (!cevap) return { teknik: 'ic-ses', uygulanamaz: true, neden: 'Henüz konuşmadınız; okunacak an yok.' };
  if (!tahmin) return { teknik: 'ic-ses', uygulanamaz: true, neden: 'Bir tahmin seçilmedi.' };
  const gercek = icSesKategorisi(sorgu.durum, cevap);
  const anahtar = soruAnahtari(cevap.soru);
  const r = new Rastgele(`${sorgu.durum.vaka.seed}/icses/${kisi}/${anahtar}`);
  const digerleri = r.karistir(IC_SES_KATEGORILERI.filter((k) => k !== gercek));
  const secenekler = konusmaSayisi(sorgu, kisi) >= IC_SES_AZ_KONUSMA ? r.karistir([gercek, ...digerleri.slice(0, 3)]) : r.karistir([gercek, ...digerleri]);
  sorgu.icSesTahminleri.push({ kisi, soruAnahtari: anahtar, tahmin, gercek, gercekMetin: icSesMetni(sorgu.durum, cevap, gercek) });
  return { teknik: 'ic-ses', uygulanamaz: false, tahmin, secenekler };
}

// ---------------------------------------------------------------------------------------------
// Kayıt inceleme (Swerts 2013)

/** Yavaşlatma + yüz bölgesi gizleme: küçük bir ek görünürlük (%49 → %53 ölçeğinde). */
const KAYIT_CARPANI = 1.25;
/** Temel çizgide bu olasılığın üstünde gözlenen ipucu "onun normali" sayılır. */
const NORMAL_ESIGI = 0.35;

export type KayitSonucu =
  | { teknik: 'kayit-inceleme'; uygulanamaz: true; neden: string }
  | { teknik: 'kayit-inceleme'; uygulanamaz: false; soru: Soru; temelCizgiVar: boolean; gozlemler: IpucuGozlemi[]; normali: IpucuGozlemi[]; sapmalar: IpucuGozlemi[] };

/** Kaydı yeniden izlemek: aynı cevap, yeni bir gözlem çekimi; temel çizgi varsa gözlemler normali/sapma diye ayrılır. */
export function kayitIncele(sorgu: Sorgu, kisi: KisiId, soru?: Soru): KayitSonucu {
  const cevap = sonCevap(sorgu, kisi, soru);
  if (!cevap) return { teknik: 'kayit-inceleme', uygulanamaz: true, neden: 'Bu kişiyle henüz kayıt yok.' };
  const gozlemler = ipucuUret(sorgu.durum, cevap, { kaymaCarpani: KAYIT_CARPANI, ekGerginlik: sorgu.stres.get(kisi) ?? 0, etiket: 'kayit' });
  const temelCizgiVar = sorgu.gecmis.some((g) => g.kisi === kisi && g.teknik === 'temel-cizgi');
  if (!temelCizgiVar) return { teknik: 'kayit-inceleme', uygulanamaz: false, soru: cevap.soru, temelCizgiVar, gozlemler, normali: [], sapmalar: [] };
  const taban = temelCizgi(sorgu.durum, kisi);
  const normali = gozlemler.filter((g) => (taban.get(g.ipucuId) ?? 0) >= NORMAL_ESIGI);
  const sapmalar = gozlemler.filter((g) => (taban.get(g.ipucuId) ?? 0) < NORMAL_ESIGI);
  return { teknik: 'kayit-inceleme', uygulanamaz: false, soru: cevap.soru, temelCizgiVar, gozlemler, normali, sapmalar };
}
