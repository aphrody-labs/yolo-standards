async function captureFusedMatrix() {
  const list = await (await fetch('http://127.0.0.1:9222/json')).json();
  const gameTab = list.find((t: any) => t.url.includes('localhost'));
  const ws = new WebSocket(gameTab.webSocketDebuggerUrl);

  ws.onopen = () => {
    ws.send(JSON.stringify({ id: 1, method: 'Page.reload' }));

    setTimeout(() => {
      ws.send(JSON.stringify({
        id: 2,
        method: 'Runtime.evaluate',
        params: {
          expression: `
            // Fire multiple attacks and trigger role inversion
            for(let i=0; i<6; i++) {
              window.attack();
            }
          `
        }
      }));
    }, 1500);

    setTimeout(() => {
      ws.send(JSON.stringify({ id: 3, method: 'Page.captureScreenshot', params: { format: 'png' } }));
    }, 2800);
  };

  ws.onmessage = async (evt) => {
    const msg = JSON.parse(evt.data.toString());
    if (msg.id === 3 && msg.result?.data) {
      const buf = Buffer.from(msg.result.data, 'base64');
      await Bun.write('C:/src/yolo-standards/fused-os-browser-matrix.png', buf);
      console.log('Saved C:/src/yolo-standards/fused-os-browser-matrix.png');
      ws.close();
      process.exit(0);
    }
  };
}
captureFusedMatrix();
