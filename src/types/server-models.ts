export const palette = {
  background: '#0d0d0d',
  blue: '#29C2DE',
  green: '#26C99E',
  indigo: '#CC78FA',
  violet: '#C724B1',
  dark_teal: '#005151',
  light_teal: '#30CEBB',
  red: '#DD5E89',
  white: '#FFFFFF',
  dark_gray: '#53565A',
};

export interface IGameRoomService {
  gameRoomList: { [key: string]: GameRoom };
  findOpenRoom(): { room: GameRoom; isNew: boolean };
  addPlayer(roomId: string, player: Player): GameRoom;
  isRoomReady(roomId: string): boolean;
  removePlayerFromRooms(playerId: string): void;
  removeEmptyRooms(): void;
  createMap(roomId: string): GameRoom;
  getGameRoom(roomId: string): GameRoom;
  createGameRoom(): string;
  gameRoomPlayerCount(roomId: string): number;
}

export interface IPlayerService {
  getPlayerBySocketId(socketId: string): Player;
  insert(socketId: string, playerInfo: PlayerInfo): Player;
  assignRoom(playerId: string, room: GameRoom): Player;
  removePlayer(playerId: string): void;
  playerList: { [id: string]: Player };
}

export type ServerContext = {
  gameRoomService: IGameRoomService;
  playerService: IPlayerService;
};

export type Player = {
  id: string;
  color: string;
  assignedRoom: string;
  gameState: {
    availablePower: number;
  };
};

export type PlayerInfo = {
  name?: string;
  color: string;
};

export type GameRoom = {
  id: string;
  players: { [id: string]: Player };
  status: string;
  locked: boolean;
  gameState: Game;
  isReady: boolean;
};

export type Game = {
  map: GameMap;
  stage: Stage;
  currentPlayer: Player;
  currentAttackNodeSelected: boolean;
  currentAttackNodeColumn: number;
  currentAttackNodeRow: number;
  currentAttackNodePower: number;
};

export enum Stage {
  Attack = 'Attack',
  Allocate = 'Allocate',
}

export type GameMap = {
  size: number;
  columns: number;
  rows: number;
  tiles: GameTile[][];
};

export type GameTile = {
  id: string;
  x: number;
  y: number;
  type: string;
  color: string;
  player: Player | null;
  power: number;
  active: boolean;
};

export type ClientAction = {
  type: ClientActionType;
  data: any;
};

export enum ClientActionType {
  FindGame = 'player:findGame',
  ClickTile = 'player:clickTile',
  EndTurn = 'player:endTurn',
  EndAttack = 'player:endAttack',
}

export type ServerEvent = {
  type: ServerEventType;
  data: any;
};

export enum ServerEventType {
  FindingPlayers = 'game.findingPlayers',
  GameStarted = 'game.started',
  GameEnded = 'game.ended',
  PlayerJoined = 'game.playerJoined',
  PlayerLeft = 'game.playerLeft',

  BoardChanged = 'game.boardChanged',
  // ^ if we're just going to send the entire game state every time
  // there's an event, the above event can be used for everything
  // otherwise: we need to define specific events for any possible action
  // or change in state, e.g.:
  //
  // PlayerSelectedTile = 'game.playerSelectedTile',
  // PlayerDeselectedTile = 'game.playerDeselectedTile',
  // PlayerAttackedTile = 'game.playerAttackedTile',
  // PlayerEndedTurn = 'game.playerEndedTurn',
  // PlayerEndedAttack = 'game.playerEndedAttack',
  // PlayerAllocatedPower = 'game.playerAllocatedPower',
}

export enum SocketEventType {
  Connect = 'connect',
  Disconnect = 'disconnect',
  Disconnecting = 'disconnecting',
}
