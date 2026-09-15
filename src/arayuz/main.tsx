// Tarayıcı giriş noktası: React ağacını index.html'deki #kok elemanına bağlar.
import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import { App } from './App';

const kok = document.getElementById('kok');
if (!kok) throw new Error('index.html içinde #kok elemanı bulunamadı');

createRoot(kok).render(
  <StrictMode>
    <App />
  </StrictMode>,
);
