import {createUpwardServer} from '@magento/upward-js';

export async function gUpwardApp() {
  console.info(__dirname);
  console.info(__filename);
  const {app} = await createUpwardServer({
    upwardPath: __dirname + '/spec.yml',
    bindLocal: false, // do not create http server
    logUrl: true
  });

  return app;
}

