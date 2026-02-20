import { useState } from 'react';
import { workoutData, dayMapping } from '../../data/workoutData';
import DaySelector from './DaySelector';
import WorkoutHeader from './WorkoutHeader';
import ExerciseCard from './ExerciseCard';
import RestDay from './RestDay';

export default function WorkoutSection() {
    const [activeDay, setActiveDay] = useState(1);
    const workoutKey = dayMapping[activeDay];
    const currentWorkout = workoutKey !== null ? workoutData[workoutKey] : null;

    return (
        <div className="space-y-8 py-8">
            <DaySelector activeDay={activeDay} setActiveDay={setActiveDay} />

            {currentWorkout ? (
                <div className="space-y-8">
                    <WorkoutHeader
                        title={currentWorkout.title}
                        subtitle={currentWorkout.subtitle}
                        focus={currentWorkout.focus}
                    />
                    <div className="grid gap-6">
                        {currentWorkout.exercises.map((exercise, idx) => (
                            <ExerciseCard key={idx} exercise={exercise} index={idx} />
                        ))}
                    </div>
                </div>
            ) : (
                <RestDay />
            )}
        </div>
    );
}
