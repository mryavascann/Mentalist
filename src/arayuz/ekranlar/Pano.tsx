// Pano: Gözlem | Çıkarım ayrımı, hipotez limiti (4–7), "beklenen ama olmayan" listesi (TASARIM §9).
import { useState } from 'react';
import { depo, useOyun } from '../oyun/kullan';
import type { PanoTuru } from '../oyun/depo';

const SUTUNLAR: { tur: PanoTuru; baslik: string; ipucu: string }[] = [
  { tur: 'gozlem', baslik: 'Gözlem (ham)', ipucu: 'Ne gördün, ne duydun; yorum katma.' },
  { tur: 'cikarim', baslik: 'Çıkarım (yorum)', ipucu: 'Gözlemden ne sonuç çıkardın; test ettin mi?' },
  { tur: 'hipotez', baslik: 'Hipotezler (en fazla 7)', ipucu: 'Karşıt hipotezi de yaz (çapalama kırıcı).' },
  { tur: 'olmayan', baslik: 'Beklenen ama olmayan', ipucu: 'Köpek havlamadı, kapı zorlanmadı…' },
];

function Sutun({ tur, baslik, ipucu }: { tur: PanoTuru; baslik: string; ipucu: string }) {
  const d = useOyun();
  const [metin, setMetin] = useState('');
  const liste = d.pano[tur];
  const ekle = () => { if (depo.panoEkle(tur, metin)) setMetin(''); };
  return (
    <div>
      <h3>{baslik}</h3>
      <p className="soluk" style={{ color: '#fff', marginTop: 0 }}>{ipucu}</p>
      {liste.map((m, i) => (
        <div className="not" key={i}>
          {m} <button style={{ float: 'right', padding: '0 6px' }} onClick={() => depo.panoSil(tur, i)} aria-label="sil">×</button>
        </div>
      ))}
      <div className="satirici">
        <input type="text" value={metin} placeholder="ekle…" onChange={(e) => setMetin(e.target.value)} onKeyDown={(e) => e.key === 'Enter' && ekle()} />
        <button onClick={ekle} disabled={tur === 'hipotez' && liste.length >= 7}>+</button>
      </div>
    </div>
  );
}

export function Pano() {
  return (
    <div className="mantar izgara">
      {SUTUNLAR.map((s) => <Sutun key={s.tur} {...s} />)}
    </div>
  );
}
