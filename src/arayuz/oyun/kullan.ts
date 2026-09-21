// React ↔ depo köprüsü: tek bir OyunDeposu örneği, useSyncExternalStore ile okunur.
// Otomatik kayıt (K-011): her değişimde localStorage'a yazılır; okuma/yazma try/catch içinde,
// depolama yoksa (file://, gizli pencere) oyun yine çalışır. Dosyaya dışa/içe aktarma ayrıca var.
import { useSyncExternalStore } from 'react';
import { OyunDeposu, type OyunDurumu } from './depo';

export const KAYIT_ANAHTARI = 'cold-read:kayit';
// Oyunun eski adıyla (K-007) yazılmış kayıtların anahtarı; K-019 ile ad değişti, kayıt kaybolmasın diye taşınır.
const ESKI_KAYIT_ANAHTARI = 'the-mentalist:kayit';

export const depo = new OyunDeposu();

/**
 * Eski anahtardaki kaydı yeni anahtara taşır. Yeni anahtar doluysa dokunmaz (yeni kayıt önceliklidir);
 * eski anahtar her durumda temizlenir ki aynı taşıma tekrar tekrar denenmesin.
 */
function eskiKaydiTasi(): void {
  const depolama = globalThis.localStorage;
  const eski = depolama?.getItem(ESKI_KAYIT_ANAHTARI);
  if (!depolama || !eski) return;
  if (!depolama.getItem(KAYIT_ANAHTARI)) depolama.setItem(KAYIT_ANAHTARI, eski);
  depolama.removeItem(ESKI_KAYIT_ANAHTARI);
}

/** Açılışta tarayıcı kaydını yükler (varsa). */
export function kaydiYukle(): boolean {
  try {
    eskiKaydiTasi();
    const json = globalThis.localStorage?.getItem(KAYIT_ANAHTARI);
    return json ? depo.iceAktar(json) : false;
  } catch {
    return false;
  }
}

export function kaydiYaz(): void {
  try {
    globalThis.localStorage?.setItem(KAYIT_ANAHTARI, depo.disaAktar());
  } catch {
    /* depolama yok; sessizce geç */
  }
}

export function kaydiSil(): void {
  try {
    globalThis.localStorage?.removeItem(KAYIT_ANAHTARI);
  } catch {
    /* yok say */
  }
}

depo.abone(kaydiYaz);

export function useOyun(): OyunDurumu {
  return useSyncExternalStore(
    (fn) => depo.abone(fn),
    () => depo.durum,
    () => depo.durum,
  );
}
