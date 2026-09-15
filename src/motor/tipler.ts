// Motorun çekirdek tipleri.
//
// Mimari ilke (TASARIM §4): "önce gerçek, sonra ifadeler". Buradaki tipler vakanın GERÇEĞİNİ
// tanımlar: kim, nerede, ne zaman, ne yaptı; kim kime ne borçlu; ne oldu. İfadeler, ipuçları
// ve oyuncunun gördükleri bu gerçekten türetilir ve ona karşı test edilir.
// Bu dosya UI'dan bağımsızdır ve src/arayuz'u asla ithal etmez (K-005).

export type KisiId = string;
export type OdaId = string;

/** Mekân türü; her vaka farklı mekânda geçebilir (K-008). Higgsfield arka planlarıyla eşlenir. */
export type MekanTuru =
  | 'malikane'
  | 'ofis'
  | 'sahil-evi'
  | 'ciftlik'
  | 'hastane'
  | 'motel'
  | 'karnaval'
  | 'apartman';

export interface Oda {
  id: OdaId;
  ad: string;
}

export interface Mekan {
  ad: string;
  tur: MekanTuru;
  /** İsim havuzunu belirler: Türkiye'de kurgusal bir yer mi, yurtdışı mı. */
  ulke: 'TR' | 'yurtdisi';
  odalar: Oda[];
}

/** Kişilik parametreleri; hepsi 0–1. Davranış üretimi ve temel çizgi buradan beslenir. */
export interface Kisilik {
  /** Dışadönüklük: konuşkanlık, jest sıklığı, göz teması temel çizgisi. */
  disadonukluk: number;
  /** Kaygı eğilimi: masum olsa da gerginlik üretir (Othello hatası kaynağı). */
  kaygi: number;
  /** Öz-izleme: yüksekse izlenim yönetimi güçlü, okunması zor (Funder "iyi hedef" tersi). */
  ozIzleme: number;
  /** Telkine yatkınlık: yönlendirici sorulara ve sahte anıya açıklık (Lynn 2015, Loftus). */
  telkineYatkinlik: number;
}

export interface Kisi {
  id: KisiId;
  ad: string;
  yas: number;
  cinsiyet: 'kadin' | 'erkek';
  /** Kurbanla ilişkisinin oyuncuya görünen kısa tarifi ("iş ortağı", "komşu"). */
  rol: string;
  hayatta: boolean;
  kisilik: Kisilik;
  /** Vrij 2010'un "iyi yalancı" özelliklerinin tek sayıya indirgenmiş hali (0–1). */
  yalanBecerisi: number;
}

export type IliskiTuru = 'aile' | 'es' | 'sevgili' | 'is' | 'arkadas' | 'rakip' | 'tanidik';

export interface Iliski {
  a: KisiId;
  b: KisiId;
  tur: IliskiTuru;
  /** -1 düşmanca … +1 sıcak. */
  sicaklik: number;
}

/** Borç grafiği: karşılıklılık ilkesi (Cialdini) → koruma yalanlarını yordar. */
export interface Borc {
  alacakli: KisiId;
  borclu: KisiId;
  tur: 'iyilik' | 'para' | 'sir';
  /** 0–1: ne kadar bağlayıcı. */
  agirlik: number;
}

export type OlayTuru = 'cinayet' | 'hirsizlik' | 'sabotaj' | 'kaza';

export interface OlayCekirdegi {
  tur: OlayTuru;
  kurban: KisiId;
  /** Suç yoksa (kaza) null. */
  fail: KisiId | null;
  /** Zaman dilimi indeksi (0..DILIM_SAYISI-1). */
  dilim: number;
  oda: OdaId;
  yontem: string;
  /** Failin gerçek motivasyonu; suç yoksa boş. */
  motivasyon: string;
}

/** Bir kişinin bir zaman dilimindeki gerçek konumu ve eylemi. */
export interface Konum {
  kisi: KisiId;
  dilim: number;
  oda: OdaId;
  eylem: string;
}

export interface ZamanDilimi {
  index: number;
  /** "HH:MM" biçiminde başlangıç saati. */
  baslangic: string;
}

/** Zorluk seviyesi: sızıntı oranı, kaçamak eşiği, korkuyla susan tanık, sahnelenmiş delil buna bağlı. */
export type Zorluk = 'kolay' | 'orta' | 'zor';

export interface VakaAyari {
  zorluk: Zorluk;
}

/** Zorluk seviyesine göre üretim parametreleri (tek yerde; katmanlar buradan okur). */
export const ZORLUK_PARAMETRELERI: Record<Zorluk, {
  /** Yöntemin basına sızma olasılığı (CIT'i geçersiz kılar). */
  sizmaOlasiligi: number;
  /** Failin olay yerinde olduğunu kabul edip eylemi saklama (kaçamak) eşiği: yalanBecerisi bu değerin üstündeyse. */
  kacamakEsigi: number;
  /** Görgü tanığının failden korkup susma olasılığı. */
  korkuOlasiligi: number;
  /** Failin masuma sahnelenmiş delil yerleştirme olasılığı. */
  sahnelemeOlasiligi: number;
}> = {
  kolay: { sizmaOlasiligi: 0.15, kacamakEsigi: 0.85, korkuOlasiligi: 0, sahnelemeOlasiligi: 0 },
  orta: { sizmaOlasiligi: 0.35, kacamakEsigi: 0.7, korkuOlasiligi: 0.2, sahnelemeOlasiligi: 0.2 },
  zor: { sizmaOlasiligi: 0.55, kacamakEsigi: 0.45, korkuOlasiligi: 0.6, sahnelemeOlasiligi: 0.6 },
};

/** Vakanın gerçeği. İfadeler ve ipuçları bunun üstüne sonraki katmanlarda eklenir. */
export interface Vaka {
  seed: string;
  ayar: VakaAyari;
  /** Vaka arketipi (src/motor/arketipler.ts). Renk verir; çözüm anahtarı değildir. */
  arketip: string;
  mekan: Mekan;
  kisiler: Kisi[];
  iliskiler: Iliski[];
  borclar: Borc[];
  dilimler: ZamanDilimi[];
  zamanCizelgesi: Konum[];
  olay: OlayCekirdegi;
}
