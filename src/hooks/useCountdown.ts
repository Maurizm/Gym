import { useState, useEffect } from 'react';
import type { CountdownState } from '../types';

/** Countdown hacia la próxima fecha objetivo (18 de Febrero, 06:00 AM) */
export const useCountdown = (): CountdownState => {
    const [countdown, setCountdown] = useState<CountdownState>({
        days: 0,
        hours: 0,
        minutes: 0,
        seconds: 0,
    });

    useEffect(() => {
        const now = new Date();
        let targetDate = new Date(now.getFullYear(), 1, 18, 6, 0, 0);
        // Si ya pasó la fecha este año, apuntar al próximo año
        if (now > targetDate) {
            targetDate = new Date(now.getFullYear() + 1, 1, 18, 6, 0, 0);
        }

        const interval = setInterval(() => {
            const distance = targetDate.getTime() - Date.now();
            if (distance < 0) {
                setCountdown({ days: 0, hours: 0, minutes: 0, seconds: 0 });
                clearInterval(interval);
                return;
            }
            setCountdown({
                days: Math.floor(distance / (1000 * 60 * 60 * 24)),
                hours: Math.floor((distance % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60)),
                minutes: Math.floor((distance % (1000 * 60 * 60)) / (1000 * 60)),
                seconds: Math.floor((distance % (1000 * 60)) / 1000),
            });
        }, 1000);

        return () => clearInterval(interval);
    }, []);

    return countdown;
};
