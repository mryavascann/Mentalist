// Oyun deposu: motor katmanlarını tek bir oyun akışında birleştirir; React'ten bağımsızdır.
//
// Ekranlar: baslik → vaka-acilis → sorgu / pano / kilavuz ↔ → suclama → analiz.
// Depo mutasyona dayalıdır (Sorgu içindeki Map'ler değişir); her eylem sonunda aboneler bildirilir,
// React tarafı `useSyncExternalStore` ile sürüm sayacını izler. Kayıt (K-011): JSON dışa/içe aktarma;
// içe aktarımda vaka seed'den yeniden üretilir, yalan defteri ve sorgu kayıtları geri yüklenir.
import { vakaUret } from '@motor/gerceklik';
import type { CozulebilirlikRaporu } from '@motor/cozulebilirlik';
import { hedeflerdenAyar, vakaUretHedefli, type VakaHedefi } from '@motor/adaptif';
import { betimlemeMetni, cevapMetni, kisiKarti, uslupUret, vakaBrifingi, VaryantBellegi, type KisiUslubu } from '@motor/dil';
import { puanla, type PuanRaporu, type Suclama } from '@motor/puan';
import type { Cevap, Soru } from '@motor/strateji';
import { sor, sorguBaslat, teknikUygula, delilGoster as motorDelilGoster, type Sorgu, type TeknikParametreleri, type TeknikSonucu } from '@motor/teknik';
import type { Kisi, KisiId, Vaka, Zorluk } from '@motor/tipler';
import { ICERIK } from '@icerik/index';
import { bulunma } from '@ortak/turkce';
import { PROJE } from '@ortak/surum';
import { Rastgele } from '@ortak/rastgele';
import { FORER } from '@icerik/forer';
import { MINI_OYUNLAR, sogukOkumaPuanla, lindaPuanla, offBeatPuanla, inceDilimPuanla, ciftKorPuanla } from '@icerik/mini_oyunlar';
import { soruMetni, teknikSonucMetni } from './metinler';
import { takimYorumu, watsonSorusu, type TakimYorumu } from './takim';

export type Ekran = 'baslik' | 'forer' | 'tatbikat' | 'vaka-acilis' | 'sorgu' | 'pano' | 'watson' | 'suclama' | 'analiz' | 'kilavuz';

export interface WatsonAdimi { tur: PanoTuru; metin: string; soru: string; cevap?: { sinif: 'gozlem' | 'cikarim' | 'hipotez'; testEdildi: boolean } }
export interface WatsonDurumu { adimlar: WatsonAdimi[]; indeks: number; bitti: boolean; celiskiler: string[]; testEdilmemisCikarim: string[] }
export type TatbikatId = 'kor-secim' | 'soguk-okuma' | 'taban-orani' | 'linda' | 'off-beat' | 'ince-dilim' | 'cift-kor';

export interface TatbikatSonucu { tamamlandi: boolean; puan: number | null; secim?: string }

export interface TatbikatDurumu { aktif: TatbikatId | null; sonuclar: Partial<Record<TatbikatId, TatbikatSonucu>> }
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
  /** Takım NPC yorumu (varsa). Sosyal kanıt tuzağı: yorum kanıt değildir. */
  takimYorumu?: TakimYorumu;
}

export interface PanoDurumu { gozlem: string[]; cikarim: string[]; hipotez: string[]; olmayan: string[] }

export interface ForerDurumu { tamamlandi: boolean; puan: number | null; asama: 'sorular' | 'profil' | 'ifsa' }

/** Analiz tablosu: her kişinin olay anı için söylediği vs gerçek (ifade türü adıyla). */
export interface IfadeKarsilastirma {
  kisi: KisiId;
  ad: string;
  /** Oyuncuya söylediği oda adı; sorulmadıysa null. */
  ifade: string | null;
  gercek: string;
  /** src/icerik ifade türü adı (ör. "Gömülü yalan"); sorulmadıysa "sorulmadı". */
  etiket: string;
  soruldu: boolean;
}

/** Kanepe molasında takımın getirdiği not (TASARIM §3 adım 5). */
export interface TakimNotu { tur: 'delil' | 'dedikodu' | 'bos'; metin: string; zaman: number }

export interface VakaGecmisi { seed: string; dogru: boolean; puan: number; hataEtiketleri: string[]; brier: number }

export interface OyunDurumu {
  ekran: Ekran;
  kahramanAdi: string;
  sorgu: Sorgu | null;
  rapor: CozulebilirlikRaporu | null;
  /** Bu vakada kör noktaya göre bilinçli olarak sağlanan yapısal hedefler (oyuncuya vaka sonunda açıklanır). */
  hedefler: VakaHedefi[];
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
  ifadeKarsilastirma: IfadeKarsilastirma[];
  /** Temel çizgi tekniğinin kişi başına kalıcı notu (kişi kartında görünür). */
  temelCizgiNotlari: Map<KisiId, string>;
  gecmis: VakaGecmisi[];
  kilavuzMaddesi: string | null;
  forer: ForerDurumu;
  tatbikat: TatbikatDurumu;
  /** Takım yorumları açık mı (oyuncu kapatabilir). */
  takimAcik: boolean;
  /** "Watson'a anlat" akışı (oturumluk; kayıtla taşınmaz). */
  watson: WatsonDurumu;
  /** Kanepe molalarında biriken takım notları. */
  takimNotlari: TakimNotu[];
  /** Sonraki vakaların zorluğu (kullanıcı seçer; varsayılan orta). */
  zorluk: Zorluk;
  surum: number;
}

const HIPOTEZ_LIMITI = 7;
const SORU_MALIYETI = 0.5;
const VARSAYILAN_BUTCE = 12;
const KAYIT_SURUMU = 1;

function bosPano(): PanoDurumu { return { gozlem: [], cikarim: [], hipotez: [], olmayan: [] }; }

function baslangicDurumu(): OyunDurumu {
  return {
    ekran: 'baslik', kahramanAdi: '', sorgu: null, rapor: null, hedefler: [], brifing: '', kisiKartlari: [], seciliKisi: null,
    konusmalar: new Map(), pano: bosPano(), zaman: 0, zamanButcesi: VARSAYILAN_BUTCE, suclama: null, puan: null,
    gercekAnlatimi: '', ifadeKarsilastirma: [], temelCizgiNotlari: new Map(), gecmis: [], kilavuzMaddesi: null, forer: { tamamlandi: false, puan: null, asama: 'sorular' }, tatbikat: { aktif: null, sonuclar: {} }, takimAcik: true, watson: { adimlar: [], indeks: 0, bitti: false, celiskiler: [], testEdilmemisCikarim: [] }, takimNotlari: [], zorluk: 'orta', surum: 0,
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
  // ---------------------------------------------------------------------------------------------
  // "Watson'a anlat" (TASARIM §9): pano maddelerini sorgucuya adım adım anlat; sınıflamanı panoyla kıyasla.

  watsonBasla(): boolean {
    const { pano } = this.durum;
    const turler: PanoTuru[] = ['gozlem', 'cikarim', 'hipotez', 'olmayan'];
    const adimlar: WatsonAdimi[] = [];
    for (const tur of turler) pano[tur].forEach((metin, i) => adimlar.push({ tur, metin, soru: watsonSorusu(tur, metin, i) }));
    if (adimlar.length === 0) return false;
    this.durum.watson = { adimlar, indeks: 0, bitti: false, celiskiler: [], testEdilmemisCikarim: [] };
    this.durum.ekran = 'watson';
    this.bildir();
    return true;
  }

  watsonCevapla(cevap: { sinif: 'gozlem' | 'cikarim' | 'hipotez'; testEdildi: boolean }) {
    const w = this.durum.watson;
    const adim = w.adimlar[w.indeks];
    if (!adim || w.bitti) return;
    adim.cevap = cevap;
    // Pano sütunu ile oyuncunun sınıflaması: "olmayan" gözlem sayılır. Çıkarımı gözlem sanmak = Priory Okulu hatası.
    const beklenen = adim.tur === 'olmayan' ? 'gozlem' : adim.tur;
    if (cevap.sinif !== beklenen) w.celiskiler.push(adim.metin);
    if (adim.tur === 'cikarim' && !cevap.testEdildi) w.testEdilmemisCikarim.push(adim.metin);
    w.indeks++;
    if (w.indeks >= w.adimlar.length) w.bitti = true;
    this.durum.watson = { ...w };
    this.bildir();
  }

  watsonKapat() {
    this.durum.watson = { adimlar: [], indeks: 0, bitti: false, celiskiler: [], testEdilmemisCikarim: [] };
    this.durum.ekran = 'pano';
    this.bildir();
  }

  /**
   * Kanepe molası (TASARIM §3 adım 5): zaman 1 saat ilerler, takım yeni bir not getirir.
   * Not, oyuncunun henüz "fark etmediği" bir delil (yokluk/belge) ya da bilgi katmanından bir dedikodudur;
   * dedikodu yanlış olabilir (bellek uyumu) ve bu söylenmez. Gizli etiket sızmaz.
   */
  kanepeMolasi(): boolean {
    const { sorgu, puan } = this.durum;
    if (!sorgu || puan) return false;
    sorgu.zaman += 1;
    const r = new Rastgele(`${sorgu.durum.vaka.seed}/kanepe/${this.durum.takimNotlari.length}`);
    const vaka = sorgu.durum.vaka;
    const anlatilan = new Set(this.durum.takimNotlari.map((n) => n.metin));
    const delilAdaylari = sorgu.deliller.filter((d) => (d.tur === 'olmayan' || d.tur === 'belge' || d.tur === 'dijital') && !anlatilan.has(`Takım olay yerinde şunu not etmiş: ${d.aciklama}`));
    const dedikodular = sorgu.durum.dagilim.bilgiler.filter((b) => b.kaynak === 'dedikodu' && b.konu === 'konum');
    let not_: TakimNotu;
    if (delilAdaylari.length > 0 && (dedikodular.length === 0 || r.sans(0.6))) {
      const d = r.sec(delilAdaylari);
      not_ = { tur: 'delil', metin: `Takım olay yerinde şunu not etmiş: ${d.aciklama}`, zaman: sorgu.zaman };
    } else if (dedikodular.length > 0) {
      const b = r.sec(dedikodular);
      const kim = vaka.kisiler.find((k) => k.id === b.kisi)!.ad.split(' ')[0];
      const hedef = vaka.kisiler.find((k) => k.id === b.hedefKisi)!.ad.split(' ')[0];
      const oda = vaka.mekan.odalar.find((o) => o.id === b.icerik)!.ad;
      const saat = vaka.dilimler[b.hedefDilim!]!.baslangic;
      not_ = { tur: 'dedikodu', metin: `Koridorda konuşulan: ${kim}, ${hedef} için "${saat} civarı ${oda} tarafındaydı" demiş. Duyum; doğrula.`, zaman: sorgu.zaman };
    } else {
      not_ = { tur: 'bos', metin: 'Takım yeni bir şey getirmedi. Panoyu dağıt, hipotezleri yeniden sırala.', zaman: sorgu.zaman };
    }
    this.durum.takimNotlari = [...this.durum.takimNotlari, not_];
    this.durum.zaman = sorgu.zaman;
    this.bildir();
    return true;
  }

  takimAcKapat(acik: boolean) {
    this.durum.takimAcik = acik;
    this.bildir();
  }

  zorlukSec(zorluk: Zorluk) {
    this.durum.zorluk = zorluk;
    this.bildir();
  }

  yeniVaka(seed?: string | number) {
    // Adaptif üretim: kör nokta profili → yapısal hedefler (fark ettirmeden; Ericsson 1993 bilinçli pratik).
    const hedefler = hedeflerdenAyar(this.korNoktalar());
    const { vaka, rapor, saglananHedefler } = vakaUretHedefli(seed ?? `vaka-${Date.now()}`, hedefler, { zorluk: this.durum.zorluk });
    this.kur(sorguBaslat(vaka), rapor);
    this.durum.hedefler = saglananHedefler;
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
      seciliKisi: null, konusmalar: new Map(), pano: bosPano(), zaman: sorgu.zaman, suclama: null, puan: null, gercekAnlatimi: '', ifadeKarsilastirma: [], temelCizgiNotlari: new Map(), takimNotlari: [], kilavuzMaddesi: null,
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
    const kayit = this.cevapKaydi(seciliKisi, s.cevap, s.ipuclari, soruMetni(soru, sorgu.durum.vaka, seciliKisi));
    if (this.durum.takimAcik) { const y = takimYorumu(sorgu, seciliKisi, s); if (y) kayit.takimYorumu = y; }
    this.kayitEkle(seciliKisi, kayit);
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
      this.durum.temelCizgiNotlari.set(seciliKisi, sonuc.gozlemler.length === 0 ? 'Normali: sakin, akıcı.' : `Normali: ${sonuc.gozlemler.map((g) => g.betimleme).join(' ')}`);
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
    this.durum.ifadeKarsilastirma = this.ifadeleriKarsilastir();
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

  /** Olay anı için herkesin söylediği vs gerçek; ifade türü adıyla (anlatım abartısı / bellek uyumu / gömülü yalan dersi). */
  private ifadeleriKarsilastir(): IfadeKarsilastirma[] {
    const sorgu = this.durum.sorgu!;
    const { vaka } = sorgu.durum;
    const { olay } = vaka;
    const odaAdi = (id: string | null) => (id ? vaka.mekan.odalar.find((o) => o.id === id)?.ad ?? id : null);
    const turAdi = (id: string) => ICERIK.ifadeTurleri.find((t) => t.id === id)?.ad ?? id;
    return vaka.kisiler
      .filter((k) => k.hayatta && k.id !== olay.kurban)
      .map((k) => {
        const cevap = sorgu.durum.defter.get(`${k.id}|konum:${k.id}:${olay.dilim}`);
        const gercek = odaAdi(vaka.zamanCizelgesi.find((z) => z.kisi === k.id && z.dilim === olay.dilim)!.oda)!;
        return cevap
          ? { kisi: k.id, ad: k.ad, ifade: odaAdi(cevap.icerik), gercek, etiket: turAdi(cevap.ifadeTuru), soruldu: true }
          : { kisi: k.id, ad: k.ad, ifade: null, gercek, etiket: 'sorulmadı', soruldu: false };
      });
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
  // Tatbikatlar / mini oyunlar (TASARIM §13): kısa, anında geri bildirimli.

  tatbikatAc(id: TatbikatId) {
    this.durum.tatbikat = { ...this.durum.tatbikat, aktif: id };
    this.durum.ekran = 'tatbikat';
    this.bildir();
  }

  tatbikatKapat() {
    this.durum.tatbikat = { ...this.durum.tatbikat, aktif: null };
    this.durum.ekran = this.durum.sorgu ? (this.durum.puan ? 'analiz' : 'vaka-acilis') : 'baslik';
    this.bildir();
  }

  private tatbikatSonuc(id: TatbikatId, sonuc: TatbikatSonucu) {
    this.durum.tatbikat = { ...this.durum.tatbikat, sonuclar: { ...this.durum.tatbikat.sonuclar, [id]: sonuc } };
    this.bildir();
  }

  /** Kör seçim: hangi profili "ben" diye seçtiği kaydedilir; puan yok (ders ifşada). */
  korSecimBitir(profilId: string) {
    this.tatbikatSonuc('kor-secim', { tamamlandi: true, puan: null, secim: profilId });
  }

  /** Soğuk okuma dedektörü: çoklu etiket puanı. */
  sogukOkumaBitir(secimler: Record<string, string[]>) {
    const r = sogukOkumaPuanla(secimler);
    this.tatbikatSonuc('soguk-okuma', { tamamlandi: true, puan: r.puan });
    return r;
  }

  /** Taban oranı: doğru seçenek 1, yanlış 0. */
  tabanOraniBitir(secenekId: string): boolean {
    const dogru = MINI_OYUNLAR.tabanOrani.secenekler.find((s) => s.id === secenekId)?.dogru === true;
    this.tatbikatSonuc('taban-orani', { tamamlandi: true, puan: dogru ? 1 : 0, secim: secenekId });
    return dogru;
  }

  /** Linda tuzağı: çift başına doğru +1 (birleşim yanılgısı). */
  lindaBitir(secimler: Record<string, string>) {
    const r = lindaPuanla(secimler);
    this.tatbikatSonuc('linda', { tamamlandi: true, puan: r.puan });
    return r;
  }

  /** Kaybolan top / off-beat: üç soru, doğru +1. */
  offBeatBitir(secimler: Record<string, string>) {
    const r = offBeatPuanla(secimler);
    this.tatbikatSonuc('off-beat', { tamamlandi: true, puan: r.puan });
    return r;
  }

  /** İnce dilim: kişilik boyutları puanlanır; yalan sorusunda 'bilinemez' dışındaki cevap aşırı genellemedir. */
  inceDilimBitir(secimler: Record<string, Record<string, string>>) {
    const r = inceDilimPuanla(secimler);
    this.tatbikatSonuc('ince-dilim', { tamamlandi: true, puan: r.puan });
    return r;
  }

  /** Çift kör test tasarla: gerekli madde +1, tuzak −1. */
  ciftKorBitir(secilen: string[]) {
    const r = ciftKorPuanla(secilen);
    this.tatbikatSonuc('cift-kor', { tamamlandi: true, puan: r.puan });
    return r;
  }

  // ---------------------------------------------------------------------------------------------
  // Kayıt (K-011)

  disaAktar(): string {
    const d = this.durum;
    const s = d.sorgu;
    return JSON.stringify({
      kayitSurumu: KAYIT_SURUMU, oyun: PROJE.surum, kahramanAdi: d.kahramanAdi, ekran: d.ekran, zamanButcesi: d.zamanButcesi, forer: d.forer, zorluk: d.zorluk, takimAcik: d.takimAcik, tatbikat: { aktif: null, sonuclar: d.tatbikat.sonuclar },
      seed: s?.durum.vaka.seed ?? null, seciliKisi: d.seciliKisi,
      konusmalar: [...d.konusmalar.entries()], pano: d.pano, suclama: d.suclama, puan: d.puan, gercekAnlatimi: d.gercekAnlatimi, ifadeKarsilastirma: d.ifadeKarsilastirma, temelCizgiNotlari: [...d.temelCizgiNotlari.entries()], takimNotlari: d.takimNotlari, gecmis: d.gecmis,
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
      this.durum = { ...this.durum, kahramanAdi: String(v.kahramanAdi ?? 'Okuyucu'), zamanButcesi: Number(v.zamanButcesi ?? VARSAYILAN_BUTCE), gecmis: Array.isArray(v.gecmis) ? v.gecmis : [], forer: v.forer ?? { tamamlandi: false, puan: null, asama: 'sorular' }, zorluk: (v.zorluk as Zorluk) ?? 'orta', tatbikat: { aktif: null, sonuclar: v.tatbikat?.sonuclar ?? {} }, takimAcik: v.takimAcik ?? true };
      if (v.seed && v.sorgu) {
        const sorgu = sorguBaslat(vakaUret(v.seed, { zorluk: (v.zorluk as Zorluk) ?? 'orta' }));
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
        this.durum.ifadeKarsilastirma = v.ifadeKarsilastirma ?? [];
        this.durum.temelCizgiNotlari = new Map(v.temelCizgiNotlari ?? []);
        this.durum.takimNotlari = v.takimNotlari ?? [];
        this.durum.seciliKisi = v.seciliKisi ?? null;
        this.durum.zaman = sorgu.zaman;
      }
      this.durum.ekran = v.ekran === 'forer' || v.ekran === 'tatbikat' ? 'baslik' : v.ekran === 'watson' ? 'pano' : ((v.ekran as Ekran) ?? (this.durum.sorgu ? 'vaka-acilis' : 'baslik'));
      this.bildir();
      return true;
    } catch {
      return false;
    }
  }
}
