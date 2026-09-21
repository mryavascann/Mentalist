// Okuma tercihleri ve ortam sesleri; oyun kaydından ayrı, yalnızca bu cihazda saklanır.
import { useEffect, useRef, useState } from 'react';
import { OrtamSesi, SESLER, type Sesler, type SesTuru } from '../oyun/ortamSesi';
const ANAHTAR = 'cold-read:rahatlik';
interface Tercih { boyut: number; aralik: number; sesler: Sesler }
function tercihOku(): Tercih {
  const temel = { boyut: 1, aralik: 1.85, sesler: { ...SESLER } };
  try {
    const v = JSON.parse(localStorage.getItem(ANAHTAR) || 'null'); if (!v) return temel;
    return { boyut: [1, 1.15, 1.3].includes(v.boyut) ? v.boyut : 1, aralik: [1.6, 1.85, 2.2].includes(v.aralik) ? v.aralik : 1.85,
      sesler: Object.fromEntries(Object.entries(SESLER).map(([k, d]) => [k, typeof v.sesler?.[k] === 'number' && Number.isFinite(v.sesler[k]) ? Math.max(0, Math.min(100, v.sesler[k])) : d])) as Sesler };
  } catch { return temel; }
}
export function RahatlikAyarlari({ odak, odakDegistir, sorguda }: { odak: boolean; odakDegistir: () => void; sorguda: boolean }) {
  const [tercih, setTercih] = useState(tercihOku);
  const [sesAcik, setSesAcik] = useState(false);
  const [hata, setHata] = useState('');
  const modal = useRef<HTMLDialogElement>(null);
  const motor = useRef<OrtamSesi | null>(null);
  const mesgul = useRef(false);
  useEffect(() => {
    document.documentElement.style.setProperty('--okuma-olcegi', String(tercih.boyut));
    document.documentElement.style.setProperty('--okuma-araligi', String(tercih.aralik));
    try { localStorage.setItem(ANAHTAR, JSON.stringify(tercih)); } catch { /* Tercih depolanamasa da bu oturumda çalışır. */ }
  }, [tercih]);
  useEffect(() => () => motor.current?.durdur(), []);
  const sesDegistir = async () => {
    if (mesgul.current) return;
    if (sesAcik) { motor.current?.durdur(); motor.current = null; setSesAcik(false); return; }
    mesgul.current = true;
    try { motor.current = new OrtamSesi(); await motor.current.baslat(tercih.sesler); setSesAcik(true); setHata(''); }
    catch { setHata('Bu tarayıcıda ses başlatılamadı. Yeniden deneyebilirsin.'); }
    finally { mesgul.current = false; }
  };
  return <><button className="arac-ac" onClick={() => modal.current?.showModal()} aria-label="Okuma ve ses ayarları">Aa · Ses{sesAcik ? ' ●' : ''}</button>
    {sorguda && <button className="arac-ac" aria-pressed={odak} onClick={odakDegistir}>{odak ? 'Odaktan çık' : 'Odak görünümü'}</button>}
    <dialog ref={modal} className="masa-dialog ayar-dialog" aria-labelledby="ayar-baslik"><div className="bolum-ust"><h2 id="ayar-baslik">Kendi ritminde.</h2><button onClick={() => modal.current?.close()}>Ayarları kapat</button></div><p className="soluk">Okuma ayarların bu cihazda hatırlanır. Ortam sesi her açılışta kapalıdır.</p>
      <label>Yazı boyutu<select value={tercih.boyut} onChange={e => setTercih({ ...tercih, boyut: Number(e.target.value) })}><option value={1}>Standart</option><option value={1.15}>Büyük</option><option value={1.3}>Çok büyük</option></select></label>
      <label>Satır aralığı<select value={tercih.aralik} onChange={e => setTercih({ ...tercih, aralik: Number(e.target.value) })}><option value={1.6}>Sık</option><option value={1.85}>Rahat</option><option value={2.2}>Geniş</option></select></label>
      <p className="okuma-ornek">Bir ayrıntı fark ettin. Şimdi acele etmeden, onun ne anlama gelebileceğini düşün.</p>
      <h3>Masadaki sesler</h3><button className="birincil" onClick={() => void sesDegistir()}>{sesAcik ? 'Ortam seslerini kapat' : 'Ortam seslerini aç'}</button><p className="soluk">Yağmur ve şehir arka planda; kâğıt ve fincan sesleri seyrek aralıklarla çalar. Sesler cihazında üretilir.</p>
      {(Object.entries({ yagmur: 'Yağmur', sehir: 'Şehir uğultusu', kagit: 'Kâğıt', fincan: 'Fincan' }) as [SesTuru, string][]).map(([id, ad]) => <div className="ses-kanali" key={id}><label>{ad} · %{tercih.sesler[id]}<input type="range" min={0} max={100} value={tercih.sesler[id]} onChange={e => { const n = Number(e.target.value); setTercih({ ...tercih, sesler: { ...tercih.sesler, [id]: n } }); motor.current?.ayarla(id, n); }} /></label>{(id === 'kagit' || id === 'fincan') && <button disabled={!sesAcik} onClick={() => motor.current?.ornek(id)}>{ad} sesini dene</button>}</div>)}
      {hata && <p role="alert">{hata}</p>}
    </dialog></>;
}
