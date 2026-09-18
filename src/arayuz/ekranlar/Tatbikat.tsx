// Tatbikatlar (TASARIM §13): kör seçim, soğuk okuma dedektörü, taban oranı, Linda tuzağı,
// kaybolan top / off-beat, ince dilim, çift kör test tasarla. Kısa, anında geri bildirimli; her biri bir
// Kılavuz maddesine bağlanır. Puanlama kuralları @icerik/mini_oyunlar'da; burada yalnızca akış ve görünüm var.
import { useState } from 'react';
import { MINI_OYUNLAR } from '@icerik/mini_oyunlar';
import { depo, useOyun } from '../oyun/kullan';
import { TATBIKAT_GORSELLERI } from '../gorseller';
import type { TatbikatId } from '../oyun/depo';

/** Her tatbikatın "Kılavuz" düğmesinin açtığı madde. */
const KILAVUZ_BAGI: Record<TatbikatId, string> = {
  'kor-secim': 'forer-barnum',
  'soguk-okuma': 'soguk-okuma-teknikleri',
  'taban-orani': 'capalama',
  linda: 'birlesim-yanilgisi',
  'off-beat': 'off-beat',
  'ince-dilim': 'ince-dilimler',
  'cift-kor': 'cift-kor-test',
};

function KorSecim() {
  const d = useOyun();
  const sonuc = d.tatbikat.sonuclar['kor-secim'];
  const { korSecim } = MINI_OYUNLAR;
  return (
    <>
      <h2>Kör seçim</h2>
      <p className="soluk">Aşağıdaki dört profilden hangisi seni en iyi anlatıyor? Hangi profilin ne olduğunu bilmeden seç.</p>
      {korSecim.profiller.map((p) => (
        <div key={p.id} className="kart" style={{ marginBottom: 8 }}>
          <p style={{ margin: '0 0 6px' }}>{p.metin}</p>
          {!sonuc?.tamamlandi && <button onClick={() => depo.korSecimBitir(p.id)}>Bu benim</button>}
          {sonuc?.tamamlandi && <span className="rozet karsilasildi">{p.id === 'barnum' ? 'Barnum (Forer 1949)' : p.id === 'zit' ? 'Barnum\'un tam zıttı' : p.id === 'olumlu' ? 'genel olumlu' : 'genel olumsuz'}{sonuc.secim === p.id ? ' · senin seçimin' : ''}</span>}
        </div>
      ))}
      {sonuc?.tamamlandi && <p className="uyari">{korSecim.ifsa}</p>}
    </>
  );
}

function SogukOkuma() {
  const d = useOyun();
  const { sogukOkuma } = MINI_OYUNLAR;
  const [secimler, setSecimler] = useState<Record<string, string[]>>({});
  const [sonuc, setSonuc] = useState<ReturnType<typeof depo.sogukOkumaBitir> | null>(null);
  const degistir = (cumle: string, oge: string) => setSecimler((s) => {
    const mevcut = new Set(s[cumle] ?? []);
    if (mevcut.has(oge)) mevcut.delete(oge); else mevcut.add(oge);
    return { ...s, [cumle]: [...mevcut] };
  });
  const bitmis = sonuc !== null || d.tatbikat.sonuclar['soguk-okuma']?.tamamlandi;
  return (
    <>
      <h2>Soğuk okuma dedektörü</h2>
      <p className="soluk">{sogukOkuma.aciklama}</p>
      <details style={{ marginBottom: 10 }}>
        <summary>Öğe sözlüğü</summary>
        <ul className="soluk">{sogukOkuma.ogeler.map((o) => <li key={o.id}><b>{o.ad}:</b> {o.aciklama}</li>)}</ul>
      </details>
      {sogukOkuma.kayit.map((c) => {
        const r = sonuc?.cumleler.find((x) => x.id === c.id);
        return (
          <div key={c.id} className="kart" style={{ marginBottom: 8 }}>
            <p style={{ margin: '0 0 6px' }}>"{c.metin}"</p>
            <div className="dugmeler">
              {sogukOkuma.ogeler.map((o) => {
                const secili = (secimler[c.id] ?? []).includes(o.id);
                const gercek = c.ogeler.includes(o.id);
                const stil = sonuc ? (gercek ? { background: 'var(--vurgu-dogru)' } : secili ? { background: 'var(--vurgu-yanlis)' } : {}) : {};
                return <button key={o.id} className={secili ? 'secili' : ''} style={stil} disabled={!!sonuc} onClick={() => degistir(c.id, o.id)}>{o.ad}</button>;
              })}
            </div>
            {r && <div className="soluk">doğru {r.dogru} · yanlış {r.yanlis} · kaçırılan {r.kacirilan}</div>}
          </div>
        );
      })}
      {!sonuc && <button className="birincil" onClick={() => setSonuc(depo.sogukOkumaBitir(secimler))}>Puanla</button>}
      {sonuc && <p className="uyari">Puan: {sonuc.puan} / {sonuc.enYuksek}. Yeşil gerçek öğeleri, kırmızı yanlış etiketlerini gösteriyor. Medyumlar bir cümlede birden fazla öğeyi üst üste bindirir.</p>}
      {bitmis && !sonuc && <p className="soluk">Daha önce tamamladın: {d.tatbikat.sonuclar['soguk-okuma']?.puan} puan.</p>}
    </>
  );
}

function TabanOrani() {
  const d = useOyun();
  const { tabanOrani } = MINI_OYUNLAR;
  const sonuc = d.tatbikat.sonuclar['taban-orani'];
  return (
    <>
      <h2>Taban oranı bulmacası</h2>
      <p>{tabanOrani.aciklama}</p>
      <div className="dugmeler">
        {tabanOrani.secenekler.map((s) => (
          <button key={s.id} disabled={!!sonuc?.tamamlandi} className={sonuc?.secim === s.id ? 'secili' : ''} onClick={() => depo.tabanOraniBitir(s.id)}>{s.metin}</button>
        ))}
      </div>
      {sonuc?.tamamlandi && (
        <p className="uyari">{sonuc.puan ? 'Doğru.' : 'Yanlış; çoğu insan burada %99 der.'} {tabanOrani.cozum}</p>
      )}
    </>
  );
}

/** Seçilen seçeneğe göre düğme rengi: sonuç açıklandıysa doğru yeşil, yanlış seçim kırmızı. */
function secenekStili(aciklandi: boolean, dogru: boolean, secili: boolean) {
  if (!aciklandi) return {};
  if (dogru) return { background: 'var(--vurgu-dogru)' };
  if (secili) return { background: 'var(--vurgu-yanlis)' };
  return {};
}

/** Linda tuzağı: çiftlerden "daha olası" olanı seç; birleşim (VE) ve ayrık (YA DA) kuralı. */
function Linda() {
  const d = useOyun();
  const { linda } = MINI_OYUNLAR;
  const [secimler, setSecimler] = useState<Record<string, string>>({});
  const [sonuc, setSonuc] = useState<ReturnType<typeof depo.lindaBitir> | null>(null);
  const onceki = d.tatbikat.sonuclar['linda'];
  const hepsiSecildi = linda.ciftler.every((c) => secimler[c.id] !== undefined);
  return (
    <>
      <h2>Linda tuzağı</h2>
      <p className="soluk">{linda.aciklama}</p>
      {linda.ciftler.map((c) => (
        <div key={c.id} className="kart" style={{ marginBottom: 8 }}>
          <p style={{ margin: '0 0 6px' }}>{c.profil}</p>
          <div className="dugmeler">
            {c.secenekler.map((s) => (
              <button key={s.id} disabled={!!sonuc} className={secimler[c.id] === s.id ? 'secili' : ''} style={secenekStili(!!sonuc, s.dogru, secimler[c.id] === s.id)} onClick={() => setSecimler((x) => ({ ...x, [c.id]: s.id }))}>{s.metin}</button>
            ))}
          </div>
          {sonuc && <p className={sonuc.yanlislar.includes(c.id) ? 'uyari' : 'soluk'} style={{ margin: '6px 0 0' }}>{c.aciklama}</p>}
        </div>
      ))}
      {!sonuc && <button className="birincil" disabled={!hepsiSecildi} onClick={() => setSonuc(depo.lindaBitir(secimler))}>Puanla</button>}
      {sonuc && <p className="uyari">Puan: {sonuc.puan} / {sonuc.enYuksek}. Kural "kısa olanı seç" değil, "koşulları say": her VE bir çarpan, her YA DA bir toplamdır.</p>}
      {onceki?.tamamlandi && !sonuc && <p className="soluk">Daha önce tamamladın: {onceki.puan} puan.</p>}
    </>
  );
}

/** Kaybolan top / off-beat: sahneyi oku, yöntemin anını ve tanık ifadelerinin anlamını seç. */
function OffBeat() {
  const d = useOyun();
  const { offBeat } = MINI_OYUNLAR;
  const [secimler, setSecimler] = useState<Record<string, string>>({});
  const [sonuc, setSonuc] = useState<ReturnType<typeof depo.offBeatBitir> | null>(null);
  const onceki = d.tatbikat.sonuclar['off-beat'];
  const hepsiSecildi = offBeat.sorular.every((s) => secimler[s.id] !== undefined);
  return (
    <>
      <h2>Kaybolan top ve gevşeme anı</h2>
      <p className="soluk">{offBeat.aciklama}</p>
      <ol style={{ paddingLeft: 20 }}>
        {offBeat.anlar.map((a) => <li key={a.id} style={{ marginBottom: 4 }}><b>{a.id}.</b> {a.metin}</li>)}
      </ol>
      {offBeat.sorular.map((s) => (
        <div key={s.id} className="kart" style={{ marginBottom: 8 }}>
          <p style={{ margin: '0 0 6px' }}>{s.metin}</p>
          <div className="dugmeler">
            {s.secenekler.map((x) => (
              <button key={x.id} disabled={!!sonuc} className={secimler[s.id] === x.id ? 'secili' : ''} style={secenekStili(!!sonuc, x.dogru, secimler[s.id] === x.id)} onClick={() => setSecimler((m) => ({ ...m, [s.id]: x.id }))}>{x.metin}</button>
            ))}
          </div>
          {sonuc && <p className={sonuc.yanlislar.includes(s.id) ? 'uyari' : 'soluk'} style={{ margin: '6px 0 0' }}>{s.aciklama}</p>}
        </div>
      ))}
      {!sonuc && <button className="birincil" disabled={!hepsiSecildi} onClick={() => setSonuc(depo.offBeatBitir(secimler))}>Puanla</button>}
      {sonuc && <p className="uyari">Puan: {sonuc.puan} / {sonuc.enYuksek}. Zaman çizelgesinde "bitti sanılan" anları ve "gözümü ayırmadım" ifadelerini bu gözle oku.</p>}
      {onceki?.tamamlandi && !sonuc && <p className="soluk">Daha önce tamamladın: {onceki.puan} puan.</p>}
    </>
  );
}

/** İnce dilim: 30 saniyelik betimlemeden kişilik yargısı ver; yalan sorusunda "bilinemez" tek doğru. */
function InceDilim() {
  const d = useOyun();
  const { inceDilim } = MINI_OYUNLAR;
  const [secimler, setSecimler] = useState<Record<string, Record<string, string>>>({});
  const [sonuc, setSonuc] = useState<ReturnType<typeof depo.inceDilimBitir> | null>(null);
  const onceki = d.tatbikat.sonuclar['ince-dilim'];
  const hepsiSecildi = inceDilim.kisiler.every((k) => k.boyutlar.every((b) => secimler[k.id]?.[b.id] !== undefined));
  const sec = (kisi: string, boyut: string, id: string) => setSecimler((m) => ({ ...m, [kisi]: { ...(m[kisi] ?? {}), [boyut]: id } }));
  return (
    <>
      <h2>İnce dilim</h2>
      <p className="soluk">{inceDilim.aciklama}</p>
      {inceDilim.kisiler.map((k) => (
        <div key={k.id} className="kart" style={{ marginBottom: 8 }}>
          <p style={{ margin: '0 0 8px' }}><b>{k.ad}.</b> {k.betimleme}</p>
          {k.boyutlar.map((b) => {
            const secim = secimler[k.id]?.[b.id];
            return (
              <div key={b.id} style={{ marginBottom: 6 }}>
                <span className="soluk" style={{ marginRight: 8 }}>{b.soru}:</span>
                <span className="dugmeler" style={{ display: 'inline-flex' }}>
                  {b.secenekler.map((s) => (
                    <button key={s.id} disabled={!!sonuc} className={secim === s.id ? 'secili' : ''} style={secenekStili(!!sonuc, s.id === b.dogru, secim === s.id)} onClick={() => sec(k.id, b.id, s.id)}>{s.metin}</button>
                  ))}
                </span>
                {sonuc && <p className={secim === b.dogru ? 'soluk' : 'uyari'} style={{ margin: '4px 0 0' }}>{b.aciklama}</p>}
              </div>
            );
          })}
        </div>
      ))}
      {!sonuc && <button className="birincil" disabled={!hepsiSecildi} onClick={() => setSonuc(depo.inceDilimBitir(secimler))}>Puanla</button>}
      {sonuc && (
        <p className="uyari">
          Puan: {sonuc.puan} / {sonuc.enYuksek}.
          {sonuc.asiriGenelleme > 0 ? ` ${sonuc.asiriGenelleme} kez kısa bir izlenime bakıp yalan hükmü verdin. Kişilik için işe yarayan bu araç yalan için çalışmaz (aldatmada doğruluk .31).` : ' Yalan sorusunda "bilinemez" demek doğru araçla doğru soruyu eşleştirmektir.'}
        </p>
      )}
      {onceki?.tamamlandi && !sonuc && <p className="soluk">Daha önce tamamladın: {onceki.puan} puan.</p>}
    </>
  );
}

/** Çift kör test tasarla: protokol maddelerini seç; gerekliler +1, tuzaklar −1. */
function CiftKor() {
  const d = useOyun();
  const { ciftKor } = MINI_OYUNLAR;
  const [secilen, setSecilen] = useState<string[]>([]);
  const [sonuc, setSonuc] = useState<ReturnType<typeof depo.ciftKorBitir> | null>(null);
  const onceki = d.tatbikat.sonuclar['cift-kor'];
  const degistir = (id: string) => setSecilen((s) => (s.includes(id) ? s.filter((x) => x !== id) : [...s, id]));
  return (
    <>
      <h2>Çift kör test tasarla</h2>
      <p className="soluk">{ciftKor.aciklama}</p>
      {ciftKor.maddeler.map((m) => {
        const secili = secilen.includes(m.id);
        const stil = sonuc ? (m.tur === 'gerekli' ? { background: secili ? 'var(--vurgu-dogru)' : 'var(--vurgu-notr)' } : secili ? { background: 'var(--vurgu-yanlis)' } : {}) : {};
        return (
          <div key={m.id} className="kart" style={{ marginBottom: 6, ...stil }}>
            <label style={{ display: 'flex', gap: 8, alignItems: 'flex-start', cursor: sonuc ? 'default' : 'pointer' }}>
              <input type="checkbox" checked={secili} disabled={!!sonuc} onChange={() => degistir(m.id)} />
              <span>{m.metin}</span>
            </label>
            {sonuc && <p className={m.tur === 'gerekli' ? (secili ? 'soluk' : 'uyari') : secili ? 'uyari' : 'soluk'} style={{ margin: '6px 0 0 26px' }}><b>{m.tur === 'gerekli' ? 'Gerekli.' : 'Tuzak.'}</b> {m.aciklama}</p>}
          </div>
        );
      })}
      {!sonuc && <button className="birincil" disabled={secilen.length === 0} onClick={() => setSonuc(depo.ciftKorBitir(secilen))}>Protokolü onayla</button>}
      {sonuc && (
        <p className="uyari">
          Puan: {sonuc.puan} / {sonuc.enYuksek}. Kaçırılan gerekli madde: {sonuc.kacirilan.length}; seçilen tuzak: {sonuc.tuzaklar.length}.
          {' '}Testin başarısız çıkması dolandırıcılık niyetini kanıtlamaz; niyet delil ve para akışıyla gösterilir.
        </p>
      )}
      {onceki?.tamamlandi && !sonuc && <p className="soluk">Daha önce tamamladın: {onceki.puan} puan.</p>}
    </>
  );
}

export function Tatbikat() {
  const d = useOyun();
  const aktif = d.tatbikat.aktif;
  return (
    <div className="dosya" style={{ maxWidth: 820, margin: '20px auto' }}>
      {aktif && TATBIKAT_GORSELLERI[aktif] && <img src={TATBIKAT_GORSELLERI[aktif]} alt="" aria-hidden="true" style={{ width: '100%', maxHeight: 180, objectFit: 'cover', border: '1px solid var(--cizgi)', marginBottom: 8 }} />}
      {aktif === 'kor-secim' && <KorSecim />}
      {aktif === 'soguk-okuma' && <SogukOkuma />}
      {aktif === 'taban-orani' && <TabanOrani />}
      {aktif === 'linda' && <Linda />}
      {aktif === 'off-beat' && <OffBeat />}
      {aktif === 'ince-dilim' && <InceDilim />}
      {aktif === 'cift-kor' && <CiftKor />}
      <div className="dugmeler" style={{ marginTop: 12 }}>
        <button onClick={() => depo.tatbikatKapat()}>Kapat</button>
        <button onClick={() => depo.kilavuzAc(aktif ? KILAVUZ_BAGI[aktif] : 'forer-barnum')}>Kılavuz</button>
      </div>
    </div>
  );
}
