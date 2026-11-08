async function captureLauncherAndGame() {
  const list = await (await fetch('http://127.0.0.1:9222/json')).json();
  const gameTab = list.find((t: any) => t.url.includes('localhost'));
  const ws = new WebSocket(gameTab.webSocketDebuggerUrl);

  ws.onopen = () => {
    // Reload page first
    ws.send(JSON.stringify({ id: 1, method: 'Page.reload' }));
    
    // Step 1: Capture clean Launcher
    setTimeout(() => {
      ws.send(JSON.stringify({ id: 2, method: 'Page.captureScreenshot', params: { format: 'png' } }));
    }, 1500);

    // Step 2: Click Start, move and fire attacks, capture in-game battle
    setTimeout(() => {
      ws.send(JSON.stringify({
        id: 3,
        method: 'Runtime.evaluate',
        params: {
          expression: `
            window.startGame();
            // Simulate firing several WebGPU laser salvos
            for(let i=0; i<8; i++) {
              window.attack();
            }
          `
        }
      }));
    }, 2500);

    setTimeout(() => {
      ws.send(JSON.stringify({ id: 4, method: 'Page.captureScreenshot', params: { format: 'png' } }));
    }, 3800);
  };

  ws.onmessage = async (evt) => {
    const msg = JSON.parse(evt.data.toString());
    if (msg.id === 2 && msg.result?.data) {
      const buf = Buffer.from(msg.result.data, 'base64');
      await Bun.write('C:/src/yolo-standards/new-launcher-screen.png', buf);
      console.log('Saved C:/src/yolo-standards/new-launcher-screen.png');
    }
    if (msg.id === 4 && msg.result?.data) {
      const buf = Buffer.from(msg.result.data, 'base64');
      await Bun.write('C:/src/yolo-standards/new-ingame-battle.png', buf);
      console.log('Saved C:/src/yolo-standards/new-ingame-battle.png');
      ws.close();
      process.exit(0);
    }
  };
}
captureLauncherAndGame();
