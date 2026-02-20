export const getVideoEmbed = (exerciseName: string): string => {
    const videoIds: Record<string, string> = {
        'Press de Banca con Barra': 'gRVjAtPip0Y',
        'Press Inclinado con Mancuernas': 'hChjZWI_SW8',
        'Sentadilla Trasera (Back Squat)': 'ultWZbUMPL8',
        'Peso Muerto (Deadlift)': 'op9kVnSso6Q',
        'Press Militar (Barra o Mancuerna)': '2yjwXTZQDDI',
        'Jalón al Pecho (Agarre Supino)': 'lueEJGjTuPQ',
    };
    return videoIds[exerciseName] || 'gRVjAtPip0Y';
};

export const getImageUrl = (text: string): string => {
    const photoId =
        text.includes('Press') ? '1517836357463-1c44e13e8b99' :
            text.includes('Sentadilla') || text.includes('Squat') ? '1574680178050-55c6a6a96e0a' :
                text.includes('Peso Muerto') || text.includes('Deadlift') ? '1526401485123-4ae56e49e4b2' :
                    text.includes('Curl') ? '1583454122833-2537b0f95fa7' :
                        text.includes('Hip Thrust') ? '1571019614242-c5c5dee9f50b' :
                            text.includes('Remo') ? '1605296867304-46d5465a13f1' :
                                text.includes('Jalón') || text.includes('Pull') ? '1581009146003-9e3c68a79d62' :
                                    '1534438327276-14e5300c3a48';
    return `https://images.unsplash.com/photo-${photoId}?auto=format&fit=crop&w=800&q=80`;
};
