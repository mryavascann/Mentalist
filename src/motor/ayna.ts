// "Ayna" ana düşman taslağı (TASARIM §14).
//
// Ayna, oyuncunun kör nokta profilini (geçmiş vakalarda biriken hata etiketleri) "okuyan" bir manipülatördür.
// Dizideki "düşman şüpheli listesini önceden biliyor" anının karşılığı: Ayna, oyuncunun KİME şüpheleneceğini
// oyuncunun kendi verisinden tahmin eder ve olay yerine bunu ima eden bir imza notu bırakır.
//
// Tasarım kısıtları:
//   1. Tahmin YALNIZCA oyuncuya görünür özelliklerden üretilir (kişilik temel çizgisi, kurbanla ilişki
//      sıcaklığı, görüşme sırası). Faille hiçbir bağı yoktur; örüntü testi bunu şans düzeyinde tutar.
//   2. Not, tahmin edilen kişinin adını yazmaz: oyuncuyu o kişiye itmek değil, vaka sonunda "okundun" demek amaçtır.
//   3. Ayna her vakada gelmez; kadans (AYNA_KADANSI) ve baskın bir kör nokta (≥2 tekrar) gerekir.
// Motor saf TS'dir; kör nokta profili dışarıdan liste olarak verilir (UI deposu üretir).
import { Rastgele } from '@ortak/rastgele';
import type { Kisi, KisiId, Vaka } from './tipler';

/** Kaç bitmiş vakada bir Ayna vakası gelir (3 → 3., 6., 9. vakalar). */
export const AYNA_KADANSI = 3;

/** Baskın kör nokta sayılması için gereken en az tekrar. */
const EN_AZ_TEKRAR = 2;

/**
 * Ayna'nın "imzası" olan arketipler: sahne, manipülasyon, örtbas. Her mekân türü için en az biri bulunur
 * (test denetler). Ayna vakasında ağırlıkları AYNA_ARKETIP_CARPANI ile çarpılır; fail seçimiyle ilgisi yoktur.
 */
export const AYNA_ARKETIPLERI: readonly string[] = ['motel-sahnelenmis', 'sahte-medyum', 'karnaval-el-cabuklugu', 'romantik-dolandiricilik', 'ofis-sabotaj', 'tarikat-ici-olum', 'hastane-yanlis-doz'];
export const AYNA_ARKETIP_CARPANI = 5;

export interface KorNokta { etiket: string; sayi: number }

/** Ark özeti: geçmiş Ayna vakalarından türer (kaç karşılaşma oldu, sonuncusunda okundu mu, önceki notlar). */
export interface AynaArkOzeti {
  /** Bu vakadan ÖNCEKİ Ayna karşılaşması sayısı. */
  karsilasma: number;
  /** Son karşılaşmada Ayna oyuncuyu okudu mu; hiç karşılaşma yoksa null. */
  sonOkundu: boolean | null;
  /** Önceki imza notları (sırayla). */
  notlar: string[];
}

/** Geçmiş kayıtlarının Ayna alanı (depo türünün motor tarafından bilinen kısmı). */
export interface AynaGecmisKaydi { ayna?: { okundu: boolean; not?: string } }

export function aynaArkOzeti(gecmis: readonly AynaGecmisKaydi[]): AynaArkOzeti {
  const aynalar = gecmis.filter((g) => g.ayna).map((g) => g.ayna!);
  return {
    karsilasma: aynalar.length,
    sonOkundu: aynalar.length ? aynalar[aynalar.length - 1]!.okundu : null,
    notlar: aynalar.filter((a) => a.not).map((a) => a.not!),
  };
}

/** Ayna kaç karşılaşmanın kaçında oyuncuyu okudu (kör nokta bölümünde gösterilir). */
export function aynaOkunmaOrani(gecmis: readonly AynaGecmisKaydi[]): { n: number; okundu: number } {
  const aynalar = gecmis.filter((g) => g.ayna).map((g) => g.ayna!);
  return { n: aynalar.length, okundu: aynalar.filter((a) => a.okundu).length };
}

export interface AynaTahmini {
  /** Hedef alınan kör nokta etiketi (hata_etiketleri.json kimliği). */
  etiket: string;
  /** Oyuncunun suçlayacağı tahmin edilen kişi; null = "kimseyi suçlamayacaksın" (doğruluk yanlılığı). */
  tahmin: KisiId | null;
  /** Vaka sonunda oyuncuya gösterilen gerekçe: Ayna neyi neden bekledi. */
  gerekce: string;
}

/**
 * Bu vaka bir Ayna vakası mı? Bitmiş vaka sayısı kadansa oturmalı ve kör nokta profilinin en üstündeki etiket
 * en az iki kez tekrarlamış olmalı (tek seferlik hata "kör nokta" değildir).
 */
export function aynaVakasiMi(bitmisVakaSayisi: number, korNoktalar: readonly KorNokta[]): boolean {
  if (bitmisVakaSayisi < AYNA_KADANSI || bitmisVakaSayisi % AYNA_KADANSI !== 0) return false;
  const baskin = korNoktalar[0];
  return !!baskin && baskin.sayi >= EN_AZ_TEKRAR;
}

/** Tahmine aday kişiler: hayatta ve kurban değil; sıra vaka listesi sırasıdır (görüşme sırası varsayımı). */
function adaylar(vaka: Vaka): Kisi[] {
  return vaka.kisiler.filter((k) => k.hayatta && k.id !== vaka.olay.kurban);
}

/** Kişinin kurbanla ilişki sıcaklığı (ilişki yoksa 0 = nötr). */
function kurbanlaSicaklik(vaka: Vaka, id: KisiId): number {
  const i = vaka.iliskiler.find((x) => (x.a === id && x.b === vaka.olay.kurban) || (x.b === id && x.a === vaka.olay.kurban));
  return i?.sicaklik ?? 0;
}

/**
 * Bir ölçüte göre en yüksek değerli adayı seç; eşitlikte seed'li rastgelelik (kalıp oluşmasın).
 * Ölçüt oyuncuya görünür bir özellikten türetilir.
 */
function enYuksek(liste: Kisi[], olcut: (k: Kisi) => number, r: Rastgele): Kisi {
  const enIyi = Math.max(...liste.map(olcut));
  const esitler = liste.filter((k) => olcut(k) === enIyi);
  return esitler.length === 1 ? esitler[0]! : r.sec(esitler);
}

/**
 * Ayna'nın tahmini: kör nokta profilinin en üstündeki etikete göre oyuncunun kime şüpheleneceği.
 * Etiket → görünür özellik eşlemesi:
 *   othello-hatasi / tek-ipucu / sorgulama-heuristigi / beklenti-ihlali → en kaygılı kişi (en çok "kıvranan")
 *   sosyal-kanit → en kaygılı ve en az öz-izlemeli kişi (takımın "bak kıvranıyor" dediği)
 *   hale-etkisi → en az dışadönük kişi (sempatik olan korunur, soğuk olan suçlanır)
 *   temsil-edicilik / yalan-yanliligi → kurbana en soğuk kişi ("tipik şüpheli": motivasyonu görünür olan)
 *   dogrulama-yanliligi / capalama / erken-delil → ilk görüşülen kişi (ilk hipoteze yapışma)
 *   dogruluk-yanliligi → kimse ("suç yok" diyeceksin)
 *   diğerleri → en kaygılı kişi
 */
export function aynaTahmini(vaka: Vaka, korNoktalar: readonly KorNokta[]): AynaTahmini {
  const etiket = korNoktalar[0]?.etiket ?? 'othello-hatasi';
  const liste = adaylar(vaka);
  const r = new Rastgele(`${vaka.seed}/ayna/${etiket}`);

  switch (etiket) {
    case 'dogruluk-yanliligi':
      return { etiket, tahmin: null, gerekce: 'Ayna, herkese inandığın için bu kez de "suç yok" diyeceğini bekledi.' };
    case 'hale-etkisi':
      return { etiket, tahmin: enYuksek(liste, (k) => -k.kisilik.disadonukluk, r).id, gerekce: 'Ayna, sıcak ve konuşkan olanı koruyup en soğuk görüneni suçlayacağını bekledi (hale etkisi).' };
    case 'temsil-edicilik':
    case 'yalan-yanliligi':
      return { etiket, tahmin: enYuksek(liste, (k) => -kurbanlaSicaklik(vaka, k.id), r).id, gerekce: 'Ayna, kurbanla arası en kötü olanı, "tipik şüpheli"yi seçeceğini bekledi (temsil edicilik).' };
    case 'dogrulama-yanliligi':
    case 'capalama':
    case 'erken-delil':
      return { etiket, tahmin: liste[0]!.id, gerekce: 'Ayna, ilk konuştuğun kişi hakkındaki ilk hipotezine yapışacağını bekledi (çapalama / doğrulama yanlılığı).' };
    case 'sosyal-kanit':
      return { etiket, tahmin: enYuksek(liste, (k) => k.kisilik.kaygi + (1 - k.kisilik.ozIzleme) * 0.5, r).id, gerekce: 'Ayna, takımın "bak nasıl kıvranıyor" dediği kişiye yöneleceğini bekledi (sosyal kanıt).' };
    default:
      return { etiket, tahmin: enYuksek(liste, (k) => k.kisilik.kaygi, r).id, gerekce: 'Ayna, en gergin görünen kişiyi suçlayacağını bekledi (Othello hatası: gergin masum).' };
  }
}

/** Etiket → notun "geçmiş hatayı alıntılayan" cümlesi. Kişi adı yazılmaz. */
const NOT_KALIPLARI: Record<string, string[]> = {
  'othello-hatasi': ['Geçen dosyada en çok titreyeni seçtin. Bu kez de titreyen biri olacak; bakalım yine ona mı gidersin.', 'Terleyen eller seni hep çekti. Birinin ellerini bu kez de terlettim.'],
  'tek-ipucu': ['Tek bir bakış yetti sana geçen sefer. Bu kez de bir bakış bırakıyorum; gerisini sen tamamlarsın.'],
  'sosyal-kanit': ['Ekibin ne diyorsa onu dedin. Ekibine bu kez de bir şey söyletecek kadar gürültü var.'],
  'hale-etkisi': ['Gülümseyeni bağışladın, asık suratlıyı astın. Bu odada da gülümseyen biri var.'],
  'temsil-edicilik': ['Sabıkalı ve borçlu olanı sevdin geçen dosyada; hikâyeye uyuyordu. Bu kez de biri hikâyeye tıpatıp uyacak.'],
  'yalan-yanliligi': ['Herkesi yalancı saydın; bu kez de sayacaksın. Sadece doğrusunu bulman zor.'],
  'dogrulama-yanliligi': ['İlk konuştuğun kişiden sonra kimseyi dinlemedin. İlk kapıyı ben seçtim.'],
  capalama: ['Sana söylenen ilk saat kafana çakılı kaldı. Bu kez de biri sana bir saat söyleyecek.'],
  'erken-delil': ['Delili elinde tutamadın, hemen masaya koydun. Masaya koyacağın bir şey daha bıraktım.'],
  'dogruluk-yanliligi': ['Herkese inandın ve "kaza" dedin. Bu kez de kaza gibi görünmesi için uğraştım.'],
};

/**
 * Olay yerine bırakılan imza notu. Kahramanın adını ve geçmiş hatasını ima eder; tahmin edilen kişinin adı
 * geçmez. Deterministik (seed + etiket + karşılaşma). Ark özeti verilirse ilk karşılaşma tanışma tonunda,
 * sonrakiler önceki sonucu alıntılar: okunduysa "yine", yanıldıysa "şaşırttın" (ark boyunca biriken hikâye).
 */
export function aynaNotu(vaka: Vaka, kahramanAdi: string, tahmin: AynaTahmini, ark?: AynaArkOzeti): string {
  const r = new Rastgele(`${vaka.seed}/ayna-not/${tahmin.etiket}`);
  const govde = r.sec(NOT_KALIPLARI[tahmin.etiket] ?? ['Nasıl baktığını biliyorum. Aynı yere bakacaksın.']);
  const acilis = r.sec([`${kahramanAdi},`, `Sevgili ${kahramanAdi},`, `${kahramanAdi}, yine karşılaştık.`]);
  const kapanis = r.sec(['Aynaya bak.', 'Seni okuyorum.', 'Bu kez de aynı yere bakarsan şaşırmam.']);
  let ara = '';
  if (ark && ark.karsilasma > 0) {
    const r2 = new Rastgele(`${vaka.seed}/ayna-ark/${ark.karsilasma}/${ark.sonOkundu}`);
    ara = ark.sonOkundu
      ? r2.sec(['Geçen sefer de seni okudum; tam beklediğim yere baktın.', 'Geçen sefer tahminim tuttu. Kalıbın hâlâ aynı mı, bakalım.'])
      : r2.sec(['Geçen sefer beni şaşırttın; kalıbından çıktın. Bu kez daha dikkatli hazırlandım.', 'Geçen sefer yanıldım; beklediğim yere bakmadın. Bir kez olur.']);
    ara = ` ${ara}`;
  }
  return `${acilis}${ara} ${govde} ${kapanis} — A.`;
}

/** Suçlama Ayna'nın beklediğiyle örtüştü mü? (null = "suç yok" beyanı da tahmin olabilir.) */
export function aynaOkuduMu(tahmin: AynaTahmini, suclananFail: KisiId | null): boolean {
  return tahmin.tahmin === suclananFail;
}
