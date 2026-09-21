// Her ekrandan açılan yerel not defteri ve kaynaklı alıntı düğmesi.
import { useEffect, useRef, useState } from 'react';
import { depo, useOyun } from '../oyun/kullan';
import type { DefterNotu } from '../oyun/masa';
import { ifadeCizelgesi } from '../oyun/cizelge';

export function DeftereEkle({ metin, kaynak, tur = 'ifade' }: { metin: string; kaynak: string; tur?: DefterNotu['tur'] }) {
  const d = useOyun();
  const kayitli = d.masa.notlar.some(n => n.metin === metin.trim() && n.kaynak === kaynak);
  return <button className="alinti-dugmesi" disabled={kayitli} onClick={() => depo.notEkle(metin, kaynak, tur)}>{kayitli ? 'Deftere eklendi' : 'Deftere ekle'}</button>;
}

export function NotDefteri() {
  const d = useOyun();
  const modal = useRef<HTMLDialogElement>(null);
  const [metin, setMetin] = useState('');
  const [bildirim, setBildirim] = useState('');
  useEffect(() => { setMetin(''); setBildirim(''); }, [d.sorgu?.durum.vaka.seed]);
  return <>
    <button onClick={() => modal.current?.showModal()} className="arac-ac" aria-label="Dedektif defterini aç">Defter <span>{d.masa.notlar.length}</span></button>
    <dialog ref={modal} className="masa-dialog" aria-labelledby="defter-baslik">
      <div className="bolum-ust"><h2 id="defter-baslik">Dedektif defteri</h2><button onClick={() => modal.current?.close()} aria-label="Defteri kapat">Kapat</button></div>
      <p className="soluk">Notlar bu vaka ile saklanır. İfade ve delillerin yanındaki “Deftere ekle” düğmesi kaynağı da kaydeder.</p>
      {d.sorgu ? <><form onSubmit={e => { e.preventDefault(); depo.notEkle(metin); setMetin(''); setBildirim('Not kaydedildi.'); }}><label>Yeni not<textarea autoFocus rows={3} maxLength={8000} value={metin} onChange={e => setMetin(e.target.value)} /></label><button className="birincil" disabled={!metin.trim()}>Notu kaydet</button></form><p role="status" className="soluk">{bildirim}</p>
        {d.masa.notlar.length === 0 && <p>Defterin henüz boş. İlk gözlemini yaz.</p>}
        {[...d.masa.notlar].reverse().map(n => <article className="defter-notu" key={n.id}><span className="ust-etiket">{n.tur === 'ifade' ? 'İFADE' : n.tur === 'delil' ? 'DELİL' : 'SENİN NOTUN'} · {n.saat.toLocaleString('tr-TR')} sa</span><p>{n.metin}</p><small>{n.kaynak}</small><div className="dugmeler"><button onClick={() => { depo.ekranaGit('cizelge'); modal.current?.close(); }}>Çizelgeye yerleştir</button><button onClick={() => depo.notSil(n.id)} aria-label={`Notu sil: ${n.metin.slice(0, 35)}`}>Sil</button></div></article>)}
      </> : <p>Not tutmak için bir vaka başlat.</p>}
    </dialog>
  </>;
}

/** Geri dönüş özeti gizli bilgi kullanmaz; yalnızca görüşme kayıtlarını ve açık notları sayar. */
export function DonusOzeti() {
  const d = useOyun();
  if (!d.sorgu || !d.donusOzeti) return null;
  const kisi = d.sorgu.durum.vaka.kisiler.find(k => k.id === d.masa.sonGorusulen);
  const son = d.masa.notlar.at(-1);
  const c = ifadeCizelgesi(d.sorgu);
  const eksik = [...c.hucreler.values()].reduce((n, satir) => n + satir.filter(x => x === null).length, 0);
  return <section className="donus-ozeti"><div className="bolum-ust"><h2>Kaldığın yerden.</h2><button onClick={() => depo.ozetiKapat()}>Özeti kapat</button></div><p>Son görüşme: <b>{kisi?.ad ?? 'Henüz görüşme yapmadın'}</b>. Harcanan süre: {d.zaman.toLocaleString('tr-TR')} saat.</p><p>Son notun: {son?.metin ?? 'Henüz not eklemedin.'}</p><p className="soluk">Kişi ve saat eşleşmelerinde henüz sorulmamış {eksik} konum sorusu var. Her soruyu sorman gerekmiyor.</p>{d.pano.olmayan.length > 0 && <p>Beklediğin ama bulamadığın: {d.pano.olmayan.join(' · ')}</p>}<button onClick={() => { depo.ozetiKapat(); depo.ekranaGit('cizelge'); }}>Açık soruları çizelgede gör</button></section>;
}
