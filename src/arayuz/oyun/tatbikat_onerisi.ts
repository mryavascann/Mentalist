// Aralıklı tekrar (TASARIM §11 "çalışma önerisi" + §13): vaka sonunda hata etiketi → ilgili tatbikat.
//
// Analiz ekranı "Öğrendiklerin" bölümünün altında, bu vakadaki hata etiketlerine uyan tatbikatları önerir.
// Her etiketin bir tatbikatı olmak zorunda değil; yalnızca dersin doğrudan karşılığı olan eşlemeler tutulur
// (ör. "tipik suçlu" profiline kanan oyuncuya Linda tuzağı; tek bir tike yaslanan oyuncuya ince dilim).
// Öneriler etiket sırasını korur ve aynı tatbikatı bir kez listeler; hangi etiketlerden geldiği yazılır.
import type { TatbikatId } from './depo';

/** Tatbikat kimliği → ekranda görünen ad (Başlık ve Analiz aynı adları kullanır). */
export const TATBIKAT_ADLARI: Record<TatbikatId, string> = {
  'kor-secim': 'Kör seçim',
  'soguk-okuma': 'Soğuk okuma dedektörü',
  'taban-orani': 'Taban oranı',
  linda: 'Linda tuzağı',
  'off-beat': 'Kaybolan top / off-beat',
  'ince-dilim': 'İnce dilim',
  'cift-kor': 'Çift kör test tasarla',
};

/**
 * Hata etiketi → tatbikat. Gerekçeler:
 *   temsil-edicilik, ic-masalci → Linda: ayrıntılı/uyumlu hikâye daha olası değildir (birleşim yanılgısı).
 *   capalama, asiri-ozguven → taban oranı: ilk rakam ve "%99" sezgisinin tuzağı.
 *   fark-etmedin, ipucu-erisilemez → off-beat: dikkat gevşeme anında kaçırır; bakmak görmek değildir.
 *   othello-hatasi, tek-ipucu, beklenti-ihlali, hale-etkisi → ince dilim: ilk izlenim kişilik için işe yarar, yalan için değil.
 *   dogruluk-yanliligi → soğuk okuma: "bana uyuyor" hissinin nasıl üretildiğini görmek.
 *   delil-sorgulanmadi, gecersiz-gizli-bilgi-testi → çift kör: iddiayı protokolle sına, testin geçerliliğini kur.
 */
export const TATBIKAT_ONERISI: Record<string, TatbikatId> = {
  'temsil-edicilik': 'linda',
  'ic-masalci': 'linda',
  capalama: 'taban-orani',
  'asiri-ozguven': 'taban-orani',
  'fark-etmedin': 'off-beat',
  'ipucu-erisilemez': 'off-beat',
  'othello-hatasi': 'ince-dilim',
  'tek-ipucu': 'ince-dilim',
  'beklenti-ihlali': 'ince-dilim',
  'hale-etkisi': 'ince-dilim',
  'oda-okuma-suc': 'ince-dilim',
  'dogruluk-yanliligi': 'soguk-okuma',
  'delil-sorgulanmadi': 'cift-kor',
  'gecersiz-gizli-bilgi-testi': 'cift-kor',
};

export interface TatbikatOnerisi { tatbikat: TatbikatId; ad: string; etiketler: string[] }

/** Bu vakanın hata etiketlerinden tekrarsız tatbikat listesi (etiket sırası korunur). */
export function tatbikatOner(hataEtiketleri: readonly string[]): TatbikatOnerisi[] {
  const sonuc: TatbikatOnerisi[] = [];
  for (const etiket of hataEtiketleri) {
    const t = TATBIKAT_ONERISI[etiket];
    if (!t) continue;
    const mevcut = sonuc.find((x) => x.tatbikat === t);
    if (mevcut) { if (!mevcut.etiketler.includes(etiket)) mevcut.etiketler.push(etiket); continue; }
    sonuc.push({ tatbikat: t, ad: TATBIKAT_ADLARI[t], etiketler: [etiket] });
  }
  return sonuc;
}
