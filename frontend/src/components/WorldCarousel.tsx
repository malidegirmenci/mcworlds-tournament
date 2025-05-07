// src/components/WorldCarousel.tsx

import React, { useState, useEffect, useRef } from 'react';
import apiClient from '../services/api';
import { useKeenSlider } from 'keen-slider/react'; 
import { toast } from 'react-toastify'; // toast import edildi

import type { Participant } from '../types';
import LoadingIndicator from './LoadingIndicator';

// API'den dönen oy listesinin tipi (/votes/my-votes)
interface MyVoteResponse {
    participant_id: number;
}

// --- Ana Bileşen ---
const WorldCarousel: React.FC = () => {
    // State tanımlamaları
    const [participants, setParticipants] = useState<Participant[]>([]);
    const [isLoading, setIsLoading] = useState<boolean>(true);
    const [currentSlide, setCurrentSlide] = useState(0);
    const [loaded, setLoaded] = useState(false);
    const [myVotes, setMyVotes] = useState<Set<number>>(new Set());
    const [isVotesLoading, setIsVotesLoading] = useState<boolean>(false);
    const [isVoting, setIsVoting] = useState<number | null>(null);
    const previousSlideIndexRef = useRef<number>(0);

    // KeenSlider hook'u (Video duraklatma mantığı dahil)
    const [sliderRef, instanceRef] = useKeenSlider<HTMLDivElement>({
        initial: 0,
        slideChanged(slider) {
            // Video duraklatma mantığı...
            try {
                const previousSlideElement = slider.slides[previousSlideIndexRef.current];
                if (previousSlideElement) {
                    const videoElement = previousSlideElement.querySelector('video');
                    if (videoElement && !videoElement.paused) {
                        videoElement.pause();
                    }
                }
            } catch (e) { console.error("Error pausing previous video:", e); }
            setCurrentSlide(slider.track.details.rel);
            previousSlideIndexRef.current = slider.track.details.rel;
        },
        created(slider) {
            setLoaded(true);
            previousSlideIndexRef.current = slider.track.details.rel;
        },
        loop: false,
        slides: { perView: 1, spacing: 15 },
    });

    // Effect: Dünyaları çekme
    useEffect(() => {
        const fetchWorlds = async () => {
            setIsLoading(true);
            try {
                const response = await apiClient.get<Participant[]>('/worlds');
                setParticipants(response.data);
            } catch (err: any) {
                console.error("Dünyalar yüklenirken hata:", err);
                toast.error(`Dünyalar yüklenirken bir hata oluştu: ${err.message || 'Sunucu hatası'}`);
            } finally {
                setIsLoading(false);
            }
        };
        fetchWorlds();
    }, []);

    useEffect(() => {
        const fetchMyVotes = async () => {
            setIsVotesLoading(true);
            try {
                const response = await apiClient.get<MyVoteResponse[]>('/votes/my-votes');
                const votedIds = new Set(response.data.map(vote => vote.participant_id));
                setMyVotes(votedIds);
            } catch (error: any) {
                console.error("Kullanıcı oyları çekilirken hata:", error);
                if (error.response && error.response.status === 401) {
                    console.warn("Oturum geçersiz veya süresi dolmuş.");
                    localStorage.removeItem('authToken');
                    toast.warn("Oturumunuz sonlanmış olabilir, lütfen tekrar giriş yapın.");
                } else {
                    toast.error(`Oylarınız yüklenirken bir sorun oluştu: ${error.message || 'Sunucu hatası'}`);
                }
                setMyVotes(new Set());
            } finally {
                setIsVotesLoading(false);
            }
        };
        const token = localStorage.getItem('authToken');
        if (token) {
            fetchMyVotes();
        } else {
            console.log("Kullanıcı girişi yapılmamış, oylar çekilmiyor.");
            setIsVotesLoading(false); 
        }
    }, []);

    // Fonksiyon: Beğenme/Geri Alma İşlemi
    const handleLikeClick = async (participantId: number) => {
        if (isVoting === participantId) return;

        const token = localStorage.getItem('authToken');
        if (!token) {
            toast.warn("Oy vermek için giriş yapmalısınız!");
            return;
        }

        const participantIndex = participants.findIndex(p => p.id === participantId);
        if (participantIndex === -1) return;

        const originalParticipant = { ...participants[participantIndex] };
        const originalMyVotes = new Set(myVotes);
        const wasPreviouslyLiked = originalMyVotes.has(participantId);

        setIsVoting(participantId);

        setParticipants(prevParticipants =>
            prevParticipants.map(p =>
                p.id === participantId
                    ? { ...p, like_count: wasPreviouslyLiked ? p.like_count - 1 : p.like_count + 1 }
                    : p
            )
        );
        setMyVotes(prevVotes => {
            const newVotes = new Set(prevVotes);
            if (wasPreviouslyLiked) { newVotes.delete(participantId); }
            else { newVotes.add(participantId); }
            return newVotes;
        });

        // API İsteği
        try {
            const response = await apiClient.post<Participant>(`/votes`, { participant_id: participantId });
            const updatedParticipantFromServer = response.data;
            setParticipants(prevParticipants =>
                prevParticipants.map(p =>
                    p.id === participantId ? updatedParticipantFromServer : p
                )
            );
        } catch (error: any) {
            console.error("Oy verme/geri alma API hatası:", error);
            setParticipants(prevParticipants =>
                prevParticipants.map(p =>
                    p.id === participantId ? originalParticipant : p
                )
            );
            setMyVotes(originalMyVotes);
            let errorMessage = error.response?.data?.detail || 'Oy verme işlemi sırasında bir sorun oluştu.';
            if (error.response && error.response.status === 401) {
                localStorage.removeItem('authToken');
                errorMessage += " Lütfen tekrar giriş yapın.";
            }
            toast.error(`Hata: ${errorMessage}`);

        } finally {
            setIsVoting(null);
        }
    };

    // --- Render Logic ---
    if (isLoading || isVotesLoading) {
        return <LoadingIndicator message="Dünyalar ve Oylar Yükleniyor..." />;
    }

    return (
        // Ana konteyner (Responsive padding)
        <div className="px-2 sm:px-4 md:px-6 lg:px-8 py-4 max-w-4xl mx-auto">
            <h2 className="text-2xl sm:text-3xl lg:text-4xl font-bold my-3 sm:my-5 md:my-6 text-center text-gray-100 font-minecraft">Minecraft Worlds Tournament</h2>
            {participants.length === 0 && !isLoading ? ( // isLoading kontrolü
                <p className="text-center text-gray-100 font-minecraft">Gösterilecek dünya bulunamadı.</p>
            ) : (
                <div className="relative navigation-wrapper">
                    <div ref={sliderRef} className="keen-slider rounded-lg overflow-hidden shadow-xl">
                        {participants.map((participant) => {
                            const isLiked = myVotes.has(participant.id);
                            const isCurrentVoteProcessing = isVoting === participant.id;
                            return (
                                <div className="keen-slider__slide" key={participant.id}>
                                    <div className="bg-gradient-to-br from-gray-700 to-gray-900 p-3 sm:p-4 md:p-5 rounded-lg h-full flex flex-col items-center">
                                        <video
                                            src={participant.video_url}
                                            controls
                                            className="w-full aspect-video mb-3 sm:mb-4 md:mb-5 rounded-md shadow"
                                        >
                                            Tarayıcınız video etiketini desteklemiyor.
                                        </video>
                                        <div className="flex flex-wrap justify-between items-center mt-auto w-full gap-x-4 gap-y-2">
                                            <div className="flex items-center space-x-1 mx-auto">
                                                <button
                                                    onClick={() => handleLikeClick(participant.id)}
                                                    disabled={isCurrentVoteProcessing}
                                                    className={`rounded-full transition-transform duration-200 ease-in-out ${isCurrentVoteProcessing ? 'opacity-50 cursor-wait' : 'hover:scale-110 active:scale-95'
                                                        }`}
                                                    aria-label={isLiked ? "Oyu Geri Al" : "Oy Ver"}
                                                >
                                                    <svg
                                                        xmlns="http://www.w3.org/2000/svg"
                                                        className={`h-6 w-6 sm:h-7 sm:w-7 md:h-8 md:w-8 transition-colors ${isLiked ? 'text-red-500' : 'text-gray-100 hover:text-red-400'}`}
                                                        viewBox="0 0 24 24"
                                                        fill={isLiked ? 'currentColor' : 'none'}
                                                        stroke="currentColor"
                                                        strokeWidth={1.5}
                                                    >
                                                        <path strokeLinecap="round" strokeLinejoin="round" d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
                                                    </svg>
                                                </button>
                                                <span className="text-base sm:text-lg md:text-xl font-medium text-gray-100 pt-0 text-center font-minecraft">{participant.like_count}</span>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            );
                        })}
                    </div>

                    {/* Navigasyon Okları */}
                    {loaded && instanceRef.current && participants.length > 1 && (
                        <>
                            <Arrow left onClick={(e: any) => e.stopPropagation() || instanceRef.current?.prev()} disabled={currentSlide === 0} />
                            <Arrow onClick={(e: any) => e.stopPropagation() || instanceRef.current?.next()} disabled={currentSlide === instanceRef.current.track.details.slides.length - 1} />
                        </>
                    )}
                </div>
            )}
        </div>
    );
};

// --- Ok (Arrow) Bileşeni (Responsive) ---
function Arrow(props: {
    disabled: boolean
    left?: boolean
    onClick: (e: any) => void
}) {
    const disabled = props.disabled ? " opacity-50 cursor-not-allowed" : " hover:bg-gray-600"; // hover rengi güncellendi
    return (
        <button
            onClick={props.onClick}
            className={`font-minecraft z-10 absolute top-1/2 transform -translate-y-1/2 p-2 sm:p-3 md:p-4 bg-gray-500 bg-opacity-70 hover:bg-opacity-90 rounded-full shadow-lg cursor-pointer transition-opacity ${
                props.left ? "left-1 sm:left-2 md:left-3" : "right-1 sm:right-2 md:right-3"
                } ${disabled}`}
            disabled={props.disabled}
            aria-label={props.left ? "Önceki Slayt" : "Sonraki Slayt"}
        >
            {props.left ? (
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 sm:h-6 sm:w-6 md:h-7 md:w-7 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M15 19l-7-7 7-7" />
                </svg>
            ) : (
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 sm:h-6 sm:w-6 md:h-7 md:w-7 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" />
                </svg>
            )}
        </button>
    )
}

export default WorldCarousel;
