import { GameRoom, Player, IPlayerService } from '../types/server-models';

export class PlayerService implements IPlayerService {
  private players: {
    [id: string]: Player;
  };

  constructor() {
    this.players = {};
    // console.log('PlayerService instance created');
  }

  public get playerList() {
    return this.players;
  }

  getPlayerBySocketId(socketId: string): Player {
    return this.players[socketId];
  }

  createPlayer(socketId, playerInfo): Player {
    console.log('createPlayer(): creating player', socketId);
    return (this.players[socketId] = {
      id: socketId,
      color: playerInfo.color,
      assignedRoom: '',
      gameState: {
        availablePower: 0,
      },
    });
  }

  assignRoom(playerId: string, room: GameRoom): Player {
    console.log('assignRoom(): assigning room to player', room.id);
    return (this.players[playerId] = {
      ...this.players[playerId],
      assignedRoom: room.id,
    });
  }

  removePlayer(playerId) {
    console.log('removePlayer(): removing player', playerId);
    delete this.players[playerId];
  }
}

// export const playerService = new PlayerService();
