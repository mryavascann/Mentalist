// Türkçe ek yardımcıları: ünlü uyumu, ünsüz sertleşmesi, özel adlarda kesme, tamlama iyeliği.
// Dil katmanı oda/kişi adlarını çekimlerken bunları kullanır; yanlış ek oyunu ucuz gösterir.
import { describe, it, expect } from 'vitest';
import { bulunma, belirtme, tamlayan, sonUnlu, yonelme } from '@ortak/turkce';

describe('sonUnlu', () => {
  it('kelimenin son ünlüsünü bulur; rakamlarda okunuşa göre', () => {
    expect(sonUnlu('Salon')).toBe('o');
    expect(sonUnlu('Kütüphane')).toBe('e');
    expect(sonUnlu('412')).toBe('i'); // "on iki"
    expect(sonUnlu('Daire 3B')).toBe('e'); // "üç be"
    expect(sonUnlu('7')).toBe('i'); // yedi
    expect(sonUnlu('10')).toBe('o'); // on
  });
});

describe('bulunma (-da/-de/-ta/-te)', () => {
  it('cins adlarda kesme yok, ünlü uyumu ve sertleşme', () => {
    expect(bulunma('Salon')).toBe('Salonda');
    expect(bulunma('Mutfak')).toBe('Mutfakta');
    expect(bulunma('Kütüphane')).toBe('Kütüphanede');
    expect(bulunma('Garaj')).toBe('Garajda');
    expect(bulunma('Teras')).toBe('Terasta');
    expect(bulunma('Sera')).toBe('Serada');
  });

  it('iyelikli tamlamalarda -n- kaynaştırması', () => {
    expect(bulunma('Çalışma Odası')).toBe('Çalışma Odasında');
    expect(bulunma('Üst Kat Koridoru')).toBe('Üst Kat Koridorunda');
    expect(bulunma('Havuz Başı')).toBe('Havuz Başında');
    expect(bulunma('Toplantı Odası')).toBe('Toplantı Odasında');
    expect(bulunma('Merdiven Boşluğu')).toBe('Merdiven Boşluğunda');
  });

  it('rakam/harf biten adlarda kesme işareti', () => {
    expect(bulunma('Oda 412')).toBe("Oda 412'de");
    expect(bulunma('Daire 3B')).toBe("Daire 3B'de");
    expect(bulunma('Oda 7')).toBe("Oda 7'de");
  });

  it('özel adlarda kesme işareti', () => {
    expect(bulunma('Ayvalık', true)).toBe("Ayvalık'ta");
    expect(bulunma('Karaca Köşkü', true)).toBe("Karaca Köşkü'nde");
  });
});

describe('belirtme (-ı/-i/-u/-ü) özel adlar', () => {
  it('ünsüzle bitende doğrudan, ünlüyle bitende -y- kaynaştırması', () => {
    expect(belirtme('Kerem')).toBe("Kerem'i");
    expect(belirtme('Nazlı')).toBe("Nazlı'yı");
    expect(belirtme('Tolga')).toBe("Tolga'yı");
    expect(belirtme('Onur')).toBe("Onur'u");
    expect(belirtme('Gökçe')).toBe("Gökçe'yi");
    expect(belirtme('Uğur')).toBe("Uğur'u");
  });
});

describe('tamlayan (-ın/-in/-un/-ün) özel adlar', () => {
  it('ünlüyle bitende -n- kaynaştırması', () => {
    expect(tamlayan('Kerem')).toBe("Kerem'in");
    expect(tamlayan('Nazlı')).toBe("Nazlı'nın");
    expect(tamlayan('Onur')).toBe("Onur'un");
    expect(tamlayan('Gökçe')).toBe("Gökçe'nin");
    expect(tamlayan('Sude')).toBe("Sude'nin");
    expect(tamlayan('Uğur')).toBe("Uğur'un");
  });
});

describe('yonelme (-a/-e) cins ve özel', () => {
  it('ünlüyle bitende -y-', () => {
    expect(yonelme('Salon')).toBe('Salona');
    expect(yonelme('Kütüphane')).toBe('Kütüphaneye');
    expect(yonelme('Çalışma Odası')).toBe('Çalışma Odasına');
    expect(yonelme('Nazlı', true)).toBe("Nazlı'ya");
  });
});
