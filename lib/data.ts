// Types
export interface Player {
  id: string;
  name: string;
  seniority: number; // years at company
}

export interface Team {
  id: string;
  name: string;
  players: Player[];
}

export interface Match {
  id: string;
  team1: string;
  team2: string;
  score1?: number;
  score2?: number;
  played: boolean;
  date?: string;
}

export interface GroupStanding {
  teamId: string;
  teamName: string;
  pj: number; // partidos jugados
  pg: number; // ganados
  pe: number; // empatados
  pp: number; // perdidos
  gf: number; // goles a favor
  gc: number; // goles en contra
  dg: number; // diferencia
  pts: number;
}

// Fútbol 5 Data
export const futbol5Teams: Team[] = [
  {
    id: "f1",
    name: "Los Cirujanos",
    players: [
      { id: "f1p1", name: "Carlos García", seniority: 12 },
      { id: "f1p2", name: "Juan Pérez", seniority: 8 },
      { id: "f1p3", name: "Miguel Torres", seniority: 5 },
      { id: "f1p4", name: "Diego López", seniority: 3 },
      { id: "f1p5", name: "Andrés Martín", seniority: 7 },
      { id: "f1p6", name: "Pablo Ruiz", seniority: 2 },
    ],
  },
  {
    id: "f2",
    name: "Enfermería FC",
    players: [
      { id: "f2p1", name: "Roberto Silva", seniority: 10 },
      { id: "f2p2", name: "Fernando Díaz", seniority: 6 },
      { id: "f2p3", name: "Alejandro Gómez", seniority: 4 },
      { id: "f2p4", name: "Lucas Fernández", seniority: 9 },
      { id: "f2p5", name: "Matías Rodríguez", seniority: 1 },
      { id: "f2p6", name: "Sebastián Castro", seniority: 11 },
    ],
  },
  {
    id: "f3",
    name: "Administración United",
    players: [
      { id: "f3p1", name: "Ricardo Morales", seniority: 15 },
      { id: "f3p2", name: "Javier Herrera", seniority: 7 },
      { id: "f3p3", name: "Nicolás Vargas", seniority: 3 },
      { id: "f3p4", name: "Eduardo Ramírez", seniority: 5 },
      { id: "f3p5", name: "Gustavo Medina", seniority: 8 },
      { id: "f3p6", name: "Mauricio Flores", seniority: 2 },
    ],
  },
  {
    id: "f4",
    name: "Urgencias FC",
    players: [
      { id: "f4p1", name: "Cristian Vega", seniority: 6 },
      { id: "f4p2", name: "Sergio Ortiz", seniority: 4 },
      { id: "f4p3", name: "Daniel Soto", seniority: 9 },
      { id: "f4p4", name: "Adrián Navarro", seniority: 2 },
      { id: "f4p5", name: "Emilio Ríos", seniority: 7 },
      { id: "f4p6", name: "Gonzalo Mendoza", seniority: 5 },
    ],
  },
  {
    id: "f5",
    name: "Laboratorio Stars",
    players: [
      { id: "f5p1", name: "Tomás Guerrero", seniority: 11 },
      { id: "f5p2", name: "Ramiro Campos", seniority: 3 },
      { id: "f5p3", name: "Ignacio Reyes", seniority: 8 },
      { id: "f5p4", name: "Francisco Molina", seniority: 6 },
      { id: "f5p5", name: "Bruno Delgado", seniority: 4 },
      { id: "f5p6", name: "Martín Aguilar", seniority: 1 },
    ],
  },
  {
    id: "f6",
    name: "Farmacia Athletic",
    players: [
      { id: "f6p1", name: "Héctor Sandoval", seniority: 9 },
      { id: "f6p2", name: "Raúl Cabrera", seniority: 5 },
      { id: "f6p3", name: "Óscar Paredes", seniority: 7 },
      { id: "f6p4", name: "Julio Espinoza", seniority: 2 },
      { id: "f6p5", name: "Alberto Cruz", seniority: 10 },
      { id: "f6p6", name: "Leandro Peña", seniority: 4 },
    ],
  },
];

export const futbol5Groups = {
  A: ["f1", "f2", "f3"],
  B: ["f4", "f5", "f6"],
};

export const futbol5Matches: Match[] = [
  // Group A
  { id: "fm1", team1: "f1", team2: "f2", score1: 3, score2: 1, played: true },
  { id: "fm2", team1: "f2", team2: "f3", score1: 2, score2: 2, played: true },
  { id: "fm3", team1: "f1", team2: "f3", played: false },
  // Group B
  { id: "fm4", team1: "f4", team2: "f5", score1: 0, score2: 2, played: true },
  { id: "fm5", team1: "f5", team2: "f6", played: false },
  { id: "fm6", team1: "f4", team2: "f6", played: false },
];

// Padel Data
export interface PadelPair {
  id: string;
  name: string;
  player1: Player;
  player2: Player;
}

export const padelPairs: PadelPair[] = [
  {
    id: "p1",
    name: "Los Raquetazos",
    player1: { id: "pp1", name: "Carlos García", seniority: 12 },
    player2: { id: "pp2", name: "Juan Pérez", seniority: 8 },
  },
  {
    id: "p2",
    name: "Smash Bros",
    player1: { id: "pp3", name: "Roberto Silva", seniority: 10 },
    player2: { id: "pp4", name: "Fernando Díaz", seniority: 6 },
  },
  {
    id: "p3",
    name: "Los Padeleros",
    player1: { id: "pp5", name: "Miguel Torres", seniority: 5 },
    player2: { id: "pp6", name: "Diego López", seniority: 3 },
  },
  {
    id: "p4",
    name: "Drive & Volley",
    player1: { id: "pp7", name: "Ricardo Morales", seniority: 15 },
    player2: { id: "pp8", name: "Javier Herrera", seniority: 7 },
  },
  {
    id: "p5",
    name: "Los Bandeja",
    player1: { id: "pp9", name: "Cristian Vega", seniority: 6 },
    player2: { id: "pp10", name: "Sergio Ortiz", seniority: 4 },
  },
  {
    id: "p6",
    name: "Vibora Team",
    player1: { id: "pp11", name: "Tomás Guerrero", seniority: 11 },
    player2: { id: "pp12", name: "Ramiro Campos", seniority: 3 },
  },
];

export const padelGroups = {
  A: ["p1", "p2", "p3"],
  B: ["p4", "p5", "p6"],
};

export interface PadelMatch {
  id: string;
  pair1: string;
  pair2: string;
  sets1?: number;
  sets2?: number;
  played: boolean;
}

export const padelMatches: PadelMatch[] = [
  { id: "pm1", pair1: "p1", pair2: "p2", sets1: 2, sets2: 0, played: true },
  { id: "pm2", pair1: "p2", pair2: "p3", sets1: 2, sets2: 1, played: true },
  { id: "pm3", pair1: "p1", pair2: "p3", played: false },
  { id: "pm4", pair1: "p4", pair2: "p5", sets1: 1, sets2: 2, played: true },
  { id: "pm5", pair1: "p5", pair2: "p6", played: false },
  { id: "pm6", pair1: "p4", pair2: "p6", played: false },
];

// Loba Data
export interface LobaPlayer {
  id: string;
  name: string;
  seniority: number;
  points: number;
  eliminated: boolean;
}

export interface LobaTable {
  id: string;
  name: string;
  players: LobaPlayer[];
}

export const lobaTables: LobaTable[] = [
  {
    id: "lt1",
    name: "Mesa 1",
    players: [
      { id: "lp1", name: "Carlos García", seniority: 12, points: 45, eliminated: false },
      { id: "lp2", name: "Juan Pérez", seniority: 8, points: 78, eliminated: false },
      { id: "lp3", name: "Miguel Torres", seniority: 5, points: 102, eliminated: true },
      { id: "lp4", name: "Diego López", seniority: 3, points: 34, eliminated: false },
      { id: "lp5", name: "Andrés Martín", seniority: 7, points: 89, eliminated: false },
      { id: "lp6", name: "Pablo Ruiz", seniority: 2, points: 56, eliminated: false },
    ],
  },
  {
    id: "lt2",
    name: "Mesa 2",
    players: [
      { id: "lp7", name: "Roberto Silva", seniority: 10, points: 23, eliminated: false },
      { id: "lp8", name: "Fernando Díaz", seniority: 6, points: 67, eliminated: false },
      { id: "lp9", name: "Alejandro Gómez", seniority: 4, points: 105, eliminated: true },
      { id: "lp10", name: "Lucas Fernández", seniority: 9, points: 41, eliminated: false },
      { id: "lp11", name: "Matías Rodríguez", seniority: 1, points: 88, eliminated: false },
      { id: "lp12", name: "Sebastián Castro", seniority: 11, points: 52, eliminated: false },
    ],
  },
  {
    id: "lt3",
    name: "Mesa 3",
    players: [
      { id: "lp13", name: "Ricardo Morales", seniority: 15, points: 31, eliminated: false },
      { id: "lp14", name: "Javier Herrera", seniority: 7, points: 76, eliminated: false },
      { id: "lp15", name: "Nicolás Vargas", seniority: 3, points: 94, eliminated: false },
      { id: "lp16", name: "Eduardo Ramírez", seniority: 5, points: 108, eliminated: true },
      { id: "lp17", name: "Gustavo Medina", seniority: 8, points: 62, eliminated: false },
      { id: "lp18", name: "Mauricio Flores", seniority: 2, points: 47, eliminated: false },
    ],
  },
  {
    id: "lt4",
    name: "Mesa 4",
    players: [
      { id: "lp19", name: "Cristian Vega", seniority: 6, points: 55, eliminated: false },
      { id: "lp20", name: "Sergio Ortiz", seniority: 4, points: 83, eliminated: false },
      { id: "lp21", name: "Daniel Soto", seniority: 9, points: 29, eliminated: false },
      { id: "lp22", name: "Adrián Navarro", seniority: 2, points: 71, eliminated: false },
      { id: "lp23", name: "Emilio Ríos", seniority: 7, points: 103, eliminated: true },
      { id: "lp24", name: "Gonzalo Mendoza", seniority: 5, points: 44, eliminated: false },
    ],
  },
  {
    id: "lt5",
    name: "Mesa 5",
    players: [
      { id: "lp25", name: "Tomás Guerrero", seniority: 11, points: 38, eliminated: false },
      { id: "lp26", name: "Ramiro Campos", seniority: 3, points: 92, eliminated: false },
      { id: "lp27", name: "Ignacio Reyes", seniority: 8, points: 59, eliminated: false },
      { id: "lp28", name: "Francisco Molina", seniority: 6, points: 107, eliminated: true },
      { id: "lp29", name: "Bruno Delgado", seniority: 4, points: 66, eliminated: false },
      { id: "lp30", name: "Martín Aguilar", seniority: 1, points: 81, eliminated: false },
      { id: "lp31", name: "Héctor Sandoval", seniority: 9, points: 48, eliminated: false },
    ],
  },
  {
    id: "lt6",
    name: "Mesa 6",
    players: [
      { id: "lp32", name: "Raúl Cabrera", seniority: 5, points: 27, eliminated: false },
      { id: "lp33", name: "Óscar Paredes", seniority: 7, points: 74, eliminated: false },
      { id: "lp34", name: "Julio Espinoza", seniority: 2, points: 96, eliminated: false },
      { id: "lp35", name: "Alberto Cruz", seniority: 10, points: 110, eliminated: true },
      { id: "lp36", name: "Leandro Peña", seniority: 4, points: 53, eliminated: false },
      { id: "lp37", name: "Damián Rojas", seniority: 6, points: 69, eliminated: false },
      { id: "lp38", name: "Ezequiel Luna", seniority: 3, points: 42, eliminated: false },
    ],
  },
];

// Truco Data
export interface TrucoPair {
  id: string;
  name: string;
  player1: Player;
  player2: Player;
}

export const trucoPairs: TrucoPair[] = [
  {
    id: "t1",
    name: "Los Trucadores",
    player1: { id: "tp1", name: "Carlos García", seniority: 12 },
    player2: { id: "tp2", name: "Juan Pérez", seniority: 8 },
  },
  {
    id: "t2",
    name: "Envido Masters",
    player1: { id: "tp3", name: "Roberto Silva", seniority: 10 },
    player2: { id: "tp4", name: "Fernando Díaz", seniority: 6 },
  },
  {
    id: "t3",
    name: "Los Mentirosos",
    player1: { id: "tp5", name: "Miguel Torres", seniority: 5 },
    player2: { id: "tp6", name: "Diego López", seniority: 3 },
  },
  {
    id: "t4",
    name: "Retruco FC",
    player1: { id: "tp7", name: "Ricardo Morales", seniority: 15 },
    player2: { id: "tp8", name: "Javier Herrera", seniority: 7 },
  },
  {
    id: "t5",
    name: "Vale Cuatro",
    player1: { id: "tp9", name: "Cristian Vega", seniority: 6 },
    player2: { id: "tp10", name: "Sergio Ortiz", seniority: 4 },
  },
  {
    id: "t6",
    name: "Los Picantes",
    player1: { id: "tp11", name: "Tomás Guerrero", seniority: 11 },
    player2: { id: "tp12", name: "Ramiro Campos", seniority: 3 },
  },
  {
    id: "t7",
    name: "Quiero Team",
    player1: { id: "tp13", name: "Nicolás Vargas", seniority: 3 },
    player2: { id: "tp14", name: "Eduardo Ramírez", seniority: 5 },
  },
  {
    id: "t8",
    name: "Los Falta Envido",
    player1: { id: "tp15", name: "Gustavo Medina", seniority: 8 },
    player2: { id: "tp16", name: "Mauricio Flores", seniority: 2 },
  },
];

export const trucoGroups = {
  A: ["t1", "t2", "t3", "t4"],
  B: ["t5", "t6", "t7", "t8"],
};

export interface TrucoMatch {
  id: string;
  pair1: string;
  pair2: string;
  winner?: string;
  played: boolean;
}

export const trucoMatches: TrucoMatch[] = [
  { id: "tm1", pair1: "t1", pair2: "t2", winner: "t1", played: true },
  { id: "tm2", pair1: "t1", pair2: "t3", winner: "t1", played: true },
  { id: "tm3", pair1: "t1", pair2: "t4", played: false },
  { id: "tm4", pair1: "t2", pair2: "t3", winner: "t3", played: true },
  { id: "tm5", pair1: "t2", pair2: "t4", played: false },
  { id: "tm6", pair1: "t3", pair2: "t4", played: false },
  { id: "tm7", pair1: "t5", pair2: "t6", winner: "t5", played: true },
  { id: "tm8", pair1: "t5", pair2: "t7", played: false },
  { id: "tm9", pair1: "t5", pair2: "t8", played: false },
  { id: "tm10", pair1: "t6", pair2: "t7", winner: "t6", played: true },
  { id: "tm11", pair1: "t6", pair2: "t8", played: false },
  { id: "tm12", pair1: "t7", pair2: "t8", played: false },
];

// Metegol Data
export interface MetegolTeam {
  id: string;
  name: string;
  player1: Player;
  player2: Player;
}

export const metegolTeams: MetegolTeam[] = [
  {
    id: "m1",
    name: "Los Goleadores",
    player1: { id: "mp1", name: "Carlos García", seniority: 12 },
    player2: { id: "mp2", name: "Juan Pérez", seniority: 8 },
  },
  {
    id: "m2",
    name: "Metegol Masters",
    player1: { id: "mp3", name: "Roberto Silva", seniority: 10 },
    player2: { id: "mp4", name: "Fernando Díaz", seniority: 6 },
  },
  {
    id: "m3",
    name: "Los Barras",
    player1: { id: "mp5", name: "Miguel Torres", seniority: 5 },
    player2: { id: "mp6", name: "Diego López", seniority: 3 },
  },
  {
    id: "m4",
    name: "Fulbito FC",
    player1: { id: "mp7", name: "Ricardo Morales", seniority: 15 },
    player2: { id: "mp8", name: "Javier Herrera", seniority: 7 },
  },
  {
    id: "m5",
    name: "Los Muñecos",
    player1: { id: "mp9", name: "Cristian Vega", seniority: 6 },
    player2: { id: "mp10", name: "Sergio Ortiz", seniority: 4 },
  },
  {
    id: "m6",
    name: "Barra Brava",
    player1: { id: "mp11", name: "Tomás Guerrero", seniority: 11 },
    player2: { id: "mp12", name: "Ramiro Campos", seniority: 3 },
  },
  {
    id: "m7",
    name: "Los Arqueros",
    player1: { id: "mp13", name: "Nicolás Vargas", seniority: 3 },
    player2: { id: "mp14", name: "Eduardo Ramírez", seniority: 5 },
  },
  {
    id: "m8",
    name: "Defensa Central",
    player1: { id: "mp15", name: "Gustavo Medina", seniority: 8 },
    player2: { id: "mp16", name: "Mauricio Flores", seniority: 2 },
  },
  {
    id: "m9",
    name: "Los Delanteros",
    player1: { id: "mp17", name: "Daniel Soto", seniority: 9 },
    player2: { id: "mp18", name: "Adrián Navarro", seniority: 2 },
  },
  {
    id: "m10",
    name: "Mediocampo FC",
    player1: { id: "mp19", name: "Emilio Ríos", seniority: 7 },
    player2: { id: "mp20", name: "Gonzalo Mendoza", seniority: 5 },
  },
  {
    id: "m11",
    name: "Los Laterales",
    player1: { id: "mp21", name: "Ignacio Reyes", seniority: 8 },
    player2: { id: "mp22", name: "Francisco Molina", seniority: 6 },
  },
  {
    id: "m12",
    name: "Gol en Contra",
    player1: { id: "mp23", name: "Bruno Delgado", seniority: 4 },
    player2: { id: "mp24", name: "Martín Aguilar", seniority: 1 },
  },
  {
    id: "m13",
    name: "Los Centros",
    player1: { id: "mp25", name: "Héctor Sandoval", seniority: 9 },
    player2: { id: "mp26", name: "Raúl Cabrera", seniority: 5 },
  },
  {
    id: "m14",
    name: "Tiro Libre FC",
    player1: { id: "mp27", name: "Óscar Paredes", seniority: 7 },
    player2: { id: "mp28", name: "Julio Espinoza", seniority: 2 },
  },
  {
    id: "m15",
    name: "Penal Masters",
    player1: { id: "mp29", name: "Alberto Cruz", seniority: 10 },
    player2: { id: "mp30", name: "Leandro Peña", seniority: 4 },
  },
  {
    id: "m16",
    name: "Los Corners",
    player1: { id: "mp31", name: "Damián Rojas", seniority: 6 },
    player2: { id: "mp32", name: "Ezequiel Luna", seniority: 3 },
  },
  {
    id: "m17",
    name: "Fuera de Juego",
    player1: { id: "mp33", name: "Facundo Paz", seniority: 5 },
    player2: { id: "mp34", name: "Agustín Vera", seniority: 8 },
  },
  {
    id: "m18",
    name: "Los Tarjetas",
    player1: { id: "mp35", name: "Lautaro Ponce", seniority: 2 },
    player2: { id: "mp36", name: "Thiago Benítez", seniority: 4 },
  },
];

export const metegolGroups = {
  1: ["m1", "m2", "m3"],
  2: ["m4", "m5", "m6"],
  3: ["m7", "m8", "m9"],
  4: ["m10", "m11", "m12"],
  5: ["m13", "m14", "m15"],
  6: ["m16", "m17", "m18"],
};

// Sapo Data
export interface SapoPair {
  id: string;
  name: string;
  player1: Player;
  player2: Player;
  round1Score?: number;
  round2Score?: number;
  totalScore?: number;
}

export const sapoPairs: SapoPair[] = [
  {
    id: "s1",
    name: "Los Sapitos",
    player1: { id: "sp1", name: "Carlos García", seniority: 12 },
    player2: { id: "sp2", name: "Juan Pérez", seniority: 8 },
    round1Score: 85,
    round2Score: 92,
    totalScore: 177,
  },
  {
    id: "s2",
    name: "Rana Team",
    player1: { id: "sp3", name: "Roberto Silva", seniority: 10 },
    player2: { id: "sp4", name: "Fernando Díaz", seniority: 6 },
    round1Score: 78,
    round2Score: 88,
    totalScore: 166,
  },
  {
    id: "s3",
    name: "Los Bocones",
    player1: { id: "sp5", name: "Miguel Torres", seniority: 5 },
    player2: { id: "sp6", name: "Diego López", seniority: 3 },
    round1Score: 95,
    round2Score: 90,
    totalScore: 185,
  },
  {
    id: "s4",
    name: "Sapo Masters",
    player1: { id: "sp7", name: "Ricardo Morales", seniority: 15 },
    player2: { id: "sp8", name: "Javier Herrera", seniority: 7 },
    round1Score: 82,
    round2Score: 79,
    totalScore: 161,
  },
  {
    id: "s5",
    name: "Los Tiradores",
    player1: { id: "sp9", name: "Cristian Vega", seniority: 6 },
    player2: { id: "sp10", name: "Sergio Ortiz", seniority: 4 },
    round1Score: 91,
    round2Score: 87,
    totalScore: 178,
  },
  {
    id: "s6",
    name: "Puntería FC",
    player1: { id: "sp11", name: "Tomás Guerrero", seniority: 11 },
    player2: { id: "sp12", name: "Ramiro Campos", seniority: 3 },
    round1Score: 76,
    round2Score: 81,
    totalScore: 157,
  },
  {
    id: "s7",
    name: "Los Certeros",
    player1: { id: "sp13", name: "Nicolás Vargas", seniority: 3 },
    player2: { id: "sp14", name: "Eduardo Ramírez", seniority: 5 },
    round1Score: 88,
    round2Score: 94,
    totalScore: 182,
  },
  {
    id: "s8",
    name: "Boca Abierta",
    player1: { id: "sp15", name: "Gustavo Medina", seniority: 8 },
    player2: { id: "sp16", name: "Mauricio Flores", seniority: 2 },
    round1Score: 72,
    round2Score: 85,
    totalScore: 157,
  },
  {
    id: "s9",
    name: "Los Fichas",
    player1: { id: "sp17", name: "Daniel Soto", seniority: 9 },
    player2: { id: "sp18", name: "Adrián Navarro", seniority: 2 },
    round1Score: 89,
    round2Score: 91,
    totalScore: 180,
  },
  {
    id: "s10",
    name: "Tiro al Sapo",
    player1: { id: "sp19", name: "Emilio Ríos", seniority: 7 },
    player2: { id: "sp20", name: "Gonzalo Mendoza", seniority: 5 },
    round1Score: 80,
    round2Score: 83,
    totalScore: 163,
  },
  {
    id: "s11",
    name: "Los Aros",
    player1: { id: "sp21", name: "Ignacio Reyes", seniority: 8 },
    player2: { id: "sp22", name: "Francisco Molina", seniority: 6 },
    round1Score: 93,
    round2Score: 86,
    totalScore: 179,
  },
  {
    id: "s12",
    name: "Canasta Team",
    player1: { id: "sp23", name: "Bruno Delgado", seniority: 4 },
    player2: { id: "sp24", name: "Martín Aguilar", seniority: 1 },
    round1Score: 74,
    round2Score: 78,
    totalScore: 152,
  },
  {
    id: "s13",
    name: "Los Puntos",
    player1: { id: "sp25", name: "Héctor Sandoval", seniority: 9 },
    player2: { id: "sp26", name: "Raúl Cabrera", seniority: 5 },
    round1Score: 87,
    round2Score: 89,
    totalScore: 176,
  },
  {
    id: "s14",
    name: "Ojo de Águila",
    player1: { id: "sp27", name: "Óscar Paredes", seniority: 7 },
    player2: { id: "sp28", name: "Julio Espinoza", seniority: 2 },
    round1Score: 79,
    round2Score: 84,
    totalScore: 163,
  },
  {
    id: "s15",
    name: "Los Finales",
    player1: { id: "sp29", name: "Alberto Cruz", seniority: 10 },
    player2: { id: "sp30", name: "Leandro Peña", seniority: 4 },
    round1Score: 84,
    round2Score: 82,
    totalScore: 166,
  },
];

// Discipline Icons and Metadata
export const disciplines = [
  { id: "futbol5", name: "Fútbol 5", icon: "⚽", href: "/futbol5", color: "bg-green-500" },
  { id: "padel", name: "Padel", icon: "🎾", href: "/padel", color: "bg-yellow-500" },
  { id: "loba", name: "Loba", icon: "🃏", href: "/loba", color: "bg-red-500" },
  { id: "truco", name: "Truco", icon: "🎴", href: "/truco", color: "bg-blue-500" },
  { id: "metegol", name: "Metegol", icon: "🕹️", href: "/metegol", color: "bg-purple-500" },
  { id: "sapo", name: "Sapo", icon: "🐸", href: "/sapo", color: "bg-emerald-500" },
];
