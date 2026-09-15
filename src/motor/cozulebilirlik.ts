// Çözülebilirlik denetçisi, zorluk puanı ve örüntü denetçisi.
//
// Çözülebilirlik: "ideal ama meşru" bir soruşturmacı, oyuncunun erişebileceği sinyallerle
// (olay yeri delilleri + kendi konum iddiasıyla delil çelişkisi, geçerli CIT, koruması olmayan görgü
// tanığı, beklenmedik soru, SVT) faili tek başına en yüksek puana çıkarabiliyor mu? Oyuncu sorgusunu
// KİRLETMEMEK için denetim her zaman taze bir Sorgu klonunda yapılır.
//
// Örüntü denetçisi: binlerce vakada failin yüzeysel özelliklerle (sıra, kişilik, yaş, cinsiyet, ilişki
// sayısı, sır…) korelasyonu ≈ 0 olmalı; aksi halde oyuncu kalıbı öğrenir ve bilim yerine meta-tahmin kazanır.
import { vakaUret } from './gerceklik';
import { citGecerliMi } from './bilgi';
import { sirlarUret } from './sirlar';
import { sor, sorguBaslat, teknikUygula, type Sorgu } from './teknik';
import type { KisiId, Vaka } from './tipler';

export type SinyalTuru = 'delil-celiskisi' | 'gecerli-cit' | 'gorgu-tanigi' | 'beklenmedik-soru' | 'svt';

export interface Sinyal {
  tur: SinyalTuru;
  hedef: KisiId;
  agirlik: number;
  aciklama: string;
}

export interface CozulebilirlikRaporu {
  sucVar: boolean;
  /** Olay anında olay odasında delili olan hayatta kişiler. */
  supheliler: KisiId[];
  sinyaller: Sinyal[];
  /** Fail (varsa) sinyal puanında tek başına ve yeterince önde mi; kaza vakasında "suç yok" ulaşılabilir mi. */
  cozulebilir: boolean;
  tekCozum: boolean;
  /** 0 kolay … 1 çok zor. */
  zorluk: number;
  notlar: string[];
}

const SINYAL_AGIRLIKLARI: Record<SinyalTuru, number> = { 'delil-celiskisi': 3, 'gorgu-tanigi': 4, 'gecerli-cit': 2, 'beklenmedik-soru': 1, 'svt': 1 };
const COZUM_ESIGI = 2;

export function cozulebilirlikDenetle(orijinal: Sorgu): CozulebilirlikRaporu {
  const vaka = orijinal.durum.vaka;
  const { olay } = vaka;
  const sorgu = sorguBaslat(vaka); // taze klon; oyuncunun defteri/kayıtları etkilenmez
  const notlar: string[] = [];

  if (!olay.fail) {
    return { sucVar: false, supheliler: [], sinyaller: [], cozulebilir: true, tekCozum: true, zorluk: 0.35, notlar: ['Suç delili yok (yöntem delili ve yokluk delili üretilmedi); "suç yok" sonucuna ulaşılabilir.'] };
  }

  const canlilar = vaka.kisiler.filter((k) => k.hayatta && k.id !== olay.kurban);
  const supheliler = canlilar
    .filter((k) => sorgu.deliller.some((d) => d.gosterir.tur === 'konum' && d.gosterir.kisi === k.id && d.gosterir.dilim === olay.dilim && d.gosterir.oda === olay.oda))
    .map((k) => k.id);
  const sinyaller: Sinyal[] = [];
  const ekle = (tur: SinyalTuru, hedef: KisiId, aciklama: string) => sinyaller.push({ tur, hedef, agirlik: SINYAL_AGIRLIKLARI[tur], aciklama });

  const citGecerli = citGecerliMi(vaka, sorgu.durum.dagilim, 'olay-yontemi');
  for (const s of supheliler) {
    // 1) Delil çelişkisi: delili göstermeden konum sor (SUE sırası).
    const konum = sor(sorgu, s, { tur: 'konum', hedef: s, dilim: olay.dilim });
    if (konum.celisenDeliller.length > 0) ekle('delil-celiskisi', s, `${s} olay anı için "${konum.cevap.icerik}" dedi; delil ${konum.celisenDeliller[0]!.id} olay odasını gösteriyor`);
    // 2) Geçerli CIT.
    if (citGecerli) {
      const cit = teknikUygula(sorgu, s, 'gizli-bilgi-testi', { konu: 'olay-yontemi' });
      if (cit.teknik === 'gizli-bilgi-testi' && cit.tepki === 'tanima') ekle('gecerli-cit', s, `${s} yöntem ayrıntısını tanıdı`);
    }
    // 3) Beklenmedik soru: iddia edilen odada olmayan kişi sayarsa.
    const bs = teknikUygula(sorgu, s, 'beklenmedik-soru', { dilim: olay.dilim });
    if (bs.teknik === 'beklenmedik-soru' && bs.iddiaEdilenOda !== null) {
      const odadakiler = new Set(vaka.zamanCizelgesi.filter((z) => z.dilim === olay.dilim && z.oda === bs.iddiaEdilenOda).map((z) => z.kisi));
      if (bs.adiGecenler.some((a) => !odadakiler.has(a))) ekle('beklenmedik-soru', s, `${s} iddia ettiği odada olmayan birini saydı`);
    }
    // 4) SVT: yöntemi "bilmiyorum" diyen şans altında kalırsa.
    const svt = teknikUygula(sorgu, s, 'zorunlu-iki-secenek', { konu: 'olay-yontemi' });
    if (svt.teknik === 'zorunlu-iki-secenek' && svt.skor !== null && svt.sansAlti) ekle('svt', s, `${s} iki seçenekli testte şans altında kaldı (${svt.skor}/${svt.n})`);
  }
  // 5) Görgü tanığı: koruması olmayan tanık faili adıyla söyler.
  for (const t of canlilar) {
    const c = sor(sorgu, t.id, { tur: 'olay-bilgisi', konu: 'fail-kimligi' }).cevap;
    if (c.icerik && c.ifadeTuru === 'dogru' && canlilar.some((k) => k.id === c.icerik)) ekle('gorgu-tanigi', c.icerik, `${t.id} faili gördüğünü söyledi`);
  }

  const puanlar = new Map<KisiId, number>();
  for (const s of sinyaller) puanlar.set(s.hedef, (puanlar.get(s.hedef) ?? 0) + s.agirlik);
  const failPuani = puanlar.get(olay.fail) ?? 0;
  const digerMax = Math.max(0, ...[...puanlar.entries()].filter(([k]) => k !== olay.fail).map(([, p]) => p));
  const cozulebilir = supheliler.includes(olay.fail) && failPuani >= COZUM_ESIGI && failPuani > digerMax;
  if (!cozulebilir) notlar.push(`Fail puanı ${failPuani}, en yakın rakip ${digerMax}; meşru sinyaller faili ayırt etmiyor.`);

  // Zorluk
  const fail = vaka.kisiler.find((k) => k.id === olay.fail)!;
  let zorluk = 0.3;
  const kacamak = !sinyaller.some((s) => s.tur === 'delil-celiskisi' && s.hedef === olay.fail);
  if (kacamak) { zorluk += 0.2; notlar.push('Fail olay yerinde olduğunu kabul ediyor (kaçamak); delil çelişkisi yok.'); }
  if (!citGecerli) { zorluk += 0.15; notlar.push('Yöntem ayrıntısı sızmış; gizli bilgi testi geçersiz.'); }
  if (sorgu.durum.sirKatmani.korumalar.some((c) => c.korunan === olay.fail)) { zorluk += 0.15; notlar.push('Faili koruyan biri var.'); }
  if (sinyaller.some((s) => s.tur === 'gorgu-tanigi')) { zorluk -= 0.2; notlar.push('Koruması olmayan görgü tanığı var.'); }
  if (supheliler.length > 1) { zorluk += 0.1; notlar.push(`Olay odasında izi olan ${supheliler.length} kişi var.`); }
  if (fail.yalanBecerisi > 0.7) zorluk += 0.1;
  if (sorgu.deliller.some((d) => d.tur === 'dijital' && d.gosterir.tur === 'konum' && d.gosterir.kisi === olay.fail && d.gosterir.dilim === olay.dilim)) zorluk -= 0.1;
  zorluk = Math.min(0.95, Math.max(0.05, Math.round(zorluk * 100) / 100));

  return { sucVar: true, supheliler, sinyaller, cozulebilir, tekCozum: cozulebilir, zorluk, notlar };
}

/** Seed'den çözülebilir vaka üretir; gerekirse `${seed}#n` türevlerini dener (deterministik). */
export function vakaUretCozulebilir(seed: string | number, enFazlaDeneme = 10): { vaka: Vaka; rapor: CozulebilirlikRaporu; deneme: number } {
  let son: { vaka: Vaka; rapor: CozulebilirlikRaporu; deneme: number } | null = null;
  for (let i = 1; i <= enFazlaDeneme; i++) {
    const vaka = vakaUret(i === 1 ? seed : `${seed}#${i}`);
    const rapor = cozulebilirlikDenetle(sorguBaslat(vaka));
    son = { vaka, rapor, deneme: i };
    if (rapor.cozulebilir) return son;
  }
  return son!;
}

// ---------------------------------------------------------------------------------------------
// Örüntü denetçisi

export interface OzellikKorelasyonu { ad: string; r: number }
export interface OruntuRaporu {
  ozellikler: OzellikKorelasyonu[];
  enBuyukMutlakR: number;
  delilSayisiKestirmesiDogrulugu: number;
  ilkKisiDogrulugu: number;
  sonKisiDogrulugu: number;
  kisiSayisi: number;
}

function pearson(x: number[], y: number[]): number {
  const n = x.length;
  const mx = x.reduce((a, b) => a + b, 0) / n;
  const my = y.reduce((a, b) => a + b, 0) / n;
  let sxy = 0, sxx = 0, syy = 0;
  for (let i = 0; i < n; i++) { const dx = x[i]! - mx, dy = y[i]! - my; sxy += dx * dy; sxx += dx * dx; syy += dy * dy; }
  return sxx === 0 || syy === 0 ? 0 : sxy / Math.sqrt(sxx * syy);
}

export function oruntuDenetle(vakalar: Vaka[]): OruntuRaporu {
  const ozellikAdlari = ['sira', 'kaygi', 'disadonukluk', 'ozIzleme', 'telkineYatkinlik', 'yalanBecerisi', 'yas', 'kadin', 'iliskiSayisi', 'borclu', 'alacakli', 'sirVar', 'kurbanSicakligi'];
  const sutunlar = new Map<string, number[]>(ozellikAdlari.map((a) => [a, []]));
  const failBayragi: number[] = [];
  let delilDogru = 0, ilkDogru = 0, sonDogru = 0, sucVaka = 0;
  for (const vaka of vakalar) {
    if (!vaka.olay.fail) continue;
    sucVaka++;
    const sorgu = sorguBaslat(vaka);
    const sirlar = sirlarUret(vaka).sirlar;
    const adaylar = vaka.kisiler.filter((k) => k.id !== vaka.olay.kurban);
    adaylar.forEach((k, i) => {
      failBayragi.push(k.id === vaka.olay.fail ? 1 : 0);
      const kurbanIliskisi = vaka.iliskiler.find((r) => (r.a === k.id && r.b === vaka.olay.kurban) || (r.b === k.id && r.a === vaka.olay.kurban));
      const deger: Record<string, number> = {
        sira: i / Math.max(1, adaylar.length - 1),
        kaygi: k.kisilik.kaygi, disadonukluk: k.kisilik.disadonukluk, ozIzleme: k.kisilik.ozIzleme, telkineYatkinlik: k.kisilik.telkineYatkinlik,
        yalanBecerisi: k.yalanBecerisi, yas: k.yas, kadin: k.cinsiyet === 'kadin' ? 1 : 0,
        iliskiSayisi: vaka.iliskiler.filter((r) => r.a === k.id || r.b === k.id).length,
        borclu: vaka.borclar.some((b) => b.borclu === k.id) ? 1 : 0,
        alacakli: vaka.borclar.some((b) => b.alacakli === k.id) ? 1 : 0,
        sirVar: sirlar.some((s) => s.kisi === k.id) ? 1 : 0,
        kurbanSicakligi: kurbanIliskisi?.sicaklik ?? 0,
      };
      for (const ad of ozellikAdlari) sutunlar.get(ad)!.push(deger[ad]!);
    });
    // Kestirmeler
    const delilSayisi = new Map(adaylar.map((k) => [k.id, sorgu.deliller.filter((d) => d.gosterir.tur === 'konum' && d.gosterir.kisi === k.id).length]));
    const enCok = [...delilSayisi.entries()].reduce((a, b) => (b[1] > a[1] ? b : a));
    if (enCok[0] === vaka.olay.fail) delilDogru++;
    if (adaylar[0]!.id === vaka.olay.fail) ilkDogru++;
    if (adaylar[adaylar.length - 1]!.id === vaka.olay.fail) sonDogru++;
  }
  const ozellikler = ozellikAdlari.map((ad) => ({ ad, r: pearson(sutunlar.get(ad)!, failBayragi) }));
  return {
    ozellikler,
    enBuyukMutlakR: Math.max(...ozellikler.map((o) => Math.abs(o.r))),
    delilSayisiKestirmesiDogrulugu: delilDogru / sucVaka,
    ilkKisiDogrulugu: ilkDogru / sucVaka,
    sonKisiDogrulugu: sonDogru / sucVaka,
    kisiSayisi: failBayragi.length,
  };
}
