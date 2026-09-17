// Karanlık/aydınlık mod: salt görsel tercih, oyun kaydından ayrı anahtarla saklanır (oyun durumunu etkilemez).
import { useEffect, useState } from 'react';

export type Tema = 'acik' | 'karanlik';

const TEMA_ANAHTARI = 'the-mentalist:tema';

function sistemKaranlikMi(): boolean {
  try {
    return globalThis.matchMedia?.('(prefers-color-scheme: dark)').matches ?? false;
  } catch {
    return false;
  }
}

function temaOku(): Tema {
  try {
    const kayitli = globalThis.localStorage?.getItem(TEMA_ANAHTARI);
    if (kayitli === 'acik' || kayitli === 'karanlik') return kayitli;
  } catch {
    /* depolama yok; sessizce geç */
  }
  return sistemKaranlikMi() ? 'karanlik' : 'acik';
}

function temaUygula(tema: Tema): void {
  document.documentElement.setAttribute('data-tema', tema);
  try {
    globalThis.localStorage?.setItem(TEMA_ANAHTARI, tema);
  } catch {
    /* depolama yok; sessizce geç */
  }
}

/** Geçerli tema ve aç/kapa fonksiyonunu döner; değişiklik <html data-tema> üzerinden CSS'e yansır. */
export function useTema(): [Tema, () => void] {
  const [tema, setTema] = useState<Tema>(temaOku);
  useEffect(() => {
    temaUygula(tema);
  }, [tema]);
  const degistir = () => setTema((t) => (t === 'acik' ? 'karanlik' : 'acik'));
  return [tema, degistir];
}
