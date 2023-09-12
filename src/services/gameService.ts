import { GameState, IGameService } from 'src/types/server-models';

export class GameService implements IGameService {
  private games;
  constructor() {}
  handleTileClick(
    col: number,
    row: number,
    playerId: string,
    roomId: string
  ): GameState {
    throw new Error('Method not implemented.');
  }
}
