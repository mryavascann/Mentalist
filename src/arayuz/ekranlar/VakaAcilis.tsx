// Vaka açılışı: brifing, kişi kartları (eksik alanlar görünür), delil listesi (sızıntı rozeti).
import { depo, useOyun } from '../oyun/kullan';
import { DELIL_GORSELLERI, DIGER, mekanGorseli, portreUrl } from '../gorseller';
import { Portre } from './Portre';
import { Ikon } from './Ikon';

export function VakaAcilis() {
  const d = useOyun();
  if (!d.sorgu) return null;
  const vaka = d.sorgu.durum.vaka;
  const mekanResmi = mekanGorseli(vaka.mekan.tur);
  return (
    <div>
      <section className="dosya vaka-brifingi">
        <div className="vaka-kapak">
          {mekanResmi && <img src={mekanResmi} alt={`${vaka.mekan.ad} — olay yeri`} />}
          <span className="vaka-damga">{d.puan ? 'TAMAMLANDI' : 'SORUŞTURMA AÇIK'}</span>
        </div>
        <div className="vaka-ozeti"><span className="ust-etiket">OLAY YERİ BRİFİNGİ</span><h2>{vaka.mekan.ad}</h2>
        <p className="brifing-anlati">{d.brifing}</p>
        <div className="vaka-verileri"><span><Ikon ad="sorgu" boyut={16} />{depo.gorusulebilirler().length} kişi</span><span><Ikon ad="dosya" boyut={16} />{d.sorgu.deliller.length} delil</span><span><Ikon ad="saat" boyut={16} />{d.zamanButcesi} saat bütçe</span></div>
        {d.rapor && <p className="alan-notu">Tahmini zorluk: {Math.round(d.rapor.zorluk * 100)}/100</p>}
        <button className="metin-dugmesi" onClick={() => depo.ekranaGit('sorgu')}>Sorgu odasına geç <Ikon ad="ok" boyut={18} /></button>
        </div>
      </section>
        {d.ayna && (
          <div className="kart" style={{ marginBottom: 22 }}>
            <p className="soluk" style={{ margin: '0 0 4px' }}>Olay yerinde, delillerin arasında el yazısı bir not{d.ayna.karsilasma > 1 ? ` (aynı el yazısı, ${d.ayna.karsilasma}. kez)` : ''}:</p>
            <div style={{ display: 'flex', gap: 10, alignItems: 'flex-start' }}>
              {DIGER['ayna-not'] && <img src={DIGER['ayna-not']} alt="" aria-hidden="true" style={{ width: 120, border: '1px solid var(--cizgi)', flex: 'none' }} />}
              <p className="daktilo" style={{ margin: 0, fontStyle: 'italic' }}>"{d.ayna.not}"</p>
            </div>
          </div>
        )}
      <section className="dosya vaka-kisileri">
        <div className="bolum-ust"><h2>Kişiler</h2><span className="soluk">Her ifadenin arkasında bir hikâye var.</span></div>
        <div className="izgara">
          {d.kisiKartlari.map((k) => {
            const kisi = vaka.kisiler.find((x) => x.id === k.id)!;
            const gorusulebilir = kisi.hayatta && kisi.id !== vaka.olay.kurban;
            return (
              <div className="kart kisi-karti" key={k.id}>
                <div style={{ display: 'flex', gap: 10, alignItems: 'center' }}>
                  <Portre id={kisi.id} ad={kisi.ad} boyut={64} kurban={kisi.id === vaka.olay.kurban} src={portreUrl(vaka, kisi.id)} />
                  <div className="ad">{kisi.ad}</div>
                </div>
                <div className="soluk">{k.metin}</div>
                <div className="soluk">Kişilik: bilinmiyor · Alibi: bilinmiyor</div>
                {gorusulebilir && <button onClick={() => depo.kisiSec(k.id)}>Görüş <Ikon ad="ok" boyut={15} /></button>}
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
              <span style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
                {DELIL_GORSELLERI[delil.tur] && <img src={DELIL_GORSELLERI[delil.tur]} alt={`${delil.tur} delil`} width={36} height={36} style={{ borderRadius: 4, border: '1px solid var(--cizgi)', flex: 'none' }} />}
                <span><span className="daktilo">{delil.id}</span> · {delil.aciklama}</span>
                {delil.sizmis && <span className="rozet sizmis">basına sızdı</span>}
              </span>
              <span className="soluk">{delil.tur} · güç %{Math.round(delil.gucu * 100)}</span>
            </li>
          ))}
        </ul>
        <p className="soluk">Delilleri sorgu odasında kişiye gösterebilirsin. Ne zaman gösterdiğin önemlidir (Kılavuz: Stratejik delil kullanımı).</p>
      </section>
    </div>
  );
}
