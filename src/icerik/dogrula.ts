// İçerik doğrulayıcı.
//
// JSON kütükleri elle yazılır; bu modül onları şemaya, kaynak kütüğüne ve bilimsel tutarlılık
// kurallarına karşı denetler. Hata listesi döner (boş liste = temiz). Her hata mesajı ilgili
// kaydın id'sini içerir ki test çıktısından doğrudan bulunabilsin.
// Aynı fonksiyon runtime'da (geliştirme modunda) da çağrılabilir.
import type { IpucuKaydi, KanitDuzeyi, TumIcerik } from './tipler';

export const KANIT_DUZEYLERI: readonly KanitDuzeyi[] = ['guclu', 'orta', 'zayif', 'mit'];
const KANALLAR = new Set(['sozel', 'vokal', 'yuz', 'beden', 'fizyolojik', 'genel']);
const YONLER = new Set(['yalanda_artar', 'yalanda_azalir', 'iliskisiz']);

/** |d| bu eşiğin altındaysa ipucu "ilişkisiz" sayılmalı (DePaulo 2003'te .01–.09 aralığı). */
const ILISKISIZ_ESIGI = 0.1;

function boslukDegil(deger: unknown): deger is string {
  return typeof deger === 'string' && deger.trim().length > 0;
}

/** Zorunlu metin alanlarını denetler. */
function metinAlanlari(kayit: Record<string, unknown>, alanlar: string[], etiket: string, hatalar: string[]) {
  for (const alan of alanlar) {
    if (!boslukDegil(kayit[alan])) hatalar.push(`${etiket}: "${alan}" alanı boş veya eksik`);
  }
}

/** Kaynak listesi: en az bir eleman ve her biri kütükte olmalı. */
function kaynakDenetle(kaynak: unknown, kutuk: Set<string>, etiket: string, hatalar: string[]) {
  if (!Array.isArray(kaynak) || kaynak.length === 0) {
    hatalar.push(`${etiket}: kaynak listesi boş`);
    return;
  }
  for (const k of kaynak) {
    if (!kutuk.has(String(k))) hatalar.push(`${etiket}: kaynak kütüğünde bulunamadı → "${k}"`);
  }
}

function kanitDenetle(deger: unknown, etiket: string, hatalar: string[]) {
  if (!KANIT_DUZEYLERI.includes(deger as KanitDuzeyi)) {
    hatalar.push(`${etiket}: geçersiz kanıt düzeyi "${deger}"`);
  }
}

function benzersizIdler(kayitlar: { id: string }[], koleksiyon: string, hatalar: string[]) {
  const gorulen = new Set<string>();
  for (const k of kayitlar) {
    if (!boslukDegil(k.id)) hatalar.push(`${koleksiyon}: id'si boş kayıt var`);
    else if (gorulen.has(k.id)) hatalar.push(`${koleksiyon}: yinelenen id "${k.id}"`);
    gorulen.add(k.id);
  }
}

/** İpucu yönü ile etki büyüklüğü işaretinin tutarlılığı (bilimsel sadakat testi). */
function ipucuYonDenetle(i: IpucuKaydi, etiket: string, hatalar: string[]) {
  if (typeof i.etkiBuyuklugu !== 'number' || !Number.isFinite(i.etkiBuyuklugu)) {
    hatalar.push(`${etiket}: etkiBuyuklugu sayı değil`);
    return;
  }
  if (Math.abs(i.etkiBuyuklugu) > 2) hatalar.push(`${etiket}: etkiBuyuklugu makul aralık dışında (|d|>2)`);
  if (!YONLER.has(i.yon)) {
    hatalar.push(`${etiket}: geçersiz yön "${i.yon}"`);
    return;
  }
  const d = i.etkiBuyuklugu;
  if (i.yon === 'yalanda_artar' && d <= 0) hatalar.push(`${etiket}: yön "yalanda_artar" ama d=${d} ≤ 0 (yön/işaret çelişkisi)`);
  if (i.yon === 'yalanda_azalir' && d >= 0) hatalar.push(`${etiket}: yön "yalanda_azalir" ama d=${d} ≥ 0 (yön/işaret çelişkisi)`);
  if (i.yon === 'iliskisiz' && Math.abs(d) > ILISKISIZ_ESIGI) hatalar.push(`${etiket}: yön "iliskisiz" ama |d|=${Math.abs(d)} > ${ILISKISIZ_ESIGI}`);
}

/** Tüm içeriği doğrular; hata mesajları listesi döner (boş = temiz). */
export function dogrulaIcerik(icerik: TumIcerik): string[] {
  const hatalar: string[] = [];
  const kutuk = new Set(icerik.kaynaklar.map((k) => k.id));
  const kilavuzIdler = new Set(icerik.kilavuz.map((m) => m.id));

  benzersizIdler(icerik.kaynaklar, 'kaynaklar', hatalar);
  for (const k of icerik.kaynaklar) {
    metinAlanlari(k as unknown as Record<string, unknown>, ['id', 'baslik', 'notlarBaslikAnahtar'], `kaynak ${k.id}`, hatalar);
    if (!['kitap', 'makale', 'diger'].includes(k.tur)) hatalar.push(`kaynak ${k.id}: geçersiz tür "${k.tur}"`);
  }

  benzersizIdler(icerik.ipuclari, 'ipuclari', hatalar);
  for (const i of icerik.ipuclari) {
    const e = `ipucu ${i.id}`;
    metinAlanlari(i as unknown as Record<string, unknown>, ['id', 'ad'], e, hatalar);
    if (!KANALLAR.has(i.kanal)) hatalar.push(`${e}: geçersiz kanal "${i.kanal}"`);
    if (!Array.isArray(i.betimlemeler) || i.betimlemeler.length < 3) hatalar.push(`${e}: en az 3 betimleme varyantı gerekli`);
    ipucuYonDenetle(i, e, hatalar);
    if (!['artar', 'azalir', 'iliskisiz'].includes(i.betimlemeYonu)) hatalar.push(`${e}: geçersiz betimlemeYonu "${i.betimlemeYonu}"`);
    else if ((i.yon === 'iliskisiz') !== (i.betimlemeYonu === 'iliskisiz')) hatalar.push(`${e}: yön "${i.yon}" ile betimlemeYonu "${i.betimlemeYonu}" çelişiyor (ilişkisizlik eşleşmeli)`);
    kanitDenetle(i.kanitDuzeyi, e, hatalar);
    kaynakDenetle(i.kaynak, kutuk, e, hatalar);
    if (i.kosullar) {
      for (const [ad, deger] of Object.entries(i.kosullar)) {
        if (typeof deger !== 'number' || !Number.isFinite(deger)) hatalar.push(`${e}: koşul "${ad}" sayı değil`);
      }
    }
  }

  benzersizIdler(icerik.ifadeTurleri, 'ifadeTurleri', hatalar);
  for (const t of icerik.ifadeTurleri) {
    const e = `ifade türü ${t.id}`;
    metinAlanlari(t as unknown as Record<string, unknown>, ['id', 'ad', 'aciklama', 'ornek'], e, hatalar);
    kaynakDenetle(t.kaynak, kutuk, e, hatalar);
  }

  benzersizIdler(icerik.teknikler, 'teknikler', hatalar);
  for (const t of icerik.teknikler) {
    const e = `teknik ${t.id}`;
    metinAlanlari(t as unknown as Record<string, unknown>, ['id', 'ad', 'aciklama', 'nasil', 'sinirlari', 'kilavuzMaddesi'], e, hatalar);
    if (!kilavuzIdler.has(t.kilavuzMaddesi)) hatalar.push(`${e}: Kılavuz maddesi bulunamadı → "${t.kilavuzMaddesi}"`);
    kaynakDenetle(t.kaynak, kutuk, e, hatalar);
    if (!t.maliyet || typeof t.maliyet.zaman !== 'number' || t.maliyet.zaman < 0) hatalar.push(`${e}: maliyet.zaman geçersiz`);
    const etkiler = t.etkiler ?? ({} as Record<string, unknown>);
    for (const alan of ['bilgi', 'kontaminasyon', 'stres', 'itirafBaskisi'] as const) {
      const v = (etkiler as Record<string, unknown>)[alan];
      if (typeof v !== 'number' || v < 0 || v > 1) hatalar.push(`${e}: etkiler.${alan} 0–1 aralığında olmalı`);
    }
  }

  benzersizIdler(icerik.kilavuz, 'kilavuz', hatalar);
  for (const m of icerik.kilavuz) {
    const e = `kılavuz ${m.id}`;
    metinAlanlari(m as unknown as Record<string, unknown>, ['id', 'bolum', 'baslik', 'ozet', 'nasilKullanilir', 'sinirlari'], e, hatalar);
    kanitDenetle(m.kanitDuzeyi, e, hatalar);
    kaynakDenetle(m.kaynak, kutuk, e, hatalar);
    if (m.bolum === 'mitler-muzesi' && m.kanitDuzeyi !== 'mit') hatalar.push(`${e}: Mitler Müzesi maddesi "mit" düzeyinde olmalı`);
    for (const t of m.iliskiliTeknikler ?? []) {
      if (!icerik.teknikler.some((x) => x.id === t)) hatalar.push(`${e}: ilişkili teknik bulunamadı → "${t}"`);
    }
  }

  benzersizIdler(icerik.hataEtiketleri, 'hataEtiketleri', hatalar);
  for (const h of icerik.hataEtiketleri) {
    const e = `hata etiketi ${h.id}`;
    metinAlanlari(h as unknown as Record<string, unknown>, ['id', 'ad', 'aciklama', 'kilavuzMaddesi'], e, hatalar);
    if (!kilavuzIdler.has(h.kilavuzMaddesi)) hatalar.push(`${e}: Kılavuz maddesi bulunamadı → "${h.kilavuzMaddesi}"`);
    kaynakDenetle(h.kaynak, kutuk, e, hatalar);
    if (h.ramKatmani !== undefined && ![1, 2, 3, 4].includes(h.ramKatmani)) hatalar.push(`${e}: ramKatmani 1–4 olmalı`);
  }

  return hatalar;
}
