// Vaka sonu analizi: puan, kalibrasyon, cezalar/bonuslar, hata etiketleri → Kılavuz, gerçeğin anlatımı, kör noktalar.
// Dil: gelişim zihniyeti ("şunu öğrendin"), TASARIM §11.
import { ICERIK } from '@icerik/index';
import { depo, useOyun } from '../oyun/kullan';
import { ARKETIPLER } from '@motor/arketipler';
import { kalibrasyonOzeti } from '../oyun/cizelge';
import { takimSahnesi } from '../oyun/takim_hikaye';

const ETIKETLER = new Map(ICERIK.hataEtiketleri.map((h) => [h.id, h]));
const KILAVUZ = new Map(ICERIK.kilavuz.map((m) => [m.id, m]));
const HEDEF_ADI: Record<string, string> = {
  'gergin-masum': 'gergin masum (Othello)',
  'gomulu-yalan': 'gömülü yalan (SUE sırası)',
  'sizinti': 'basına sızmış ayrıntı (CIT geçerliliği)',
  'telkine-yatkin-masum': 'telkine yatkın tanık (kontaminasyon / sahte itiraf)',
  'sahnelenmis-delil': 'sahnelenmiş delil (fizik kontrolü)',
  'suc-var': 'gerçek bir suç (doğruluk yanlılığı)',
};

export function Analiz() {
  const d = useOyun();
  if (!d.sorgu || !d.puan) return null;
  const p = d.puan;
  const korNoktalar = depo.korNoktalar();
  return (
    <div>
      <section className="dosya">
        <h2>{p.dogru ? 'Doğru okudun' : 'Bu kez kandırıldın — şimdi nasıl olduğunu göreceksin'}</h2>
        <p className="puan-buyuk">{p.puan}</p>
        <p className="soluk">
          Güven beyanın {Math.round(p.kalibrasyon.guven * 100)}% · sonuç {p.kalibrasyon.sonuc ? 'doğru' : 'yanlış'} · Brier {p.kalibrasyon.brier.toFixed(2)} (0 en iyi)
        </p>
        {p.bonuslar.map((b) => <div key={b.neden} className="soluk">+{b.miktar} {b.aciklama}</div>)}
        {p.cezalar.map((c) => <div key={c.neden} className="uyari">{c.miktar} {c.aciklama}</div>)}
      </section>

      <section className="dosya">
        <h2>Öğrendiklerin</h2>
        {p.hataEtiketleri.length === 0 && <p>Hata etiketi yok. Yöntem işledi; bir sonraki vakada zorluk artabilir.</p>}
        {p.hataEtiketleri.map((e) => {
          const h = ETIKETLER.get(e)!;
          const m = KILAVUZ.get(h.kilavuzMaddesi);
          return (
            <div key={e} style={{ marginBottom: 8 }}>
              <button className="etiket" onClick={() => depo.kilavuzAc(h.kilavuzMaddesi)}>{h.ad}{h.ramKatmani ? ` · RAM ${h.ramKatmani}` : ''}</button>
              <div className="soluk">{h.aciklama} {m && <>→ Çalış: <b>{m.baslik}</b></>}</div>
            </div>
          );
        })}
      </section>

      {d.ifadeKarsilastirma.length > 0 && (
        <section className="dosya">
          <h2>Olay anı: söylenen ve gerçek</h2>
          <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 14 }}>
            <thead><tr><th style={{ textAlign: 'left' }}>Kişi</th><th style={{ textAlign: 'left' }}>Sana söylediği</th><th style={{ textAlign: 'left' }}>Gerçek</th><th style={{ textAlign: 'left' }}>İfade türü</th></tr></thead>
            <tbody>
              {d.ifadeKarsilastirma.map((r) => (
                <tr key={r.kisi} style={{ borderTop: '1px dotted var(--cizgi)' }}>
                  <td>{r.ad}</td>
                  <td>{r.soruldu ? r.ifade ?? '"hatırlamıyorum"' : <span className="soluk">sorulmadı</span>}</td>
                  <td>{r.gercek}</td>
                  <td className={r.soruldu && r.ifade !== r.gercek ? 'soluk' : ''}>{r.etiket}</td>
                </tr>
              ))}
            </tbody>
          </table>
          <p className="soluk">Sormadığın kişi: ipucu önünde değildi (Funder RAM 2. halka). Doğru oda ama "gizleme": yerini söyledi, ne yaptığını sakladı.</p>
        </section>
      )}

      <section className="dosya">
        <h2>Aslında ne oldu</h2>
        <p className="daktilo">{d.gercekAnlatimi}</p>
        {d.rapor && (
          <p className="soluk">Zorluk {Math.round(d.rapor.zorluk * 100)}/100. {d.rapor.notlar.join(' ')}</p>
        )}
        {(() => {
          const a = ARKETIPLER.find((x) => x.id === d.sorgu!.durum.vaka.arketip);
          if (!a) return null;
          const m = a.kilavuzMaddesi ? KILAVUZ.get(a.kilavuzMaddesi) : null;
          return <p className="soluk">Vaka arketipi: <b>{a.ad}</b>.{m && <> Bu vakanın dersi: <button className="etiket" onClick={() => depo.kilavuzAc(m.id)}>{m.baslik}</button></>}</p>;
        })()}
      </section>

      {d.hedefler.length > 0 && (
        <p className="soluk">Bu vaka, önceki hatalarına göre özellikle şunları çalıştırmak için üretildi: {d.hedefler.map((h) => HEDEF_ADI[h] ?? h).join(', ')}.</p>
      )}
      {d.ayna && (() => {
        const okundu = d.ayna.tahmin === (d.suclama?.fail ?? null);
        const tahminAd = d.ayna.tahmin ? d.sorgu!.durum.vaka.kisiler.find((k) => k.id === d.ayna!.tahmin)?.ad : 'kimse ("suç yok")';
        const etiket = ETIKETLER.get(d.ayna.etiket);
        return (
          <section className="dosya">
            <h2>{okundu ? 'Ayna seni okudu' : 'Ayna yanıldı'}</h2>
            <p className="daktilo" style={{ fontStyle: 'italic' }}>"{d.ayna.not}"</p>
            <p>
              Notu bırakan, kime şüpheleneceğini <b>senin geçmiş hatalarından</b> tahmin etti: <b>{tahminAd}</b>. {d.ayna.gerekce}
              {okundu ? ' Tam da o kişiyi suçladın: kör noktan okunabilir bir kalıp olmuş.' : ' Başka yöne gittin: kalıbın kırılıyor.'}
            </p>
            {etiket && <p className="soluk">Hedef alınan kör nokta: <button className="etiket" onClick={() => depo.kilavuzAc(etiket.kilavuzMaddesi)}>{etiket.ad}</button></p>}
          </section>
        );
      })()}
      {d.gecmis.length >= 2 && (
        <section className="dosya">
          <h2>Karar günlüğü · kalibrasyon</h2>
          <p className="soluk">Beyan ettiğin güven (kova) ile gerçek doğruluk oranın. İyi kalibrasyon: ikisi yakın. (Ekman & O'Sullivan 1991; Tversky & Kahneman 1974)</p>
          <table style={{ borderCollapse: 'collapse', fontSize: 14 }}>
            <thead><tr><th style={{ textAlign: 'left', padding: 4 }}>Güven kovası</th><th style={{ padding: 4 }}>Vaka</th><th style={{ padding: 4 }}>Ort. beyan</th><th style={{ padding: 4 }}>Gerçek doğruluk</th></tr></thead>
            <tbody>
              {kalibrasyonOzeti(d.gecmis).map((k) => (
                <tr key={k.kova} style={{ borderTop: '1px dotted var(--cizgi)' }}>
                  <td style={{ padding: 4 }}>{k.kova}</td><td style={{ padding: 4, textAlign: 'center' }}>{k.sayi}</td><td style={{ padding: 4, textAlign: 'center' }}>{Math.round(k.beyanOrt * 100)}%</td>
                  <td style={{ padding: 4, textAlign: 'center', color: k.dogrulukOrani + 0.15 < k.beyanOrt ? 'var(--kirmizi)' : 'inherit' }}>{Math.round(k.dogrulukOrani * 100)}%</td>
                </tr>
              ))}
            </tbody>
          </table>
        </section>
      )}
      {korNoktalar.length > 0 && (
        <section className="dosya">
          <h2>Senin kör noktan</h2>
          <ul className="liste-temiz">
            {korNoktalar.map((k) => (
              <li key={k.etiket}><span>{ETIKETLER.get(k.etiket)?.ad ?? k.etiket}</span><span className="soluk">{k.sayi} kez</span></li>
            ))}
          </ul>
        </section>
      )}

      {d.takimAcik && (() => {
        const sahne = takimSahnesi(d.gecmis, d.kahramanAdi);
        if (!sahne) return null;
        const m = KILAVUZ.get(sahne.kilavuz);
        return (
          <section className="dosya">
            <h2>Ofis · sonra</h2>
            <p className="soluk">Çaylar demlendi; kanepe boş. Takım konuşuyor.</p>
            {sahne.satirlar.map((s, i) => (
              <p key={i} style={{ margin: '6px 0' }}><b className="daktilo" style={{ fontSize: 13 }}>{s.ad}:</b> {s.metin}</p>
            ))}
            {m && <p className="soluk">Bu hikâyenin dersi: <button className="etiket" onClick={() => depo.kilavuzAc(m.id)}>{m.baslik}</button></p>}
          </section>
        );
      })()}

      <div className="dugmeler">
        <button className="birincil" onClick={() => depo.yeniVaka()}>Yeni vaka</button>
        <button onClick={() => depo.kilavuzAc(null)}>Kılavuz</button>
      </div>
    </div>
  );
}
