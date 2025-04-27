// src/components/TopWorlds.tsx

import React, { useState, useEffect } from 'react';
import apiClient from '../services/api';
import type { Participant } from '../types';

const TopWorlds: React.FC = () => {
    const [topParticipants, setTopParticipants] = useState<Participant[]>([]);
    const [isLoading, setIsLoading] = useState<boolean>(true);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        const fetchTopWorlds = async () => {
            setIsLoading(true);
            setError(null);
            try {
                // Backend'den /worlds/top5 endpoint'ine istek at
                const response = await apiClient.get<Participant[]>('/worlds/top5');
                setTopParticipants(response.data);
            } catch (err) {
                console.error("Top 5 dünya verisi çekilirken hata:", err);
                setError('En popüler dünyalar yüklenirken bir hata oluştu.');
            } finally {
                setIsLoading(false);
            }
        };

        fetchTopWorlds();
    }, []); // Sadece component mount olduğunda çalışır

    // --- Render Logic ---

    if (isLoading) {
        return <div className="text-center p-4 text-gray-100">Skor tablosu yükleniyor...</div>;
    }

    if (error) {
        return <div className="text-center p-4 text-red-500">{error}</div>;
    }

    return (
        <div className="mt-0 mb-8 px-4 max-w-2xl mx-auto">
            <h3 className="font-minecraft text-2xl font-semibold mb-4 text-center text-gray-100 border-b pb-2">
                🏆 En Popüler 5 Dünya 🏆
            </h3>
            {topParticipants.length === 0 ? (
                <p className="text-center text-gray-100">Henüz sıralama için yeterli veri yok.</p>
            ) : (
                <ol className="space-y-3">
                    {topParticipants.map((participant, index) => (
                        <li key={participant.id} className="flex items-center justify-between bg-gradient-to-br from-gray-700 to-gray-900 p-3 rounded-md shadow-sm hover:bg-gray-50 transition-colors">
                            <div className="flex items-center space-x-3">
                                <span className={`font-bold text-lg w-6 text-center text-gray-100
                                    }`}>
                                    {index + 1}.
                                </span>
                                <span className="text-gray-100 font-medium">{participant.serial_number}</span>
                            </div>
                            <div className="flex items-center space-x-2 text-gray-100">
                                <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 text-red-400" viewBox="0 0 20 20" fill="currentColor">
                                    <path fillRule="evenodd" d="M3.172 5.172a4 4 0 015.656 0L10 6.343l1.172-1.171a4 4 0 115.656 5.656L10 17.657l-6.828-6.829a4 4 0 010-5.656z" clipRule="evenodd" />
                                </svg>
                                <span className="font-semibold pt-2">{participant.like_count}</span>
                            </div>
                        </li>
                    ))}
                </ol>
            )}
        </div>
    );
};

export default TopWorlds;