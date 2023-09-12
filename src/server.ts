import express from 'express';
import http from 'http';
import path from 'path';
import socketIO from 'socket.io';

import { PlayerService } from './services/playerService';
import { GameRoomService } from './services/gameRoomService';
import { ServerContext } from './types/server-models';
import { playerHandler } from './handlers/playerHandler';
import { gameHandler } from './handlers/gameHandler';
import { GameService } from './services/gameService';

class App {
  private server: http.Server;
  private io: socketIO.Server;
  private port: any;
  private serverContext: ServerContext;

  constructor(port: any) {
    // create express app
    // @ignore - serve static files from the client folder
    // - (this has been moved to a separate repo + server)
    this.port = port;
    const app = express().set('port', this.port);
    //.use(express.static(path.join(__dirname, '../client')));

    // setup http server and socket.io
    this.server = new http.Server(app);
    this.io = new socketIO.Server(this.server, {
      cors: {
        origin: 'http://localhost:3000',
        methods: ['GET', 'POST'],
        allowedHeaders: ['my-custom-header'],
        credentials: true,
      },
    });

    // initialize game data
    this.serverContext = {
      gameService: new GameService(),
      gameRoomService: new GameRoomService(),
      playerService: new PlayerService(),
    };

    // api to get server metadata
    app.get('/api/all', (req, res) => {
      res.send({
        players: this.serverContext.playerService.playerList,
        rooms: this.serverContext.gameRoomService.gameRoomList,
      });
    });

    app.get('/api/players', (req, res) => {
      res.send(this.serverContext.playerService.playerList);
    });

    app.get('/api/rooms', (req, res) => {
      res.send(this.serverContext.gameRoomService.gameRoomList);
    });
  }

  public start() {
    this.server.listen(this.port, () => {
      console.log(`Listening on port ${this.port}...`);
    });

    // socket.io events
    this.io.on('connection', (socket: socketIO.Socket) => {
      console.log('*'.repeat(10), `connection: ${socket.id}`, '*'.repeat(10));
      playerHandler(this.io, socket, this.serverContext);
      gameHandler(this.io, socket);
    });
  }
}

const port = process.env.PORT || 8000;
new App(port).start();
