// Kanepe molası sekmesi: düğmenin oyun işi (1 saat + takım notu, depo.kanepeMolasi) aynen kalır; bu ekran
// yalnızca görsel mizah ve takımın getirdiği son notu gösterir. GIF, panoya iğnelenmiş bir polaroid gibi çerçevelenir.
import { depo, useOyun } from '../oyun/kullan';
import kanepeGif from '../../../assets/diger/kanepe-mola.gif';

export function KanepeMolasi() {
  const d = useOyun();
  const son = d.takimNotlari[d.takimNotlari.length - 1];
  return (
    <div className="dosya" style={{ maxWidth: 900, margin: '20px auto' }}>
      <h2>Kanepe Molası</h2>
      <figure style={{ position: 'relative', width: 'min(620px, 100%)', margin: '24px auto 26px', padding: '14px 14px 0', background: 'var(--beyaz)', border: '1px solid var(--cizgi)', boxShadow: '3px 3px 0 var(--cizgi)', transform: 'rotate(-1.2deg)' }}>
        <span aria-hidden="true" style={{ position: 'absolute', top: -6, left: '50%', width: 12, height: 12, marginLeft: -6, borderRadius: '50%', background: 'var(--kirmizi)', boxShadow: '1px 2px 0 rgba(0,0,0,.25)' }} />
        <img src={kanepeGif} alt="Kanepede kollarını kavuşturup uyuklayan dedektif" style={{ display: 'block', width: '100%', height: 'auto', border: '1px solid var(--cizgi)' }} />
        <figcaption className="daktilo" style={{ textAlign: 'center', padding: '12px 4px 14px', fontSize: 14 }}>Rahatsız etmeyin: düşünüyor.</figcaption>
      </figure>
      <p className="soluk">Bir saat geçti. Sen gözlerini dinlendirirken takım çalıştı; bütün notlar Pano'da.</p>
      {son && <div className="kart"><span className="daktilo">{son.metin}</span></div>}
      <div className="dugmeler" style={{ marginTop: 12 }}>
        <button onClick={() => depo.ekranaGit('sorgu')}>Uyan, işe dön</button>
      </div>
    </div>
  );
}
