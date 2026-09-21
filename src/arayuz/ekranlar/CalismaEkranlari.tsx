// Karşılaştırma, olay çizelgesi, tamamlanmış dosyalar ve kişisel gelişim ekranları.
import { useState } from 'react';
import { depo, useOyun } from '../oyun/kullan';
import { ifadeCizelgesi, kalibrasyonOzeti } from '../oyun/cizelge';
import { ICERIK } from '@icerik/index';
import { DeftereEkle } from './NotDefteri';

export function Karsilastirma() {
  const d = useOyun();
  const kisiler = depo.gorusulebilirler();
  const [sol, setSol] = useState(kisiler[0]?.id ?? '');
  const [sag, setSag] = useState(kisiler[1]?.id ?? '');
  const [saat, setSaat] = useState('hepsi');
  if (!d.sorgu) return <p>Önce bir vaka başlat.</p>;
  const c = ifadeCizelgesi(d.sorgu);
  return <><p className="soluk">Yan yana gördüğün bilgiler kişilerin söyledikleridir. Farklılık, tek başına yalan anlamına gelmez.</p><label className="filtre-satiri">Karşılaştırılacak saat<select value={saat} onChange={e => setSaat(e.target.value)}><option value="hepsi">Tüm görüşme kayıtları</option>{c.dilimler.map((s, i) => <option key={s} value={i}>{s}</option>)}</select></label><div className="karsilastirma-izgarasi">{([['Birinci kişi', sol, setSol], ['İkinci kişi', sag, setSag]] as const).map(([etiket, id, sec]) => {
    const kisi = kisiler.find(k => k.id === id);
    const kayitlar = d.konusmalar.get(id) ?? [];
    return <section className="dosya" key={etiket}><label>{etiket}<select value={id} onChange={e => sec(e.target.value)}>{kisiler.map(k => <option key={k.id} value={k.id}>{k.ad}</option>)}</select></label><h2>{kisi?.ad}</h2>{saat !== 'hepsi' ? <div className="satir"><span className="ust-etiket">SÖYLENEN KONUM · {c.dilimler[Number(saat)]}</span><p>{c.hucreler.get(id)?.[Number(saat)] ?? 'Bu saat henüz sorulmadı.'}</p>{c.hucreler.get(id)?.[Number(saat)] && <DeftereEkle metin={`${c.dilimler[Number(saat)]}: ${c.hucreler.get(id)![Number(saat)]}`} kaynak={`${kisi?.ad} · Konum ifadesi`} />}</div> : <>{kayitlar.length === 0 && <p>Bu kişiyle henüz görüşmedin.</p>}{kayitlar.map((k, i) => <article className="satir" key={i}><span className="ust-etiket">{k.soru}</span><p>{k.cevap}</p><DeftereEkle metin={k.cevap} kaynak={`${kisi?.ad} · ${k.soru}`} /></article>)}</>}</section>;
  })}</div>{sol === sag && <p role="status" className="uyari">İki tarafta aynı kişi seçili. Başka bir kişi seçerek ifadeleri karşılaştırabilirsin.</p>}</>;
}

export function OlayCizelgesi() {
  const d = useOyun();
  const [notId, setNotId] = useState('');
  const [dilim, setDilim] = useState(0);
  if (!d.sorgu) return <p>Önce bir vaka başlat.</p>;
  const vaka = d.sorgu.durum.vaka;
  const c = ifadeCizelgesi(d.sorgu);
  return <><p className="soluk">İfadeleri, delilleri ve kendi notlarını olayın saatlerine yerleştir. Doğrulama senin değerlendirmen; oyunun verdiği bir doğruluk işareti değildir.</p>
    <section className="dosya"><h2>Çizelgeye ekle</h2><div className="cizelge-ekle"><label>Defterden seç<select value={notId} onChange={e => setNotId(e.target.value)}><option value="">Bir not veya alıntı seç</option>{d.masa.notlar.map(n => <option value={n.id} key={n.id}>{n.kaynak} · {n.metin.slice(0, 70)}</option>)}</select></label><label>Olay saati<select aria-label="Olay saati" value={dilim} onChange={e => setDilim(Number(e.target.value))}>{vaka.dilimler.map(z => <option value={z.index} key={z.index}>{z.baslangic}</option>)}</select></label><button disabled={!notId} className="birincil" onClick={() => depo.cizelgeEkle(notId, dilim)}>Yerleştir</button></div>{!d.masa.notlar.length && <p className="soluk">Önce Defter'e bir not ekle ya da dosya ve sorgu ekranlarından bir alıntı kaydet.</p>}</section>
    <div className="olay-seridi">{vaka.dilimler.map(z => <section className="zaman-dilimi" key={z.index}><h2>{z.baslangic}</h2><div className="zaman-icerigi"><details><summary>Konum ifadeleri ({c.kisiler.filter(k => c.hucreler.get(k.id)?.[z.index] != null).length}/{c.kisiler.length})</summary>{c.kisiler.map(k => <p key={k.id}><b>{k.ad}:</b> {c.hucreler.get(k.id)?.[z.index] ?? 'Sorulmadı'}</p>)}</details>{d.masa.cizelge.filter(x => x.dilim === z.index).map(x => { const n = d.masa.notlar.find(n => n.id === x.notId)!; return <article className="cizelge-karti" key={x.id}><span className="ust-etiket">{x.dayanak.trim() ? 'SENİN DOĞRULAMAN' : n.tur === 'ifade' ? 'SÖYLENEN · DOĞRULANMADI' : 'NOT / DELİL · DEĞERLENDİRİLMEDİ'}</span><p>{n.metin}</p><small>{n.kaynak}</small><label>Doğrulama dayanağın<textarea rows={2} placeholder="Hangi bağımsız bilgiyle doğruladın?" value={x.dayanak} onChange={e => depo.cizelgeDuzenle(x.id, x.dilim, e.target.value)} /></label><div className="satirici"><label>Saati değiştir<select value={x.dilim} onChange={e => depo.cizelgeDuzenle(x.id, Number(e.target.value), x.dayanak)}>{vaka.dilimler.map(s => <option key={s.index} value={s.index}>{s.baslangic}</option>)}</select></label><button onClick={() => depo.cizelgeSil(x.id)}>Çizelgeden kaldır</button></div></article>; })}</div></section>)}</div></>;
}

export function VakaArsivi() {
  const d = useOyun();
  const [secili, setSecili] = useState<number | null>(null);
  const [arama, setArama] = useState('');
  const g = secili !== null ? d.gecmis[secili] : undefined;
  if (g) return <><button onClick={() => setSecili(null)}>Dosya rafına dön</button><section className="dosya arsiv-detayi"><span className="ust-etiket">TAMAMLANMIŞ DOSYA · {g.seed}</span><h2>{g.dosya?.mekan ?? 'Eski vaka kaydı'}</h2><p>{g.dosya?.brifing}</p><p><b>Kararın:</b> {g.dosya?.karar ?? 'Eski kayıtta ayrıntı yok'} · {g.dogru ? 'Doğru' : 'Yanlış'} · {g.puan} puan</p><h3>Aslında ne oldu?</h3><p className="daktilo">{g.dosya?.gercek ?? 'Bu vaka ayrıntılı arşiv özelliğinden önce tamamlandı. Puanın ve öğrenme etiketlerin korundu.'}</p><h3>Öğrenme notları</h3>{g.hataEtiketleri.length === 0 && <p>Bu vakada kayıtlı hata etiketi yok.</p>}{g.hataEtiketleri.map(id => { const h = ICERIK.hataEtiketleri.find(h => h.id === id); return <div key={id}><p>{h?.aciklama ?? id}</p>{h && <button onClick={() => depo.kilavuzAc(h.kilavuzMaddesi)}>{h.ad} konusunu çalış</button>}</div>; })}<h3>Dosyadaki notların</h3>{!g.dosya?.notlar.length && <p>Bu dosyada kayıtlı not yok.</p>}{g.dosya?.notlar.map(n => <blockquote key={n.id}><p>{n.metin}</p><small>{n.kaynak}</small></blockquote>)}</section></>;
  return <><p className="soluk">Tamamlanan soruşturmaların, kararların ve öğrendiklerin. Bir dosyayı incelemek mevcut vakayı değiştirmez.</p><label className="filtre-satiri">Arşivde ara<input type="search" value={arama} onChange={e => setArama(e.target.value)} placeholder="Mekân veya vaka kodu" /></label>{!d.gecmis.length && <section className="dosya"><h2>İlk dosyan burada yerini alacak.</h2><p>Bir vakayı tamamladığında kararın, notların ve analiz özeti bu rafa eklenir.</p></section>}<div className="arsiv-rafi">{d.gecmis.map((g, i) => ({ g, i })).reverse().filter(({ g }) => `${g.seed} ${g.dosya?.mekan ?? ''}`.toLocaleLowerCase('tr-TR').includes(arama.toLocaleLowerCase('tr-TR'))).map(({ g, i }) => <button key={i} className="arsiv-dosyasi" onClick={() => setSecili(i)}><span className="ust-etiket">DOSYA {String(i + 1).padStart(3, '0')}</span><h2>{g.dosya?.mekan ?? g.seed}</h2><span>{g.dogru ? 'Doğru karar' : 'Yeni bir ders'} · {g.puan} puan</span><small>{g.dosya ? new Date(g.dosya.tarih).toLocaleDateString('tr-TR') : 'Önceki sürüm kaydı'}</small><span>Dosyayı incele →</span></button>)}</div></>;
}

export function Gelisim() {
  const d = useOyun(); const gecmis = d.gecmis;
  const detaylar = gecmis.flatMap(g => g.dosya ? [g.dosya] : []);
  const n = gecmis.length;
  const kovalar = kalibrasyonOzeti(gecmis);
  return <><p className="soluk">Bu sayfa oyun içindeki karar alışkanlıklarını gösterir; bir kişilik testi değildir. Az sayıda vakadan kesin sonuç çıkarma.</p><div className="gelisim-ozeti"><section className="dosya"><span>Tamamlanan vaka</span><strong>{n}</strong></section><section className="dosya"><span>Doğru karar</span><strong>{n ? `%${Math.round(gecmis.filter(g => g.dogru).length / n * 100)}` : '—'}</strong></section><section className="dosya"><span>Ortalama Brier puanı</span><strong>{n ? (gecmis.reduce((s, g) => s + g.brier, 0) / n).toLocaleString('tr-TR', { maximumFractionDigits: 2 }) : '—'}</strong><small>0'a yaklaştıkça daha iyi.</small></section></div>
    <section className="dosya"><h2>Güvenin ile doğruluğun</h2>{!n && <p>İlk vakanı bitirdiğinde karşılaştırman burada görünecek.</p>}{kovalar.map(k => <div className="kalibrasyon-satiri" key={k.kova}><h3>{k.kova} güven aralığı · {k.sayi} vaka</h3><label>Ortalama güven %{Math.round(k.beyanOrt * 100)}<meter min="0" max="1" value={k.beyanOrt} /></label><label>Gerçek isabet %{Math.round(k.dogrulukOrani * 100)}<meter min="0" max="1" value={k.dogrulukOrani} /></label></div>)}</section>
    <section className="dosya"><h2>Karar vermeden önce</h2><p className="soluk">Aşağıdaki ölçüler yalnızca yeni arşivli {detaylar.length} vakadan hesaplanır. Az görüşme yapmak tek başına erken hüküm verdiğin anlamına gelmez.</p>{detaylar.length ? <ul className="liste-temiz"><li>Ortalama görüşülen kişi oranı <b>%{Math.round(detaylar.reduce((s, a) => s + a.gorusulen / Math.max(1, a.kisiSayisi), 0) / detaylar.length * 100)}</b></li><li>Kararda kullanılan ortalama delil dayanağı <b>{(detaylar.reduce((s, a) => s + a.dayanakSayisi, 0) / detaylar.length).toFixed(1).replace('.', ',')}</b></li><li>Temel çizgi tekniği kullanılan vaka <b>{detaylar.filter(a => a.teknikler.includes('temel-cizgi')).length} / {detaylar.length}</b></li><li>Doğrulama dayanağı yazdığın çizelge notu <b>{detaylar.reduce((s, a) => s + a.cizelge.filter(c => c.dayanak.trim()).length, 0)}</b></li></ul> : <p>Henüz ayrıntılı bir vaka kaydın yok.</p>}</section>
    <section className="dosya"><h2>Tekrar çalışabileceğin konular</h2>{!depo.korNoktalar().length && <p>Henüz tekrarlayan hata kaydı yok.</p>}{depo.korNoktalar().map(k => { const h = ICERIK.hataEtiketleri.find(h => h.id === k.etiket); return <div className="gelisim-konu" key={k.etiket}><span>{h?.ad ?? k.etiket} · {k.sayi} kez</span>{h && <button onClick={() => depo.kilavuzAc(h.kilavuzMaddesi)}>Kılavuzda çalış</button>}</div>; })}</section></>;
}

