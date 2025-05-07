// src/components/TopWorlds.tsx

import React, { useState, useEffect } from 'react';
import apiClient from '../services/api';
import type { Participant } from '../types';
import LoadingIndicator from './LoadingIndicator';
import { toast } from 'react-toastify'; // toast import edildi

const TopWorlds: React.FC = () => {
    const [topParticipants, setTopParticipants] = useState<Participant[]>([]);
    const [isLoading, setIsLoading] = useState<boolean>(true);

    useEffect(() => {
        const fetchTopWorlds = async () => {
            setIsLoading(true);
            try {
                // Backend'den /worlds/top5 endpoint'ine istek at
                const response = await apiClient.get<Participant[]>('/worlds/top5');
                setTopParticipants(response.data);
            } catch (err: any) { 
                console.error("Top 5 dünya verisi çekilirken hata:", err);
                toast.error(`Skor tablosu yüklenirken bir hata oluştu: ${err.message || 'Sunucu hatası'}`);
            } finally {
                setIsLoading(false);
            }
        };

        fetchTopWorlds();
    }, []); // Sadece component mount olduğunda çalışır

    // --- Render Logic ---

    if (isLoading) {
        return <LoadingIndicator message="Skor Tablosu Yükleniyor..." />;
    }

    return (
        <div className="mt-0 mb-8 px-4 max-w-2xl mx-auto">
            <h3 className="font-minecraft text-2xl font-semibold mb-4 text-center text-gray-100 border-b pb-2">
                🏆 En Popüler 5 Dünya 🏆
            </h3>
            {topParticipants.length === 0 && !isLoading ? ( 
                <p className="text-center text-gray-100">Henüz sıralama için yeterli veri yok.</p>
            ) : (
                <ol className="space-y-3">
                    {topParticipants.map((participant, index) => (
                        <li key={participant.id} className="flex items-center justify-between bg-gradient-to-br from-gray-700 to-gray-900 p-3 rounded-md shadow-sm hover:bg-gray-50 transition-colors">
                            <div className="flex items-center space-x-3">
                                <span className={`font-bold text-lg w-6 text-center text-gray-100`}> 
                                    {index + 1}.
                                </span>
                                <span className="text-gray-100 font-medium font-minecraft">{participant.serial_number}</span> 
                            </div>
                            <div className="flex items-center space-x-2 text-gray-100">
                                <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 text-red-400" viewBox="0 0 20 20" fill="currentColor">
                                    <path fillRule="evenodd" d="M3.172 5.172a4 4 0 015.656 0L10 6.343l1.172-1.171a4 4 0 115.656 5.656L10 17.657l-6.828-6.829a4 4 0 010-5.656z" clipRule="evenodd" />
                                </svg>
                                <span className="font-semibold pt-2 font-minecraft">{participant.like_count}</span>
                            </div>
                        </li>
                    ))}
                </ol>
            )}
        </div>
    );
};

export default TopWorlds;
