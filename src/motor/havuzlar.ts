// İçerik havuzları: isimler, mekânlar, odalar, eylemler, motivasyon şablonları.
// Şimdilik TypeScript sabitleri; büyüdükçe src/icerik JSON'a taşınabilir.
// İsimler özgün; dizi karakter adları bilinçli olarak yok (K-007 notu).
import type { IliskiTuru, MekanTuru, OlayTuru } from './tipler';

export const TR_KADIN_ADLARI = [
  'Nazlı', 'Defne', 'Selin', 'Ece', 'Zeynep', 'Melis', 'İpek', 'Ceren', 'Elif', 'Yasemin',
  'Aylin', 'Beren', 'Damla', 'Gökçe', 'Hande', 'Lale', 'Nehir', 'Pelin', 'Sude', 'Tuğçe',
];
export const TR_ERKEK_ADLARI = [
  'Kerem', 'Tolga', 'Barış', 'Emre', 'Cem', 'Onur', 'Sinan', 'Levent', 'Kaan', 'Ozan',
  'Ferhat', 'Halil', 'Mert', 'Nihat', 'Serkan', 'Tarık', 'Uğur', 'Volkan', 'Yiğit', 'Arda',
];
export const TR_SOYADLARI = [
  'Aksoy', 'Demirel', 'Kaya', 'Yıldırım', 'Şahin', 'Erdem', 'Kurt', 'Öztürk', 'Polat', 'Taş',
  'Uçar', 'Vural', 'Yalçın', 'Zengin', 'Bozkurt', 'Çelik', 'Duran', 'Güneş', 'Karaca', 'Sezer',
];
export const YABANCI_KADIN_ADLARI = [
  'Clara', 'Margot', 'Elena', 'Ingrid', 'Sofia', 'Vera', 'Nora', 'Lydia', 'Helen', 'Agnes',
  'Beatrice', 'Miriam', 'Greta', 'Iris', 'Rosalind',
];
export const YABANCI_ERKEK_ADLARI = [
  'Victor', 'Elias', 'Julian', 'Tobias', 'Marcus', 'Felix', 'Oscar', 'Rupert', 'Silas', 'Anton',
  'Casper', 'Dorian', 'Hugo', 'Leon', 'Martin',
];
export const YABANCI_SOYADLARI = [
  'Hale', 'Whitmore', 'Lindqvist', 'Moreau', 'Baxter', 'Kessler', 'Ashford', 'Delgado', 'Fenwick', 'Ostrowski',
  'Pembrook', 'Rainer', 'Sorensen', 'Thorne', 'Voss',
];

export interface MekanSablonu {
  tur: MekanTuru;
  ulke: 'TR' | 'yurtdisi';
  adlar: string[];
  odalar: string[];
}

export const MEKAN_SABLONLARI: MekanSablonu[] = [
  { tur: 'malikane', ulke: 'TR', adlar: ['Karaca Köşkü', 'Yalçın Yalısı', 'Sezer Malikânesi'], odalar: ['Salon', 'Kütüphane', 'Mutfak', 'Bahçe', 'Çalışma Odası', 'Üst Kat Koridoru', 'Garaj'] },
  { tur: 'ofis', ulke: 'TR', adlar: ['Vural Holding 12. Kat', 'Duran Mimarlık', 'Aksoy Reklam'], odalar: ['Açık Ofis', 'Toplantı Odası', 'Yönetici Odası', 'Mutfak', 'Arşiv', 'Merdiven Boşluğu'] },
  { tur: 'sahil-evi', ulke: 'TR', adlar: ['Ayvalık Sahil Evi', 'Datça Yazlığı', 'Foça Taş Ev'], odalar: ['Teras', 'Oturma Odası', 'Mutfak', 'İskele', 'Yatak Odası', 'Kayıkhane'] },
  { tur: 'ciftlik', ulke: 'TR', adlar: ['Işık Yolu Çiftliği', 'Sessiz Vadi Topluluğu'], odalar: ['Toplantı Salonu', 'Yemekhane', 'Ahır', 'Sera', 'Liderin Evi', 'Misafirhane', 'Tarla Yolu'] },
  { tur: 'hastane', ulke: 'TR', adlar: ['Kuzey Şehir Hastanesi 4. Kat', 'Marmara Özel Hastanesi'], odalar: ['Hemşire Bankosu', 'Oda 412', 'Eczane', 'Doktor Odası', 'Koridor', 'Merdiven', 'Acil Servis'] },
  { tur: 'motel', ulke: 'yurtdisi', adlar: ['Blue Pine Motel', 'Route 9 Motor Inn'], odalar: ['Resepsiyon', 'Oda 7', 'Oda 8', 'Otopark', 'Havuz Başı', 'Çamaşırhane'] },
  { tur: 'karnaval', ulke: 'yurtdisi', adlar: ['Harlequin Gezici Lunapark', 'Silvermoon Karnavalı'], odalar: ['Ana Çadır', 'Karavan Alanı', 'Aynalı Ev', 'Bilet Gişesi', 'Jeneratör Sahası', 'Hayvan Kafesleri'] },
  { tur: 'apartman', ulke: 'yurtdisi', adlar: ['Ashford Apartmanı', 'Lindqvist Court'], odalar: ['Daire 3B', 'Daire 4A', 'Lobi', 'Çatı Katı', 'Bodrum', 'Yangın Merdiveni'] },
];

/** Odalara göre sıradan eylemler; zaman çizelgesi betimlemesi için. */
export const EYLEMLER: string[] = [
  'telefonla konuşuyordu', 'bir şeyler okuyordu', 'içki hazırlıyordu', 'sigara içiyordu', 'biriyle tartışıyordu',
  'dinleniyordu', 'eşya topluyordu', 'bilgisayarda çalışıyordu', 'pencereden dışarı bakıyordu', 'yemek yiyordu',
  'kimseyle konuşmadan bekliyordu', 'müzik dinliyordu', 'notlar alıyordu', 'kapının önünde volta atıyordu',
];

export interface IliskiSablonu {
  tur: IliskiTuru;
  agirlik: number;
  roller: string[];
}

export const ILISKI_SABLONLARI: IliskiSablonu[] = [
  { tur: 'aile', agirlik: 18, roller: ['kardeşi', 'yeğeni', 'kuzeni', 'üvey çocuğu', 'annesi', 'babası'] },
  { tur: 'es', agirlik: 10, roller: ['eşi'] },
  { tur: 'sevgili', agirlik: 10, roller: ['sevgilisi', 'eski sevgilisi'] },
  { tur: 'is', agirlik: 20, roller: ['iş ortağı', 'çalışanı', 'muhasebecisi', 'avukatı', 'asistanı'] },
  { tur: 'arkadas', agirlik: 16, roller: ['yakın arkadaşı', 'çocukluk arkadaşı', 'komşusu'] },
  { tur: 'rakip', agirlik: 12, roller: ['iş rakibi', 'eski ortağı', 'davalısı'] },
  { tur: 'tanidik', agirlik: 14, roller: ['misafiri', 'kiracısı', 'bahçıvanı', 'şoförü', 'terapisti'] },
];

/**
 * Rol kuralları: rol, kişinin yaşı/cinsiyetiyle ve kurbanın yaşıyla çelişmemeli ("25 yaşında erkek, annesi" olmaz).
 * Kural yoksa rol serbesttir. Meslek rolleri için alt yaş; ebeveyn/çocuk için yön ve en az 16 yıl fark.
 */
const ROL_KOSULLARI: Record<string, (kisi: { yas: number; cinsiyet: 'kadin' | 'erkek' }, kurban: { yas: number }) => boolean> = {
  annesi: (k, v) => k.cinsiyet === 'kadin' && k.yas - v.yas >= 16,
  babası: (k, v) => k.cinsiyet === 'erkek' && k.yas - v.yas >= 16,
  'üvey çocuğu': (k, v) => v.yas - k.yas >= 16,
  yeğeni: (k, v) => v.yas - k.yas >= 10,
  kardeşi: (k, v) => Math.abs(k.yas - v.yas) <= 25,
  kuzeni: (k, v) => Math.abs(k.yas - v.yas) <= 25,
  'çocukluk arkadaşı': (k, v) => Math.abs(k.yas - v.yas) <= 8,
  avukatı: (k) => k.yas >= 27,
  muhasebecisi: (k) => k.yas >= 27,
  terapisti: (k) => k.yas >= 27,
  'iş ortağı': (k) => k.yas >= 23,
  'eski ortağı': (k) => k.yas >= 25,
  asistanı: (k) => k.yas <= 50,
  çalışanı: (k) => k.yas <= 65,
  şoförü: (k) => k.yas <= 65,
};

/** Bir vakada yalnızca bir kişide olabilecek roller (kurbanın iki annesi, iki avukatı olmaz). */
export const TEKIL_ROLLER: readonly string[] = ['annesi', 'babası', 'eşi', 'avukatı', 'muhasebecisi', 'terapisti', 'şoförü', 'asistanı', 'bahçıvanı', 'sevgilisi'];

/** Kurbanla aynı soyadı taşıyan roller. */
export const SOYADI_ORTAK_ROLLER: readonly string[] = ['annesi', 'babası', 'kardeşi'];

/** Şablonun bu kişi için uygun rolleri (yaş/cinsiyet kuralı + vakada daha önce kullanılmış tekil roller hariç); hiçbiri uymazsa nötr "yakını". */
export function uygunRoller(sablon: { roller: string[] }, kisi: { yas: number; cinsiyet: 'kadin' | 'erkek' }, kurban: { yas: number }, kullanilan: ReadonlySet<string> = new Set()): string[] {
  const uygun = sablon.roller.filter((rol) => (ROL_KOSULLARI[rol]?.(kisi, kurban) ?? true) && !(TEKIL_ROLLER.includes(rol) && kullanilan.has(rol)));
  return uygun.length ? uygun : ['yakını'];
}

export interface OlaySablonu {
  tur: OlayTuru;
  agirlik: number;
  yontemler: string[];
}

export const OLAY_SABLONLARI: OlaySablonu[] = [
  { tur: 'cinayet', agirlik: 55, yontemler: ['küt darbe', 'boğma', 'zehir', 'merdivenden itme', 'ilaç dozu'] },
  { tur: 'hirsizlik', agirlik: 20, yontemler: ['kasadan belge alma', 'mücevher değiştirme', 'dijital hesap boşaltma'] },
  { tur: 'sabotaj', agirlik: 15, yontemler: ['fren hattı kesme', 'ilaç etiketi değiştirme', 'sözleşme sahteciliği'] },
  { tur: 'kaza', agirlik: 10, yontemler: ['düşme', 'yanlış doz', 'elektrik kaçağı'] },
];

/** İlişki türüne göre motivasyon adayları (fail-kurban ilişkisi). */
export const MOTIVASYONLAR: Record<IliskiTuru, string[]> = {
  aile: ['miras payı', 'aile sırrının açığa çıkma tehdidi', 'yıllardır biriken kırgınlık'],
  es: ['aldatılma öfkesi', 'boşanma ve mal paylaşımı', 'sigorta parası'],
  sevgili: ['terk edilme', 'ilişkinin ifşa edilme tehdidi', 'kıskançlık'],
  is: ['zimmetin açığa çıkması', 'ortaklıktan atılma', 'patent/sözleşme kavgası'],
  arkadas: ['borç ve ihanet', 'eski bir sırrın ortaya çıkması', 'kıskançlık'],
  rakip: ['rekabette kaybetme', 'intikam', 'ihale/hile ifşası'],
  tanidik: ['şantaj', 'bir suçun tanığı olması', 'para'],
};
