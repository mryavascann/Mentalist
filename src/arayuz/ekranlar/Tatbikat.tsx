// Tatbikatlar (TASARIM §13): kör seçim, soğuk okuma dedektörü, taban oranı. Kısa, anında geri bildirimli.
import { useState } from 'react';
import { MINI_OYUNLAR } from '@icerik/mini_oyunlar';
import { depo, useOyun } from '../oyun/kullan';

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
                const stil = sonuc ? (gercek ? { background: '#dfeedd' } : secili ? { background: '#f3d6d3' } : {}) : {};
                return <button key={o.id} className={secili ? 'secili' : ''} style={stil} disabled={!!sonuc} onClick={() => degistir(c.id, o.id)}>{o.ad}</button>;
              })}
            </div>
            {r && <div className="soluk">doğru {r.dogru} · yanlış {r.yanlis} · kaçırılan {r.kacirilan}</div>}
          </div>
        );
      })}
      {!sonuc && <button className="birincil" onClick={() => setSonuc(depo.sogukOkumaBitir(secimler))}>Puanla</button>}
      {sonuc && <p className="uyari">Puan: {sonuc.puan} / {sonuc.enYuksek}. Yeşil = gerçek öğe, kırmızı = yanlış etiket. Medyum bir cümlede birden fazla öğeyi üst üste bindirir.</p>}
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

export function Tatbikat() {
  const d = useOyun();
  const aktif = d.tatbikat.aktif;
  return (
    <div className="dosya" style={{ maxWidth: 820, margin: '20px auto' }}>
      {aktif === 'kor-secim' && <KorSecim />}
      {aktif === 'soguk-okuma' && <SogukOkuma />}
      {aktif === 'taban-orani' && <TabanOrani />}
      <div className="dugmeler" style={{ marginTop: 12 }}>
        <button onClick={() => depo.tatbikatKapat()}>Kapat</button>
        <button onClick={() => depo.kilavuzAc(aktif === 'taban-orani' ? 'capalama' : aktif === 'soguk-okuma' ? 'soguk-okuma-teknikleri' : 'forer-barnum')}>Kılavuz</button>
      </div>
    </div>
  );
}
