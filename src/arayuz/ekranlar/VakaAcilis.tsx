// Vaka açılışı: brifing, kişi kartları (eksik alanlar görünür), delil listesi (sızıntı rozeti).
import { depo, useOyun } from '../oyun/kullan';
import { DIGER, mekanGorseli, portreUrl } from '../gorseller';
import { Portre } from './Portre';

export function VakaAcilis() {
  const d = useOyun();
  if (!d.sorgu) return null;
  const vaka = d.sorgu.durum.vaka;
  const mekanResmi = mekanGorseli(vaka.mekan.tur);
  return (
    <div>
      <section className="dosya">
        <h2>Dosya · {vaka.mekan.ad}</h2>
        {mekanResmi && <img src={mekanResmi} alt={`${vaka.mekan.ad} — olay yeri`} style={{ width: '100%', maxHeight: 260, objectFit: 'cover', border: '1px solid var(--cizgi)', marginBottom: 8 }} />}
        <p className="daktilo">{d.brifing}</p>
        {d.rapor && <p className="soluk">Tahmini zorluk: {Math.round(d.rapor.zorluk * 100)}/100</p>}
        {d.ayna && (
          <div className="kart" style={{ marginTop: 10 }}>
            <p className="soluk" style={{ margin: '0 0 4px' }}>Olay yerinde, delillerin arasında el yazısı bir not{d.ayna.karsilasma > 1 ? ` (aynı el yazısı, ${d.ayna.karsilasma}. kez)` : ''}:</p>
            <div style={{ display: 'flex', gap: 10, alignItems: 'flex-start' }}>
              {DIGER['ayna-not'] && <img src={DIGER['ayna-not']} alt="" aria-hidden="true" style={{ width: 120, border: '1px solid var(--cizgi)', flex: 'none' }} />}
              <p className="daktilo" style={{ margin: 0, fontStyle: 'italic' }}>"{d.ayna.not}"</p>
            </div>
          </div>
        )}
      </section>
      <section className="dosya">
        <h2>Kişiler</h2>
        <div className="izgara">
          {d.kisiKartlari.map((k) => {
            const kisi = vaka.kisiler.find((x) => x.id === k.id)!;
            const gorusulebilir = kisi.hayatta && kisi.id !== vaka.olay.kurban;
            return (
              <div className="kart" key={k.id}>
                <div style={{ display: 'flex', gap: 10, alignItems: 'center' }}>
                  <Portre id={kisi.id} ad={kisi.ad} kurban={kisi.id === vaka.olay.kurban} src={portreUrl(vaka, kisi.id)} />
                  <div className="ad">{kisi.ad}</div>
                </div>
                <div className="soluk">{k.metin}</div>
                <div className="soluk">Kişilik: bilinmiyor · Alibi: bilinmiyor</div>
                {gorusulebilir && <button style={{ marginTop: 6 }} onClick={() => depo.kisiSec(k.id)}>Görüş</button>}
              </div>
            );
          })}
        </div>
      </section>
      <section className="dosya">
        <h2>Olay yeri delilleri</h2>
        <ul className="liste-temiz">
          {d.sorgu.deliller.map((delil) => (
            <li key={delil.id}>
              <span>
                <span className="daktilo">{delil.id}</span> · {delil.aciklama}
                {delil.sizmis && <span className="rozet sizmis">basına sızdı</span>}
              </span>
              <span className="soluk">{delil.tur} · güç {Math.round(delil.gucu * 100)}%</span>
            </li>
          ))}
        </ul>
        <p className="soluk">Delilleri sorgu odasında kişiye gösterebilirsin. Ne zaman gösterdiğin önemlidir (Kılavuz: SUE).</p>
      </section>
    </div>
  );
}
