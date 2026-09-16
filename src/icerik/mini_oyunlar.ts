// Mini oyun / tatbikat içerikleri (TASARIM §13): kör seçim, soğuk okuma dedektörü, taban oranı,
// Linda tuzağı, kaybolan top / off-beat, ince dilim, çift kör test tasarla.
// Her tatbikat kısa (2–5 dk), anında geri bildirimli ve Kılavuz'a bağlıdır. Puanlama saf fonksiyondur;
// depo ve ekran bunları çağırır, böylece kurallar UI'dan bağımsız test edilir.
import veri from './mini_oyunlar.json';

export interface KorSecimIcerigi {
  kaynak: string[];
  aciklama: string;
  profiller: { id: string; metin: string }[];
  ifsa: string;
}

export interface SogukOkumaIcerigi {
  kaynak: string[];
  aciklama: string;
  ogeler: { id: string; ad: string; aciklama: string }[];
  /** Medyum kaydı: her cümlenin doğru öğe etiketleri (çoklu). */
  kayit: { id: string; metin: string; ogeler: string[] }[];
}

export interface TabanOraniIcerigi {
  kaynak: string[];
  aciklama: string;
  secenekler: { id: string; metin: string; dogru: boolean }[];
  cozum: string;
}

/** Tek doğrulu çoktan seçmeli seçenek (Linda çiftleri ve off-beat soruları). */
export interface Secenek { id: string; metin: string; dogru: boolean }

/** Linda tuzağı: 'birlesim' çiftinde kısa (tek koşullu) iddia, 'ayrik' çiftinde uzun ('ya da') iddia doğrudur. */
export interface LindaIcerigi {
  kaynak: string[];
  aciklama: string;
  ciftler: { id: string; tur: 'birlesim' | 'ayrik'; profil: string; secenekler: Secenek[]; aciklama: string }[];
}

/** Kaybolan top / off-beat: anlar listesi + üç soru (ilk sorunun seçenekleri an kimlikleridir). */
export interface OffBeatIcerigi {
  kaynak: string[];
  kilavuz: string[];
  aciklama: string;
  anlar: { id: string; metin: string }[];
  sorular: { id: string; metin: string; secenekler: Secenek[]; aciklama: string }[];
}

/** İnce dilim: kişi başına sıcaklık, baskınlık ve yalan boyutu; yalanın doğrusu her zaman 'bilinemez'. */
export interface InceDilimIcerigi {
  kaynak: string[];
  aciklama: string;
  kisiler: {
    id: string;
    ad: string;
    betimleme: string;
    boyutlar: { id: string; soru: string; dogru: string; secenekler: { id: string; metin: string }[]; aciklama: string }[];
  }[];
}

/** Çift kör test: protokol maddeleri; 'gerekli' seçilmeli, 'tuzak' seçilmemeli. */
export interface CiftKorIcerigi {
  kaynak: string[];
  aciklama: string;
  maddeler: { id: string; tur: 'gerekli' | 'tuzak'; metin: string; aciklama: string }[];
}

export interface MiniOyunlar {
  korSecim: KorSecimIcerigi;
  sogukOkuma: SogukOkumaIcerigi;
  tabanOrani: TabanOraniIcerigi;
  linda: LindaIcerigi;
  offBeat: OffBeatIcerigi;
  inceDilim: InceDilimIcerigi;
  ciftKor: CiftKorIcerigi;
}

export const MINI_OYUNLAR: MiniOyunlar = veri as MiniOyunlar;

/**
 * Soğuk okuma dedektörü puanı: her cümle için doğru etiket +1, yanlış etiket −1; toplam ve en yüksek puan.
 * Çoklu etiket puanı (TASARIM §13).
 */
export function sogukOkumaPuanla(secimler: Record<string, string[]>): { puan: number; enYuksek: number; cumleler: { id: string; dogru: number; yanlis: number; kacirilan: number }[] } {
  const cumleler = MINI_OYUNLAR.sogukOkuma.kayit.map((c) => {
    const secilen = new Set(secimler[c.id] ?? []);
    const gercek = new Set(c.ogeler);
    const dogru = [...secilen].filter((x) => gercek.has(x)).length;
    const yanlis = [...secilen].filter((x) => !gercek.has(x)).length;
    const kacirilan = [...gercek].filter((x) => !secilen.has(x)).length;
    return { id: c.id, dogru, yanlis, kacirilan };
  });
  const puan = cumleler.reduce((t, c) => t + c.dogru - c.yanlis, 0);
  const enYuksek = MINI_OYUNLAR.sogukOkuma.kayit.reduce((t, c) => t + c.ogeler.length, 0);
  return { puan, enYuksek, cumleler };
}

/**
 * Linda tuzağı puanı: çift başına doğru seçenek +1. Yanlış seçilen çiftlerin kimlikleri döner ki ekran
 * açıklamayı o çiftlerde vurgulasın. Boş bırakılan çift yanlış sayılmaz ama puan da almaz.
 */
export function lindaPuanla(secimler: Record<string, string>): { puan: number; enYuksek: number; yanlislar: string[] } {
  const yanlislar: string[] = [];
  let puan = 0;
  for (const c of MINI_OYUNLAR.linda.ciftler) {
    const secim = secimler[c.id];
    if (secim === undefined) continue;
    if (c.secenekler.find((s) => s.id === secim)?.dogru) puan++;
    else yanlislar.push(c.id);
  }
  return { puan, enYuksek: MINI_OYUNLAR.linda.ciftler.length, yanlislar };
}

/** Off-beat puanı: soru başına doğru +1; en yüksek soru sayısı (3). */
export function offBeatPuanla(secimler: Record<string, string>): { puan: number; enYuksek: number; yanlislar: string[] } {
  const yanlislar: string[] = [];
  let puan = 0;
  for (const s of MINI_OYUNLAR.offBeat.sorular) {
    const secim = secimler[s.id];
    if (secim === undefined) continue;
    if (s.secenekler.find((x) => x.id === secim)?.dogru) puan++;
    else yanlislar.push(s.id);
  }
  return { puan, enYuksek: MINI_OYUNLAR.offBeat.sorular.length, yanlislar };
}

/**
 * İnce dilim puanı: her boyutta doğru +1. Yalan boyutunda 'evet' ya da 'hayır' demek puan getirmez ve
 * "aşırı genelleme" sayılır: ince dilim kişilik için işe yarar, yalan için değil (Ambady & Rosenthal 1992).
 */
export function inceDilimPuanla(secimler: Record<string, Record<string, string>>): { puan: number; enYuksek: number; asiriGenelleme: number } {
  let puan = 0;
  let asiriGenelleme = 0;
  let enYuksek = 0;
  for (const k of MINI_OYUNLAR.inceDilim.kisiler) {
    for (const b of k.boyutlar) {
      enYuksek++;
      const secim = secimler[k.id]?.[b.id];
      if (secim === undefined) continue;
      if (secim === b.dogru) puan++;
      else if (b.id === 'yalan') asiriGenelleme++;
    }
  }
  return { puan, enYuksek, asiriGenelleme };
}

/**
 * Çift kör test puanı: seçilen gerekli madde +1, seçilen tuzak −1. Kaçırılan gerekliler ve seçilen tuzaklar
 * ayrı listelenir; en yüksek puan gerekli madde sayısıdır.
 */
export function ciftKorPuanla(secilen: string[]): { puan: number; enYuksek: number; kacirilan: string[]; tuzaklar: string[] } {
  const s = new Set(secilen);
  let puan = 0;
  const kacirilan: string[] = [];
  const tuzaklar: string[] = [];
  let enYuksek = 0;
  for (const m of MINI_OYUNLAR.ciftKor.maddeler) {
    if (m.tur === 'gerekli') {
      enYuksek++;
      if (s.has(m.id)) puan++; else kacirilan.push(m.id);
    } else if (s.has(m.id)) { puan--; tuzaklar.push(m.id); }
  }
  return { puan, enYuksek, kacirilan, tuzaklar };
}
