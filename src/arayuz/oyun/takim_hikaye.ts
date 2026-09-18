// Takım arka plan hikâyesi (TASARIM §14): vakalar arası kısa "ofis sahneleri".
//
// Her vaka bittiğinde Analiz ekranının altında 3–4 satırlık bir sahne oynar:
//   1. Son vakaya tepki: doğruysa övgü (delile bağlı), yanlışsa ilk hata etiketiyle ilgili üye konuşur
//      (sosyal kanıtta saha ajanı mahcup olur, Othello'da sorgucu "gerginlik kanıt değil" der...).
//   2. Bir üyenin geçmişinden bir parça (arka plan bölümü). Bölümler vaka sayısıyla açılır; sıra üyeler
//      arasında döner. Her bölüm gerçek bir Kılavuz maddesine bağlıdır: hikâye, dersin taşıyıcısıdır.
//   3. Başka bir üyenin kısa karşılığı.
//   4. Kapanış (çay, kanepe; kahramanın adı geçer).
// Sahne yalnızca geçmiş kayıtlardan üretilir; vaka verisi kullanılmaz, dolayısıyla hiçbir gizli bilgi sızmaz.
// Deterministik: aynı geçmiş → aynı sahne (kayıt sonrası da aynı görünür).
import { Rastgele } from '@ortak/rastgele';
import { TAKIM, type TakimRolu } from './takim';

/** Sahnenin ihtiyaç duyduğu geçmiş alanları (depo.VakaGecmisi bunu sağlar; döngüsel ithalat olmasın). */
export interface SahneGecmisi { dogru: boolean; hataEtiketleri: string[]; ayna?: { etiket: string; okundu: boolean } }

/** Kaçıncı Ayna karşılaşmasından itibaren takım Ayna'yı açıkça konuşur (ark finali tonu). */
export const AYNA_SAHNE_ESIGI = 3;

export interface ArkBolumu { metin: string; kilavuz: string }

/** Üye başına arka plan bölümleri; her biri bir Kılavuz maddesinin hikâyeleşmiş hali. */
export const TAKIM_ARKI: Record<TakimRolu, ArkBolumu[]> = {
  lider: [
    { metin: 'İlk yılımda, on iki saatlik bir sorgunun sonunda bir itiraf aldım. Çocuk masummuş; üç yıl sonra anlaşıldı. O günden beri "itiraf" kelimesinde durur, nasıl alındığını sorarım.', kilavuz: 'suclayici-ton' },
    { metin: 'Babam savcıydı. "Dosyayı bir de tersine oku" derdi: fail masumsa hangi kanıt açıklanamaz kalır? Çoğu zaman hiçbiri. Hikâye her şeyi açıklıyorsa hikâyeden şüphelen.', kilavuz: 'dogrulama-yanliligi' },
    { metin: 'Bir kere yüzde doksan emindim; yanıldım. O gün karar günlüğü tutmaya başladım: ne kadar emindim, ne çıktı. Emin olmak doğru olmak değil.', kilavuz: 'guven-dogruluk-iliskisi' },
    { metin: 'Sahnelenmiş bir hırsızlık gördüm: her şey fazla açıktı, sanki bize gösteriliyordu. Fazla açık delil, sorulmadan kabul edilmez; kim, ne zaman, nasıl koydu?', kilavuz: 'sahnelenmis-suc' },
    { metin: 'Akademide "iyi polis" bendim. Sonra öğrendim ki iyi polis-kötü polis, karşıtlıkla karşılıklılığı birleştiren bir numara; şüpheli kendini bana borçlu hissediyordu. Artık o borç duygusunu kullanmıyorum.', kilavuz: 'karsiliklilik' },
  ],
  sorgucu: [
    { metin: 'Beni eski usul eğittiler: göz kaçıran, kıpırdanan yalancıdır dediler. O listeyle bir masumu yaktım. Listeyi çöpe attım; masumun adını atamadım.', kilavuz: 'mit-reid-ipuclari' },
    { metin: 'Delili önce gösterirdim. Şüpheli hikâyesini delile uydururdu, ben de "tutarlı" derdim. Şimdi önce anlattırıyorum; delil en sona kalıyor.', kilavuz: 'sue' },
    { metin: 'Ters sırayla anlattırmayı bir çocuk tanıkta denedim. Ezber hikâye dağıldı; yaşanmış olan dağılmadı. Yalan söylemek zaten zordur; biraz daha zorlaştır.', kilavuz: 'bilissel-yuk' },
    { metin: 'Karımla ilk tanıştığımda hiç soru sormadım, sadece izledim. Temel çizgi. Birinin rahatken nasıl olduğunu bilmeden gerginliğini okuyamazsın.', kilavuz: 'temel-cizgi' },
    { metin: '"Restoranda masalar nasıl diziliydi?" Hazırlanmış yalancı orada duraksar; hazırlanmadığı bir soruya cevap uydurmak zaman alır. Bunu bir sihirbaz tanıktan öğrendim.', kilavuz: 'beklenmedik-soru' },
  ],
  inanan: [
    { metin: 'Babam öldüğünde halam medyuma gitti. Medyum "H harfi" dedi; halam "Hasan" diye ağladı. Ben de inanmak istedim. Hâlâ bazen istiyorum; o yüzden tekniği ezberledim.', kilavuz: 'soguk-okuma-teknikleri' },
    { metin: 'Üniversitede bir kişilik testi doldurdum; sonuç tam bendim. Sonra herkesin aynı metni aldığını öğrendim. Bir yerim hâlâ "ama bana uyuyordu" diyor.', kilavuz: 'forer-barnum' },
    { metin: 'Bir arkadaşım bir grubun içindeydi. Kehanet tutmayınca ayrılmadı, daha çok inandı. Bunu anlamak yıllarımı aldı: inanç yatırımdır, kanıt değil.', kilavuz: 'kehanet-basarisiz-olunca' },
    { metin: 'Ouija tahtasında el kendi kendine gidiyor sanırdım. Gözlerim kapalıyken tahta anlamsız yazdı. İdeomotor hareket; ama his gerçekti, ben uydurmuyordum.', kilavuz: 'ideomotor-ouija' },
    { metin: 'Bir gece odamda biri vardı, yemin ederim. Uyku felci diyorlar. Belki. O yüzden böyle bir tanığa "yalan söylüyorsun" demem; "yanılıyor olabilirsin" derim.', kilavuz: 'anomalistik-psikoloji' },
  ],
  saha: [
    { metin: 'Panayırda büyüdüm; üç kâğıt masasının başındaki kalabalığın yarısı bizdendi. Herkes kazanıyor gibi görünürse sen de oynarsın. Bunu bilirim; yine de kalabalığa kapılırım.', kilavuz: 'sosyal-kanit' },
    { metin: 'Yakışıklı bir dolandırıcıyı üç kez saldım. Üçünde de "bu adam yapmaz" dedim. Yüze bakıp karar vermek benim hastalığım; tedavisi delil.', kilavuz: 'hale-etkisi' },
    { metin: 'İlk otuz saniyede insanları tartarım; sıcak mı soğuk mu, çoğunlukla tuttururum. Ama yalan söylüyor mu? Orada yazı tura kadar iyiyim.', kilavuz: 'ince-dilimler' },
    { metin: 'Panayırda abim dikkat dağıtırdı, ben cüzdanı alırdım. Herkes abimin baktığı yere bakardı. Sonra polis oldum; hâlâ kimin nereye baktığına bakarım.', kilavuz: 'yanlis-yonlendirme' },
    { metin: 'En iyi numara şaka bittikten sonra yapılır; herkes gülerken, iş "bitti" sanılırken. Şimdi bir tanık "gözümü ayırmadım" deyince gülümsüyorum.', kilavuz: 'off-beat' },
  ],
};

export interface SahneSatiri { rol: TakimRolu; ad: string; metin: string }

export interface TakimSahnesiSonucu {
  satirlar: SahneSatiri[];
  /** Bu sahnede açılan arka plan bölümü. */
  arkaPlan: { rol: TakimRolu; metin: string };
  /** Sahnenin Kılavuz bağı (arka plan bölümünün maddesi). */
  kilavuz: string;
  /** Ayna arkı sahnesi oynadıysa: kaçıncı karşılaşma ve şimdiye dek okunma oranı. */
  ayna?: { karsilasma: number; okunmaOrani: number };
}

/** Ayna arkı satırları (3. karşılaşmadan itibaren): takım, notları bırakan kişiyi ve oyuncunun kalıbını konuşur. */
const AYNA_OKUNDU: { rol: TakimRolu; metin: string }[] = [
  { rol: 'lider', metin: 'Üç dosya, üç not; artık ona Ayna diyoruz. {ad}, Ayna seni okuyor: nereye bakacağını senden önce biliyor. Bu bir sihir değil; senin kalıbın.' },
  { rol: 'sorgucu', metin: 'Aynı yerden yakalanıyorsun. Kalıbı kır: bir sonraki dosyada ilk şüphelendiğin kişiyi en sona bırak.' },
];
const AYNA_KIRDI: { rol: TakimRolu; metin: string }[] = [
  { rol: 'lider', metin: 'Üçüncü not, ve Ayna bu kez yanıldı. {ad}, seni okuyamadı; demek ki kalıbın değişiyor. Bunu yazıyorum.' },
  { rol: 'inanan', metin: 'Ayna\'nın notlarında bir şey dikkatimi çekti: her seferinde senin geçmiş hatanı alıntılıyor. Kayıtlarımıza erişimi mi var, yoksa sadece iyi mi tahmin ediyor?' },
];

const uye = (rol: TakimRolu) => TAKIM.find((u) => u.rol === rol)!;
const satir = (rol: TakimRolu, metin: string): SahneSatiri => ({ rol, ad: uye(rol).ad, metin });

/** Hata etiketi → kimin, ne dediği. {ad} kahraman adıyla değiştirilir. */
const HATA_TEPKISI: Record<string, { rol: TakimRolu; metinler: string[] }> = {
  'othello-hatasi': { rol: 'sorgucu', metinler: ['Gergindi, evet. Masumlar da gerilir, {ad}. Gerginlik "hangi konuda" sorusudur, hüküm değil.', 'Titreyen eller. Bir dahaki sefere önce rahatken nasıl olduğuna bak, {ad}.'] },
  'tek-ipucu': { rol: 'sorgucu', metinler: ['Tek ipucuna yaslandın, {ad}. Tek ipucu bir soru doğurur, bir karar değil.'] },
  'beklenti-ihlali': { rol: 'sorgucu', metinler: ['Tuhaf davrandı diye şüphelendin, {ad}. Tuhaflık kişiliktir; yalan değil.'] },
  'sorgulama-heuristigi': { rol: 'sorgucu', metinler: ['Sorguladın, iz bulamadın, daha çok inandın, {ad}. Sorgulamak doğrulamak değildir.'] },
  'tutarlilik-heuristigi': { rol: 'sorgucu', metinler: ['Hikâye tutarlıydı diye inandın, {ad}. Prova edilen hikâye de tutarlıdır.'] },
  'capalama': { rol: 'sorgucu', metinler: ['İlk duyduğun saat aklına çakılıp kaldı, {ad}. Onu fark etmek, ondan kurtulmanın yarısıdır.'] },
  'dogrulama-yanliligi': { rol: 'sorgucu', metinler: ['İlk hipotezinden sonra yalnızca onu destekleyen şeyleri aradın, {ad}. Çürütmeye çalış; çürütemezsen inan.'] },
  'erken-delil': { rol: 'sorgucu', metinler: ['Delili erken gösterdin, {ad}. Hikâyesini delile uydurdu ve sen "tutarlı" dedin.'] },
  'tanik-kirletme': { rol: 'sorgucu', metinler: ['Tanığa ne söylersen onu hatırlar, {ad}. Soruyu nasıl sorarsan anı da öyle şekillenir.'] },
  'sosyal-kanit': { rol: 'saha', metinler: ['Tamam, benim yüzümden. Herkes öyle diyordu, ben de bağırdım. Beni dinlemeseydin daha iyiydi, {ad}.', 'Ekip "bu o" dedi, sen de dedin. Bir dahakine bana inanma, {ad}; delile inan.'] },
  'fark-etmedin': { rol: 'saha', metinler: ['Ben de görmedim, {ad}. İkimiz de aynı yere bakıyorduk; yanlış yere.'] },
  'ipucu-erisilemez': { rol: 'saha', metinler: ['Önüne hiç gelmeyen bir şeyi göremezdin, {ad}. Ben de göremezdim; bunu kendine yükleme.'] },
  'delil-sorgulanmadi': { rol: 'saha', metinler: ['Delil fazla güzeldi ve ikimiz de sevindik, {ad}. Kim koymuş diye sormadık.'] },
  'hale-etkisi': { rol: 'lider', metinler: ['Sempatik olanı bağışladın, {ad}. Sempati dosyaya girmez.'] },
  'temsil-edicilik': { rol: 'lider', metinler: ['"Tipik suçlu"ya benziyordu, {ad}. Profil hüküm değildir; taban oranını unuttun.'] },
  'ic-masalci': { rol: 'lider', metinler: ['Tutarsızlığı kendi açıklamanla kapattın, {ad}. Açıklamayı ona yaptırmalıydın.'] },
  'asiri-ozguven': { rol: 'lider', metinler: ['Yüzde doksan dedin, {ad}. Ben de demiştim bir kere. Günlüğüne yaz.'] },
  'sahte-itiraf-kabulu': { rol: 'lider', metinler: ['İtiraf aldın diye sevindin, {ad}. Ben de sevinmiştim, yıllar önce. Nasıl alındığına bak.'] },
  'yalan-yanliligi': { rol: 'lider', metinler: ['Herkesi yalancı saydın, {ad}. Şüphe de bir yanlılıktır; dürüstleri harcar.'] },
  'dogruluk-yanliligi': { rol: 'inanan', metinler: ['Ben de inanmıştım, {ad}. İnanmak kolay; o yüzden bize sen lazımsın.'] },
  'gecersiz-gizli-bilgi-testi': { rol: 'sorgucu', metinler: ['Test ettiğin ayrıntı basına sızmıştı, {ad}. Herkesin bildiği şey gizli bilgi değildir.'] },
};

const DOGRU_TEPKISI: { rol: TakimRolu; metinler: string[] }[] = [
  { rol: 'lider', metinler: ['Delille geldin, {ad}. Savcı bunu sever; ben de.', 'Bu kez "bence" demedin, {ad}. Çelişkiyi ve kaynağı gösterdin.'] },
  { rol: 'sorgucu', metinler: ['İyi iş, {ad}. Önce anlattırdın, sonra delil. Böyle.', 'Temiz iş, {ad}. Tek kelime: doğru.'] },
  { rol: 'saha', metinler: ['Ben yanılmıştım, sen tutturdun, {ad}. Yemek benden.', 'Bak, {ad} işi çözdü ve ben hâlâ yanlış adama bakıyordum.'] },
  { rol: 'inanan', metinler: ['İçime doğmuştu, {ad}... tamam, doğmamıştı. Sen delille buldun.', 'Bir işaret vardı diyecektim ama sen zaten delili göstermiştin, {ad}.'] },
];

/** Arka plan anlatısına başka bir üyenin kısa karşılığı (rolüne göre). */
const KARSILIK: Record<TakimRolu, string[]> = {
  lider: ['Bunu dosyaya yazmıyoruz; ama not aldım.', 'Peki. Çay soğuyor; yarın erken başlıyoruz.'],
  sorgucu: ['Hm. Anladım.', 'Bunu bir daha anlat. Kısa.'],
  inanan: ['Bunu anlatman bile bir şey söylüyor; iyi bir şey.', 'Bence bu bir işaret. Şaka. Ama biraz da değil.'],
  saha: ['Yemek söyleyelim mi?', 'Bunu biliyorum; yine de yaparım. İnsanım.'],
};

const KAPANIS: Record<TakimRolu, string[]> = {
  lider: ['Kanepe senin, {ad}. Yarın yeni dosya.', 'Işıkları kapatıyorum. {ad}, çayını bitir.'],
  sorgucu: ['Kanepe boş. Uzan, {ad}.', 'Yarın. {ad}, uyu.'],
  inanan: ['{ad}, çayına bir şeker attım; fal değil, alışkanlık.', 'İyi geceler, {ad}. Rüyanda dosya görme.'],
  saha: ['{ad}, kanepede yine sen mi? Pekâlâ, sandalye benim.', 'Yemek geldi. {ad}, sana da aldım.'],
};

const doldur = (metin: string, ad: string) => metin.replaceAll('{ad}', ad);

/**
 * Vaka sonu ofis sahnesi. Geçmiş boşsa null (ilk vaka bitmeden takım hikâyesi yok).
 * Sıra: tepki → arka plan (üye = (n−1) mod 4, bölüm = ⌊(n−1)/4⌋, döngüsel) → karşılık → kapanış.
 * Rol tekilliği: aynı üye art arda konuşmaz; karşılık satırı gerekirse tepki ile arka planın arasına girer.
 */
export function takimSahnesi(gecmis: readonly SahneGecmisi[], kahramanAdi: string): TakimSahnesiSonucu | null {
  const n = gecmis.length;
  if (n === 0) return null;
  const son = gecmis[n - 1]!;
  const etiket = son.hataEtiketleri[0];
  const r = new Rastgele(`sahne/${n}/${son.dogru ? 'd' : 'y'}/${etiket ?? '-'}`);
  const satirlar: SahneSatiri[] = [];

  // 1. Tepki
  if (son.dogru) {
    const t = r.sec(DOGRU_TEPKISI);
    satirlar.push(satir(t.rol, doldur(r.sec(t.metinler), kahramanAdi)));
  } else {
    const t: { rol: TakimRolu; metinler: string[] } = (etiket ? HATA_TEPKISI[etiket] : undefined) ?? { rol: 'lider', metinler: ['Bu kez olmadı, {ad}. Nerede kaydığını analizde gördün; şimdi çalış.'] };
    satirlar.push(satir(t.rol, doldur(r.sec(t.metinler), kahramanAdi)));
  }

  // 1b. Ayna arkı: son vaka Ayna vakasıysa ve bu en az AYNA_SAHNE_ESIGI. karşılaşmaysa takım Ayna'yı konuşur.
  const aynalar = gecmis.filter((g) => g.ayna);
  let ayna: TakimSahnesiSonucu['ayna'];
  if (son.ayna && aynalar.length >= AYNA_SAHNE_ESIGI) {
    const okunma = aynalar.filter((g) => g.ayna!.okundu).length / aynalar.length;
    for (const s of son.ayna.okundu ? AYNA_OKUNDU : AYNA_KIRDI) satirlar.push(satir(s.rol, doldur(s.metin, kahramanAdi)));
    ayna = { karsilasma: aynalar.length, okunmaOrani: okunma };
  }

  // Rol tekilliği: aynı üye art arda iki satır konuşmaz (tepki rolü etikete, anlatıcı vaka sayısına bağlı; çakışabilir).
  // Karşılık satırı "yüzer": ilk çakışmanın arasına girer (tepkiye ya da Ayna satırına karşılık gibi okunur);
  // yalnızca Ayna sahnesinde mümkün olan ikinci çakışmada anlatıcı bir sonraki üyeye kayar. Arklar bozulmaz.
  const rolSec = (baslangic: number, yasak: (TakimRolu | undefined)[]): TakimRolu => {
    for (let i = 0; i < TAKIM.length; i++) {
      const rol = TAKIM[(baslangic + i) % TAKIM.length]!.rol;
      if (!yasak.includes(rol)) return rol;
    }
    return TAKIM[baslangic % TAKIM.length]!.rol;
  };
  const cakisma = (liste: SahneSatiri[]) => liste.findIndex((x, i) => i > 0 && x.rol === liste[i - 1]!.rol);
  let karsilikci: TakimRolu | undefined;
  const karsilikEkle = (indeks: number) => {
    karsilikci = rolSec(n, [satirlar[indeks - 1]?.rol, satirlar[indeks]?.rol]);
    satirlar.splice(indeks, 0, satir(karsilikci, r.sec(KARSILIK[karsilikci])));
  };
  // Tepki ile Ayna satırı çakışırsa karşılık araya girer.
  const ilkCakisma = cakisma(satirlar);
  if (ilkCakisma !== -1) karsilikEkle(ilkCakisma);

  // 2. Arka plan: üyeler sırayla, bölümler vaka sayısıyla ilerler (bölümler bitince başa döner).
  let anlatici = TAKIM[(n - 1) % TAKIM.length]!.rol;
  const sonRol = satirlar[satirlar.length - 1]!.rol;
  if (anlatici === sonRol) {
    if (karsilikci === undefined) karsilikEkle(satirlar.length); // 3'. Karşılık tepkiden sonra, arka plandan önce
    else anlatici = rolSec(n, [sonRol]);
  }
  const ark = TAKIM_ARKI[anlatici];
  const bolum = ark[Math.floor((n - 1) / TAKIM.length) % ark.length]!;
  satirlar.push(satir(anlatici, bolum.metin));

  // 3. Karşılık (henüz girmediyse): bir sonraki üye, anlatıcıdan farklı.
  if (karsilikci === undefined) karsilikEkle(satirlar.length);

  // 4. Kapanış: son konuşandan ve karşılıkçıdan farklı bir üye.
  const kapatan = rolSec(n + 2, [satirlar[satirlar.length - 1]!.rol, karsilikci]);
  satirlar.push(satir(kapatan, doldur(r.sec(KAPANIS[kapatan]), kahramanAdi)));

  return { satirlar, arkaPlan: { rol: anlatici, metin: bolum.metin }, kilavuz: bolum.kilavuz, ...(ayna ? { ayna } : {}) };
}
