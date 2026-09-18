// Pano: Gözlem | Çıkarım ayrımı, hipotez limiti (4–7), "beklenen ama olmayan" listesi (TASARIM §9).
import { useState } from 'react';
import { depo, useOyun } from '../oyun/kullan';
import type { PanoTuru } from '../oyun/depo';
import { ifadeCizelgesi } from '../oyun/cizelge';
import { DIGER } from '../gorseller';

const SUTUNLAR: { tur: PanoTuru; baslik: string; ipucu: string }[] = [
  { tur: 'gozlem', baslik: 'Gözlem (ham)', ipucu: 'Ne gördün, ne duydun; yorum katma.' },
  { tur: 'cikarim', baslik: 'Çıkarım (yorum)', ipucu: 'Gözlemden ne sonuç çıkardın; test ettin mi?' },
  { tur: 'hipotez', baslik: 'Hipotezler (en fazla 7)', ipucu: 'Karşıt hipotezini de yaz; ilk fikrine takılıp kalmamanı sağlar (çıpalama etkisi).' },
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
  const d = useOyun();
  const dolu = d.pano.gozlem.length + d.pano.cikarim.length + d.pano.hipotez.length + d.pano.olmayan.length > 0;
  return (
    <div>
      <div className="mantar izgara" style={DIGER.mantar ? { backgroundImage: `url(${DIGER.mantar})`, backgroundSize: 'cover' } : undefined}>
        {SUTUNLAR.map((s) => <Sutun key={s.tur} {...s} />)}
      </div>
      {d.takimNotlari.length > 0 && (
        <section className="dosya">
          {DIGER.kanepe && <img src={DIGER.kanepe} alt="" aria-hidden="true" style={{ width: '100%', maxHeight: 140, objectFit: 'cover', border: '1px solid var(--cizgi)', marginBottom: 8 }} />}
          <h2>Takım notları (kanepe molaları)</h2>
          <ul className="liste-temiz">{d.takimNotlari.map((n, i) => <li key={i}><span>{n.metin}</span><span className="soluk">{n.zaman.toFixed(1)} s</span></li>)}</ul>
        </section>
      )}
      {d.sorgu && (() => {
        const c = ifadeCizelgesi(d.sorgu);
        const sorulmus = [...c.hucreler.values()].some((s) => s.some((h) => h !== null));
        if (!sorulmus) return null;
        return (
          <section className="dosya">
            <h2>İfade çizelgesi (söylenenler; gerçek değil)</h2>
            <div style={{ overflowX: 'auto' }}>
              <table style={{ borderCollapse: 'collapse', fontSize: 12, fontFamily: 'var(--daktilo)' }}>
                <thead><tr><th style={{ textAlign: 'left', padding: 4 }}>Kişi</th>{c.dilimler.map((s) => <th key={s} style={{ padding: 4 }}>{s}</th>)}</tr></thead>
                <tbody>
                  {c.kisiler.map((k) => (
                    <tr key={k.id} style={{ borderTop: '1px dotted var(--cizgi)' }}>
                      <td style={{ padding: 4 }}>{k.ad.split(' ')[0]}</td>
                      {c.hucreler.get(k.id)!.map((h, i) => <td key={i} style={{ padding: 4, color: h === null ? 'var(--cizgi)' : h === 'bilmiyor' ? 'var(--murekkep-soluk)' : 'inherit' }}>{h === null ? '·' : h}</td>)}
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </section>
        );
      })()}
      <div className="dugmeler" style={{ marginTop: 10 }}>
        <button disabled={!dolu} onClick={() => depo.watsonBasla()} title="Pano maddelerini sorgucuya adım adım anlat">Watson'a anlat</button>
        <span className="soluk">Vakayı bir takım arkadaşına anlat; her maddede "gözlem mi çıkarım mı, test ettin mi?" sorulur.</span>
      </div>
    </div>
  );
}
