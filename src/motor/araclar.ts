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

// Görünen adlar docs/USLUP.md terim sözlüğüne göre (identity claim → kimlik mesajı, behavioral residue → davranış izi).
export const ESYA_SINIF_ADLARI: Record<EsyaSinifi, string> = {
  iddia: 'Kimlik mesajı',
  kalinti: 'Davranış izi',
  sahnelenmis: 'Göstermelik',
};

export const ESYA_TURU_ADLARI: Record<EsyaTuru, string> = {
  'kimlik-iddiasi-kendine': 'Kendine verdiği mesaj',
  'kimlik-iddiasi-baskalarina': 'Başkalarına verdiği mesaj',
  'kalinti-ic': 'Odadaki alışkanlık izi',
  'kalinti-dis': 'Dışarıdaki hayatının izi',
  sahnelenmis: 'Göstermelik düzen',
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
    betimlemeler: ['İki fincan, ikisi de yıkanmamış; yastığın altında ona ait olmayan bir çakmak.', 'Lavaboda iki diş fırçası; dolapta ona küçük gelecek bir ceket.', 'Telefon ekranı hep aşağı dönük; çekmecede küçük, açılmamış bir hediye paketi.', 'Yatak odasında iki farklı parfüm; yalnızca biri onun.'],
    ima: 'Biriyle gizlice görüşüyor olabilir; "O akşam kiminleydin?" diye sor. Sır saklamak suç işlemek demek değildir.',
  },
  'gizli-ziyaret': {
    tur: 'kalinti-dis',
    betimlemeler: ['Ceketin cebinde başka bir semtin otobüs bileti; ayakkabıda taze çamur.', 'Masada sonradan buruşturulmuş bir adres notu; anahtarlıkta tanımadığın bir anahtar.', 'Otopark makbuzu, tanımadığın bir semtten; ceket cebinde katlanmış bir kroki.', 'Ayakkabılıkta tek çift çamurlu bot; diğerleri pırıl pırıl.'],
    ima: 'Söylemediği bir yere gitmiş: nereye, kimi görmeye? Sır saklamak suç işlemek demek değildir.',
  },
  'gizli-borc': {
    tur: 'kalinti-dis',
    betimlemeler: ['Çekmecede el yazısıyla vade tarihleri; açılmamış banka zarfları.', 'Rehin dükkânı makbuzu; boş bir mücevher kutusu.', 'Kesilmiş kredi kartı parçaları çöpte; masada ödeme planı hesapları.', 'Duvarda boş bir çerçeve; satılmış bir tablonun izi hâlâ solgun.'],
    ima: 'Para sıkıntısını saklıyor. Bu sorulacak bir konu, suçun kanıtı değil.',
  },
  'is-kaybi': {
    tur: 'kalinti-dis',
    betimlemeler: ['Ütülü gömlekler hazır ama takvimde iki haftadır boş günler; kartvizitlerin yarısı çöpte.', 'Masada açık iş ilanları; şirket kimlik kartı çekmecenin dibinde.', 'Şirket rozeti çekmecede, kordonu kesilmiş; masada özgeçmiş taslakları.', 'Takım elbise askıda naylonuyla; ajandada \'toplantı\' yazılı ama boş saatler.'],
    ima: 'İşiyle ilgili bir şey saklıyor. "İşler nasıl?" diye sor ve cevabını kişinin normaliyle karşılaştır. Sır saklamak suç işlemek demek değildir.',
  },
  bagimlilik: {
    tur: 'kalinti-ic',
    betimlemeler: ['Dolabın arkasında boş şişeler; ağız spreyi ve naneli şeker paketleri.', 'Reçetesiz ilaç kutuları; sürekli yenilenen bir su sürahisi.', 'Çekmecede birden fazla eczaneden alınmış aynı ilaç; fişler farklı tarihli.', 'Buzdolabında yalnızca içecek; tezgâhta açılmamış yemek paketleri.'],
    ima: 'Bir bağımlılığı saklıyor olabilir; gerginliğinin kaynağı bu olabilir (Othello hatası). Sır saklamak suç işlemek demek değildir.',
  },
  sabika: {
    tur: 'kalinti-dis',
    betimlemeler: ['Kilitli küçük bir kutu; eski tarihli, resmi görünüşlü bir zarf.', 'Başka bir şehirden gelmiş avukat mektubu; sayfaları çok kez katlanmış.', 'Parmak izi mürekkebi izi taşıyan eski bir kart; dosya dolabında \'kapandı\' yazılı klasör.', 'Bir kefalet bürosunun kartviziti; takvimde düzenli aralıklarla aynı harfle işaretlenmiş günler.'],
    ima: 'Geçmişinde sakladığı bir şey var. Sabıka kaydı insanı gerer ama bu olayda suç kanıtı değildir.',
  },
};

const SICAK_ODA = [
  'Oda sıcak ve dekore: duvarda fotoğraflar, iki misafir koltuğu, masada ikramlık.',
  'Kapı açık; içeride konuk sandalyeleri, duvarda konser afişleri, masada açık bir çikolata kutusu.',
  'Masanın karşısında iki koltuk; duvarda arkadaşlarla çekilmiş fotoğraflar, rafta oyun kutuları.',
  'Girişte "hoş geldin" paspası; içeride müzik açık, yanında ikinci bir fincan hazır.',
  'Renkli duvarlar, üst üste davetiye kartları, masada herkesin alabileceği bir şeker kavanozu.',
  'Kapı hep aralık; içeride büyük bir masanın etrafına dizilmiş beş sandalye, duvarda grup fotoğrafları.',
  'Pencere önünde iki kişilik kanepe, masada iki bardak, panoda etkinlik biletleri.',
  'Oda kalabalık ve canlı: duvarda kartpostallar, rafta hediye paketleri, masada misafir defteri.',
];
const CIPLAK_ODA = [
  'Oda çıplak: tek sandalye, duvarda hiçbir şey, kapı hep kapalı.',
  'Masada tek bir kalem ve defter; konuk oturacak yer yok.',
  'Perdeler çekili, ışık loş; duvarda tek bir takvim, o da geçen aydan.',
  'Rafta sıraya dizili dosyalar, kişisel tek bir nesne yok; kapıda "rahatsız etmeyin" kartı.',
  'Tek koltuk pencereye dönük; masada kulaklık, duvarda boş çiviler.',
  'Oda küçük ve sessiz; kitaplar kapalı raflarda, masada yalnızca bir su bardağı.',
  'Konuk sandalyesi dosyalarla dolu; duvarda çerçevesiz tek bir harita.',
  'Kapı kilitli tutuluyor; içeride tek bir lamba ve yıpranmış bir okuma koltuğu.',
];
const KAYGI_KALINTISI = [
  'Komodinde papatya çayı kutuları ve uyku damlası; not defterinde üstü çizilip yeniden yazılmış listeler.',
  'Kapının arkasında iki ayrı kilit; takvimde her randevu üç kez işaretlenmiş.',
  'Masada tırnakla oyulmuş bir silgi; ilaç dolabında sakinleştirici bitki çayları.',
  'Çekmecede yedek şarj aleti, yedek anahtar, yedek ilaç; hepsi etiketli.',
  'Yatak başında el feneri ve su; not defterinde "unutma" ile başlayan yarım sayfa.',
  'Ajandada saatler dakikasına kadar yazılmış; kenarlara "geç kalma" notları.',
  'Masa üstünde nefes egzersizi kartı; pencere kilidi ikinci bir mandalla desteklenmiş.',
  'Telefonun yanında üç liste: yapılacaklar, yapılanlar, yapılamayanlar.',
];
const SAHNE = [
  'Kitaplık kusursuz dizilmiş, ama raftaki toz izleri kitapların dün yerinden oynatıldığını söylüyor.',
  'Masada açık bir felsefe kitabı; sırtı hiç kırılmamış, sayfaları yeni.',
  'Duvarda yeni asılmış bir diploma; çivinin etrafındaki boya izi eski çerçevenin daha küçük olduğunu gösteriyor.',
  'Çalışma masası düzenli ama çekmeceler tıka basa; yalnızca görünen yüzey düzenlenmiş.',
  'Spor ekipmanı görünür yerde, etiketleri hâlâ üstünde.',
  'Konuk koltuğunun önüne konmuş aile albümü; kapağında tek bir parmak izi yok.',
  'Masada "Ziyaretçi" defteri; ilk sayfa dışında boş.',
  'Rafta ödül kupaları öne, tozlu kutular arkaya alınmış; raf izleri yeni.',
];
const BASKALARINA_IDDIA = [
  'Masanın üstünde konuklara dönük diploma ve ödül; kişisel hiçbir şey görünürde değil.',
  'Girişte özenle sergilenmiş sertifikalar; çalışma masası ise bomboş.',
  'Duvarda ünlü kişilerle çekilmiş fotoğraflar, hepsi kapıya bakan açıda.',
  'Masada pahalı bir dolma kalem, hiç kullanılmamış; yanında kartvizitlik dolu.',
  'Rafta sırtı okunmamış ciltli klasikler; kapıdan girenin ilk gördüğü yerde.',
  'Kapı arkasında ayna değil, gelenlerin göreceği yerde bir başarı plaketi.',
  'Konuk sandalyesinin karşısında bir gazete kesiği: kendi adı sarıyla çizilmiş.',
  'Masada açık bırakılmış bir teşekkür mektubu; zarfı ortada yok.',
];
const TUZAK = [
  'Renkli minderler, neşeli bir tablo, pencerede taze çiçek.',
  'Duvarda gülümseyen aile fotoğrafları, masada şekerleme kâsesi.',
  'Yumuşak ışık, kedili takvim, pencere kenarında el yapımı bir kupa.',
  'Rafta çocuk resimleri, masada kurabiye kavanozu, kapıda hoş bir çan.',
  'Pastel duvarlar, yastıkta nakışlı bir söz: "Her gün yeni bir başlangıç."',
  'Küçük bir akvaryum, bitki dolu pencere kenarı, masada kart oyunu.',
  'Duvarda motivasyon posteri, rafta el örgüsü battaniye, masada nane şekeri.',
  'Kapı üstünde nazar boncuğu, içeride meyve tabağı ve gülümseyen bir çerçeve.',
];
const GURULTU: { betimleme: string; tur: EsyaTuru; ima: string }[] = [
  { betimleme: 'Pencere kenarında küçük bir çakıl taşı ve bir deniz kabuğu.', tur: 'kimlik-iddiasi-kendine', ima: 'Kendine verdiği bir mesaj; kişisel anlamı olan bir nesne. Ona bir şey ifade eder, sana bir şey söylemez.' },
  { betimleme: 'Yarım kalmış bir bulmaca ve soğumuş çay.', tur: 'kalinti-ic', ima: 'Tekrarlanan bir alışkanlığın izi; vakayla ilgisi yok.' },
  { betimleme: 'Raflarda şiir, astronomi ve aşçılık kitapları yan yana.', tur: 'kalinti-ic', ima: 'Kitapların sayısı değil çeşitliliği, deneyime açıklığın geçerli bir ipucudur; vakayla ilgisi yok.' },
  { betimleme: 'Askıda bir yağmurluk ve kullanılmış bir sinema bileti.', tur: 'kalinti-dis', ima: 'Dışarıdaki hayatının izi: dışarıda ne yaptığını gösterir. Hangi gün olduğunu sorabilirsin.' },
  { betimleme: 'Pencere pervazında yarısı okunmuş bir gazete ve bir okuma gözlüğü.', tur: 'kalinti-ic', ima: 'Tekrarlanan bir alışkanlığın izi; vakayla ilgisi yok.' },
  { betimleme: 'Kapı arkasında bir şemsiye ve tozlu bir spor çantası.', tur: 'kalinti-dis', ima: 'Dışarıdaki hayatının izi; en son ne zaman kullanıldığını sorabilirsin.' },
  { betimleme: 'Masada bir saksı bitkisi, altında sulama takvimi.', tur: 'kalinti-ic', ima: 'Düzenli bir alışkanlığın izi; vakayla ilgisi yok.' },
  { betimleme: 'Rafta eski bir fotoğraf makinesi ve birkaç yabancı bozuk para.', tur: 'kimlik-iddiasi-kendine', ima: 'Kendine verdiği bir mesaj: kim olmak istediğini anlatır, o akşamı değil.' },
  { betimleme: 'Masanın altında bir çift terlik; yanında yarısı bitmiş bir bulmaca kitabı.', tur: 'kalinti-ic', ima: 'Bir alışkanlığın izi; vakayla ilgisi yok.' },
  { betimleme: 'Duvarda bir konser bileti, tarihi geçen ay.', tur: 'kalinti-dis', ima: 'Dışarıdaki hayatının izi: geçen ay nerede olduğunu anlatır, o akşamı değil.' },
  { betimleme: 'Pencere kenarında küçük bir kaktüs koleksiyonu.', tur: 'kimlik-iddiasi-kendine', ima: 'Kendine verdiği bir mesaj; suçla ilgisi yok.' },
  { betimleme: 'Çekmecede eski bir harita ve bir pusula.', tur: 'kimlik-iddiasi-kendine', ima: 'Kendine verdiği bir mesaj: hayallerini anlatır, ne yaptığını değil.' },
];

/**
 * Gürültü dışı eşyalar (kişilik, kaygı, sır, öz-izleme, tuzak) ve kişinin RNG'si.
 * Ayrı fonksiyon: gürültü kaydırması için önceki kişilerin eşya sayısı da buradan hesaplanır.
 */
function temelEsyalar(sorgu: Sorgu, kisi: KisiId): { esyalar: Omit<OdaEsyasi, 'id'>[]; r: Rastgele } {
  const { vaka, sirKatmani } = sorgu.durum;
  const kayit = vaka.kisiler.find((k) => k.id === kisi)!;
  const r = new Rastgele(`${vaka.seed}/oda/${kisi}`);
  const esyalar: Omit<OdaEsyasi, 'id'>[] = [];
  const { disadonukluk, kaygi, ozIzleme } = kayit.kisilik;
  // Vaka içinde tekillik: her havuz vaka düzeyinde bir kez karıştırılır ve kişi sırasına göre dağıtılır;
  // böylece aynı vakada iki kişinin odasında aynı eşya ("gülümseyen aile fotoğrafları") çıkmaz.
  // Havuzlar 8'er eşya, kişi sayısı en fazla 8. Kişilik/sır koşulları yine kişiye özel `r` ile atılır.
  const kisiIndeks = Math.max(0, vaka.kisiler.findIndex((k) => k.id === kisi));
  const secTekil = <T>(havuz: readonly T[], etiket: string, sira = kisiIndeks): T => {
    const karisik = new Rastgele(`${vaka.seed}/oda-havuz/${etiket}`).karistir(havuz);
    return karisik[sira % karisik.length]!;
  };

  // 1) Dışadönüklük: sıcak/dekore oda geçerli ipucu (Gosling 2002: ofiste .24, davetkârlık ipucu).
  if (disadonukluk > 0.65) esyalar.push({ betimleme: secTekil(SICAK_ODA, 'sicak'), tur: 'kalinti-ic', konu: 'kisilik', gecerli: true, ima: 'Sıcak, süslü, davetkâr bir oda dışadönüklüğün geçerli bir ipucudur. Konuşkanlığı ve göz teması onun normali; suçla ilgisi yok.' });
  else if (disadonukluk < 0.35) esyalar.push({ betimleme: secTekil(CIPLAK_ODA, 'ciplak'), tur: 'kalinti-ic', konu: 'kisilik', gecerli: true, ima: 'Sade ve kapalı bir oda, içe dönük birinin izidir. Az konuşması ve göz kaçırması onun normali; yalan ipucu değil.' });

  // 2) Kaygı: yatak odasından duygusal denge orta düzeyde okunur (.36); gergin masum uyarısı.
  if (kaygi > 0.65 && r.sans(0.8)) esyalar.push({ betimleme: secTekil(KAYGI_KALINTISI, 'kaygi'), tur: 'kalinti-ic', konu: 'kaygi', gecerli: true, ima: 'Kaygıya yatkın biri; gerginlik onun normali olabilir. Sorguda gerilirse Othello hatasına düşme.' });

  // 3) Sır kalıntısı: sırrı olan herkes (fail de masum da) tek bir iz bırakır. Sır ≠ suç.
  const sir = sirKatmani.sirlar.find((s) => s.kisi === kisi);
  if (sir) {
    const k = SIR_KALINTILARI[sir.tur];
    // Aynı sırrı taşıyanlar arasındaki sıra: iki kişi aynı sır türündeyse farklı kalıntı görürler.
    const ayniSir = sirKatmani.sirlar.filter((x) => x.tur === sir.tur).map((x) => x.kisi);
    esyalar.push({ betimleme: secTekil(k.betimlemeler, `sir-${sir.tur}`, Math.max(0, ayniSir.indexOf(kisi))), tur: k.tur, konu: 'sir', gecerli: true, ima: k.ima });
  }

  // 4) Öz-izleme: yüksekse oda izlenim için düzenlenmiş olabilir (sahnelenmiş) ya da başkalarına yönelik iddia taşır.
  //    Faille ilişkisi yok; sadece kişilikten. (Kalıp = hata.)
  if (ozIzleme > 0.65) {
    if (r.sans(0.7)) esyalar.push({ betimleme: secTekil(SAHNE, 'sahne'), tur: 'sahnelenmis', konu: 'sahne', gecerli: true, ima: 'Oda izlenim bırakmak için düzenlenmiş; başkalarına bilerek verilen bir mesaj. Öz-izlemesi yüksek, okunması zor biri. Dürüst görünme çabası suç kanıtı değildir.' });
    else esyalar.push({ betimleme: secTekil(BASKALARINA_IDDIA, 'iddia'), tur: 'kimlik-iddiasi-baskalarina', konu: 'iddia', gecerli: true, ima: 'Başkalarına verilen bir mesaj: kendini nasıl göstermek istediğini anlatır, nasıl biri olduğunu değil.' });
  }

  // 5) Tuzak: "hoş oda = hoş insan" (uyumluluk doğruluğu −.04). Kişilikten bağımsız; herkesin odasında olabilir.
  if (r.sans(0.6)) esyalar.push({ betimleme: secTekil(TUZAK, 'tuzak'), tur: 'kimlik-iddiasi-kendine', konu: 'tuzak', gecerli: false, ima: '"Hoş oda, hoş insan" inancı Gosling 2002\'de geçersiz çıktı. Sevimli bir oda güvenmek için, sevimsiz bir oda şüphelenmek için sebep değildir.' });

  return { esyalar, r };
}

/** Bir kişinin odasını okur; seed + kişi ile deterministik. Sırrı olan tek bir sır kalıntısı bırakır. */
export function odaOku(sorgu: Sorgu, kisi: KisiId): OdaOkumasi {
  const { vaka } = sorgu.durum;
  const { esyalar, r } = temelEsyalar(sorgu, kisi);

  // 6) Gürültü: en az 3 eşya olsun diye ilgisiz kalıntı/iddia. Havuz vaka düzeyinde karıştırılır ve
  //    önceki kişilerin gürültü ihtiyacı kadar kaydırılır: kişiler birbirinin eşyasını almaz (havuz yetince).
  const kisiIndeks = Math.max(0, vaka.kisiler.findIndex((k) => k.id === kisi));
  const ihtiyac = (id: KisiId) => Math.max(0, 3 - temelEsyalar(sorgu, id).esyalar.length);
  let kayma = 0;
  for (const k of vaka.kisiler.slice(0, kisiIndeks)) kayma += ihtiyac(k.id);
  const gurultuKarisik = new Rastgele(`${vaka.seed}/oda-havuz/gurultu`).karistir([...GURULTU]);
  for (let i = 0; esyalar.length < 3 && i < gurultuKarisik.length; i++) {
    const g = gurultuKarisik[(kayma + i) % gurultuKarisik.length]!;
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
  if (!cevap) return { teknik: 'ic-ses', uygulanamaz: true, neden: 'Henüz konuşmadınız; okunacak bir an yok.' };
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
