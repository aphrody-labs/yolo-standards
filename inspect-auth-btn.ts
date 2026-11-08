async function inspectButtons() {
  const list = await (await fetch('http://127.0.0.1:9222/json')).json();
  const authTab = list.find((t: any) => t.url.includes('context7.com'));
  const ws = new WebSocket(authTab.webSocketDebuggerUrl);
  ws.onopen = () => {
    ws.send(JSON.stringify({
      id: 1,
      method: 'Runtime.evaluate',
      params: {
        expression: 'Array.from(document.querySelectorAll("button, a")).map(b => ({ tag: b.tagName, text: b.innerText, href: b.href, class: b.className }))',
        returnByValue: true
      }
    }));
  };
  ws.onmessage = (evt) => {
    const val = JSON.parse(evt.data.toString())?.result?.result?.value;
    console.log('Buttons found:', val);
    ws.close();
    process.exit(0);
  };
}
inspectButtons();
