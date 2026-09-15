// Vaka açılışı: brifing, kişi kartları (eksik alanlar görünür), delil listesi (sızıntı rozeti).
import { depo, useOyun } from '../oyun/kullan';
import { Portre } from './Portre';

export function VakaAcilis() {
  const d = useOyun();
  if (!d.sorgu) return null;
  const vaka = d.sorgu.durum.vaka;
  return (
    <div>
      <section className="dosya">
        <h2>Dosya · {vaka.mekan.ad}</h2>
        <p className="daktilo">{d.brifing}</p>
        {d.rapor && <p className="soluk">Tahmini zorluk: {Math.round(d.rapor.zorluk * 100)}/100</p>}
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
                  <Portre id={kisi.id} ad={kisi.ad} kurban={kisi.id === vaka.olay.kurban} />
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
