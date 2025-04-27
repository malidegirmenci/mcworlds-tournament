// src/components/Modal.tsx
import React from 'react';

interface ModalProps {
    isOpen: boolean; 
    onClose: () => void; // Kapatma fonksiyonu
    title?: string; // Opsiyonel başlık
    children: React.ReactNode; // Modal içeriği
}

const Modal: React.FC<ModalProps> = ({ isOpen, onClose, title, children }) => {
    // Eğer isOpen false ise hiçbir şey render etme
    if (!isOpen) return null;

    // Arka plan overlay'e tıklayınca kapatma
    const handleOverlayClick = (e: React.MouseEvent<HTMLDivElement>) => {
        // Sadece overlay'in kendisine tıklandığında kapat (içeriğe tıklayınca kapanmasın)
        if (e.target === e.currentTarget) {
            onClose();
        }
    };

    return (
        // Ana Overlay (Sabit konumlu, tüm ekranı kaplar, yarı saydam siyah arka plan)
        <div
            className="fixed inset-0 z-50 flex items-center justify-center bg-[url(/mcworld-bg.jpg)] bg-center bg-cover bg-no-repeat bg-opacity-60 p-4"
            onClick={handleOverlayClick} // Overlay'e tıklayınca kapat
            aria-modal="true" 
            role="dialog"     
        >
            {/* Modal İçerik Kutusu */}
            <div className="bg-gradient-to-br from-gray-700 to-gray-900 rounded-lg shadow-xl w-full max-w-xl max-h-[80vh] overflow-y-auto"> {/* Maksimum genişlik ve yükseklik */}
                {/* Modal Başlığı ve Kapatma Butonu */}
                <div className="flex justify-between items-center p-4 px-8 sticky top-0 ">
                    {title ? (
                        <h3 className="text-xl font-semibold text-gray-100 pt-4">{title}</h3>
                    ) : (
                        <div /> 
                    )}
                    <button
                        onClick={onClose}
                        className="text-gray-100 hover:text-gray-800 p-1 rounded-full hover:bg-gray-400"
                        aria-label="Kapat" 
                    >
                        
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                            <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                        </svg>
                    </button>
                </div>

                {/* Modal Ana İçeriği */}
                <div className="p-5">
                    {children}
                </div>
            </div>
        </div>
    );
};

export default Modal;