export class RoomModel {
    constructor({ id, hostId, text, status = "waiting", players = [] }) {
      this.id      = id;
      this.hostId  = hostId;
      this.text    = text;
      this.status  = status;
      this.players = players;
    }
  }