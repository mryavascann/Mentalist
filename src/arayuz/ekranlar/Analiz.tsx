// Vaka sonu analizi: puan, kalibrasyon, cezalar/bonuslar, hata etiketleri → Kılavuz, gerçeğin anlatımı, kör noktalar.
// Dil: gelişim zihniyeti ("şunu öğrendin"), TASARIM §11.
import { ICERIK } from '@icerik/index';
import { ESYA_SINIF_ADLARI, ESYA_SINIFI, ESYA_TURU_ADLARI, IC_SES_SECENEKLERI } from '@motor/araclar';
import { depo, useOyun } from '../oyun/kullan';
import { DIGER, PORTRELER, TAKIM_PORTRELERI } from '../gorseller';
import { TAKIM } from '../oyun/takim';
import { ARKETIPLER } from '@motor/arketipler';
import { kalibrasyonOzeti } from '../oyun/cizelge';
import { takimSahnesi } from '../oyun/takim_hikaye';
import { tatbikatOner } from '../oyun/tatbikat_onerisi';

const ETIKETLER = new Map(ICERIK.hataEtiketleri.map((h) => [h.id, h]));
const KILAVUZ = new Map(ICERIK.kilavuz.map((m) => [m.id, m]));
const HEDEF_ADI: Record<string, string> = {
  'gergin-masum': 'gergin masum (Othello hatası)',
  'gomulu-yalan': 'gömülü yalan (delili ne zaman göstereceğin)',
  'sizinti': 'basına sızmış ayrıntı (gizli bilgi testinin geçerliliği)',
  'telkine-yatkin-masum': 'telkine yatkın tanık (anıyı kirletme ve sahte itiraf)',
  'sahnelenmis-delil': 'sahnelenmiş delil (fiziksel tutarlılık kontrolü)',
  'suc-var': 'gerçek bir suç (doğruluk yanlılığı)',
};
/** Funder'ın okuma doğruluğu modelindeki dört aşama (hata etiketinin ramKatmani alanı). */
const RAM_ASAMALARI: Record<number, string> = { 1: 'ilgililik', 2: 'erişim', 3: 'fark etme', 4: 'yorumlama' };
const ondalik = (x: number, basamak: number) => x.toFixed(basamak).replace('.', ',');

export function Analiz() {
  const d = useOyun();
  if (!d.sorgu || !d.puan) return null;
  const p = d.puan;
  const korNoktalar = depo.korNoktalar();
  return (
    <div>
      <section className="dosya">
        <h2>{p.dogru ? 'Doğru okudun' : 'Bu kez kandırıldın; nasıl olduğunu şimdi göreceksin'}</h2>
        <p className="puan-buyuk">{p.puan}</p>
        <p className="soluk">
          Güven beyanın %{Math.round(p.kalibrasyon.guven * 100)} · sonuç {p.kalibrasyon.sonuc ? 'doğru' : 'yanlış'} · Brier puanı {ondalik(p.kalibrasyon.brier, 2)} (0 en iyisi)
        </p>
        {p.bonuslar.map((b) => <div key={b.neden} className="soluk">+{b.miktar} {b.aciklama}</div>)}
        {p.cezalar.map((c) => <div key={c.neden} className="uyari">{c.miktar} {c.aciklama}</div>)}
      </section>

      <section className="dosya">
        <h2>Öğrendiklerin</h2>
        {p.hataEtiketleri.length === 0 && <p>Bu vakada hata etiketi yok; yöntemin işe yaradı. Sonraki vaka biraz daha zor olabilir.</p>}
        {p.hataEtiketleri.map((e) => {
          const h = ETIKETLER.get(e)!;
          const m = KILAVUZ.get(h.kilavuzMaddesi);
          return (
            <div key={e} style={{ marginBottom: 8 }}>
              <button className="etiket" onClick={() => depo.kilavuzAc(h.kilavuzMaddesi)}>{h.ad}</button>
              <div className="soluk">
                {h.aciklama}
                {h.ramKatmani ? <> Okumanın <b>{RAM_ASAMALARI[h.ramKatmani]}</b> aşamasında kaydın.</> : null}
                {m && <> Bu konuyu Kılavuz'daki <b>{m.baslik}</b> maddesinde çalışabilirsin.</>}
              </div>
            </div>
          );
        })}
        {(() => {
          // Aralıklı tekrar: hata etiketine uyan tatbikatlar (2–5 dk). Tamamlanmış olsa da tekrar önerilir.
          const oneriler = tatbikatOner(p.hataEtiketleri);
          if (oneriler.length === 0) return null;
          return (
            <div style={{ marginTop: 10 }}>
              <div className="soluk" style={{ marginBottom: 4 }}>Bunun için kısa bir tatbikat öneriyoruz (2–5 dk); bitince buraya dönersin.</div>
              <div className="dugmeler">
                {oneriler.map((o) => (
                  <button key={o.tatbikat} onClick={() => depo.tatbikatAc(o.tatbikat)} title={o.etiketler.map((e) => ETIKETLER.get(e)?.ad ?? e).join(', ')}>
                    {o.ad}{d.tatbikat.sonuclar[o.tatbikat]?.tamamlandi ? ' · tekrar' : ''}
                  </button>
                ))}
              </div>
            </div>
          );
        })()}
      </section>

      {d.ifadeKarsilastirma.length > 0 && (
        <section className="dosya">
          <h2>Olay anında kim ne dedi, gerçekte ne oldu</h2>
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
          <p className="soluk">"Sorulmadı" yazan kişilerin cevabı elinde yoktu; o ipucuna hiç ulaşmadın. Odası doğru ama türü "gizleme" olan kişiler yerini söyledi, ne yaptığını sakladı.</p>
        </section>
      )}

      {p.odaKarnesi && (
        // Oda okuma karnesi (Gosling 2002): gizli tür ve ima burada açılır.
        <section className="dosya">
          <h2>Oda okuma karnesi · {p.odaKarnesi.dogru}/{p.odaKarnesi.n}</h2>
          <p className="soluk">Her eşyanın gerçek türü ve dikkatli bir okuyucunun ondan çıkaracağı sonuç aşağıda. "Geçersiz çıkarım" işareti, "hoş oda, hoş insan" tuzağını gösterir. Oda kişiliği ve sırları okur, suçu değil.</p>
          {[...d.sorgu.odaOkumalari.values()].map((okuma) => {
            const ad = d.sorgu!.durum.vaka.kisiler.find((k) => k.id === okuma.kisi)?.ad ?? okuma.kisi;
            return (
              <div key={okuma.kisi} style={{ marginBottom: 8 }}>
                <b>{ad}</b>
                <ul className="liste-temiz">
                  {okuma.esyalar.map((e) => {
                    const senin = d.sorgu!.odaSiniflamalari.get(e.id);
                    const dogru = senin === ESYA_SINIFI[e.tur];
                    return (
                      <li key={e.id} style={{ display: 'block', borderTop: '1px dotted var(--cizgi)', padding: '4px 0' }}>
                        <div>{e.betimleme}</div>
                        <div className="soluk">
                          Senin sınıflaman: {senin ? ESYA_SINIF_ADLARI[senin] : 'sınıflamadın'} · Doğrusu: <b>{ESYA_TURU_ADLARI[e.tur]}</b> {senin && (dogru ? '✓' : '✗')}
                          {!e.gecerli && <> · <span className="uyari">geçersiz çıkarım</span></>}
                        </div>
                        <div className="soluk">{e.ima}</div>
                      </li>
                    );
                  })}
                </ul>
              </div>
            );
          })}
          <p className="soluk">Kılavuz'da: <button className="etiket" onClick={() => depo.kilavuzAc('oda-ipuclari')}>Oda okuma</button></p>
        </section>
      )}
      {p.icSesKarnesi && (
        // İç ses karnesi (Ickes 1990): tahmin vs gerçek; ortalama insan %22.
        <section className="dosya">
          <h2>İç ses karnesi · {p.icSesKarnesi.dogru}/{p.icSesKarnesi.n}</h2>
          <p className="soluk">Ickes 1990'da birbirini tanımayan insanlar karşısındakinin düşüncesini ortalama %22 isabetle tahmin etti. "Okudum" hissi kanıt değildir.</p>
          <ul className="liste-temiz">
            {d.sorgu.icSesTahminleri.map((t, i) => {
              const ad = d.sorgu!.durum.vaka.kisiler.find((k) => k.id === t.kisi)?.ad ?? t.kisi;
              return (
                <li key={i} style={{ display: 'block', borderTop: '1px dotted var(--cizgi)', padding: '4px 0' }}>
                  <div><b>{ad}</b> {t.tahmin === t.gercek ? '✓' : '✗'}</div>
                  <div className="soluk">Tahminin: {IC_SES_SECENEKLERI[t.tahmin]}</div>
                  <div>Gerçekte: <span className="daktilo" style={{ fontStyle: 'italic' }}>{t.gercekMetin}</span></div>
                </li>
              );
            })}
          </ul>
          <p className="soluk">Kılavuz'da: <button className="etiket" onClick={() => depo.kilavuzAc('empatik-dogruluk')}>Empatik doğruluk</button></p>
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
          return <p className="soluk">Vaka türü: <b>{a.ad}</b>.{m && <> Bu vakanın asıl dersi Kılavuz'daki <button className="etiket" onClick={() => depo.kilavuzAc(m.id)}>{m.baslik}</button> maddesinde.</>}</p>;
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
              Notu bırakan kişi, kimden şüpheleneceğini <b>geçmiş hatalarına bakarak</b> tahmin etti: <b>{tahminAd}</b>. {d.ayna.gerekce}
              {okundu ? ' Sen de tam o kişiyi suçladın; kör noktan artık tahmin edilebilir bir kalıba dönüşmüş.' : ' Sen başka birini seçtin; kalıbın kırılıyor.'}
            </p>
            {etiket && <p className="soluk">Ayna'nın hedeflediği kör nokta: <button className="etiket" onClick={() => depo.kilavuzAc(etiket.kilavuzMaddesi)}>{etiket.ad}</button></p>}
            {(() => {
              // Ark: önceki karşılaşmaların notları (bu vakanınki hariç; o zaten yukarıda).
              const onceki = depo.aynaArki().slice(0, -1).filter((a) => a.not);
              if (onceki.length === 0) return null;
              return (
                <details>
                  <summary className="soluk">Önceki notlar ({onceki.length})</summary>
                  {onceki.map((a, i) => <p key={i} className="daktilo soluk" style={{ fontStyle: 'italic', fontSize: 13 }}>"{a.not}" — {a.okundu ? 'okudu' : 'yanıldı'}</p>)}
                </details>
              );
            })()}
          </section>
        );
      })()}
      {d.gecmis.length >= 2 && (
        <section className="dosya">
          <h2>Karar günlüğü · kalibrasyon</h2>
          <p className="soluk">Beyan ettiğin güvenle gerçek isabet oranın. Kalibrasyonu iyi olan birinde ikisi birbirine yakındır (Ekman & O'Sullivan 1991; Tversky & Kahneman 1974).</p>
          <table style={{ borderCollapse: 'collapse', fontSize: 14 }}>
            <thead><tr><th style={{ textAlign: 'left', padding: 4 }}>Güven aralığı</th><th style={{ padding: 4 }}>Vaka</th><th style={{ padding: 4 }}>Ortalama beyan</th><th style={{ padding: 4 }}>Gerçek isabet</th></tr></thead>
            <tbody>
              {kalibrasyonOzeti(d.gecmis).map((k) => (
                <tr key={k.kova} style={{ borderTop: '1px dotted var(--cizgi)' }}>
                  <td style={{ padding: 4 }}>{k.kova}</td><td style={{ padding: 4, textAlign: 'center' }}>{k.sayi}</td><td style={{ padding: 4, textAlign: 'center' }}>%{Math.round(k.beyanOrt * 100)}</td>
                  <td style={{ padding: 4, textAlign: 'center', color: k.dogrulukOrani + 0.15 < k.beyanOrt ? 'var(--kirmizi)' : 'inherit' }}>%{Math.round(k.dogrulukOrani * 100)}</td>
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
          {(() => {
            const o = depo.aynaOkunmaOrani();
            if (o.n === 0) return null;
            return <p className="soluk">Ayna {o.n} karşılaşmada seni {o.okundu} kez okudu. {o.okundu / o.n >= 0.5 ? 'Kalıbın tahmin edilebilir hale geldi; karar verirken neye yaslandığını değiştir.' : 'Kalıbın kırılıyor.'}</p>;
          })()}
        </section>
      )}

      {d.takimAcik && (() => {
        const sahne = takimSahnesi(d.gecmis, d.kahramanAdi);
        if (!sahne) return null;
        const m = KILAVUZ.get(sahne.kilavuz);
        return (
          <section className="dosya">
            <h2>Ofiste, mesai sonrası</h2>
            {DIGER.ofis && <img src={DIGER.ofis} alt="Takım ofisi, mesai sonrası" style={{ width: '100%', maxHeight: 220, objectFit: 'cover', border: '1px solid var(--cizgi)', marginBottom: 8 }} />}
            <p className="soluk">Çaylar demlendi; kanepe boş. Takım konuşuyor.</p>
            {sahne.satirlar.map((s, i) => {
              const rol = TAKIM.find((u) => u.ad === s.ad)?.rol;
              const portre = rol ? PORTRELER[TAKIM_PORTRELERI[rol] ?? ''] : undefined;
              return (
                <p key={i} style={{ margin: '6px 0', display: 'flex', gap: 8, alignItems: 'flex-start' }}>
                  {portre && <img src={portre} alt="" aria-hidden="true" width={28} height={28} style={{ borderRadius: 4, flex: 'none', objectFit: 'cover' }} />}
                  <span><b className="daktilo" style={{ fontSize: 13 }}>{s.ad}:</b> {s.metin}</span>
                </p>
              );
            })}
            {m && <p className="soluk">Bu anı, Kılavuz'daki <button className="etiket" onClick={() => depo.kilavuzAc(m.id)}>{m.baslik}</button> maddesiyle ilgili.</p>}
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
