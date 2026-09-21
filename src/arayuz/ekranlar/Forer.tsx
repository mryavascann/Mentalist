// Forer tutorial'ı: kısa "kişilik testi" → herkese aynı profil → oyuncu puanlar → ifşa. Güçlü ilk ders (TASARIM §13).
import { useState } from 'react';
import { FORER } from '@icerik/forer';
import { depo, useOyun } from '../oyun/kullan';
import { DIGER } from '../gorseller';

export function Forer() {
  const d = useOyun();
  const [cevaplar, setCevaplar] = useState<string[]>(() => FORER.sorular.map(() => ''));
  const [puan, setPuan] = useState(4);
  const asama = d.forer.asama;

  return (
    <div className="dosya" style={{ maxWidth: 720, margin: '20px auto' }}>
      {DIGER.forer && <img src={DIGER.forer} alt="" aria-hidden="true" style={{ width: '100%', maxHeight: 180, objectFit: 'cover', border: '1px solid var(--cizgi)', marginBottom: 8 }} />}
      {asama === 'sorular' && (
        <>
          <h2>Açılış dersi · Kısa kişilik testi</h2>
          <p className="soluk">Sekiz soruya kısa cevap ver; sana özel bir analiz hazırlanacak. (2 dakika)</p>
          {FORER.sorular.map((s, i) => (
            <label key={i} style={{ display: 'block', margin: '8px 0' }}>
              {s}
              <br />
              <input type="text" value={cevaplar[i]} onChange={(e) => setCevaplar((c) => c.map((x, j) => (j === i ? e.target.value : x)))} style={{ width: '100%' }} />
            </label>
          ))}
          <button className="birincil" onClick={() => depo.forerCevapla(cevaplar)}>Analizimi hazırla</button>
        </>
      )}
      {asama === 'profil' && (
        <>
          <h2>Kişilik analizin, {d.kahramanAdi}</h2>
          <ol>{FORER.profil.map((m, i) => <li key={i} style={{ margin: '6px 0' }}>{m}</li>)}</ol>
          <h3>Bu analiz seni ne kadar iyi anlatıyor? {puan}/5</h3>
          <input type="range" aria-label="Analiz seni ne kadar iyi anlatıyor?" aria-valuetext={`5 üzerinden ${puan}`} min={1} max={5} value={puan} onChange={(e) => setPuan(Number(e.target.value))} style={{ width: '100%' }} />
          <button className="birincil" onClick={() => depo.forerPuanla(puan)}>Puanla</button>
        </>
      )}
      {asama === 'ifsa' && (
        <>
          <h2>İfşa</h2>
          <p>Senin puanın: <b>{d.forer.puan}/5</b>. 1949'daki öğrencilerin ortalaması: <b>{String(FORER.ortalama1949).replace('.', ',')}/5</b>.</p>
          <p>{FORER.ifsa}</p>
          <p className="soluk">{FORER.aciklama}</p>
          <div className="dugmeler">
            <button className="birincil" onClick={() => depo.forerBitir()}>Anladım, dosyaya geç</button>
            <button onClick={() => depo.kilavuzAc('forer-barnum')}>Kılavuz: Barnum etkisi</button>
          </div>
        </>
      )}
    </div>
  );
}
