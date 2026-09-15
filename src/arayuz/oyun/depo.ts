// Oyun deposu: motor katmanlarını tek bir oyun akışında birleştirir; React'ten bağımsızdır.
//
// Ekranlar: baslik → vaka-acilis → sorgu / pano / kilavuz ↔ → suclama → analiz.
// Depo mutasyona dayalıdır (Sorgu içindeki Map'ler değişir); her eylem sonunda aboneler bildirilir,
// React tarafı `useSyncExternalStore` ile sürüm sayacını izler. Kayıt (K-011): JSON dışa/içe aktarma;
// içe aktarımda vaka seed'den yeniden üretilir, yalan defteri ve sorgu kayıtları geri yüklenir.
import { vakaUret } from '@motor/gerceklik';
import { vakaUretCozulebilir, type CozulebilirlikRaporu } from '@motor/cozulebilirlik';
import { betimlemeMetni, cevapMetni, kisiKarti, uslupUret, vakaBrifingi, VaryantBellegi, type KisiUslubu } from '@motor/dil';
import { puanla, type PuanRaporu, type Suclama } from '@motor/puan';
import type { Cevap, Soru } from '@motor/strateji';
import { sor, sorguBaslat, teknikUygula, delilGoster as motorDelilGoster, type Sorgu, type TeknikParametreleri, type TeknikSonucu } from '@motor/teknik';
import type { Kisi, KisiId, Vaka } from '@motor/tipler';
import { ICERIK } from '@icerik/index';
import { bulunma } from '@ortak/turkce';
import { PROJE } from '@ortak/surum';
import { FORER } from '@icerik/forer';
import { soruMetni, teknikSonucMetni } from './metinler';

export type Ekran = 'baslik' | 'forer' | 'vaka-acilis' | 'sorgu' | 'pano' | 'suclama' | 'analiz' | 'kilavuz';
export type PanoTuru = 'gozlem' | 'cikarim' | 'hipotez' | 'olmayan';

export interface KonusmaKaydi {
  tur: 'soru' | 'teknik';
  soru: string;
  cevap: string;
  betimleme: string;
  ipucuIdler: string[];
  /** Tıklanabilir betimlemeler: her biri katalogdaki bir ipucuya bağlanır (İpucu kartı). */
  gozlemler: { ipucuId: string; betimleme: string }[];
  teknikId?: string;
}

export interface PanoDurumu { gozlem: string[]; cikarim: string[]; hipotez: string[]; olmayan: string[] }

export interface ForerDurumu { tamamlandi: boolean; puan: number | null; asama: 'sorular' | 'profil' | 'ifsa' }

export interface VakaGecmisi { seed: string; dogru: boolean; puan: number; hataEtiketleri: string[]; brier: number }

export interface OyunDurumu {
  ekran: Ekran;
  kahramanAdi: string;
  sorgu: Sorgu | null;
  rapor: CozulebilirlikRaporu | null;
  brifing: string;
  kisiKartlari: { id: KisiId; metin: string }[];
  seciliKisi: KisiId | null;
  konusmalar: Map<KisiId, KonusmaKaydi[]>;
  pano: PanoDurumu;
  zaman: number;
  zamanButcesi: number;
  suclama: Suclama | null;
  puan: PuanRaporu | null;
  gercekAnlatimi: string;
  gecmis: VakaGecmisi[];
  kilavuzMaddesi: string | null;
  forer: ForerDurumu;
  surum: number;
}

const HIPOTEZ_LIMITI = 7;
const SORU_MALIYETI = 0.5;
const VARSAYILAN_BUTCE = 12;
const KAYIT_SURUMU = 1;

function bosPano(): PanoDurumu { return { gozlem: [], cikarim: [], hipotez: [], olmayan: [] }; }

function baslangicDurumu(): OyunDurumu {
  return {
    ekran: 'baslik', kahramanAdi: '', sorgu: null, rapor: null, brifing: '', kisiKartlari: [], seciliKisi: null,
    konusmalar: new Map(), pano: bosPano(), zaman: 0, zamanButcesi: VARSAYILAN_BUTCE, suclama: null, puan: null,
    gercekAnlatimi: '', gecmis: [], kilavuzMaddesi: null, forer: { tamamlandi: false, puan: null, asama: 'sorular' }, surum: 0,
  };
}

export class OyunDeposu {
  durum: OyunDurumu = baslangicDurumu();

  /** Her şeyi başlangıca döndürür (Sıfırla düğmesi, testler). */
  sifirla() {
    this.durum = baslangicDurumu();
    this.usluplar = new Map();
    this.bellek = new VaryantBellegi();
    this.cevapMetinleri = new Map();
    this.bildir();
  }
  private aboneler = new Set<() => void>();
  private usluplar = new Map<KisiId, KisiUslubu>();
  private bellek = new VaryantBellegi();
  /** Aynı (kişi, soru) için aynı cümle: kişi tekrar sorulunca aynı sözcüklerle cevap verir (defter tutarlılığı metne kadar). */
  private cevapMetinleri = new Map<string, string>();

  abone(fn: () => void): () => void {
    this.aboneler.add(fn);
    return () => this.aboneler.delete(fn);
  }

  private bildir() {
    this.durum = { ...this.durum, surum: this.durum.surum + 1 };
    for (const fn of this.aboneler) fn();
  }

  get vaka(): Vaka | null { return this.durum.sorgu?.durum.vaka ?? null; }

  basla(kahramanAdi: string) {
    this.durum.kahramanAdi = kahramanAdi.trim() || 'Okuyucu';
    if (this.durum.ekran === 'baslik' && !this.durum.sorgu) this.durum.ekran = 'baslik';
    this.bildir();
  }

  /** Yeni (çözülebilir) vaka kurar; seed verilmezse zaman damgasından üretir. */
  yeniVaka(seed?: string | number) {
    const { vaka, rapor } = vakaUretCozulebilir(seed ?? `vaka-${Date.now()}`);
    this.kur(sorguBaslat(vaka), rapor);
    this.durum.ekran = 'vaka-acilis';
    this.bildir();
  }

  private kur(sorgu: Sorgu, rapor: CozulebilirlikRaporu | null) {
    const vaka = sorgu.durum.vaka;
    this.usluplar = new Map(vaka.kisiler.map((k) => [k.id, uslupUret(vaka, k.id)]));
    this.bellek = new VaryantBellegi();
    this.cevapMetinleri = new Map();
    this.durum = {
      ...this.durum, sorgu, rapor, brifing: vakaBrifingi(vaka),
      kisiKartlari: vaka.kisiler.map((k) => ({ id: k.id, metin: kisiKarti(vaka, k.id) })),
      seciliKisi: null, konusmalar: new Map(), pano: bosPano(), zaman: sorgu.zaman, suclama: null, puan: null, gercekAnlatimi: '', kilavuzMaddesi: null,
    };
  }

  ekranaGit(ekran: Ekran) {
    this.durum.ekran = ekran;
    this.bildir();
  }

  kilavuzAc(maddeId: string | null) {
    this.durum.kilavuzMaddesi = maddeId;
    this.durum.ekran = 'kilavuz';
    this.bildir();
  }

  gorusulebilirler(): Kisi[] {
    const vaka = this.vaka;
    if (!vaka) return [];
    return vaka.kisiler.filter((k) => k.hayatta && k.id !== vaka.olay.kurban);
  }

  kisiSec(kisiId: KisiId) {
    this.durum.seciliKisi = kisiId;
    this.durum.ekran = 'sorgu';
    this.bildir();
  }

  private kayitEkle(kisiId: KisiId, kayit: KonusmaKaydi) {
    const liste = this.durum.konusmalar.get(kisiId) ?? [];
    liste.push(kayit);
    this.durum.konusmalar.set(kisiId, liste);
  }

  private cevapKaydi(kisiId: KisiId, cevap: Cevap, ipuclari: { ipucuId: string; betimleme: string }[], soruMetin: string): KonusmaKaydi {
    const vaka = this.vaka!;
    const anahtar = `${kisiId}|${JSON.stringify(cevap.soru)}`;
    let metin = this.cevapMetinleri.get(anahtar);
    if (!metin) { metin = cevapMetni(vaka, cevap, this.usluplar.get(kisiId)!, this.bellek); this.cevapMetinleri.set(anahtar, metin); }
    return {
      tur: 'soru', soru: soruMetin,
      cevap: metin,
      betimleme: betimlemeMetni(ipuclari as never),
      ipucuIdler: ipuclari.map((g) => g.ipucuId),
      gozlemler: ipuclari.map((g) => ({ ipucuId: g.ipucuId, betimleme: g.betimleme })),
    };
  }

  /** Seçili kişiye soru sorar; suçlama sonrası kapalı. */
  sor(soru: Soru): boolean {
    const { sorgu, seciliKisi, puan } = this.durum;
    if (!sorgu || !seciliKisi || puan) return false;
    const s = sor(sorgu, seciliKisi, soru);
    sorgu.zaman += SORU_MALIYETI;
    this.kayitEkle(seciliKisi, this.cevapKaydi(seciliKisi, s.cevap, s.ipuclari, soruMetni(soru, sorgu.durum.vaka, seciliKisi)));
    this.durum.zaman = sorgu.zaman;
    this.bildir();
    return true;
  }

  /** Delili seçili kişiye gösterir (SUE dışı, "erken gösterme" tuzağı dahil). */
  delilGoster(delilId: string) {
    const { sorgu, seciliKisi } = this.durum;
    if (!sorgu || !seciliKisi) return;
    motorDelilGoster(sorgu, seciliKisi, delilId);
    const delil = sorgu.deliller.find((d) => d.id === delilId)!;
    this.kayitEkle(seciliKisi, { tur: 'teknik', teknikId: 'delil-goster', soru: 'Delili gösterdin.', cevap: delil.aciklama, betimleme: '', ipucuIdler: [], gozlemler: [] });
    this.bildir();
  }

  /** Tekniği uygular, sonucu döndürür (kayıt düşer). */
  teknikSonucu(teknikId: string, p: TeknikParametreleri = {}): TeknikSonucu | null {
    const { sorgu, seciliKisi, puan } = this.durum;
    if (!sorgu || !seciliKisi || puan) return null;
    const vaka = sorgu.durum.vaka;
    const teknik = ICERIK.teknikler.find((t) => t.id === teknikId);
    if (!teknik) return null;
    const sonuc = teknikUygula(sorgu, seciliKisi, teknikId, p);
    const kayit: KonusmaKaydi = { tur: 'teknik', teknikId, soru: teknik.ad, cevap: teknikSonucMetni(sonuc, vaka), betimleme: '', ipucuIdler: [], gozlemler: [] };
    // Anlatım içeren teknikler cevap satırlarını da döker.
    if (sonuc.teknik === 'acik-uclu-anlatim' || sonuc.teknik === 'bilissel-yuk-ters-sira') {
      const satirlar = sonuc.anlatim.map((a) => `[${vaka.dilimler[(a.cevap.soru as { dilim: number }).dilim]!.baslangic}] ${cevapMetni(vaka, a.cevap, this.usluplar.get(seciliKisi)!, this.bellek)}`);
      kayit.cevap = `${kayit.cevap} ${satirlar.join(' ')}`;
      const hepsi = sonuc.anlatim.flatMap((a) => a.ipuclari);
      kayit.betimleme = betimlemeMetni(hepsi);
      kayit.ipucuIdler = hepsi.map((g) => g.ipucuId);
      kayit.gozlemler = hepsi.map((g) => ({ ipucuId: g.ipucuId, betimleme: g.betimleme }));
    } else if (sonuc.teknik === 'temel-cizgi') {
      kayit.gozlemler = sonuc.gozlemler.map((g) => ({ ipucuId: g.ipucuId, betimleme: g.betimleme }));
    } else if (sonuc.teknik === 'yonlendirici-soru') {
      kayit.cevap = `${cevapMetni(vaka, sonuc.sonuc.cevap, this.usluplar.get(seciliKisi)!, this.bellek)} — ${kayit.cevap}`;
      kayit.betimleme = betimlemeMetni(sonuc.sonuc.ipuclari);
      kayit.gozlemler = sonuc.sonuc.ipuclari.map((g) => ({ ipucuId: g.ipucuId, betimleme: g.betimleme }));
    } else if (sonuc.teknik === 'sue') {
      kayit.cevap = `Önce anlattı: "${cevapMetni(vaka, sonuc.once.cevap, this.usluplar.get(seciliKisi)!, this.bellek)}" ${kayit.cevap}`;
      kayit.betimleme = betimlemeMetni(sonuc.once.ipuclari);
      kayit.gozlemler = sonuc.once.ipuclari.map((g) => ({ ipucuId: g.ipucuId, betimleme: g.betimleme }));
    }
    this.kayitEkle(seciliKisi, kayit);
    this.durum.zaman = sorgu.zaman;
    this.bildir();
    return sonuc;
  }

  teknik(teknikId: string, p: TeknikParametreleri = {}): boolean {
    return this.teknikSonucu(teknikId, p) !== null;
  }

  panoEkle(tur: PanoTuru, metin: string): boolean {
    const temiz = metin.trim();
    if (!temiz) return false;
    if (tur === 'hipotez' && this.durum.pano.hipotez.length >= HIPOTEZ_LIMITI) return false;
    this.durum.pano[tur].push(temiz);
    this.bildir();
    return true;
  }

  panoSil(tur: PanoTuru, indeks: number) {
    this.durum.pano[tur].splice(indeks, 1);
    this.bildir();
  }

  suclamaYap(suclama: Suclama) {
    const { sorgu } = this.durum;
    if (!sorgu) return;
    const puan = puanla(sorgu, suclama, { zamanButcesi: this.durum.zamanButcesi });
    this.durum.suclama = suclama;
    this.durum.puan = puan;
    this.durum.gercekAnlatimi = this.gercegiAnlat();
    this.durum.gecmis.push({ seed: sorgu.durum.vaka.seed, dogru: puan.dogru, puan: puan.puan, hataEtiketleri: puan.hataEtiketleri, brier: puan.kalibrasyon.brier });
    this.durum.ekran = 'analiz';
    this.bildir();
  }

  /** Vaka sonu: gerçeğin anlatımı (fail, motivasyon, herkesin olay anındaki gerçek durumu ve sakladığı). */
  private gercegiAnlat(): string {
    const sorgu = this.durum.sorgu!;
    const { vaka } = sorgu.durum;
    const { olay } = vaka;
    const odaAd = vaka.mekan.odalar.find((o) => o.id === olay.oda)!.ad;
    const saat = vaka.dilimler[olay.dilim]!.baslangic;
    const kurban = vaka.kisiler.find((k) => k.id === olay.kurban)!;
    const parcalar: string[] = [];
    if (!olay.fail) parcalar.push(`Suç yoktu. ${kurban.ad} ${saat} civarı ${bulunma(odaAd)} bir kaza geçirdi (${olay.yontem}).`);
    else {
      const fail = vaka.kisiler.find((k) => k.id === olay.fail)!;
      parcalar.push(`Fail: ${fail.ad}. ${saat} civarı ${bulunma(odaAd)}, yöntem: ${olay.yontem}. Motivasyon: ${olay.motivasyon}.`);
    }
    for (const k of vaka.kisiler) {
      if (!k.hayatta || k.id === olay.kurban) continue;
      const konum = vaka.zamanCizelgesi.find((z) => z.kisi === k.id && z.dilim === olay.dilim)!;
      const sir = sorgu.durum.sirKatmani.sirlar.find((s) => s.kisi === k.id);
      const koruma = sorgu.durum.sirKatmani.korumalar.filter((c) => c.koruyan === k.id).map((c) => vaka.kisiler.find((x) => x.id === c.korunan)!.ad.split(' ')[0]);
      const cevap = sorgu.durum.defter.get(`${k.id}|konum:${k.id}:${olay.dilim}`);
      const notlar = [`${k.ad}: olay anında ${bulunma(vaka.mekan.odalar.find((o) => o.id === konum.oda)!.ad)}, ${konum.eylem}.`];
      if (sir) notlar.push(`Sakladığı: ${sir.aciklama}.`);
      if (koruma.length) notlar.push(`Koruduğu: ${koruma.join(', ')}.`);
      if (cevap) notlar.push(`Sana verdiği cevabın aslı: ${cevap.not}.`);
      parcalar.push(notlar.join(' '));
    }
    if (sorgu.kontaminasyon.length) parcalar.push(`Kirlettiğin ifadeler: ${sorgu.kontaminasyon.map((c) => `${vaka.kisiler.find((k) => k.id === c.kisi)!.ad.split(' ')[0]} (${c.teknik})`).join(', ')}.`);
    return parcalar.join('\n');
  }

  /** Kör nokta profili: geçmiş vakalarda biriken hata etiketleri (sayıya göre). */
  korNoktalar(): { etiket: string; sayi: number }[] {
    const sayac = new Map<string, number>();
    for (const g of this.durum.gecmis) for (const e of g.hataEtiketleri) sayac.set(e, (sayac.get(e) ?? 0) + 1);
    return [...sayac.entries()].map(([etiket, sayi]) => ({ etiket, sayi })).sort((a, b) => b.sayi - a.sayi);
  }

  // ---------------------------------------------------------------------------------------------
  // Forer tutorial'ı (TASARIM §13): cevaplar ne olursa olsun herkes aynı profili alır; ders ifşada.

  forerBasla() {
    this.durum.forer = { ...this.durum.forer, asama: 'sorular' };
    this.durum.ekran = 'forer';
    this.bildir();
  }

  /** "Analiz" üretir: cevaplardan bağımsız, Forer'in 13 maddesi. Cevaplar kasıtlı olarak kullanılmaz. */
  forerCevapla(_cevaplar: string[]): string[] {
    this.durum.forer = { ...this.durum.forer, asama: 'profil' };
    this.bildir();
    return [...FORER.profil];
  }

  forerPuanla(puan: number) {
    const kirpik = Math.max(1, Math.min(5, Math.round(puan)));
    this.durum.forer = { tamamlandi: true, puan: kirpik, asama: 'ifsa' };
    this.bildir();
  }

  forerBitir() {
    this.durum.forer = { ...this.durum.forer, tamamlandi: true };
    this.durum.ekran = this.durum.sorgu ? 'vaka-acilis' : 'baslik';
    this.bildir();
  }

  // ---------------------------------------------------------------------------------------------
  // Kayıt (K-011)

  disaAktar(): string {
    const d = this.durum;
    const s = d.sorgu;
    return JSON.stringify({
      kayitSurumu: KAYIT_SURUMU, oyun: PROJE.surum, kahramanAdi: d.kahramanAdi, ekran: d.ekran, zamanButcesi: d.zamanButcesi, forer: d.forer,
      seed: s?.durum.vaka.seed ?? null, seciliKisi: d.seciliKisi,
      konusmalar: [...d.konusmalar.entries()], pano: d.pano, suclama: d.suclama, puan: d.puan, gercekAnlatimi: d.gercekAnlatimi, gecmis: d.gecmis,
      sorgu: s ? {
        defter: [...s.durum.defter.entries()], gosterilen: [...s.gosterilen.entries()].map(([k, v]) => [k, [...v]]),
        kontaminasyon: s.kontaminasyon, stres: [...s.stres.entries()], zaman: s.zaman, gecmis: s.gecmis,
      } : null,
    });
  }

  iceAktar(json: string): boolean {
    try {
      const v = JSON.parse(json);
      if (!v || v.kayitSurumu !== KAYIT_SURUMU) return false;
      this.durum = { ...this.durum, kahramanAdi: String(v.kahramanAdi ?? 'Okuyucu'), zamanButcesi: Number(v.zamanButcesi ?? VARSAYILAN_BUTCE), gecmis: Array.isArray(v.gecmis) ? v.gecmis : [], forer: v.forer ?? { tamamlandi: false, puan: null, asama: 'sorular' } };
      if (v.seed && v.sorgu) {
        const sorgu = sorguBaslat(vakaUret(v.seed));
        sorgu.durum.defter = new Map(v.sorgu.defter);
        sorgu.gosterilen = new Map((v.sorgu.gosterilen as [string, string[]][]).map(([k, arr]) => [k, new Set(arr)]));
        sorgu.kontaminasyon = v.sorgu.kontaminasyon ?? [];
        sorgu.stres = new Map(v.sorgu.stres ?? []);
        sorgu.zaman = Number(v.sorgu.zaman ?? 0);
        sorgu.gecmis = v.sorgu.gecmis ?? [];
        this.kur(sorgu, null);
        this.durum.konusmalar = new Map(((v.konusmalar ?? []) as [string, KonusmaKaydi[]][]).map(([k, liste]) => [k, liste.map((x) => ({ ...x, gozlemler: x.gozlemler ?? [] }))]));
        this.durum.pano = { ...bosPano(), ...(v.pano ?? {}) };
        this.durum.suclama = v.suclama ?? null;
        this.durum.puan = v.puan ?? null;
        this.durum.gercekAnlatimi = v.gercekAnlatimi ?? '';
        this.durum.seciliKisi = v.seciliKisi ?? null;
        this.durum.zaman = sorgu.zaman;
      }
      this.durum.ekran = v.ekran === 'forer' ? 'baslik' : ((v.ekran as Ekran) ?? (this.durum.sorgu ? 'vaka-acilis' : 'baslik'));
      this.bildir();
      return true;
    } catch {
      return false;
    }
  }
}
