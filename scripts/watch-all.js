const chalk = require('chalk');
const execa = require('execa');
const figures = require('figures');
const path = require('path');

const warn = (msg, ...args) => {
  console.warn(
    chalk.yellowBright(`\n  ${figures.warning}  ${msg}\n`),
    ...args,
  );
};

const gracefulExit = () => {
  warn('Exiting watch mode.');
  process.exit(0);
};

process.on('SIGINT', gracefulExit);


let devServer;

const workspace = [
  'g-base',
  'g-int-sap',
  'g-app',
];

function startDevServer() {
  const watch = [];
  workspace.forEach(value => {
    watch.push('yarn workspace @vjcspy/' + value + ' build:watch');
  });

  devServer = execa(
    'concurrently', [
      '--kill-others',
      ...watch,
      'yarn workspace @vjcspy/g-app start:dev',
    ],
  );
  devServer.on('exit', () => {
    devServer.exited = true;
  });
  devServer.stdout.pipe(process.stdout);
  devServer.stderr.pipe(process.stderr);
}

startDevServer();
