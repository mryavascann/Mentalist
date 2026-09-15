// Forer tutorial'ı içeriği (tipli erişim).
import forer from './forer.json';

export interface ForerIcerigi {
  kaynak: string[];
  aciklama: string;
  sorular: string[];
  /** Forer 1949'un 13 maddesi (Türkçe). Herkes aynı profili alır. */
  profil: string[];
  ifsa: string;
  ortalama1949: number;
}

export const FORER: ForerIcerigi = forer as ForerIcerigi;
