async function dispatchMouse() {
  const list = await (await fetch('http://127.0.0.1:9222/json')).json();
  const authTab = list.find((t: any) => t.url.includes('context7.com'));
  const ws = new WebSocket(authTab.webSocketDebuggerUrl);
  ws.onopen = () => {
    ws.send(JSON.stringify({
      id: 1,
      method: 'Runtime.evaluate',
      params: {
        expression: '(() => { const btn = document.querySelector(".cl-socialButtonsBlockButton__github"); const rect = btn.getBoundingClientRect(); return { x: rect.left + rect.width / 2, y: rect.top + rect.height / 2 }; })()',
        returnByValue: true
      }
    }));
  };
  ws.onmessage = (evt) => {
    const msg = JSON.parse(evt.data.toString());
    if (msg.id === 1) {
      const coords = msg.result?.result?.value;
      console.log('Button Center:', coords);
      ws.send(JSON.stringify({
        id: 2,
        method: 'Input.dispatchMouseEvent',
        params: { type: 'mousePressed', x: coords.x, y: coords.y, button: 'left', clickCount: 1 }
      }));
      setTimeout(() => {
        ws.send(JSON.stringify({
          id: 3,
          method: 'Input.dispatchMouseEvent',
          params: { type: 'mouseReleased', x: coords.x, y: coords.y, button: 'left', clickCount: 1 }
        }));
      }, 80);
      setTimeout(async () => {
        const updated = await (await fetch('http://127.0.0.1:9222/json')).json();
        console.log('Tabs now:', updated.map((t: any) => ({ title: t.title, url: t.url })));
        ws.close();
        process.exit(0);
      }, 3500);
    }
  };
}
dispatchMouse();
