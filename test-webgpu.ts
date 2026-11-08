async function testWebGPU() {
  const list = await (await fetch('http://127.0.0.1:9222/json')).json();
  const gameTab = list.find((t: any) => t.url.includes('localhost'));
  const ws = new WebSocket(gameTab.webSocketDebuggerUrl);
  ws.onopen = () => {
    ws.send(JSON.stringify({
      id: 1,
      method: 'Runtime.evaluate',
      params: {
        expression: `
          (async () => {
            try {
              const adapter = await navigator.gpu.requestAdapter();
              const device = await adapter.requestDevice();
              const canvas = document.createElement('canvas');
              canvas.width = 100;
              canvas.height = 100;
              const context = canvas.getContext('webgpu');
              const format = navigator.gpu.getPreferredCanvasFormat();
              context.configure({ device, format, alphaMode: 'premultiplied' });
              const commandEncoder = device.createCommandEncoder();
              const textureView = context.getCurrentTexture().createView();
              const renderPass = commandEncoder.beginRenderPass({
                colorAttachments: [{
                  view: textureView,
                  clearValue: { r: 0.1, g: 0.8, b: 0.3, a: 1.0 },
                  loadOp: 'clear',
                  storeOp: 'store'
                }]
              });
              renderPass.end();
              device.queue.submit([commandEncoder.finish()]);
              return { success: true, format };
            } catch(e) {
              return { success: false, error: e.message };
            }
          })()
        `,
        awaitPromise: true,
        returnByValue: true
      }
    }));
  };
  ws.onmessage = (evt) => {
    console.log('WebGPU Render test result:', JSON.parse(evt.data.toString()));
    ws.close();
    process.exit(0);
  };
}
testWebGPU();
