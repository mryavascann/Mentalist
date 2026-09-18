// Kabuk: üst bant (oyun adı, kahraman adı, zaman bütçesi) + sekme gezintisi. Ekranlar bunun içinde çizilir.
import type { ReactNode } from 'react';
import { depo, useOyun } from '../oyun/kullan';
import type { Ekran } from '../oyun/depo';
import { useTema } from '../tema';

const SEKMELER: { ekran: Ekran; ad: string }[] = [
  { ekran: 'vaka-acilis', ad: 'Dosya' },
  { ekran: 'sorgu', ad: 'Sorgu' },
  { ekran: 'pano', ad: 'Pano' },
  { ekran: 'suclama', ad: 'Suçlama' },
  { ekran: 'kilavuz', ad: 'Kılavuz' },
];

export function Kabuk({ children }: { children: ReactNode }) {
  const d = useOyun();
  const [tema, temaDegistir] = useTema();
  const vakaVar = d.sorgu !== null;
  const asim = d.zaman > d.zamanButcesi;
  return (
    <div className="kabuk">
      <header className="ust">
        <h1>THE MENTALIST</h1>
        {d.kahramanAdi && <span className="kahraman">{d.kahramanAdi}</span>}
        {vakaVar && (
          <span className={`zaman${asim ? ' asim' : ''}`} title="Harcanan soruşturma saati / bütçe">
            ⏱ {d.zaman.toFixed(1).replace('.', ',')} / {d.zamanButcesi} saat
          </span>
        )}
        <button
          type="button"
          className="tema-anahtari"
          onClick={temaDegistir}
          title={tema === 'acik' ? 'Karanlık moda geç' : 'Aydınlık moda geç'}
          aria-label={tema === 'acik' ? 'Karanlık moda geç' : 'Aydınlık moda geç'}
        >
          {tema === 'acik' ? '🌙 Karanlık' : '☀️ Aydınlık'}
        </button>
        <nav aria-label="Ekranlar">
          {SEKMELER.map((s) => (
            <button
              key={s.ekran}
              className={d.ekran === s.ekran ? 'secili' : ''}
              disabled={!vakaVar && s.ekran !== 'kilavuz'}
              onClick={() => (s.ekran === 'kilavuz' ? depo.kilavuzAc(null) : depo.ekranaGit(s.ekran))}
            >
              {s.ad}
            </button>
          ))}
          {d.puan && <button onClick={() => depo.ekranaGit('analiz')} className={d.ekran === 'analiz' ? 'secili' : ''}>Analiz</button>}
          {vakaVar && !d.puan && <button title="Zaman 1 saat ilerler; takım yeni bilgi getirir" onClick={() => depo.kanepeMolasi()}>☕ Kanepe molası</button>}
          <button onClick={() => depo.ekranaGit('baslik')}>Başlık</button>
        </nav>
      </header>
      {children}
    </div>
  );
}
