async function check() {
  const list = await (await fetch('http://127.0.0.1:9222/json')).json();
  const gameTab = list.find((t: any) => t.url.includes('localhost'));
  const ws = new WebSocket(gameTab.webSocketDebuggerUrl);
  ws.onopen = () => {
    ws.send(JSON.stringify({
      id: 1,
      method: "Runtime.evaluate",
      params: {
        expression: "navigator.gpu ? 'WEBGPU_SUPPORTED' : 'NO_WEBGPU'",
        returnByValue: true
      }
    }));
  };
  ws.onmessage = (evt) => {
    console.log('Result:', JSON.parse(evt.data.toString()));
    ws.close();
    process.exit(0);
  };
}
check();
