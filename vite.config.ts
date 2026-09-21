/// <reference types="vitest/config" />
// Vite + Vitest yapılandırması.
// - Takma adlar (@motor, @icerik, @arayuz, @ortak) tsconfig.json'daki "paths" ile birebir aynı olmalı.
// - Üretim derlemesi TEK bir index.html üretir (vite-plugin-singlefile): oyun dosya olarak
//   gönderilip çift tıkla açılabilsin (file:// altında harici <script src> modülleri engellenir, satır içi çalışır).
// - Testler varsayılan olarak Node ortamında koşar (motor saf TypeScript). Arayüz testleri
//   dosya başına "// @vitest-environment jsdom" yorumuyla jsdom'a geçer.
import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import { viteSingleFile } from 'vite-plugin-singlefile';
import { fileURLToPath } from 'node:url';

const kok = (yol: string) => fileURLToPath(new URL(yol, import.meta.url));

export default defineConfig({
  base: './',
  plugins: [react(), viteSingleFile()],
  build: {
    // Tek dosya hedefi: uyarı eşiğini yükselt, kaynak haritası kapalı.
    chunkSizeWarningLimit: 4000,
    sourcemap: false,
  },
  server: {
    // Kaynak PDF/zip klasörü oyunun parçası değil; başka bir süreç dosyayı kilitlediğinde
    // izleyici EBUSY ile geliştirme sunucusunu düşürüyordu (mentaldocs.zip).
    watch: { ignored: ['**/docs/kaynaklar/**'] },
  },
  resolve: {
    alias: {
      '@motor': kok('./src/motor'),
      '@icerik': kok('./src/icerik'),
      '@arayuz': kok('./src/arayuz'),
      '@ortak': kok('./src/ortak'),
    },
  },
  test: {
    environment: 'node',
    include: ['tests/**/*.test.{ts,tsx}'],
  },
});
