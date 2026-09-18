// Takım NPC'leri (TASARIM §14): dizideki rollerin özgün adlı analogları.
//   Lider (kurallara bağlı, şüpheci): kanıtsız okumaya itiraz eder → hesap verebilirlik.
//   Sorgucu (kısa cümleli, yöntemli): tekniğe yönlendirir.
//   İnanan analist: davranış ipuçlarını abartır, "içine doğar" → yanlış iz.
//   Saha ajanı: iştahlı, hızlı hüküm; çoğunluk görüşünü seslendirir → sosyal kanıt tuzağı.
// Yorumlar oyuncunun görebildiği şeylerden (cevap içeriği, ipucu sayısı, delil çelişkisi) üretilir;
// gizli etiketler kullanılmaz. Deterministik (seed + kişi + soru).
import { Rastgele } from '@ortak/rastgele';
import { belirtme } from '@ortak/turkce';
import type { SorSonucu, Sorgu } from '@motor/teknik';
import type { KisiId } from '@motor/tipler';
import { soruAnahtari } from '@motor/strateji';

export type TakimRolu = 'lider' | 'sorgucu' | 'inanan' | 'saha';

export interface TakimUyesi { rol: TakimRolu; ad: string; tavir: string }

export const TAKIM: TakimUyesi[] = [
  { rol: 'lider', ad: 'Komiser Sevda Oral', tavir: 'Kurallara bağlı, şüpheci; kanıt ister.' },
  { rol: 'sorgucu', ad: 'Cemal Ilgaz', tavir: 'Az konuşur; yöntemi hatırlatır.' },
  { rol: 'inanan', ad: 'Analist Defne Yurt', tavir: 'Sezgiye ve işaretlere inanır.' },
  { rol: 'saha', ad: 'Ajan Ozan Kaya', tavir: 'Hızlı hüküm verir, çoğunluğu seslendirir.' },
];

export interface TakimYorumu { rol: TakimRolu; ad: string; metin: string; hukum: 'supheli' | 'temiz' | 'yok' }

const ARTAN_KUME = new Set(['genel-gerginlik', 'ses-perdesi-yukselme', 'tutarsizlik-ambivalans', 'detay-azligi', 'sozel-vokal-yakinlik-azligi', 'yatistirici-dokunma']);

/** Sorgu satırına takım yorumu (yaklaşık %55 olasılıkla; her satırda konuşmazlar). */
export function takimYorumu(sorgu: Sorgu, kisiId: KisiId, sonuc: SorSonucu): TakimYorumu | null {
  const { vaka } = sorgu.durum;
  const r = new Rastgele(`${vaka.seed}/takim/${kisiId}/${soruAnahtari(sonuc.cevap.soru)}`);
  if (!r.sans(0.55)) return null;
  const ad = vaka.kisiler.find((k) => k.id === kisiId)!.ad.split(' ')[0]!;
  const ipucuSayisi = sonuc.ipuclari.length;
  const gerginlik = sonuc.ipuclari.filter((g) => ARTAN_KUME.has(g.ipucuId)).length;
  const celiski = sonuc.celisenDeliller.length > 0;
  const bilmiyor = sonuc.cevap.icerik === null;
  const uye = r.sec(TAKIM);

  switch (uye.rol) {
    case 'saha': {
      // Hızlı hüküm: ipucu görünce "bu adam yalan söylüyor"; ipucu yoksa "temiz". Delile bakmaz.
      if (gerginlik >= 1) return { rol: 'saha', ad: uye.ad, hukum: 'supheli', metin: r.sec([`${ad} yalan söylüyor bence. ${gerginlik > 1 ? 'Hâline baksana.' : 'Sesi titriyor, duydun mu?'} Bu iş bitti.`, `Bak, ${ad} kıvranıyor. Ekipte herkes aynı fikirde: bu o.`, `Ben olsam ${belirtme(ad)} hemen içeri alırdım. Herkes görüyor işte.`]) };
      return { rol: 'saha', ad: uye.ad, hukum: 'temiz', metin: r.sec([`${ad} temiz görünüyor, sakin. Bir sonrakine geçelim.`, `Bu kadar rahat biri yalan söylemez. ${ad} bizim adam değil.`]) };
    }
    case 'inanan':
      if (ipucuSayisi > 0) return { rol: 'inanan', ad: uye.ad, hukum: 'supheli', metin: r.sec([`${ad} bir şey saklıyor, içime doğdu. Enerjisi değişti.`, `O bakış… ${ad} gözlerini kaçırdı, ben bunu bilirim.`, `Bu bir işaret. ${ad} anlatırken bir şey değişti, hissettim.`]) };
      return { rol: 'inanan', ad: uye.ad, hukum: 'yok', metin: r.sec([`Hmm. ${ad} hakkında henüz içime bir şey doğmadı.`, `Bir şey hissetmedim ama sezgim genelde geç uyanır.`]) };
    case 'lider':
      if (celiski) return { rol: 'lider', ad: uye.ad, hukum: 'yok', metin: r.sec([`Elimizde delil var ve anlattığıyla uyuşmuyor. Ama çelişki tek başına hüküm değil; kaynağını sor.`, `Delille ifadesi çelişiyor. Bunu savcıya nasıl anlatırsın? Önce delilin kaynağına bak.`]) };
      return { rol: 'lider', ad: uye.ad, hukum: 'yok', metin: r.sec([`Gerginlik kanıt değil. Elinde delil var mı? Yoksa bunu geç.`, `"Bence" ile gelme bana. Hangi delil, hangi çelişki?`, `İyi. Şimdi bunu doğrulayacak bir kaynak bul; tek ifadeyle yürümeyiz.`]) };
    case 'sorgucu':
      if (bilmiyor) return { rol: 'sorgucu', ad: uye.ad, hukum: 'yok', metin: r.sec([`"Bilmiyorum" diyor. İki seçenekli sor; bilen, doğru cevaptan kaçar.`, `Hatırlamıyorsa zorlama. Sondan başa anlattır.`]) };
      return { rol: 'sorgucu', ad: uye.ad, hukum: 'yok', metin: r.sec([`Delili henüz gösterme. Önce anlattır.`, `Aynı soruyu başka biçimde sor. Beklemediği yerden.`, `Temel çizgi kurdun mu? Kurmadıysan bu ipuçları boş.`]) };
  }
}

/**
 * "Watson'a anlat" (TASARIM §9): sorgucu (Cemal Ilgaz) her pano maddesinde bilerek basit sorular sorar.
 * Öğreterek öğrenme: oyuncu maddeyi sınıflandırıp test edip etmediğini söyler.
 */
export function watsonSorusu(tur: 'gozlem' | 'cikarim' | 'hipotez' | 'olmayan', metin: string, indeks: number): string {
  const r = new Rastgele(`watson/${tur}/${metin}/${indeks}`);
  const sorular: Record<typeof tur, string[]> = {
    gozlem: [`"${metin}." Bunu gördün mü, yoksa öyle olduğunu mu düşünüyorsun?`, `"${metin}." Kaynağı ne: kendi gözün mü, biri mi söyledi?`, `"${metin}." Bunu bir yabancıya kanıtlayabilir misin?`],
    cikarim: [`"${metin}." Bu bir gözlem mi, yoksa senin yorumun mu?`, `"${metin}." Hangi gözlemden çıkardın? Test ettin mi?`, `"${metin}." Bunun tersi de gözlemlerle uyuşur mu?`],
    hipotez: [`"${metin}." Bunu çürütecek bir şey aradın mı?`, `"${metin}." Karşıt hipotezin ne?`, `"${metin}." Şu ana kadar bunu destekleyen mi, çürüten mi bulgu daha çok?`],
    olmayan: [`"${metin}." Beklenen ama olmayan; bunu gerçekten kontrol ettin mi, yoksa varsayım mı?`, `"${metin}." Bir şeyin olmaması da delildir; ama başka bir açıklaması olabilir mi?`],
  };
  return r.sec(sorular[tur]);
}
