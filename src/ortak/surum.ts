// Proje kimliği ve sürüm bilgisi.
// Tek bir yerden okunur; arayüz başlığı, hata raporları ve kayıt dosyaları buradan beslenir.
// Ad kararı: docs/KARARLAR.md K-019 (eski ad: K-007).

export const PROJE = {
  /** Oyunun adı (K-019). Kahraman adı ayrı: oyuncu girer. */
  ad: 'Cold Read',
  /** Semantik sürüm; package.json ile elle eşit tutulur. */
  surum: '0.0.1',
} as const;

/** Arayüzde ve günlüklerde gösterilecek "Ad vX.Y.Z" biçimli metin. */
export function surumMetni(): string {
  return `${PROJE.ad} v${PROJE.surum}`;
}
