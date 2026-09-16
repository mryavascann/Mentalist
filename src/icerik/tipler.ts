// İçerik şemaları.
//
// Oyunun bilimsel iddiaları koda gömülmez; src/icerik altındaki JSON kütüklerinde yaşar ve
// bu tiplerle okunur. Her kayıt kaynaklıdır (K-004: `kaynak` alanı kaynaklar.json'daki id'dir)
// ve kanıt düzeyi rozeti taşır. Doğrulama kuralları dogrula.ts'de; testler tests/icerik altında.

/** Kanıt düzeyi rozeti. Kılavuz'da ve ipucu kartlarında görünür. */
export type KanitDuzeyi = 'guclu' | 'orta' | 'zayif' | 'mit';

/** Davranış ipucunun kanalı. */
export type Kanal = 'sozel' | 'vokal' | 'yuz' | 'beden' | 'fizyolojik' | 'genel';

/** İpucunun yalanla ilişkisinin yönü. etkiBuyuklugu işaretiyle tutarlı olmalı. */
export type IpucuYonu = 'yalanda_artar' | 'yalanda_azalir' | 'iliskisiz';

/** Kaynak kütüğü kaydı: kısa id → NOTLAR.md başlığı ve dosya. */
export interface KaynakKaydi {
  /** Kanonik kısa ad, ör. "DePaulo 2003". İçerikteki `kaynak` alanları buna işaret eder. */
  id: string;
  /** Tam künye. */
  baslik: string;
  tur: 'kitap' | 'makale' | 'diger';
  /** docs/kaynaklar/NOTLAR.md'de bu kaynağın başlığında geçen ayırt edici alt metin. */
  notlarBaslikAnahtar: string;
  /** docs/kaynaklar/mentaldocs altındaki dosya adı (varsa). */
  dosya?: string;
}

/**
 * Davranış ipucu kataloğu kaydı.
 * Motor ipucunu olasılıkla üretir; masumlar da üretir. Oyuncu için "kanıt" değil "hotspot"tur.
 */
export interface IpucuKaydi {
  id: string;
  ad: string;
  kanal: Kanal;
  /** Aynı davranış için metin varyantları; tekrar hissini kırmak için en az 3. */
  betimlemeler: string[];
  /**
   * Temel çizgi sohbeti için alışkanlık dilinde varyantlar ("Sohbette de göz temasından kaçınıyor").
   * Sorgu betimlemeleri anlatım/soru odaklıdır ("tersini ima etti"); tarafsız sohbette tuhaf kaçar.
   */
  temelBetimlemeler?: string[];
  /** Meta-analiz etki büyüklüğü (Cohen d). Pozitif: yalancılarda daha çok. */
  etkiBuyuklugu: number;
  yon: IpucuYonu;
  /**
   * Betimlenen DAVRANIŞ yalanda artar mı, azalır mı? `yon` ham d işaretidir; bazı kayıtlar davranışın
   * yokluğunu betimler (ör. "detay azlığı" d=-.30 ama betimlenen azlık yalanda ARTAR). Simülasyon bunu kullanır.
   */
  betimlemeYonu: 'artar' | 'azalir' | 'iliskisiz';
  /** Etkiyi güçlendiren koşullar (d cinsinden alternatif değer). */
  kosullar?: {
    /** Kimlik/itibar motivasyonu yüksekken. */
    motivasyon?: number;
    /** İhlal (suç) hakkındaki yalanlarda. */
    ihlal?: number;
    /** Plansız yalanlarda. */
    plansiz?: number;
    /** Etkileşimli görüşmede. */
    etkilesim?: number;
  };
  kanitDuzeyi: KanitDuzeyi;
  kaynak: string[];
  /** Sınırlar, çelişen bulgular, kültürel/kişisel uyarılar. */
  not?: string;
}

/** İfade türü (her cümlenin gizli etiketi), TASARIM §6. */
export interface IfadeTuru {
  id: string;
  ad: string;
  aciklama: string;
  ornek: string;
  kaynak: string[];
}

/**
 * Oyuncu aracı / soru türü. `etkiler` motorun simülasyon parametreleridir (0–1, tasarım değeri),
 * kaynak bulgusunun kendisi değil; bulgu Kılavuz maddesinde anlatılır.
 */
export interface Teknik {
  id: string;
  ad: string;
  aciklama: string;
  /** Oyuncuya kısa kullanım talimatı. */
  nasil: string;
  sinirlari: string;
  kilavuzMaddesi: string;
  kaynak: string[];
  maliyet: {
    /** Soruşturma saati cinsinden (tasarım değeri). */
    zaman: number;
  };
  etkiler: {
    /** Ne kadar yeni bilgi getirir. */
    bilgi: number;
    /** Tanığın anısını kirletme riski. */
    kontaminasyon: number;
    /** Kişide yarattığı stres (masumda da). */
    stres: number;
    /** Sahte itiraf riskini artırma. */
    itirafBaskisi: number;
  };
}

/** Kılavuz maddesi. */
export interface KilavuzMaddesi {
  id: string;
  /** Bölüm kimliği (TASARIM §12). */
  bolum: string;
  baslik: string;
  ozet: string;
  nasilKullanilir: string;
  sinirlari: string;
  kanitDuzeyi: KanitDuzeyi;
  kaynak: string[];
  iliskiliTeknikler?: string[];
}

/** Vaka sonu analizinde kullanılan hata/yanlılık etiketi. */
export interface HataEtiketi {
  id: string;
  ad: string;
  aciklama: string;
  kilavuzMaddesi: string;
  kaynak: string[];
  /** Funder RAM katmanı: 1 ilgisiz, 2 erişilemez, 3 fark edilmedi, 4 yanlış yorumlandı. */
  ramKatmani?: 1 | 2 | 3 | 4;
}

/** Tüm içerik kütükleri bir arada. */
export interface TumIcerik {
  kaynaklar: KaynakKaydi[];
  ipuclari: IpucuKaydi[];
  ifadeTurleri: IfadeTuru[];
  teknikler: Teknik[];
  kilavuz: KilavuzMaddesi[];
  hataEtiketleri: HataEtiketi[];
}
