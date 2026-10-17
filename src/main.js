import { Game, Input, Assets, Audio, setTextConfig } from './engine.js';
import { Leaderboard } from './leaderboard.js';
import { TitleScene } from './scenes/title.js';
import { IntroScene } from './scenes/intro.js';
import { OfficeScene } from './scenes/office.js';
import { LiftScene } from './scenes/lift.js';
import { EndScene } from './scenes/end.js';
import { PauseMenu } from './scenes/pause.js';
import { SplashScene } from './scenes/splash.js';

const loadJson = (url) => fetch(url, { cache: 'no-store' }).then((r) => {
  if (!r.ok) throw new Error(`Could not load ${url}`);
  return r.json();
});

async function boot() {
  const boot = document.getElementById('boot');
  try {
    const [config, texts, manifest] = await Promise.all([
      loadJson('config.json'), loadJson('texts.json'), loadJson('assets/manifest.json'),
    ]);
    const assets = new Assets();
    // pixel font from Google Fonts; carry on with the fallback font if it does not arrive in time
    const font = document.fonts ? Promise.race([document.fonts.load('24px "DotGothic16"'), new Promise((r) => setTimeout(r, 2500))]).catch(() => {}) : null;
    await Promise.all([assets.load(manifest), font]);
    setTextConfig(config.text);
    const canvas = document.getElementById('game');
    const game = new Game(canvas, {
      config, texts, assets,
      audio: new Audio(assets, config.audio),
      input: new Input(canvas),
      leaderboard: new Leaderboard(config.leaderboard),
    });
    game.scenes = {
      splash: () => new SplashScene(game),
      title: () => new TitleScene(game),
      intro: () => new IntroScene(game),
      office: () => new OfficeScene(game),
      lift: () => new LiftScene(game),
      end: (result) => new EndScene(game, result),
    };
    game.makePause = () => new PauseMenu(game);
    window.game = game; // handy for debugging in the browser console
    boot.remove();
    canvas.focus();
    // the game opens with the studio card + cover art (startScene 'title' or unset), then the title screen
    const first = !config.debug?.startScene || config.debug.startScene === 'title' ? 'splash' : config.debug.startScene;
    if (first !== 'title' && first !== 'splash' && !game.session.name) game.session.name = 'Debug Bunny';
    game.go(first === 'end' ? game.scenes.end({ outcome: 'win', score: 1234, breakdown: {}, seconds: 100 }) : game.scenes[first]());
    game.start();
  } catch (err) {
    boot.textContent = 'Failed to start: ' + err.message +
      (location.protocol === 'file:' ? ' — open it through a web server (see README).' : '');
    console.error(err);
  }
}

boot();
