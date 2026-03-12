export class ScoreEntry {
    constructor({ name, color, wpm, errors, isBot, rank }) {
      this.name   = name;
      this.color  = color;
      this.wpm    = wpm;
      this.errors = errors;
      this.isBot  = isBot;
      this.rank   = rank;
    }
  }