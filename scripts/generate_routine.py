import json
import re
import difflib
import os

# Nombres de archivos esperados
DATASET_1_PATH = 'dataset_1.json' # hasaneyldrm/exercises-dataset
DATASET_2_PATH = 'dataset_2.json' # arhxam/free-exercise-db-with-videos
OUTPUT_DB = 'data/combined_exercises.json'
OUTPUT_ROUTINE = 'data/routine_nippard.json'

def normalize_string(s):
    """Limpia el string para hacer mejores coincidencias"""
    if not s: return ""
    s = s.lower()
    s = re.sub(r'[^a-z0-9\s]', '', s) # quita puntuación
    return s.strip()

def load_json(filepath):
    if not os.path.exists(filepath):
        print(f"ERROR: No se encontro {filepath}. Crea este archivo con el dataset correspondiente.")
        return []
    with open(filepath, 'r', encoding='utf-8') as f:
        return json.load(f)

def merge_datasets(ds1, ds2):
    print("Iniciando fusión de datasets...")
    
    # Crear un diccionario del ds2 usando el nombre normalizado para búsquedas rápidas
    ds2_dict = {normalize_string(ex.get('name', '')): ex for ex in ds2}
    ds2_names = list(ds2_dict.keys())
    
    combined_db = []
    
    for ex1 in ds1:
        base_name = ex1.get('name', '')
        norm_name = normalize_string(base_name)
        
        combined_ex = {
            "id": ex1.get('id', norm_name.replace(' ', '_')),
            "name": base_name,
            "target": ex1.get('target', ''),
            "body_part": ex1.get('body_part', ''),
            "equipment": ex1.get('equipment', ''),
            "gif_url": ex1.get('gif_url', ''),
            "image": ex1.get('image', ''),
            "instructions": ex1.get('instructions', []),
            "instruction_steps": ex1.get('instruction_steps', [])
        }
        
        # Buscar el ejercicio equivalente en ds2 (coincidencia mayor al 80%)
        matches = difflib.get_close_matches(norm_name, ds2_names, n=1, cutoff=0.8)
        
        if matches:
            match_key = matches[0]
            ex2 = ds2_dict[match_key]
            
            # Enriquecer con los datos de videos reales y técnica
            combined_ex["videos"] = ex2.get('videos', {})
            combined_ex["formCues"] = ex2.get('formCues', [])
            combined_ex["commonMistakes"] = ex2.get('commonMistakes', [])
            combined_ex["thumbnails"] = ex2.get('thumbnails', [])
            
        combined_db.append(combined_ex)
        
    print(f"Fusion completada: {len(combined_db)} ejercicios resultantes.")
    return combined_db

def find_exercise(db, keywords):
    """Busca un ejercicio en la base de datos basándose en palabras clave"""
    for kw in keywords:
        norm_kw = normalize_string(kw)
        for ex in db:
            if norm_kw in normalize_string(ex['name']):
                return ex
    return None

def generate_nippard_routine(db):
    print("Generando Rutina de 5 días de Jeff Nippard...")
    
    # Plantilla de la rutina: Día, Nombre, Ejercicios (keywords para buscar), Sets, Reps
    template = [
        {
            "id": "monday",
            "label": "Día 1: Push (Empuje)",
            "exercises": [
                (["bench press", "press de banca"], 3, "5-8"),
                (["overhead press", "press militar"], 3, "8-10"),
                (["incline dumbbell press", "press inclinado mancuernas"], 3, "10-12"),
                (["lateral raise", "elevaciones laterales"], 4, "12-15"),
                (["triceps pushdown", "extensión tríceps polea"], 3, "12-15")
            ]
        },
        {
            "id": "tuesday",
            "label": "Día 2: Pull (Tirón)",
            "exercises": [
                (["pull up", "dominadas"], 3, "6-8"),
                (["barbell row", "remo con barra"], 3, "8-10"),
                (["lat pulldown", "jalón al pecho"], 3, "10-12"),
                (["face pull", "face pulls"], 3, "15-20"),
                (["bicep curl", "curl de bíceps"], 3, "10-15")
            ]
        },
        {
            "id": "wednesday",
            "label": "Día 3: Legs (Piernas)",
            "exercises": [
                (["squat", "sentadilla"], 3, "5-8"),
                (["romanian deadlift", "peso muerto rumano"], 3, "8-10"),
                (["leg press", "prensa de piernas"], 3, "10-12"),
                (["leg curl", "curl de isquios"], 3, "12-15"),
                (["calf raise", "elevación de gemelos"], 4, "15-20")
            ]
        },
        {
            "id": "thursday",
            "label": "Día 4: Upper Body (Tren Superior)",
            "exercises": [
                (["incline bench press", "press inclinado"], 3, "8-10"),
                (["seated cable row", "remo sentado en polea"], 3, "10-12"),
                (["dumbbell shoulder press", "press de hombros mancuernas"], 3, "10-12"),
                (["pullover", "lat pullover"], 3, "12-15"),
                (["hammer curl", "curl martillo"], 3, "12-15"),
                (["skull crusher", "rompecráneos"], 3, "10-15")
            ]
        },
        {
            "id": "friday",
            "label": "Día 5: Lower Body (Tren Inferior)",
            "exercises": [
                (["deadlift", "peso muerto"], 3, "5-8"),
                (["front squat", "sentadilla frontal", "bulgarian split squat"], 3, "8-10"),
                (["leg extension", "extensión de cuádriceps"], 3, "12-15"),
                (["seated leg curl", "curl isquios sentado"], 3, "12-15"),
                (["seated calf raise", "gemelos sentado"], 4, "15-20")
            ]
        }
    ]

    routine_days = []
    
    for day in template:
        day_exercises = []
        for kw_list, sets, reps in day["exercises"]:
            ex = find_exercise(db, kw_list)
            if ex:
                day_exercises.append({
                    "id": ex["id"],
                    "name": ex["name"],
                    "sets": sets,
                    "repsMin": int(reps.split('-')[0]),
                    "repsMax": int(reps.split('-')[1]) if '-' in reps else int(reps),
                    "unit": "reps",
                    "gif_url": ex.get("gif_url", ""),
                    "imageUrls": ex.get("thumbnails", [ex.get("image", "")])
                })
            else:
                print(f"WARNING: No se encontro ejercicio para: {kw_list[0]}")
                
        routine_days.append({
            "id": day["id"],
            "label": day["label"],
            "intensity": "Alta" if day["id"] in ["monday", "wednesday", "friday"] else "Media",
            "exercises": day_exercises
        })

    routine = {
        "id": "nippard_5day",
        "name": "Jeff Nippard 5-Day Split",
        "description": "Rutina de hipertrofia basada en el esquema Upper/Lower/Push/Pull/Legs.",
        "days": routine_days
    }
    
    return routine

def main():
    ds1 = load_json(DATASET_1_PATH)
    ds2 = load_json(DATASET_2_PATH)
    
    if not ds1 or not ds2:
        return
        
    os.makedirs('data', exist_ok=True)
        
    combined_db = merge_datasets(ds1, ds2)
    with open(OUTPUT_DB, 'w', encoding='utf-8') as f:
        json.dump(combined_db, f, indent=2, ensure_ascii=False)
        print(f"Base de datos combinada guardada en {OUTPUT_DB}")
        
    routine = generate_nippard_routine(combined_db)
    with open(OUTPUT_ROUTINE, 'w', encoding='utf-8') as f:
        json.dump(routine, f, indent=2, ensure_ascii=False)
        print(f"Rutina Jeff Nippard guardada en {OUTPUT_ROUTINE}")

if __name__ == "__main__":
    main()
