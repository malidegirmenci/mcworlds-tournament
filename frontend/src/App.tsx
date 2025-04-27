// src/App.tsx

import { useState } from 'react';
import { useAuth } from './context/AuthContext';
import WorldCarousel from './components/WorldCarousel';
import TopWorlds from './components/TopWorlds';
import Modal from './components/Modal';
import Login from './components/Login';

function App() {
  // Auth context'ten gerekli değerleri al
  const { isAuthenticated, isLoading, logout, user } = useAuth(); 

  // Scoreboard modal state'i
  const [isScoreboardOpen, setIsScoreboardOpen] = useState<boolean>(false);
  const openScoreboard = () => setIsScoreboardOpen(true);
  const closeScoreboard = () => setIsScoreboardOpen(false);

  // --- Conditional Rendering ---

  // 1. İlk Yükleme Kontrolü: Auth durumu kontrol edilirken bekleme ekranı göster
  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-[url(/mcworld-bg.jpg)] bg-center bg-cover bg-no-repeat bg-opacity-60">
        <div className="text-xl font-semibold font-minecraft text-gray-600">
          Yükleniyor...
        </div>
      </div>
    );
  }

  // 2. Giriş Durumu Kontrolü: Yükleme bittikten sonra
  return (
    <>
      {!isAuthenticated ? (
        // --- Kullanıcı Giriş Yapmamışsa ---
        <Login />
      ) : (
        // --- Kullanıcı Giriş Yapmışsa ---
        <div className="relative min-h-screen bg-[url(/mcworld-bg.jpg)] bg-center bg-cover bg-no-repeat bg-opacity-60 py-6">
          {/* Sağ Üst Butonlar (Scoreboard ve Logout) */}
          <div className="absolute top-4 right-4 z-10 flex space-x-2">
            {user && <span className="text-sm text-gray-100 self-center mr-2 font-minecraft">Hoş geldin, {user.student_number}!</span>}
            {/* Scoreboard Butonu */}
            <button
              onClick={openScoreboard}
              className="p-2 bg-white text-gray-700 rounded-full shadow-md hover:bg-gray-100 transition-colors"
              aria-label="Skor Tablosunu Aç"
            >
              {/* Kupa ikonu */}
              <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M11.049 2.927c.3-.921 1.603-.921 1.902 0l1.519 4.674a1 1 0 00.95.69h4.915c.969 0 1.371 1.24.588 1.81l-3.976 2.888a1 1 0 00-.363 1.118l1.518 4.674c.3.922-.755 1.688-1.539 1.118l-3.975-2.888a1 1 0 00-1.176 0l-3.976 2.888c-.783.57-1.838-.196-1.539-1.118l1.518-4.674a1 1 0 00-.363-1.118l-3.976-2.888c-.783-.57-.38-1.81.588-1.81h4.914a1 1 0 00.951-.69l1.519-4.674z" />
              </svg>
            </button>

            {/* Çıkış Yap Butonu */}
            <button
              onClick={logout} // Context'ten gelen logout fonksiyonunu çağır
              className="p-2 bg-white text-red-600 rounded-full shadow-md hover:bg-gray-100 transition-colors"
              aria-label="Çıkış Yap"
            >
              {/* Basit Çıkış ikonu (SVG) */}
              <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
              </svg>
            </button>
          </div>

          {/* Ana İçerik */}
          <WorldCarousel />

          {/* Scoreboard Modalı */}
          <Modal
            isOpen={isScoreboardOpen}
            onClose={closeScoreboard}
            title="SCOREBOARD"
          >
            <TopWorlds />
          </Modal>

        </div>
      )}
    </>
  );
}

export default App;