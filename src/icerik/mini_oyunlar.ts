// Mini oyun / tatbikat içerikleri (TASARIM §13): kör seçim, soğuk okuma dedektörü, taban oranı.
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

export interface MiniOyunlar {
  korSecim: KorSecimIcerigi;
  sogukOkuma: SogukOkumaIcerigi;
  tabanOrani: TabanOraniIcerigi;
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
