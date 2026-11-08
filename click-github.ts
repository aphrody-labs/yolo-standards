async function clickGithubAuth() {
  const list = await (await fetch('http://127.0.0.1:9222/json')).json();
  const authTab = list.find((t: any) => t.url.includes('context7.com'));
  const ws = new WebSocket(authTab.webSocketDebuggerUrl);
  ws.onopen = () => {
    ws.send(JSON.stringify({
      id: 1,
      method: 'Runtime.evaluate',
      params: {
        expression: '(() => { const btn = document.querySelector(".cl-socialButtonsBlockButton__github"); if (btn) { btn.click(); return "CLICKED"; } return "NOT_FOUND"; })()',
        returnByValue: true
      }
    }));
  };
  ws.onmessage = async (evt) => {
    console.log('Result:', JSON.parse(evt.data.toString())?.result?.result?.value);
    setTimeout(async () => {
      // Check current URL of the tab
      const updatedList = await (await fetch('http://127.0.0.1:9222/json')).json();
      console.log('Tabs now:', updatedList.map((t: any) => ({ title: t.title, url: t.url })));
      ws.close();
      process.exit(0);
    }, 2500);
  };
}
clickGithubAuth();
