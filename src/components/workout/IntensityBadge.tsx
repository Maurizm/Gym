interface IntensityBadgeProps {
    level: string;
}

const colors: Record<string, string> = {
    MÁXIMA: 'bg-red-600 border-red-400',
    ALTA: 'bg-orange-600 border-orange-400',
    MEDIA: 'bg-yellow-600 border-yellow-400',
    BAJA: 'bg-green-600 border-green-400',
};

export default function IntensityBadge({ level }: IntensityBadgeProps) {
    return (
        <span className={`${colors[level] ?? 'bg-gray-600 border-gray-400'} border-2 px-2 py-0.5 rounded text-xs font-black tracking-wider text-white`}>
            {level}
        </span>
    );
}
