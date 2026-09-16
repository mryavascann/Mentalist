// Sorgu odası: solda kişiler, ortada konuşma akışı + davranış betimlemeleri, sağda sorular ve teknikler.
import { useState } from 'react';
import { ICERIK } from '@icerik/index';
import { ESYA_SINIF_ADLARI, IC_SES_KATEGORILERI, IC_SES_SECENEKLERI, type EsyaSinifi, type IcSesKategori } from '@motor/araclar';
import { depo, useOyun } from '../oyun/kullan';
import { PORTRELER, TAKIM_PORTRELERI, portreUrl } from '../gorseller';
import { IpucuKarti } from './IpucuKarti';
import { Portre } from './Portre';

export function SorguOdasi() {
  const d = useOyun();
  const [hedef, setHedef] = useState<string>('');
  const [dilim, setDilim] = useState(0);
  const [delilId, setDelilId] = useState('');
  const [oneriOda, setOneriOda] = useState('');
  const [uydurmaAd, setUydurmaAd] = useState('Cemil Aktaş');
  const [acikIpucu, setAcikIpucu] = useState<string | null>(null);
  const [tahmin, setTahmin] = useState<IcSesKategori>('sakin');
  if (!d.sorgu) return null;
  const odaOkumasi = d.seciliKisi ? d.sorgu.odaOkumalari.get(d.seciliKisi) : undefined;
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
        <h2 style={{ display: 'flex', gap: 10, alignItems: 'center' }}>{secili && <Portre id={secili.id} ad={secili.ad} boyut={40} src={portreUrl(vaka, secili.id)} />}{secili ? `Görüşme · ${secili.ad}` : 'Bir kişi seç'}</h2>
        {kapali && <p className="uyari">Suçlama yapıldı; sorgu kapandı. Analiz sekmesine bak.</p>}
        <label className="soluk" style={{ display: 'block' }}><input type="checkbox" checked={d.takimAcik} onChange={(e) => depo.takimAcKapat(e.target.checked)} /> Takım yorumları (kanıt değildir; çoğunluk sık yanılır)</label>
        {secili && d.temelCizgiNotlari.get(secili.id) && <p className="soluk" style={{ borderLeft: '3px solid var(--mantar)', paddingLeft: 8 }}>{d.temelCizgiNotlari.get(secili.id)}</p>}
        {acikIpucu && <IpucuKarti id={acikIpucu} kapat={() => setAcikIpucu(null)} />}
        {odaOkumasi && (
          // Oda okuma (Gosling 2002): her eşya için oyuncu sınıf seçer; gerçek tür vaka sonunda açılır.
          <div className="dosya" style={{ margin: '8px 0', padding: 8 }}>
            <b className="daktilo" style={{ fontSize: 13 }}>Odası</b>
            <ul className="liste-temiz">
              {odaOkumasi.esyalar.map((e) => (
                <li key={e.id} style={{ display: 'flex', gap: 8, alignItems: 'center', justifyContent: 'space-between' }}>
                  <span>{e.betimleme}</span>
                  <select aria-label={`Eşya sınıfı: ${e.betimleme}`} disabled={kapali} value={d.sorgu!.odaSiniflamalari.get(e.id) ?? ''} onChange={(ev) => depo.esyaSinifla(e.id, ev.target.value as EsyaSinifi)}>
                    <option value="">sınıfla…</option>
                    {(Object.keys(ESYA_SINIF_ADLARI) as EsyaSinifi[]).map((s) => <option key={s} value={s}>{ESYA_SINIF_ADLARI[s]}</option>)}
                  </select>
                </li>
              ))}
            </ul>
            <span className="soluk">Kalıntı: tekrarlanan davranışın izi. İddia: nasıl görünmek istediği. Sahnelenmiş: fizik tutarsızlığı olan düzen. Oda kişiliği okur, suçu değil.</span>
          </div>
        )}
        <div className="akis">
          {konusma.length === 0 && secili && <p className="soluk">Henüz soru sormadın. Önce tarafsız sohbetle temel çizgi kur (Kılavuz: Temel çizgi).</p>}
          {konusma.map((k, i) => (
            <div className={`satir ${k.tur}`} key={i}>
              <div className="soru">{k.tur === 'teknik' ? `▸ ${k.soru}` : `Sen: ${k.soru}`}</div>
              <div className="cevap">{k.cevap}</div>
              {k.takimYorumu && (
                <div className="takim" style={{ display: 'flex', gap: 8, alignItems: 'flex-start' }}>
                  {PORTRELER[TAKIM_PORTRELERI[k.takimYorumu.rol] ?? ''] && <img src={PORTRELER[TAKIM_PORTRELERI[k.takimYorumu.rol]!]} alt="" aria-hidden="true" width={28} height={28} style={{ borderRadius: 4, flex: 'none', objectFit: 'cover' }} />}
                  <span><b>{k.takimYorumu.ad}:</b> {k.takimYorumu.metin}</span>
                </div>
              )}
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

            <h3>Kişiyi oku</h3>
            <div className="dugmeler">
              {['oda-okuma', 'dijital-iz', 'kayit-inceleme'].map((id) => (
                <button key={id} title={teknik(id).nasil} onClick={() => depo.teknik(id)}>{teknik(id).ad} · {teknik(id).maliyet.zaman}s</button>
              ))}
            </div>
            <div className="satirici">
              <button title={teknik('ic-ses').nasil} onClick={() => depo.teknik('ic-ses', { tahmin })}>{teknik('ic-ses').ad} · {teknik('ic-ses').maliyet.zaman}s</button>
              <select aria-label="İç ses tahmini" value={tahmin} onChange={(e) => setTahmin(e.target.value as IcSesKategori)}>
                {IC_SES_KATEGORILERI.map((k) => <option key={k} value={k}>{IC_SES_SECENEKLERI[k]}</option>)}
              </select>
            </div>

            <h3>Deliller</h3>
            <div className="satirici">
              <select value={delilId} onChange={(e) => setDelilId(e.target.value)}>
                <option value="">delil…</option>
                {d.sorgu.deliller.map((x) => <option key={x.id} value={x.id}>{d.sorgu!.gosterilen.get(secili.id)?.has(x.id) ? '✓ ' : ''}{x.id} · {x.aciklama.slice(0, 40)}…</option>)}
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
