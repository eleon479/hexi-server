import { mapBuilder } from '../utils/mapBuilder';
import { randomUUID } from 'crypto';
import {
  GameMap,
  GameRoom,
  GameState,
  Player,
  IGameRoomService,
  Stage,
} from '../types/server-models';
import { log } from 'console';

export class GameRoomService implements IGameRoomService {
  private gameRooms: {
    [key: string]: GameRoom;
  };

  maxPlayerCount: number;

  constructor() {
    this.gameRooms = {};
    this.maxPlayerCount = 2;
    // const newLocal = this;
    // newLocal.maxPlayerCount = 2;
    console.log('gameRoomService instance created');
  }

  public get gameRoomList() {
    return this.gameRooms;
  }

  public get gameRoomCount() {
    return Object.keys(this.gameRooms).length;
  }

  public gameRoomPlayerCount(roomId: string) {
    // let ESVersionTest = Object({ a: 1, b: 2, c: 3 }).keys().length;

    return Object.keys(this.gameRooms[roomId].players).length;
  }

  public findOpenRoom(): {
    room: GameRoom;
    isNew: boolean;
  } {
    log('findOpenRoom()');
    let openRoomId: string = Object.keys(this.gameRooms).find((roomId) => {
      return !this.gameRooms[roomId].locked;
    });

    let isNew = false;
    if (!openRoomId || openRoomId.length < 1) {
      openRoomId = this.createGameRoom();
      isNew = true;
    }

    return {
      room: this.gameRooms[openRoomId],
      isNew: isNew,
    };
  }

  public getGameRoom(roomId: string) {
    return this.gameRooms[roomId];
  }

  public getPlayerIdList(roomId: string) {
    return Object.keys(this.gameRooms[roomId].players);
  }

  public createGameRoom() {
    console.log(`gameRoomService.createGameRoom()`);

    const newGameRoom: GameRoom = {
      id: randomUUID(),
      players: {},
      status: 'WaitingForPlayers',
      locked: false,
      gameState: {
        gameOver: false,
        gameWinner: null,
        currentPlayer: null,
        currentStage: null,
        availablePower: 0,
        currentAttackNodeSelected: false,
        currentAttackNodeColumn: null,
        currentAttackNodeRow: null,
        currentAttackNodePower: null,
        map: null,
      },
      isReady: false,
    };

    this.gameRooms[newGameRoom.id] = newGameRoom;
    return newGameRoom.id;
  }

  public addPlayer(roomId: string, player: Player): GameRoom {
    // const gameRoom = this.gameRooms[roomId];
    log('addPlayer(): adding player to room');

    // player added
    this.gameRooms[roomId].players[player.id] = player;
    const playerCount = Object.keys(this.gameRooms[roomId].players).length;

    if (playerCount === 1) {
      this.gameRooms[roomId].gameState.currentPlayer = player;
    }

    if (playerCount >= this.maxPlayerCount) {
      console.log('addPlayer -> max player count reached');
      this.gameRooms[roomId].locked = true;
      this.gameRooms[roomId].status = 'Ready';
      this.gameRooms[roomId].isReady = true;
    }

    return this.gameRooms[roomId];
  }

  public isRoomReady(roomId: string): boolean {
    return this.gameRooms[roomId].status === 'Ready';
  }

  public createMap(roomId: string): GameRoom {
    log(`createMap(${roomId}): `);
    const firstPlayerId = this.getPlayerIdList(roomId)[0];
    return (this.gameRooms[roomId] = {
      ...this.gameRooms[roomId],
      gameState: {
        ...this.gameRooms[roomId].gameState,
        map: mapBuilder(5, 4, this.gameRooms[roomId].players),
        currentPlayer: this.gameRooms[roomId].players[firstPlayerId],
        currentStage: Stage.Attack,
        // currentPlayer: this.gameRooms[roomId].players[0],
      },
    });
  }

  public removePlayerFromRooms(playerId) {
    console.log(`removing ${playerId} from rooms...`);
    for (let room of Object.keys(this.gameRooms)) {
      delete this.gameRooms[room].players[playerId];

      // let newPlayerList = this.gameRooms[room].players.filter(
      //   (player) => player.id !== playerId
      // );

      // this.gameRooms[room].players = newPlayerList;
      // this.gameRooms[room].players = [...newPlayerList];
      this.gameRooms[room].status = 'WaitingDisconnectedPlayer';
    }
  }

  public removeEmptyRooms() {
    console.log(`removing empty rooms...`);
    for (let roomId of Object.keys(this.gameRooms)) {
      if (this.gameRoomPlayerCount(roomId) < 1) {
        delete this.gameRooms[roomId];
      }
    }
    this.logRoomCount();
  }

  private logRoomCount() {
    console.log(`rooms: ${Object.keys(this.gameRooms).length}`);
  }

  // @TODO ewrite/improve the following start/end/reset methods

  startGame(roomId: string): GameRoom {
    log(`startGame(${roomId}): `);
    const firstPlayerId = this.getPlayerIdList(roomId)[0];

    // sets attack node to default values
    // and sets available power to 0
    this.startAttackStage(roomId);

    // set current player to first player in list
    return (this.gameRooms[roomId] = {
      ...this.gameRooms[roomId],
      gameState: {
        ...this.gameRooms[roomId].gameState,
        currentPlayer: this.gameRooms[roomId].players[firstPlayerId],
      },
    });
  }

  startAttackStage(roomId: string): GameRoom {
    log(`startAttackStage(${roomId}): `);

    this.resetAttackNode(roomId);
    this.resetAvailablePower(roomId);
    return (this.gameRooms[roomId] = {
      ...this.gameRooms[roomId],
      gameState: {
        ...this.gameRooms[roomId].gameState,
        currentStage: Stage.Attack,
      },
    });
  }

  public startAllocateStage(roomId: string): GameRoom {
    log(`startAllocateStage(${roomId}): `);

    this.resetAttackNode(roomId);
    this.resetAvailablePower(roomId);
    return (this.gameRooms[roomId] = {
      ...this.gameRooms[roomId],
      gameState: {
        ...this.gameRooms[roomId].gameState,
        currentStage: Stage.Allocate,
      },
    });
  }

  public resetAttackNode(roomId: string): GameRoom {
    log(`resetAttackNode(${roomId}): `);
    return (this.gameRooms[roomId] = {
      ...this.gameRooms[roomId],
      gameState: {
        ...this.gameRooms[roomId].gameState,
        currentAttackNodeSelected: false,
        currentAttackNodeColumn: null,
        currentAttackNodeRow: null,
        currentAttackNodePower: null,
      },
    });
  }

  public resetAvailablePower(roomId: string): GameRoom {
    log(`resetAvailablePower(${roomId}): `);
    return (this.gameRooms[roomId] = {
      ...this.gameRooms[roomId],
      gameState: {
        ...this.gameRooms[roomId].gameState,
        availablePower: 0,
      },
    });
  }

  public endAttack(playerId: string, roomId: string): GameRoom {
    log(`endAttack(${playerId}, ${roomId}): `);

    // add some validation here

    // any other state changes here

    this.gameRooms[roomId].gameState.currentStage = Stage.Allocate;
    return this.gameRooms[roomId];
  }

  public endTurn(playerId: string, roomId: string): GameRoom {
    log(`endTurn(${playerId}, ${roomId}): `);

    // add some validation here

    // any other state changes here

    let nextPlayerId = Object.keys(this.gameRooms[roomId].players).find(
      (id) => id !== playerId
    );

    // change current player to other player
    // note: this only works for 2 players
    this.gameRooms[roomId].gameState.currentPlayer =
      this.gameRooms[roomId].players[nextPlayerId];

    // change stage to Attack
    this.gameRooms[roomId].gameState.currentStage = Stage.Attack;

    return this.gameRooms[roomId];
  }

  public clickTile(
    col: number,
    row: number,
    playerId: string,
    roomId: string
  ): GameRoom {
    log(`clickTile(${col}, ${row}, ${playerId}, ${roomId}): `);

    // ...

    return this.gameRooms[roomId];
  }
}

// export const gameRoomService = new GameRoomService();
