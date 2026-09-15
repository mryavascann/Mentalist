// React ↔ depo köprüsü: tek bir OyunDeposu örneği, useSyncExternalStore ile okunur.
// Otomatik kayıt (K-011): her değişimde localStorage'a yazılır; okuma/yazma try/catch içinde,
// depolama yoksa (file://, gizli pencere) oyun yine çalışır. Dosyaya dışa/içe aktarma ayrıca var.
import { useSyncExternalStore } from 'react';
import { OyunDeposu, type OyunDurumu } from './depo';

export const KAYIT_ANAHTARI = 'the-mentalist:kayit';

export const depo = new OyunDeposu();

/** Açılışta tarayıcı kaydını yükler (varsa). */
export function kaydiYukle(): boolean {
  try {
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
