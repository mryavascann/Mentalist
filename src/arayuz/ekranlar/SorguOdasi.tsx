// Sorgu odası: solda kişiler, ortada konuşma akışı + davranış betimlemeleri, sağda sorular ve teknikler.
import { useState } from 'react';
import { ICERIK } from '@icerik/index';
import { depo, useOyun } from '../oyun/kullan';
import { IpucuKarti } from './IpucuKarti';

export function SorguOdasi() {
  const d = useOyun();
  const [hedef, setHedef] = useState<string>('');
  const [dilim, setDilim] = useState(0);
  const [delilId, setDelilId] = useState('');
  const [oneriOda, setOneriOda] = useState('');
  const [uydurmaAd, setUydurmaAd] = useState('Cemil Aktaş');
  const [acikIpucu, setAcikIpucu] = useState<string | null>(null);
  if (!d.sorgu) return null;
  const vaka = d.sorgu.durum.vaka;
  const kisiler = depo.gorusulebilirler();
  const secili = d.seciliKisi ? vaka.kisiler.find((k) => k.id === d.seciliKisi) : null;
  const konusma = d.seciliKisi ? d.konusmalar.get(d.seciliKisi) ?? [] : [];
  const kapali = d.puan !== null;
  const digerleri = vaka.kisiler.filter((k) => k.id !== d.seciliKisi);
  const teknik = (id: string) => ICERIK.teknikler.find((t) => t.id === id)!;

  return (
    <div className="sorgu-duzeni">
      <aside className="dosya kisi-listesi">
        <h2>Kişiler</h2>
        {kisiler.map((k) => (
          <button key={k.id} className={k.id === d.seciliKisi ? 'secili' : ''} onClick={() => depo.kisiSec(k.id)}>
            {k.ad}
            <br />
            <span className="soluk">{k.rol}</span>
          </button>
        ))}
      </aside>

      <main className="dosya">
        <h2>{secili ? `Görüşme · ${secili.ad}` : 'Bir kişi seç'}</h2>
        {kapali && <p className="uyari">Suçlama yapıldı; sorgu kapandı. Analiz sekmesine bak.</p>}
        {acikIpucu && <IpucuKarti id={acikIpucu} kapat={() => setAcikIpucu(null)} />}
        <div className="akis">
          {konusma.length === 0 && secili && <p className="soluk">Henüz soru sormadın. Önce tarafsız sohbetle temel çizgi kur (Kılavuz: Temel çizgi).</p>}
          {konusma.map((k, i) => (
            <div className={`satir ${k.tur}`} key={i}>
              <div className="soru">{k.tur === 'teknik' ? `▸ ${k.soru}` : `Sen: ${k.soru}`}</div>
              <div className="cevap">{k.cevap}</div>
              {k.gozlemler.length > 0 && (
                <div className="betimleme">
                  {k.gozlemler.map((g, j) => (
                    <button key={j} className="ipucu-etiket" title="İpucu kartını aç" onClick={() => setAcikIpucu(g.ipucuId)}>{g.betimleme}</button>
                  ))}
                </div>
              )}
            </div>
          ))}
        </div>
      </main>

      <aside className="dosya panel">
        <h2>Sorular</h2>
        {!secili && <p className="soluk">Soldan bir kişi seç.</p>}
        {secili && !kapali && (
          <>
            <h3>Neredeydin?</h3>
            <div className="dugmeler">
              {vaka.dilimler.map((z) => (
                <button key={z.index} onClick={() => depo.sor({ tur: 'konum', hedef: secili.id, dilim: z.index })}>{z.baslangic}</button>
              ))}
            </div>
            <h3>Kimi gördün?</h3>
            <div className="satirici">
              <select value={hedef} onChange={(e) => setHedef(e.target.value)}>
                <option value="">kişi…</option>
                {digerleri.map((k) => <option key={k.id} value={k.id}>{k.ad}</option>)}
              </select>
              <select value={dilim} onChange={(e) => setDilim(Number(e.target.value))}>
                {vaka.dilimler.map((z) => <option key={z.index} value={z.index}>{z.baslangic}</option>)}
              </select>
              <button disabled={!hedef} onClick={() => depo.sor({ tur: 'konum', hedef, dilim })}>Sor</button>
            </div>
            <h3>Olay</h3>
            <div className="dugmeler">
              <button onClick={() => depo.sor({ tur: 'olay-bilgisi', konu: 'olay-yontemi' })}>Nasıl oldu?</button>
              <button onClick={() => depo.sor({ tur: 'olay-bilgisi', konu: 'fail-kimligi' })}>Kimi gördün?</button>
            </div>

            <h3>Teknikler</h3>
            <div className="dugmeler">
              {['temel-cizgi', 'acik-uclu-anlatim', 'bilissel-yuk-ters-sira', 'seytanin-avukati', 'suclayici-ton'].map((id) => (
                <button key={id} title={teknik(id).nasil} onClick={() => depo.teknik(id)}>{teknik(id).ad} · {teknik(id).maliyet.zaman}s</button>
              ))}
            </div>
            <div className="satirici">
              <button title={teknik('beklenmedik-soru').nasil} onClick={() => depo.teknik('beklenmedik-soru', { dilim })}>Beklenmedik soru</button>
              <span className="soluk">saat:</span>
              <select value={dilim} onChange={(e) => setDilim(Number(e.target.value))}>
                {vaka.dilimler.map((z) => <option key={z.index} value={z.index}>{z.baslangic}</option>)}
              </select>
            </div>
            <div className="dugmeler">
              {['gizli-bilgi-testi', 'zorunlu-iki-secenek', 'saskinlik-testi'].map((id) => (
                <button key={id} title={teknik(id).nasil} onClick={() => depo.teknik(id, { konu: 'olay-yontemi' })}>{teknik(id).ad} (yöntem)</button>
              ))}
            </div>
            <div className="satirici">
              <button title={teknik('sahte-bilgi-yemi').nasil} onClick={() => depo.teknik('sahte-bilgi-yemi', { uydurmaAd })}>Sahte bilgi yemi</button>
              <input type="text" value={uydurmaAd} onChange={(e) => setUydurmaAd(e.target.value)} style={{ width: 130 }} />
            </div>
            <div className="satirici">
              <button title={teknik('yonlendirici-soru').nasil} disabled={!oneriOda} onClick={() => depo.teknik('yonlendirici-soru', { dilim, hedef: hedef || secili.id, onerilenOda: oneriOda })}>Yönlendirici soru</button>
              <select value={oneriOda} onChange={(e) => setOneriOda(e.target.value)}>
                <option value="">oda öner…</option>
                {vaka.mekan.odalar.map((o) => <option key={o.id} value={o.id}>{o.ad}</option>)}
              </select>
            </div>

            <h3>Deliller</h3>
            <div className="satirici">
              <select value={delilId} onChange={(e) => setDelilId(e.target.value)}>
                <option value="">delil…</option>
                {d.sorgu.deliller.map((x) => <option key={x.id} value={x.id}>{x.id} · {x.aciklama.slice(0, 40)}…</option>)}
              </select>
            </div>
            <div className="dugmeler">
              <button disabled={!delilId} onClick={() => depo.delilGoster(delilId)}>Göster</button>
              <button
                disabled={!delilId || d.sorgu.deliller.find((x) => x.id === delilId)?.gosterir.tur !== 'konum'}
                title={teknik('sue').nasil}
                onClick={() => depo.teknik('sue', { delilId })}
              >
                SUE ile sor
              </button>
            </div>
          </>
        )}
      </aside>
    </div>
  );
}
