import { RACE_STATUS } from "../constants";

export class RaceModel {
  constructor({ text, mode, roomId = null }) {
    this.text      = text;
    this.mode      = mode;
    this.roomId    = roomId;
    this.status    = RACE_STATUS.IDLE;
    this.startTime = null;
    this.players   = [];   // PlayerModel[]
    this.scores    = [];   // sorted ScoreEntry[]
  }

  get totalLanes()   { return this.players.length; }
  get humanPlayers() { return this.players.filter(p => !p.isBot); }
  get botPlayers()   { return this.players.filter(p =>  p.isBot); }
}