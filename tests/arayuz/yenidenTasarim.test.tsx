// @vitest-environment jsdom
// Yeni gezinti, kayıt güvenliği ve aranabilir kılavuzun kullanıcı davranışları.
import { beforeEach, expect, it } from 'vitest';
import { cleanup, fireEvent, render, screen } from '@testing-library/react';
import { App } from '@arayuz/App';
import { depo, kaydiSil } from '@arayuz/oyun/kullan';

beforeEach(() => { cleanup(); kaydiSil(); depo.sifirla(); });

it('zorluk kartları yeni vakanın ayarını değiştirir', () => {
  render(<App />);
  fireEvent.click(screen.getByRole('radio', { name: /Zor/ }));
  expect(depo.durum.zorluk).toBe('zor');
  expect(screen.getByRole('radio', { name: /Zor/ }).getAttribute('aria-checked')).toBe('true');
});

it('kılavuz araması Türkçe harflerle çalışır ve boş sonuç bildirir', () => {
  render(<App />);
  fireEvent.click(screen.getByRole('button', { name: 'Kılavuz' }));
  const arama = screen.getByRole('searchbox', { name: 'Kılavuzda ara' });
  fireEvent.change(arama, { target: { value: 'TEMEL ÇİZGİ' } });
  expect(screen.getByRole('button', { name: /Temel çizgi/ })).toBeTruthy();
  fireEvent.change(arama, { target: { value: 'olmayanbaşlıkxyz' } });
  expect(screen.getByText('Aramana uygun bir madde bulunamadı.')).toBeTruthy();
});

it('kayıt sıfırlama iptal edilebilir', () => {
  depo.basla('Deniz');
  render(<App />);
  fireEvent.click(screen.getByText('Kayıt yönetimi'));
  fireEvent.click(screen.getByRole('button', { name: 'Sıfırla' }));
  expect(depo.durum.kahramanAdi).toBe('Deniz');
  fireEvent.click(screen.getByRole('button', { name: 'Vazgeç' }));
  expect(depo.durum.kahramanAdi).toBe('Deniz');
});

it('sorgu araçları gruplar halinde açılır ve seçilen teknik kullanılabilir', () => {
  depo.basla('Deniz');
  depo.yeniVaka('tasarim-araclari');
  depo.kisiSec(depo.gorusulebilirler()[0]!.id);
  render(<App />);
  fireEvent.click(screen.getByRole('button', { name: 'Kişiyi oku' }));
  expect(screen.getByRole('button', { name: /Odasını oku/ })).toBeTruthy();
  fireEvent.click(screen.getByRole('button', { name: 'Deliller' }));
  expect(screen.getByRole('combobox', { name: 'Gösterilecek delil' })).toBeTruthy();
  fireEvent.click(screen.getByRole('button', { name: 'Sorular' }));
  fireEvent.click(screen.getByRole('button', { name: /Sohbet \/ temel çizgi/ }));
  expect(depo.durum.konusmalar.get(depo.durum.seciliKisi!)!.length).toBe(1);
});
