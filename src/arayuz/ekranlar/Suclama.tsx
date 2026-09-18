// Suçlama: kişi ya da "suç yok", güven beyanı (kalibrasyon), dayanaklar (gerekçe) ve savcıya savunma kontrol listesi.
import { useState } from 'react';
import { ICERIK } from '@icerik/index';
import { depo, useOyun } from '../oyun/kullan';
import { DIGER } from '../gorseller';

export function Suclama() {
  const d = useOyun();
  const [secim, setSecim] = useState<string>('');
  const [guven, setGuven] = useState(70);
  const [gerekce, setGerekce] = useState<Set<string>>(new Set());
  if (!d.sorgu) return null;
  const kisiler = depo.gorusulebilirler();
  const kullanilanTeknikler = [...new Set(d.sorgu.gecmis.map((g) => g.teknik))];
  const dayanaklar = [
    // Açıklama tam yazılır: kesilmiş cümle ("...kamerası 19:00 civarında Gökçe Bozkurt'u") dayanak seçimini bozuyordu.
    ...d.sorgu.deliller.map((x) => ({ id: `delil:${x.id}`, ad: `Delil ${x.id}: ${x.aciklama}` })),
    ...kullanilanTeknikler.map((t) => ({ id: `teknik:${t}`, ad: `Teknik sonucu: ${ICERIK.teknikler.find((x) => x.id === t)?.ad ?? t}` })),
    { id: 'ipucu:genel', ad: 'Davranış ipuçları (gerginlik, göz kaçırma, duraksama…)' },
    { id: 'takim:cogunluk', ad: 'Takımın çoğunluk görüşü' },
    { id: 'profil:genel', ad: 'Oda okuması ya da dijital profil (kişilik okuması)' },
  ];
  const degistir = (id: string) => setGerekce((g) => { const y = new Set(g); if (y.has(id)) y.delete(id); else y.add(id); return y; });
  const gonder = () => depo.suclamaYap({ fail: secim === 'yok' ? null : secim, guven: guven / 100, gerekce: [...gerekce] });

  return (
    <div className="izgara">
      <section className="dosya">
        {DIGER.suclama && <img src={DIGER.suclama} alt="" aria-hidden="true" style={{ width: '100%', maxHeight: 160, objectFit: 'cover', border: '1px solid var(--cizgi)', marginBottom: 8 }} />}
        <h2>Kimi suçluyorsun?</h2>
        {kisiler.map((k) => (
          <label key={k.id} style={{ display: 'block' }}>
            <input type="radio" name="fail" value={k.id} checked={secim === k.id} onChange={() => setSecim(k.id)} /> {k.ad} <span className="soluk">— {k.rol}</span>
          </label>
        ))}
        <label style={{ display: 'block', marginTop: 6 }}>
          <input type="radio" name="fail" value="yok" checked={secim === 'yok'} onChange={() => setSecim('yok')} /> Suç yok, kimseyi suçlamıyorum
        </label>
        <h3>Ne kadar eminsin? %{guven}</h3>
        <input type="range" min={50} max={100} value={guven} onChange={(e) => setGuven(Number(e.target.value))} style={{ width: '100%' }} />
        <p className="soluk">Beyan ettiğin güven, gerçek isabetinle karşılaştırılır (kalibrasyon). Ekman & O'Sullivan 1991: emin olmak, doğru olmak demek değildir.</p>
        <button className="birincil" disabled={!secim || d.puan !== null} onClick={gonder}>Suçlamayı ver</button>
      </section>
      <section className="dosya">
        <h2>Dayanakların</h2>
        <p className="soluk">Bunu savcıya nasıl savunursun: hangi delil, hangi teknik sonucu? Yalnızca davranış ipuçlarına dayanıyorsan bunun farkında ol.</p>
        {dayanaklar.map((x) => (
          <label key={x.id} style={{ display: 'block', fontSize: 14 }}>
            <input type="checkbox" checked={gerekce.has(x.id)} onChange={() => degistir(x.id)} /> {x.ad}
          </label>
        ))}
        <h3>Kontrol listesi</h3>
        <ul className="soluk">
          <li>Masum biri de aynı tepkiyi verir miydi? (Othello hatası)</li>
          <li>Karşıt hipotezi yazdın mı? (Çıpalama etkisi)</li>
          <li>Gizli bilgi testi yaptıysan ayrıntı önceden sızmış mıydı?</li>
          <li>İtiraf aldıysan bağımsız delille doğruladın mı?</li>
        </ul>
      </section>
    </div>
  );
}
