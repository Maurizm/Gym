export interface Exercise {
    name: string;
    sets: number;
    reps: string;
    rpe: number;
    rest: string;
    note: string;
    img: string;
    videoId: string;
    intensity: 'MÁXIMA' | 'ALTA' | 'MEDIA' | 'BAJA';
}

export interface WorkoutDay {
    title: string;
    subtitle: string;
    focus: string;
    exercises: Exercise[];
}

export interface WarmupStep {
    title: string;
    duration: string;
    description: string;
    icon: React.ReactNode;
    color: string;
    img: string;
    videoId: string;
}

export interface Champion {
    name: string;
    title: string;
    stats: string;
    img: string;
}

export interface StatItem {
    icon: React.ElementType;
    label: string;
    value: string;
    color: string;
}

export interface CountdownState {
    days: number;
    hours: number;
    minutes: number;
    seconds: number;
}

import type React from 'react';
