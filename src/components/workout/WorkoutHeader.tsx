interface WorkoutHeaderProps {
    title: string;
    subtitle: string;
    focus: string;
}

export default function WorkoutHeader({ title, subtitle, focus }: WorkoutHeaderProps) {
    return (
        <div className="relative overflow-hidden rounded-2xl border-4 border-red-600 bg-gradient-to-br from-red-900/40 to-orange-900/40">
            <div
                className="absolute inset-0 opacity-10"
                style={{
                    backgroundImage:
                        'repeating-linear-gradient(45deg, transparent, transparent 10px, rgba(255,255,255,0.05) 10px, rgba(255,255,255,0.05) 20px)',
                }}
            />
            <div className="relative p-8">
                <div className="flex items-center gap-3 mb-4">
                    <span className="bg-black/70 px-4 py-1 rounded-full font-black text-xs tracking-widest border-2 border-red-500">
                        SEMANA 1
                    </span>
                    <span className="bg-black/70 px-4 py-1 rounded-full font-black text-xs tracking-widest border-2 border-orange-500">
                        {subtitle}
                    </span>
                </div>
                <h2 className="text-5xl md:text-6xl font-black tracking-tighter mb-3">{title}</h2>
                <p className="text-2xl font-black text-yellow-400 tracking-wide">{focus}</p>
            </div>
        </div>
    );
}
