const WebSocket = require('ws');

function reloadExtension() {
  try {
    const ws = new WebSocket('ws://localhost:8080');
    
    ws.on('open', () => {
      ws.send(JSON.stringify({ type: 'reload', reason: 'Manual reload' }));
      console.log('🔄 Extension reload triggered');
      ws.close();
    });

    ws.on('error', (error) => {
      console.error('❌ Failed to connect to reload server:', error.message);
      console.log('💡 Make sure development server is running: npm run dev');
    });

  } catch (error) {
    console.error('❌ Reload failed:', error.message);
  }
}

reloadExtension();
