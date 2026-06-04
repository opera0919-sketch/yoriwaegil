export const Colors = {
  paper: '#FAF4EA',
  card: '#FFFDF8',
  ink: '#2B2118',
  soft: '#7A6A58',
  line: '#E9DDCA',
  accent: '#BE4329',
  accentDark: '#94311D',
  gold: '#C98A2B',

  catColor: {
    한식: '#BE4329',
    중식: '#C98A2B',
    양식: '#6F7A52',
    일식: '#4A6C7A',
    기타: '#8A6D8B',
  } as Record<string, string>,
};

export const CATS = ['한식', '중식', '양식', '일식', '기타'] as const;
export type Category = typeof CATS[number];

export const GROUPS = ['채소', '육류·해산물', '양념·소스', '기타'] as const;
export type IngGroup = typeof GROUPS[number];
