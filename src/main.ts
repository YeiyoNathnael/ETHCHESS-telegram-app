import './assets/index.css';

import { createApp } from 'vue';
import { retrieveLaunchParams } from '@tma.js/sdk-vue';

import App from './App.vue';
import { errorHandler } from './errorHandler';
import { init } from './init';

// Mock the environment in case we are outside Telegram.
import './mockEnv';

const launchParams = retrieveLaunchParams();
const { tgWebAppPlatform: platform } = launchParams;
const debug = (launchParams.tgWebAppStartParam || '').includes('debug') || import.meta.env.DEV;

init({
  debug,
  eruda: debug && ['ios', 'android'].includes(platform),
  mockForMacOS: platform === 'macos',
}).then(() => {
  const isTelegramRuntime = !!window.Telegram?.WebApp && !import.meta.env.DEV;
  document.body.classList.toggle('is-telegram', isTelegramRuntime);

  const app = createApp(App);
  app.config.errorHandler = errorHandler;
  app.mount('#app');
});
