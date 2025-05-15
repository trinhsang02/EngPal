export interface Vocab {
    word: string;
    pos: string;
    phonetic: string;
    phonetic_text: string;
    phonetic_am: string;
    phonetic_am_text: string;
    senses: {
      definition: string;
      examples: { x: string; cf: string }[];
    }[];
  }
  