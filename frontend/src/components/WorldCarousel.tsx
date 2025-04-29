// src/components/WorldCarousel.tsx

import React, { useState, useEffect, useRef } from 'react';
import apiClient from '../services/api';
import { useKeenSlider } from 'keen-slider/react';

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
    const [error, setError] = useState<string | null>(null);

    // KeenSlider state'leri
    const [currentSlide, setCurrentSlide] = useState(0);
    const [loaded, setLoaded] = useState(false);

    // Kullanıcı oyları ve oy verme durumu state'leri
    const [myVotes, setMyVotes] = useState<Set<number>>(new Set());
    const [isVotesLoading, setIsVotesLoading] = useState<boolean>(false);
    const [isVoting, setIsVoting] = useState<number | null>(null);

    const previousSlideIndexRef = useRef<number>(0);

    // KeenSlider hook'u
    const [sliderRef, instanceRef] = useKeenSlider<HTMLDivElement>({
        initial: 0,
        // Slayt değiştiğinde tetiklenecek fonksiyon
        slideChanged(slider) {
            console.log('Slide changed. New index:', slider.track.details.rel);
            // --- VİDEO DURAKLATMA MANTIĞI ---
            try {
                // Önceki slaytın DOM elementini al
                const previousSlideElement = slider.slides[previousSlideIndexRef.current];
                if (previousSlideElement) {
                    // Önceki slayt içindeki video elementini bul
                    const videoElement = previousSlideElement.querySelector('video');
                    if (videoElement && !videoElement.paused) {
                        console.log(`Pausing video in previous slide index: ${previousSlideIndexRef.current}`);
                        videoElement.pause();
                        // İsteğe bağlı: Videoyu başa sarmak isterseniz
                        // videoElement.currentTime = 0;
                    }
                }
            } catch (e) {
                console.error("Error pausing previous video:", e);
            }
            // --- BİTİŞ: VİDEO DURAKLATMA MANTIĞI ---

            // Mevcut slayt state'ini güncelle
            setCurrentSlide(slider.track.details.rel);
            // Yeni indeksi bir sonraki değişiklik için ref'e kaydet
            previousSlideIndexRef.current = slider.track.details.rel;
        },
        // Slider ilk oluşturulduğunda çalışır
        created(slider) {
            setLoaded(true);
            // Başlangıç indeksini ref'e kaydet
            previousSlideIndexRef.current = slider.track.details.rel;
        },
        loop: false,
        slides: {
            perView: 1,
            spacing: 15,
        },
    });

    // Effect: Dünyaları çekme
    useEffect(() => {
        const fetchWorlds = async () => {
            setIsLoading(true);
            setError(null);
            try {
                const response = await apiClient.get<Participant[]>('/worlds');
                setParticipants(response.data);
            } catch (err) {
                console.error("Dünyalar yüklenirken hata:", err);
                setError('Dünyalar yüklenirken bir hata oluştu.');
            } finally {
                setIsLoading(false);
            }
        };
        fetchWorlds();
    }, []);

    // Effect: Kullanıcının mevcut oylarını çekme (token varsa)
    useEffect(() => {
        const token = localStorage.getItem('authToken');
        if (!token) {
            console.log("Kullanıcı girişi yapılmamış, oylar çekilmiyor.");
            return;
        }

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
                    setError("Oturumunuz sonlanmış olabilir, lütfen tekrar giriş yapın.");
                } else {
                    setError("Oylarınız yüklenirken bir sorun oluştu.");
                }
                setMyVotes(new Set()); // Hata durumunda oyları temizle
            } finally {
                setIsVotesLoading(false);
            }
        };

        fetchMyVotes();
    }, []);

    // Fonksiyon: Beğenme/Geri Alma İşlemi
    const handleLikeClick = async (participantId: number) => {
        if (isVoting === participantId) return; // Zaten işlemdeyse çık

        const token = localStorage.getItem('authToken');
        if (!token) {
            alert("Oy vermek için giriş yapmalısınız!");
            return;
        }

        setIsVoting(participantId);
        const currentlyLiked = myVotes.has(participantId);

        try {
            const response = await apiClient.post<Participant>(`/votes`, { participant_id: participantId });
            const updatedParticipant = response.data;

            setParticipants(prevParticipants =>
                prevParticipants.map(p =>
                    p.id === participantId ? updatedParticipant : p
                )
            );

            setMyVotes(prevVotes => {
                const newVotes = new Set(prevVotes);
                if (currentlyLiked) {
                    newVotes.delete(participantId); // Unlike: Set'ten çıkar
                } else {
                    newVotes.add(participantId);    // Like: Set'e ekle
                }
                return newVotes;
            });

        } catch (error: any) {
            console.error("Oy verme/geri alma hatası:", error);
            let errorMessage = "Oy verme işlemi sırasında bir hata oluştu.";
            if (error.response) {
                errorMessage = `Hata: ${error.response.data.detail || 'Bir sorun oluştu.'}`;
                if (error.response.status === 401) {
                    localStorage.removeItem('authToken');
                    errorMessage += " Lütfen tekrar giriş yapın.";
                }
            }
            alert(errorMessage); // Kullanıcıya hatayı göster
        } finally {
            setIsVoting(null); // İşlemin bittiğini belirt
        }
    };

    // --- Render Logic ---

    if (isLoading || isVotesLoading) {
        return <LoadingIndicator message="Dünyalar ve Oylar Yükleniyor..." />;
    }

    if (error) {
        return <div className="text-center p-10 text-red-600 font-semibold">{error}</div>;
    }

    return (
        <div className="max-w-4xl mx-auto">
            <h2 className="text-3xl font-bold mb-3 text-center text-gray-100">Minecraft Worlds Tournament</h2>
            {participants.length === 0 ? (
                <p className="text-center text-gray-100">Gösterilecek dünya bulunamadı.</p>
            ) : (
                <div className="relative navigation-wrapper"> {/* KeenSlider ve oklar için sarmalayıcı */}
                    <div ref={sliderRef} className="keen-slider rounded-lg overflow-hidden shadow-xl">
                        {participants.map((participant) => {
                            const isLiked = myVotes.has(participant.id);
                            const isCurrentVoteProcessing = isVoting === participant.id;
                            return (
                                <div className="keen-slider__slide" key={participant.id}>
                                    <div className="bg-gradient-to-br from-gray-700 to-gray-900 p-3 rounded-lg h-full flex flex-col items-center">
                                        <video
                                            src={participant.video_url}
                                            controls
                                            className="w-full aspect-video rounded-md shadow"
                                        >
                                            Tarayıcınız video etiketini desteklemiyor.
                                        </video>
                                        <div className="flex items-center mt-auto"> {/* mt-auto ile en alta iter */}
                                            <div className="flex justify-evenly ">
                                                <button
                                                    onClick={() => handleLikeClick(participant.id)}
                                                    disabled={isCurrentVoteProcessing}
                                                    className={`p-1.5 rounded-full transition-transform duration-200 ease-in-out ${isCurrentVoteProcessing ? 'opacity-50 cursor-wait' : 'hover:scale-110 active:scale-95'
                                                        }`}
                                                    aria-label={isLiked ? "Oyu Geri Al" : "Oy Ver"}
                                                >
                                                    <svg
                                                        xmlns="http://www.w3.org/2000/svg"
                                                        className={`h-7 w-7 transition-colors ${isLiked ? 'text-red-500' : 'text-gray-100 hover:text-red-400'}`}
                                                        viewBox="0 0 24 24"
                                                        fill={isLiked ? 'currentColor' : 'none'}
                                                        stroke="currentColor"
                                                        strokeWidth={1.5}
                                                    >
                                                        <path strokeLinecap="round" strokeLinejoin="round" d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
                                                    </svg>
                                                </button>
                                                <span className="text-lg font-medium text-gray-100 pt-3">{participant.like_count}</span>
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
                            <Arrow
                                left
                                onClick={(e: any) => e.stopPropagation() || instanceRef.current?.prev()}
                                disabled={currentSlide === 0}
                            />
                            <Arrow
                                onClick={(e: any) => e.stopPropagation() || instanceRef.current?.next()}
                                disabled={
                                    currentSlide === instanceRef.current.track.details.slides.length - 1
                                }
                            />
                        </>
                    )}
                </div>
            )}
        </div>
    );
};

function Arrow(props: {
    disabled: boolean
    left?: boolean
    onClick: (e: any) => void
}) {
    const disabled = props.disabled ? " opacity-50 cursor-not-allowed" : " hover:bg-gray-300";
    return (
        <button
            onClick={props.onClick}
            className={`font-minecraft z-10 absolute top-1/2 transform -translate-y-1/2 p-3 bg-gray-500 rounded-full shadow-lg cursor-pointer transition-opacity ${props.left ? "left-3" : "right-3" // Biraz daha içeride
                } ${disabled}`}
            disabled={props.disabled}
            aria-label={props.left ? "Önceki Slayt" : "Sonraki Slayt"} // Erişilebilirlik
        >
            {props.left ? (
                <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-gray-700" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M15 19l-7-7 7-7" />
                </svg>
            ) : (
                <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-gray-700" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" />
                </svg>
            )}
        </button>
    )
}

export default WorldCarousel;