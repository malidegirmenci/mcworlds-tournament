// src/components/LoadingIndicator.tsx
import React from 'react';

interface LoadingIndicatorProps {
    message?: string; // Opsiyonel mesaj
}

const LoadingIndicator: React.FC<LoadingIndicatorProps> = ({ message = "Yükleniyor..." }) => {
    return (
        <div className="flex flex-col items-center justify-center text-center p-10 min-h-[200px]">
            {/* Minecraft Blok Animasyonu */}
            <div className="minecraft-loader-block"></div>

            {/* Yükleniyor Mesajı */}
            <p className="mt-4 text-lg font-semibold font-minecraft text-gray-100 animate-pulse">
                {message}
            </p>
        </div>
    );
};

export default LoadingIndicator;
