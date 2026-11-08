async function clickGoogle() {
  const list = await (await fetch('http://127.0.0.1:9222/json')).json();
  const authTab = list.find((t: any) => t.url.includes('context7.com'));
  const ws = new WebSocket(authTab.webSocketDebuggerUrl);
  ws.onopen = () => {
    setTimeout(() => {
      ws.send(JSON.stringify({
        id: 1,
        method: 'Runtime.evaluate',
        params: {
          expression: '(() => { const btn = document.querySelector(".cl-socialButtonsBlockButton__google"); if (btn) { btn.click(); return "CLICKED_GOOGLE"; } return "NO_GOOGLE_BTN"; })()',
          returnByValue: true
        }
      }));
    }, 1500);
  };
  ws.onmessage = async (evt) => {
    console.log(evt.data);
    setTimeout(async () => {
      const updated = await (await fetch('http://127.0.0.1:9222/json')).json();
      console.log('Tabs now:', updated.map((t: any) => ({ title: t.title, url: t.url })));
      ws.close();
      process.exit(0);
    }, 3000);
  };
}
clickGoogle();
