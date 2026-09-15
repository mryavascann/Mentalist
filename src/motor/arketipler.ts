// Vaka arketip havuzu (TASARIM §15). Üretici bunları mekâna göre karıştırır; kalıp oluşturmaz.
// Arketip, olay türünü, yöntem havuzunu, tema motivasyonlarını ve brifing cümlesini verir. Kişi, fail, sırlar
// ve deliller yine gerçeklik grafiğinden gelir; arketip "renk"tir, çözüm anahtarı değildir.
// İçerik tonu 13+/16+: kan ve vahşet betimlemesi yok; gerilim psikolojiden gelir.
import type { MekanTuru, OlayTuru } from './tipler';

export interface Arketip {
  id: string;
  ad: string;
  olayTuru: OlayTuru;
  /** Uygun mekân türleri. */
  mekanlar: MekanTuru[];
  yontemler: string[];
  /** Tema motivasyonları; ilişki türü motivasyonuna eklenir. */
  motivasyonlar: string[];
  /** Brifinge eklenen bir cümle (fail adı geçmez). */
  brifingEki: string;
  /** Kılavuz maddesi (isteğe bağlı; vaka sonunda "bu vakanın dersi"). */
  kilavuzMaddesi?: string;
  agirlik: number;
}

export const ARKETIPLER: Arketip[] = [
  { id: 'miras-kavgasi', ad: 'Miras kavgası', olayTuru: 'cinayet', mekanlar: ['malikane', 'sahil-evi', 'apartman'], yontemler: ['küt darbe', 'merdivenden itme', 'zehir'], motivasyonlar: ['vasiyetin değiştirilme tehdidi', 'miras payı'], brifingEki: 'Ölenin vasiyeti geçen hafta yeniden düzenlenmiş; kimin ne alacağı tartışmalı.', kilavuzMaddesi: 'capalama', agirlik: 14 },
  { id: 'sahte-medyum', ad: 'Sahte medyum dolandırıcılığı', olayTuru: 'hirsizlik', mekanlar: ['malikane', 'apartman', 'sahil-evi'], yontemler: ['kasadan belge alma', 'mücevher değiştirme'], motivasyonlar: ['medyum seansı bahanesiyle eve erişim', 'kurbanın kederini sömürme'], brifingEki: 'Evde son aylarda düzenli "ruh seansları" yapılıyormuş; kurban ölen eşiyle konuştuğuna inanıyormuş.', kilavuzMaddesi: 'soguk-okuma-teknikleri', agirlik: 10 },
  { id: 'tarikat-ici-olum', ad: 'Tarikat içi ölüm', olayTuru: 'cinayet', mekanlar: ['ciftlik'], yontemler: ['zehir', 'ilaç dozu', 'küt darbe'], motivasyonlar: ['liderin kehanetinin sorgulanması', 'topluluktan ayrılma niyeti'], brifingEki: 'Topluluğun bir kehaneti geçen ay tutmamış; üyeler bunu "işaret" olarak yorumluyor.', kilavuzMaddesi: 'kehanet-basarisiz-olunca', agirlik: 8 },
  { id: 'hastane-yanlis-doz', ad: 'Hastanede yanlış doz', olayTuru: 'cinayet', mekanlar: ['hastane'], yontemler: ['ilaç dozu'], motivasyonlar: ['tıbbi hatanın örtbası', 'sigorta'], brifingEki: 'Hasta, gece vardiyasında ilaç kayıt defterinde iki farklı paraf taşıyan bir dozdan sonra ölmüş.', kilavuzMaddesi: 'otorite-sahte-uzman', agirlik: 8 },
  { id: 'hastane-kaza', ad: 'Hastanede kaza şüphesi', olayTuru: 'kaza', mekanlar: ['hastane'], yontemler: ['yanlış doz', 'düşme'], motivasyonlar: [], brifingEki: 'Aile cinayet olduğuna inanıyor; hastane kaza diyor.', kilavuzMaddesi: 'dogruluk-yanliligi', agirlik: 4 },
  { id: 'is-yerinde-zimmet', ad: 'İş yerinde zimmet', olayTuru: 'hirsizlik', mekanlar: ['ofis'], yontemler: ['dijital hesap boşaltma', 'kasadan belge alma'], motivasyonlar: ['zimmetin açığa çıkması', 'terfi kaybı'], brifingEki: 'Şirketin denetimi haftaya; birinin hesaplarda açık olduğu söyleniyor ama patron duymak istemiyor.', kilavuzMaddesi: 'dogruluk-yanliligi', agirlik: 10 },
  { id: 'ofis-sabotaj', ad: 'Ofiste sabotaj', olayTuru: 'sabotaj', mekanlar: ['ofis'], yontemler: ['sözleşme sahteciliği', 'fren hattı kesme'], motivasyonlar: ['ihale kaybı', 'rakibe geçiş'], brifingEki: 'İhale dosyası teslimden bir gece önce değiştirilmiş.', kilavuzMaddesi: 'karsiliklilik', agirlik: 6 },
  { id: 'romantik-dolandiricilik', ad: 'Romantik dolandırıcılık', olayTuru: 'hirsizlik', mekanlar: ['apartman', 'sahil-evi', 'motel'], yontemler: ['dijital hesap boşaltma', 'mücevher değiştirme'], motivasyonlar: ['kurbanın güvenini paraya çevirme', 'utandırılan kurbanın susacağına güvenme'], brifingEki: 'Kurban aylardır çevrimiçi tanıştığı biriyle görüşüyormuş; ailesi bundan yeni haberdar.', kilavuzMaddesi: 'dolandiriciligin-yedi-ilkesi', agirlik: 8 },
  { id: 'motel-sahnelenmis', ad: 'Motelde sahnelenmiş olay', olayTuru: 'cinayet', mekanlar: ['motel'], yontemler: ['boğma', 'küt darbe'], motivasyonlar: ['tanıklığı susturma', 'borç'], brifingEki: 'Oda soygun gibi düzenlenmiş ama değerli eşyalar yerinde.', kilavuzMaddesi: 'sahnelenmis-suc', agirlik: 8 },
  { id: 'karnaval-el-cabuklugu', ad: 'Karnavalda el çabukluğu', olayTuru: 'hirsizlik', mekanlar: ['karnaval'], yontemler: ['kasadan belge alma', 'mücevher değiştirme'], motivasyonlar: ['gösteri sırrının çalınması', 'kumar borcu'], brifingEki: 'Kasa, gösterinin en gürültülü dakikasında boşalmış; herkes sahneye bakıyormuş.', kilavuzMaddesi: 'yanlis-yonlendirme', agirlik: 6 },
  { id: 'karnaval-kaza', ad: 'Karnavalda kaza mı?', olayTuru: 'kaza', mekanlar: ['karnaval'], yontemler: ['elektrik kaçağı', 'düşme'], motivasyonlar: [], brifingEki: 'Jeneratör bakım kaydı eksik; ekip birbirini suçluyor.', kilavuzMaddesi: 'sosyal-kanit', agirlik: 3 },
  { id: 'kiskanclik-ucgeni', ad: 'Kıskançlık üçgeni', olayTuru: 'cinayet', mekanlar: ['apartman', 'sahil-evi', 'malikane', 'motel'], yontemler: ['boğma', 'küt darbe', 'merdivenden itme'], motivasyonlar: ['aldatılma', 'terk edilme'], brifingEki: 'Komşular son haftalarda yüksek sesli tartışmalar duymuş.', kilavuzMaddesi: 'othello-hatasi', agirlik: 10 },
  { id: 'sahil-kaza', ad: 'Sahilde kaza şüphesi', olayTuru: 'kaza', mekanlar: ['sahil-evi', 'malikane', 'apartman'], yontemler: ['düşme', 'elektrik kaçağı'], motivasyonlar: [], brifingEki: 'İlk rapor kaza diyor; aile "o dikkatliydi" diyor.', kilavuzMaddesi: 'ic-masalci', agirlik: 4 },
  { id: 'ciftlik-sabotaj', ad: 'Çiftlikte sabotaj', olayTuru: 'sabotaj', mekanlar: ['ciftlik'], yontemler: ['fren hattı kesme', 'ilaç etiketi değiştirme'], motivasyonlar: ['topluluk parasının kontrolü', 'liderliğe rakip'], brifingEki: 'Topluluğun kamyonu bakımdan iki gün sonra yoldan çıkmış.', kilavuzMaddesi: 'kehanet-basarisiz-olunca', agirlik: 4 },
];

/** Mekâna uygun arketipler (her mekân için en az iki tane olmalı; test denetler). */
export function mekanaUygunArketipler(mekan: MekanTuru): Arketip[] {
  return ARKETIPLER.filter((a) => a.mekanlar.includes(mekan));
}
