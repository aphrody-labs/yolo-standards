import { existsSync } from "node:fs";

async function run() {
  const list = await (await fetch('http://127.0.0.1:9222/json')).json();
  const gameTab = list.find((t: any) => t.url.includes('localhost'));
  if (!gameTab) {
    console.error('No localhost tab found');
    process.exit(1);
  }
  const ws = new WebSocket(gameTab.webSocketDebuggerUrl);
  ws.onopen = () => {
    ws.send(JSON.stringify({ id: 1, method: 'Page.reload' }));
    setTimeout(() => {
      ws.send(JSON.stringify({
        id: 2,
        method: 'Runtime.evaluate',
        params: { expression: "const b = document.getElementById('btn-launch'); if (b) b.click();" }
      }));
    }, 1200);
    setTimeout(() => {
      ws.send(JSON.stringify({ id: 3, method: 'Page.captureScreenshot', params: { format: 'png' } }));
    }, 2500);
  };
  ws.onmessage = async (evt) => {
    const msg = JSON.parse(evt.data.toString());
    if (msg.id === 3 && msg.result?.data) {
      const buf = Buffer.from(msg.result.data, 'base64');
      await Bun.write('C:/src/yolo-standards/real-gameplay-screen.png', buf);
      console.log('Saved C:/src/yolo-standards/real-gameplay-screen.png, bytes:', buf.length);
      ws.close();
      process.exit(0);
    }
  };
}
run();
