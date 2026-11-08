import { existsSync } from "node:fs";

async function run() {
  const list = await (await fetch('http://127.0.0.1:9222/json')).json();
  const gameTab = list.find((t: any) => t.url.includes('localhost'));
  const ws = new WebSocket(gameTab.webSocketDebuggerUrl);
  ws.onopen = () => {
    ws.send(JSON.stringify({
      id: 1,
      method: 'Runtime.evaluate',
      params: {
        expression: `
          window.startGame();
          // Spawn multiple projectiles and trigger particles
          for(let i=0; i<15; i++) {
            window.attack();
          }
        `
      }
    }));
    setTimeout(() => {
      ws.send(JSON.stringify({ id: 2, method: 'Page.captureScreenshot', params: { format: 'png' } }));
    }, 1500);
  };
  ws.onmessage = async (evt) => {
    const msg = JSON.parse(evt.data.toString());
    if (msg.id === 2 && msg.result?.data) {
      const buf = Buffer.from(msg.result.data, 'base64');
      await Bun.write('C:/src/yolo-standards/real-gameplay-action.png', buf);
      console.log('Saved real-gameplay-action.png');
      ws.close();
      process.exit(0);
    }
  };
}
run();
