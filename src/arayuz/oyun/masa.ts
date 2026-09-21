// Oyuncunun kendi çalışma verileri; gizli gerçeklik grafiğine erişmez.
export interface DefterNotu { id: string; metin: string; kaynak: string; tur: 'not' | 'ifade' | 'delil'; saat: number }
export interface CizelgeNotu { id: string; notId: string; dilim: number; dayanak: string }
export interface Masa { notlar: DefterNotu[]; cizelge: CizelgeNotu[]; sonGorusulen: string | null }
export interface ArsivDosyasi {
  mekan: string; tarih: string; brifing: string; karar: string; gercek: string;
  notlar: DefterNotu[]; cizelge: CizelgeNotu[]; gorusulen: number; kisiSayisi: number;
  teknikler: string[]; zaman: number; dayanakSayisi: number;
}
export const bosMasa = (): Masa => ({ notlar: [], cizelge: [], sonGorusulen: null });
/** Eski veya eksik kayıt alanları güvenli başlangıç değerlerine düşer. */
export function masaOku(v: unknown): Masa {
  if (!v || typeof v !== 'object') return bosMasa();
  const m = v as Partial<Masa>;
  const notlar = Array.isArray(m.notlar) ? m.notlar.filter(n => n && typeof n.id === 'string' && typeof n.metin === 'string' && typeof n.kaynak === 'string' && ['not', 'ifade', 'delil'].includes(n.tur) && Number.isFinite(n.saat)) : [];
  const cizelge = Array.isArray(m.cizelge) ? m.cizelge.filter(c => c && typeof c.id === 'string' && notlar.some(n => n.id === c.notId) && Number.isInteger(c.dilim) && c.dilim >= 0 && typeof c.dayanak === 'string') : [];
  return { notlar, cizelge, sonGorusulen: typeof m.sonGorusulen === 'string' ? m.sonGorusulen : null };
}
