const WebSocket = require('ws');
const chokidar = require('chokidar');

class ReloadServer {
  constructor(port = 8080) {
    this.port = port;
    this.wss = null;
    this.watcher = null;
    this.clients = new Set();
    this.debounceTimer = null;
  }

  start() {
    // Create WebSocket server
    try {
      this.wss = new WebSocket.Server({ port: this.port });
      
      this.wss.on('connection', (ws) => {
        this.clients.add(ws);
        console.log(`🔄 Auto-reload client connected (${this.clients.size} total)`);
        
        ws.on('close', () => {
          this.clients.delete(ws);
          console.log(`🔄 Auto-reload client disconnected (${this.clients.size} total)`);
        });

        ws.on('error', (error) => {
          console.log('🔄 Client connection error:', error.message);
          this.clients.delete(ws);
        });
      });

      this.wss.on('error', (error) => {
        console.log(`🔄 WebSocket server error: ${error.message}`);
      });

      // Watch for file changes
      this.setupFileWatcher();
      
      console.log(`🔄 Auto-reload server started on port ${this.port}`);
      console.log(`🔄 Watching for changes in src/ and dist/ folders`);

    } catch (error) {
      console.error(`❌ Failed to start reload server on port ${this.port}:`, error.message);
      console.log('💡 Try changing the port or check if another process is using it');
    }
  }

  setupFileWatcher() {
    const watchPaths = [
      'src/**/*',
      'dist/**/*'
    ];

    try {
      this.watcher = chokidar.watch(watchPaths, {
        ignored: [
          /node_modules/,
          /\.git/,
          /dist\/.*\.js\.map$/,
          /dist\/reload\.js$/,
          /\.DS_Store/,
          /Thumbs\.db/
        ],
        persistent: true,
        ignoreInitial: true,
        awaitWriteFinish: {
          stabilityThreshold: 300,
          pollInterval: 100
        }
      });

      this.watcher.on('change', (filePath) => {
        this.debounceReload(`File changed: ${filePath}`);
      });

      this.watcher.on('add', (filePath) => {
        this.debounceReload(`File added: ${filePath}`);
      });

      this.watcher.on('unlink', (filePath) => {
        this.debounceReload(`File deleted: ${filePath}`);
      });

      this.watcher.on('error', (error) => {
        console.error('🔄 File watcher error:', error);
      });

    } catch (error) {
      console.error('🔄 Failed to setup file watcher:', error);
    }
  }

  debounceReload(reason) {
    if (this.debounceTimer) {
      clearTimeout(this.debounceTimer);
    }

    this.debounceTimer = setTimeout(() => {
      this.broadcast({ type: 'reload', reason });
      console.log(`🔄 Broadcasting reload: ${reason}`);
    }, 500); // Increased debounce time
  }

  broadcast(message) {
    if (this.clients.size === 0) {
      return; // No clients connected
    }

    const data = JSON.stringify(message);
    const clientsToRemove = [];
    
    this.clients.forEach((client) => {
      if (client.readyState === WebSocket.OPEN) {
        try {
          client.send(data);
        } catch (error) {
          console.log('🔄 Failed to send to client:', error.message);
          clientsToRemove.push(client);
        }
      } else {
        clientsToRemove.push(client);
      }
    });

    // Clean up dead connections
    clientsToRemove.forEach(client => {
      this.clients.delete(client);
    });
  }

  stop() {
    if (this.watcher) {
      this.watcher.close();
    }
    
    if (this.wss) {
      this.wss.close();
    }
    
    console.log('🔄 Auto-reload server stopped');
  }
}

const server = new ReloadServer();
server.start();

// Graceful shutdown
process.on('SIGINT', () => {
  console.log('\n🔄 Shutting down auto-reload server...');
  server.stop();
  process.exit(0);
});

process.on('SIGTERM', () => {
  server.stop();
  process.exit(0);
});

// Handle uncaught exceptions
process.on('uncaughtException', (error) => {
  console.error('🔄 Uncaught exception:', error);
  server.stop();
  process.exit(1);
});