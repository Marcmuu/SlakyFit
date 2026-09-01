import type { Exercise, Equipment, ExerciseType, Muscle, ExerciseSection } from '../types'
import { EXERCISE_MEDIA_BASE, exerciseMediaMap } from './exerciseMedia'

function ex(
  id: string,
  name: string,
  mainMuscles: Muscle[],
  pattern: string,
  equipment: Equipment,
  type: ExerciseType,
  alternativeIds: string[] = [],
  extra: Partial<Exercise> = {},
): Exercise {
  const incrementByEquipment: Record<Equipment, number> = {
    barbell: 2.5,
    dumbbell: 2,
    machine: 5,
    cable: 2.5,
    bodyweight: 0,
    smith: 2.5,
  }
  return {
    id,
    name,
    section: 'main' as ExerciseSection,
    mainMuscles,
    pattern,
    equipment,
    type,
    alternativeIds,
    media: { kind: 'placeholder', label: name },
    instructions: extra.instructions ?? [
      'Coloca el cuerpo en posición estable antes de iniciar el movimiento.',
      'Realiza la fase excéntrica de forma controlada.',
      'Evita bloquear las articulaciones al final del recorrido.',
    ],
    mistakes: extra.mistakes ?? ['Usar impulso en vez de control muscular.', 'Rango de movimiento incompleto.'],
    tips: extra.tips ?? ['Prioriza la técnica antes que el peso.', 'Controla el tempo, especialmente en la bajada.'],
    weightIncrement: extra.weightIncrement ?? incrementByEquipment[equipment],
    comparisonGroup: extra.comparisonGroup,
    ...extra,
  }
}

export const exercises: Exercise[] = [
  // ---------- PUSH ----------
  ex('press-banca-barra', 'Press banca con barra', ['pecho', 'triceps', 'hombro'], 'Empuje horizontal', 'barbell', 'compound-main', ['press-plano-mancuernas', 'press-pecho-maquina']),
  ex('press-plano-mancuernas', 'Press plano con mancuernas', ['pecho', 'triceps', 'hombro'], 'Empuje horizontal', 'dumbbell', 'compound-main', ['press-banca-barra', 'press-pecho-maquina']),
  ex('press-pecho-maquina', 'Press pecho máquina', ['pecho', 'triceps'], 'Empuje horizontal', 'machine', 'compound-main', ['press-banca-barra', 'press-plano-mancuernas']),

  ex('aperturas-polea', 'Aperturas en polea', ['pecho'], 'Aducción horizontal', 'cable', 'isolation', ['pec-deck', 'aperturas-mancuernas']),
  ex('pec-deck', 'Pec-deck', ['pecho'], 'Aducción horizontal', 'machine', 'isolation', ['aperturas-polea', 'aperturas-mancuernas']),
  ex('aperturas-mancuernas', 'Aperturas con mancuernas', ['pecho'], 'Aducción horizontal', 'dumbbell', 'isolation', ['aperturas-polea', 'pec-deck']),

  ex('press-militar-mancuernas', 'Press militar sentado con mancuernas', ['hombro', 'triceps'], 'Empuje vertical', 'dumbbell', 'compound-secondary', ['press-hombro-maquina', 'press-militar-barra']),
  ex('press-hombro-maquina', 'Press hombro máquina', ['hombro', 'triceps'], 'Empuje vertical', 'machine', 'compound-secondary', ['press-militar-mancuernas', 'press-militar-barra']),
  ex('press-militar-barra', 'Press militar con barra', ['hombro', 'triceps'], 'Empuje vertical', 'barbell', 'compound-secondary', ['press-militar-mancuernas', 'press-hombro-maquina']),

  ex('elevaciones-laterales', 'Elevaciones laterales', ['hombro'], 'Abducción de hombro', 'dumbbell', 'isolation', ['elevaciones-laterales-polea', 'elevaciones-laterales-maquina']),
  ex('elevaciones-laterales-polea', 'Elevaciones laterales en polea unilateral', ['hombro'], 'Abducción de hombro', 'cable', 'isolation', ['elevaciones-laterales', 'elevaciones-laterales-maquina']),
  ex('elevaciones-laterales-maquina', 'Elevaciones laterales en máquina', ['hombro'], 'Abducción de hombro', 'machine', 'isolation', ['elevaciones-laterales', 'elevaciones-laterales-polea']),

  ex('extension-triceps-polea', 'Extensión de tríceps en polea', ['triceps'], 'Extensión de codo', 'cable', 'isolation', ['extension-triceps-barra-v', 'extension-triceps-polea-unilateral']),
  ex('extension-triceps-barra-v', 'Extensión de tríceps con barra V', ['triceps'], 'Extensión de codo', 'cable', 'isolation', ['extension-triceps-polea', 'extension-triceps-polea-unilateral']),
  ex('extension-triceps-polea-unilateral', 'Extensión de tríceps en polea unilateral', ['triceps'], 'Extensión de codo', 'cable', 'isolation', ['extension-triceps-polea', 'extension-triceps-barra-v']),

  ex('extension-triceps-cuerda', 'Extensión de tríceps por encima de la cabeza con cuerda', ['triceps'], 'Extensión de codo overhead', 'cable', 'isolation', ['extension-triceps-mancuerna', 'extension-triceps-polea-unilateral']),
  ex('extension-triceps-mancuerna', 'Extensión de tríceps overhead con mancuerna', ['triceps'], 'Extensión de codo overhead', 'dumbbell', 'isolation', ['extension-triceps-cuerda', 'extension-triceps-polea-unilateral']),

  ex('press-inclinado-mancuernas', 'Press inclinado con mancuernas', ['pecho', 'hombro', 'triceps'], 'Empuje horizontal-alto', 'dumbbell', 'compound-main', ['press-inclinado-smith', 'press-inclinado-maquina']),
  ex('press-inclinado-smith', 'Press inclinado en Smith', ['pecho', 'hombro', 'triceps'], 'Empuje horizontal-alto', 'smith', 'compound-main', ['press-inclinado-mancuernas', 'press-inclinado-maquina']),
  ex('press-inclinado-maquina', 'Press inclinado en máquina', ['pecho', 'hombro', 'triceps'], 'Empuje horizontal-alto', 'machine', 'compound-main', ['press-inclinado-mancuernas', 'press-inclinado-smith']),

  ex('fondos-pecho', 'Fondos orientados a pecho', ['pecho', 'triceps'], 'Empuje vertical descendente', 'bodyweight', 'compound-main', ['fondos-asistidos', 'press-declinado-maquina']),
  ex('fondos-asistidos', 'Fondos asistidos', ['pecho', 'triceps'], 'Empuje vertical descendente', 'machine', 'compound-main', ['fondos-pecho', 'press-declinado-maquina']),
  ex('press-declinado-maquina', 'Press declinado / máquina', ['pecho', 'triceps'], 'Empuje horizontal descendente', 'machine', 'compound-main', ['fondos-pecho', 'fondos-asistidos']),

  ex('press-frances-ez', 'Press francés con barra EZ', ['triceps'], 'Extensión de codo overhead', 'barbell', 'isolation', ['extension-overhead-polea', 'extension-overhead-mancuerna']),
  ex('extension-overhead-polea', 'Extensión overhead en polea', ['triceps'], 'Extensión de codo overhead', 'cable', 'isolation', ['press-frances-ez', 'extension-overhead-mancuerna']),
  ex('extension-overhead-mancuerna', 'Extensión overhead con mancuerna', ['triceps'], 'Extensión de codo overhead', 'dumbbell', 'isolation', ['press-frances-ez', 'extension-overhead-polea']),

  ex('triceps-unilateral-polea', 'Tríceps unilateral en polea', ['triceps'], 'Extensión de codo', 'cable', 'isolation', ['triceps-cuerda', 'triceps-barra-polea']),
  ex('triceps-cuerda', 'Tríceps en polea con cuerda', ['triceps'], 'Extensión de codo', 'cable', 'isolation', ['triceps-unilateral-polea', 'triceps-barra-polea']),
  ex('triceps-barra-polea', 'Tríceps en polea con barra', ['triceps'], 'Extensión de codo', 'cable', 'isolation', ['triceps-unilateral-polea', 'triceps-cuerda']),

  // ---------- PULL ----------
  ex('dominadas', 'Dominadas', ['espalda', 'biceps'], 'Tracción vertical', 'bodyweight', 'compound-main', ['dominadas-asistidas', 'jalon-pecho']),
  ex('dominadas-asistidas', 'Dominadas asistidas', ['espalda', 'biceps'], 'Tracción vertical', 'machine', 'compound-main', ['dominadas', 'jalon-pecho']),
  ex('jalon-pecho', 'Jalón al pecho', ['espalda', 'biceps'], 'Tracción vertical', 'cable', 'compound-secondary', ['jalon-neutro', 'jalon-unilateral']),
  ex('jalon-neutro', 'Jalón agarre neutro', ['espalda', 'biceps'], 'Tracción vertical', 'cable', 'compound-main', ['jalon-convencional', 'dominadas-asistidas']),
  ex('jalon-unilateral', 'Jalón unilateral', ['espalda', 'biceps'], 'Tracción vertical', 'cable', 'compound-secondary', ['jalon-pecho', 'jalon-neutro']),
  ex('jalon-convencional', 'Jalón convencional agarre ancho', ['espalda', 'biceps'], 'Tracción vertical', 'cable', 'compound-main', ['jalon-neutro', 'dominadas-asistidas']),

  ex('remo-t', 'Remo T con pecho apoyado', ['espalda', 'biceps'], 'Tracción horizontal', 'machine', 'compound-main', ['remo-maquina', 'remo-polea']),
  ex('remo-maquina', 'Remo en máquina', ['espalda', 'biceps'], 'Tracción horizontal', 'machine', 'compound-main', ['remo-t', 'remo-polea']),
  ex('remo-polea', 'Remo en polea', ['espalda', 'biceps'], 'Tracción horizontal', 'cable', 'compound-main', ['remo-t', 'remo-maquina']),
  ex('remo-sentado-polea', 'Remo sentado en polea', ['espalda', 'biceps'], 'Tracción horizontal', 'cable', 'compound-main', ['remo-maquina', 'remo-mancuerna']),
  ex('remo-mancuerna', 'Remo con mancuerna', ['espalda', 'biceps'], 'Tracción horizontal', 'dumbbell', 'compound-main', ['remo-sentado-polea', 'remo-maquina']),

  ex('curl-ez-pie', 'Curl con barra EZ de pie', ['biceps'], 'Flexión de codo', 'barbell', 'isolation', ['curl-barra-recta', 'curl-polea']),
  ex('curl-barra-recta', 'Curl con barra recta', ['biceps'], 'Flexión de codo', 'barbell', 'isolation', ['curl-ez-pie', 'curl-polea']),
  ex('curl-polea', 'Curl en polea', ['biceps'], 'Flexión de codo', 'cable', 'isolation', ['curl-ez-pie', 'curl-barra-recta']),

  ex('curl-martillo', 'Curl martillo', ['biceps', 'antebrazo'], 'Flexión de codo neutra', 'dumbbell', 'isolation', ['curl-martillo-cuerda', 'curl-martillo-alterno']),
  ex('curl-martillo-cuerda', 'Curl martillo en polea con cuerda', ['biceps', 'antebrazo'], 'Flexión de codo neutra', 'cable', 'isolation', ['curl-martillo', 'curl-martillo-alterno']),
  ex('curl-martillo-alterno', 'Curl martillo alterno', ['biceps', 'antebrazo'], 'Flexión de codo neutra', 'dumbbell', 'isolation', ['curl-martillo', 'curl-martillo-cuerda']),

  ex('face-pull', 'Face pull', ['hombro', 'espalda'], 'Tracción horizontal alta', 'cable', 'isolation', ['reverse-pec-deck', 'pajaros-polea']),
  ex('reverse-pec-deck', 'Reverse pec-deck', ['hombro', 'espalda'], 'Tracción horizontal alta', 'machine', 'isolation', ['face-pull', 'pajaros-mancuerna']),
  ex('pajaros-polea', 'Pájaros en polea', ['hombro', 'espalda'], 'Tracción horizontal alta', 'cable', 'isolation', ['face-pull', 'reverse-pec-deck']),
  ex('pajaros-mancuerna', 'Pájaros con mancuerna', ['hombro', 'espalda'], 'Tracción horizontal alta', 'dumbbell', 'isolation', ['reverse-pec-deck', 'face-pull']),

  ex('pullover-polea', 'Pullover en polea con brazos rectos', ['espalda', 'pecho'], 'Extensión de hombro', 'cable', 'isolation', ['pullover-maquina', 'pullover-polea-unilateral']),
  ex('pullover-maquina', 'Pullover en máquina', ['espalda', 'pecho'], 'Extensión de hombro', 'machine', 'isolation', ['pullover-polea', 'pullover-polea-unilateral']),
  ex('pullover-polea-unilateral', 'Pullover en polea unilateral', ['espalda', 'pecho'], 'Extensión de hombro', 'cable', 'isolation', ['pullover-polea', 'pullover-maquina']),

  ex('curl-inclinado-mancuernas', 'Curl inclinado con mancuernas', ['biceps'], 'Flexión de codo en estiramiento', 'dumbbell', 'isolation', ['curl-bayesian-polea', 'curl-predicador']),
  ex('curl-bayesian-polea', 'Curl Bayesian en polea', ['biceps'], 'Flexión de codo en estiramiento', 'cable', 'isolation', ['curl-inclinado-mancuernas', 'curl-predicador']),
  ex('curl-predicador', 'Curl predicador', ['biceps'], 'Flexión de codo', 'barbell', 'isolation', ['curl-inclinado-mancuernas', 'curl-bayesian-polea']),

  // ---------- LEGS ----------
  ex('sentadilla', 'Sentadilla con barra', ['cuadriceps', 'gluteo'], 'Sentadilla', 'barbell', 'compound-main', ['hack-squat', 'prensa'], { comparisonGroup: 'rodilla-dominante' }),
  ex('hack-squat', 'Hack squat', ['cuadriceps', 'gluteo'], 'Sentadilla', 'machine', 'compound-main', ['sentadilla', 'prensa'], { comparisonGroup: 'rodilla-dominante' }),
  ex('prensa', 'Prensa', ['cuadriceps', 'gluteo'], 'Sentadilla', 'machine', 'compound-main', ['sentadilla', 'hack-squat'], { comparisonGroup: 'rodilla-dominante' }),

  ex('peso-muerto-rumano', 'Peso muerto rumano', ['isquios', 'gluteo'], 'Bisagra de cadera', 'barbell', 'compound-main', ['rdl-mancuernas', 'rdl-smith']),
  ex('rdl-mancuernas', 'RDL con mancuernas', ['isquios', 'gluteo'], 'Bisagra de cadera', 'dumbbell', 'compound-main', ['peso-muerto-rumano', 'rdl-smith']),
  ex('rdl-smith', 'RDL en Smith', ['isquios', 'gluteo'], 'Bisagra de cadera', 'smith', 'compound-main', ['peso-muerto-rumano', 'rdl-mancuernas']),

  ex('extension-cuadriceps', 'Extensión de cuádriceps', ['cuadriceps'], 'Extensión de rodilla', 'machine', 'isolation', ['extension-cuadriceps-unilateral', 'prensa-ligera']),
  ex('extension-cuadriceps-unilateral', 'Extensión de cuádriceps unilateral', ['cuadriceps'], 'Extensión de rodilla', 'machine', 'isolation', ['extension-cuadriceps', 'prensa-ligera']),
  ex('prensa-ligera', 'Prensa ligera (cuádriceps)', ['cuadriceps'], 'Sentadilla', 'machine', 'isolation', ['extension-cuadriceps', 'extension-cuadriceps-unilateral']),

  ex('curl-femoral-sentado', 'Curl femoral sentado', ['isquios'], 'Flexión de rodilla', 'machine', 'isolation', ['curl-femoral-tumbado', 'curl-femoral-unilateral']),
  ex('curl-femoral-tumbado', 'Curl femoral tumbado', ['isquios'], 'Flexión de rodilla', 'machine', 'isolation', ['curl-femoral-sentado', 'curl-femoral-unilateral']),
  ex('curl-femoral-unilateral', 'Curl femoral unilateral', ['isquios'], 'Flexión de rodilla', 'machine', 'isolation', ['curl-femoral-sentado', 'curl-femoral-tumbado']),

  ex('gemelos-maquina', 'Gemelos en máquina', ['gemelos'], 'Flexión plantar', 'machine', 'isolation', ['gemelos-prensa', 'gemelo-de-pie']),
  ex('gemelos-prensa', 'Gemelos en prensa', ['gemelos'], 'Flexión plantar', 'machine', 'isolation', ['gemelos-maquina', 'gemelo-de-pie']),
  ex('gemelo-de-pie', 'Gemelo de pie', ['gemelos'], 'Flexión plantar', 'machine', 'isolation', ['gemelos-maquina', 'gemelos-prensa']),

  // ---------- ABS ----------
  ex('plancha', 'Plancha frontal', ['core'], 'Anti-extensión', 'bodyweight', 'isolation', [], { section: 'abs', defaultDurationSec: 40 }),
  ex('crunch-polea', 'Crunch en polea', ['core'], 'Flexión de tronco', 'cable', 'isolation', [], { section: 'abs' }),
  ex('elevacion-piernas-colgado', 'Elevación de piernas colgado', ['core'], 'Flexión de cadera', 'bodyweight', 'isolation', [], { section: 'abs' }),
  ex('rueda-abdominal', 'Rueda abdominal', ['core'], 'Anti-extensión', 'bodyweight', 'isolation', [], { section: 'abs' }),
  ex('crunch-maquina', 'Crunch en máquina', ['core'], 'Flexión de tronco', 'machine', 'isolation', [], { section: 'abs' }),
  ex('oblicuo-polea', 'Oblicuo en polea (leñador)', ['core'], 'Rotación de tronco', 'cable', 'isolation', [], { section: 'abs' }),

  // ---------- MOVILIDAD ----------
  ex('movilidad-hombro-circulos', 'Círculos de hombro con banda', ['hombro'], 'Movilidad', 'bodyweight', 'isolation', [], { section: 'mobility', defaultDurationSec: 45 }),
  ex('movilidad-toracica', 'Rotación torácica en cuadrupedia', ['espalda'], 'Movilidad', 'bodyweight', 'isolation', [], { section: 'mobility', defaultDurationSec: 45 }),
  ex('movilidad-cadera-90-90', 'Movilidad de cadera 90/90', ['gluteo'], 'Movilidad', 'bodyweight', 'isolation', [], { section: 'mobility', defaultDurationSec: 60 }),
  ex('movilidad-tobillo', 'Movilidad de tobillo en pared', ['gemelos'], 'Movilidad', 'bodyweight', 'isolation', [], { section: 'mobility', defaultDurationSec: 45 }),
  ex('movilidad-columna-gato-camello', 'Gato-camello', ['espalda'], 'Movilidad', 'bodyweight', 'isolation', [], { section: 'mobility', defaultDurationSec: 45 }),

  // ---------- FLEXIBILIDAD ----------
  ex('estiramiento-pecho-puerta', 'Estiramiento de pecho en marco de puerta', ['pecho'], 'Estiramiento', 'bodyweight', 'isolation', [], { section: 'flexibility', defaultDurationSec: 30 }),
  ex('estiramiento-isquios-pie', 'Estiramiento de isquiosurales de pie', ['isquios'], 'Estiramiento', 'bodyweight', 'isolation', [], { section: 'flexibility', defaultDurationSec: 30 }),
  ex('estiramiento-cuadriceps-pie', 'Estiramiento de cuádriceps de pie', ['cuadriceps'], 'Estiramiento', 'bodyweight', 'isolation', [], { section: 'flexibility', defaultDurationSec: 30 }),
  ex('estiramiento-gluteo-figura4', 'Estiramiento de glúteo (figura 4)', ['gluteo'], 'Estiramiento', 'bodyweight', 'isolation', [], { section: 'flexibility', defaultDurationSec: 30 }),
  ex('estiramiento-flexor-cadera', 'Estiramiento de flexor de cadera', ['gluteo'], 'Estiramiento', 'bodyweight', 'isolation', [], { section: 'flexibility', defaultDurationSec: 30 }),
  ex('estiramiento-dorsal-colgado', 'Estiramiento de dorsal colgado', ['espalda'], 'Estiramiento', 'bodyweight', 'isolation', [], { section: 'flexibility', defaultDurationSec: 30 }),
]

for (const exercise of exercises) {
  const files = exerciseMediaMap[exercise.id]
  if (files) exercise.externalImages = files.map((f) => `${EXERCISE_MEDIA_BASE}/${f}`)
}

export const exerciseMap: Record<string, Exercise> = Object.fromEntries(exercises.map((e) => [e.id, e]))

export function getExercise(id: string): Exercise | undefined {
  return exerciseMap[id]
}
