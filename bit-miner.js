document.addEventListener("DOMContentLoaded", function () {
  // your code here
});

//game variables
let hasWatts = false;
let watts = 0;
let funds = 1000;
const reels = [];

PIXI.Assets.load([
  "assets/images/red.png",
  "assets/images/orange.png",
  "assets/images/blue.png",
  "assets/images/green.png",
]).then(onAssetsLoaded);

//game states
let spinning = false;

//art variables
let alphaFilterInactive = new PIXI.filters.AlphaFilter(0.5);
let alphaFilterFull = new PIXI.filters.AlphaFilter(1);

const app = new PIXI.Application({
  background: "#000",
  height: window.innerHeight,
  width: window.innerWidth,
});

document.body.appendChild(app.view);
function onAssetsLoaded() {
  const bgSprite = PIXI.Sprite.from("assets/images/background-server-room.jpg");
  bgSprite.width = app.screen.width;
  bgSprite.height = app.screen.height;

  // Add the sprite to the stage as the first child
  app.stage.addChildAt(bgSprite, 0);

  //title
  const titleContainer = new PIXI.Container();
  const gameTitle = new PIXI.Text("BIT-MINER", {
    fontSize: 64,
    fill: 0xffffff,
    fontFamily: "Sigmar",
    textAlign: "center",
    dropShadow: true,
    dropShadowColor: "#51D5FF",
    dropShadowBlur: 16,
    padding: 20,
  });
  gameTitle.anchor.set(0.5);
  gameTitle.position.set(titleContainer.width / 2, titleContainer.height / 2);

  titleContainer.position.set(app.view.width / 2, 80);
  titleContainer.addChild(gameTitle);
  app.stage.addChild(titleContainer);

  //background rack
  const rackContainer = new PIXI.Container();

  rackContainer.height = 721;
  rackContainer.zIndex = 1;
  rackContainer.pivot.set(0.5, 1);

  rackContainer.width = 797;
  rackContainer.position.set(
    app.view.width / 2 - 797 / 2,
    app.view.height - 721
  );

  //the on/off sprite for the foreground mining rack
  const rackSprite = new PIXI.Sprite(
    PIXI.Texture.from("assets/images/rack off.png")
  );
  app.stage.addChild(rackContainer);

  rackContainer.addChild(rackSprite);

  setRackState();

  //game display
  const gameDisplayMonitor = new PIXI.Graphics();
  gameDisplayMonitor.beginFill("#000000");
  gameDisplayMonitor.drawRoundedRect(0, 0, 534, 387, 21);
  gameDisplayMonitor.endFill();

  gameDisplayMonitor.position.set(
    app.view.width / 2 - gameDisplayMonitor.width / 2,
    350
  );

  gameDisplayMonitor.filters = [
    new PIXI.filters.DropShadowFilter({
      distance: 10,
      blur: 23,
      alpha: 0.9,
    }),
  ];

  app.stage.addChild(gameDisplayMonitor);

  //mask area for reels
  const maskGraphics = new PIXI.Graphics();

  maskGraphics.beginFill(0xff0000);
  maskGraphics.drawRect(0, 0, gameDisplayMonitor.width, 310);
  maskGraphics.endFill();
  maskGraphics.position.y = 0;
  gameDisplayMonitor.mask = maskGraphics;

  gameDisplayMonitor.addChild(maskGraphics);

  //controls container
  const controlsContainer = new PIXI.Container();
  const controlsPanel = new PIXI.Graphics();
  controlsPanel.lineStyle(2, 0x25ec5d, 0.4);
  controlsPanel.beginFill(0x000000, 0.5);
  controlsPanel.drawRect(0, 0, 764, 170);
  controlsPanel.endFill();
  controlsPanel.zIndex = 3;
  controlsContainer.addChild(controlsPanel);
  controlsContainer.position.set(
    app.view.width / 2 - controlsContainer.width / 2,
    app.view.height - (controlsContainer.height + 20)
  );
  app.stage.addChild(controlsContainer);

  //purchase watts button
  const purchaseWattsContainer = new PIXI.Container();
  const purchaseWattsSprite = PIXI.Sprite.from("assets/images/mine-button.png");
  purchaseWattsSprite.width = 189;
  purchaseWattsSprite.height = 186;
  purchaseWattsContainer.addChild(purchaseWattsSprite);
  purchaseWattsSprite.position.y = -30;
  controlsContainer.addChild(purchaseWattsContainer);
  purchaseWattsSprite.interactive = true;
  purchaseWattsSprite.cursor = "pointer";

  purchaseWattsSprite.addListener("pointerdown", () => {
    mineButtonSprite.filters = [alphaFilterFull];
    mineButtonSprite.interactive = true;

    buyWatts();
    setRackState();
  });

  const purchaseButtonText = new PIXI.Text("PURCHASE WATTS", {
    fontSize: 24,
    fill: 0xc7d4ff,
    fontFamily: "Share Tech Mono",
  });
  purchaseButtonText.position.set(
    0,
    purchaseWattsContainer.height - purchaseButtonText.height * 2
  );
  purchaseWattsContainer.addChild(purchaseButtonText);

  //mine button ( a.k.a. spin)
  const mineButtonSprite = PIXI.Sprite.from(
    "assets/images/mine-button-blue.png"
  );

  mineButtonSprite.width = 189;
  mineButtonSprite.height = 186;
  controlsContainer.addChild(mineButtonSprite);
  mineButtonSprite.position.y = -30;
  mineButtonSprite.position.x =
    controlsContainer.width - mineButtonSprite.width;
  mineButtonSprite.cursor = "pointer";
  mineButtonSprite.filters = [alphaFilterInactive];

  mineButtonSprite.addListener("pointerdown", () => {
    spin();
  });

  const playIcon = PIXI.Sprite.from("assets/images/Polygon 1.png");
  playIcon.position.y = 186 / 2 + 120;
  playIcon.position.x = 270;
  playIcon.filters = [
    new PIXI.filters.DropShadowFilter({
      distance: 5,
      blur: 2,
      alpha: 1,
    }),
  ];
  mineButtonSprite.addChild(playIcon);

  //game status text
  const textInfoContainer = new PIXI.Container();
  let wattsStatusText = new PIXI.Text("WATTS : " + watts, {
    fontSize: 36,
    fill: "#C7D4FF",
    fontFamily: "Share Tech Mono",
    padding: 20,
  });

  textInfoContainer.position.x = purchaseWattsContainer.width + 30;
  textInfoContainer.position.y = 30;
  textInfoContainer.addChild(wattsStatusText);

  //funds text
  let fundsText = new PIXI.Text("FUNDS : " + funds, {
    fontSize: 36,
    fill: "#C7D4FF",
    fontFamily: "Share Tech Mono",
    padding: 20,
  });
  fundsText.position.y = 70;
  textInfoContainer.addChild(fundsText);
  controlsContainer.addChild(textInfoContainer);

  function setRackState() {
    if (watts > 1) {
      hasWatts = true;
    } else {
      hasWatts = false;
    }
    if (!hasWatts) {
      const newSprite = new PIXI.Sprite(
        PIXI.Texture.from("/assets/images/rack off.png")
      );
      rackSprite.texture = newSprite.texture;
    } else {
      const newSprite = new PIXI.Sprite(
        PIXI.Texture.from("/assets/images/rack on.png")
      );
      rackSprite.texture = newSprite.texture;
    }
  }

  function setGameInfoText() {
    wattsStatusText.text = "WATTS : " + watts;
    fundsText.text = "FUNDS :" + funds;
  }

  function buyWatts() {
    if (funds >= 500) {
      funds -= 500;
      watts += 500;
    }
    if (funds < 1) {
      purchaseWattsSprite.interactive = false;
      purchaseWattsSprite.filters = [alphaFilterInactive];
    }
    setGameInfoText();
    setRackState();
  }

  function spin() {
    console.log("spin called!");
    if (watts >= 100) {
      //  spinning = true;
      watts -= 100;
      startPlay();
      setGameInfoText();
    }
    if (spinning) {
      mineButtonSprite.interactive = false;
      mineButtonSprite.filters = [alphaFilterInactive];
    }
  }
  function setMineButtonState() {
    if (watts < 1) {
      mineButtonSprite.interactive = false;
      mineButtonSprite.filters = [alphaFilterInactive];
    } else {
      mineButtonSprite.interactive = true;
      mineButtonSprite.filters = [alphaFilterFull];
    }
  }
  //slot demo integration

  const REEL_WIDTH = gameDisplayMonitor.width / 5;
  const SYMBOL_SIZE = gameDisplayMonitor.width / 5.1;

  // onAssetsLoaded handler builds the example.

  // Create different slot symbols.
  const slotTextures = [
    PIXI.Texture.from("assets/images/red.png"),
    PIXI.Texture.from("assets/images/orange.png"),
    PIXI.Texture.from("assets/images/blue.png"),
    PIXI.Texture.from("assets/images/green.png"),
  ];

  // Build the reels
  const reelContainer = new PIXI.Container();
  for (let i = 0; i < 5; i++) {
    const rc = new PIXI.Container();
    rc.x = i * REEL_WIDTH;
    reelContainer.addChild(rc);

    const reel = {
      container: rc,
      symbols: [],
      position: 0,
      previousPosition: 0,
      blur: new PIXI.filters.BlurFilter(),
    };
    reel.blur.blurX = 0;
    reel.blur.blurY = 0;
    rc.filters = [reel.blur];

    // Build the symbols
    for (let j = 0; j < 4; j++) {
      const symbol = new PIXI.Sprite(
        slotTextures[Math.floor(Math.random() * slotTextures.length)]
      );
      // Scale the symbol to fit symbol area.
      symbol.y = j * SYMBOL_SIZE;
      symbol.scale.x = symbol.scale.y = Math.min(
        SYMBOL_SIZE / symbol.width,
        SYMBOL_SIZE / symbol.height
      );
      symbol.x = Math.round((SYMBOL_SIZE - symbol.width) / 2);
      reel.symbols.push(symbol);
      rc.addChild(symbol);
    }
    reels.push(reel);
  }

  gameDisplayMonitor.addChild(reelContainer);

  // Reels done handler.
  function reelsComplete() {
    spinning = false;
    setMineButtonState();
    setRackState();
    checkReels();
  }

  // Listen for animate update.
  app.ticker.add((delta) => {
    // Update the slots.
    for (let i = 0; i < reels.length; i++) {
      const r = reels[i];
      // Update blur filter y amount based on speed.
      // This would be better if calculated with time in mind also. Now blur depends on frame rate.
      r.blur.blurY = (r.position - r.previousPosition) * 8;
      r.previousPosition = r.position;

      // Update symbol positions on reel.
      for (let j = 0; j < r.symbols.length; j++) {
        const s = r.symbols[j];
        const prevy = s.y;
        s.y = ((r.position + j) % r.symbols.length) * SYMBOL_SIZE - SYMBOL_SIZE;
        if (s.y < 0 && prevy > SYMBOL_SIZE) {
          // Detect going over and swap a texture.
          // This should in proper product be determined from some logical reel.
          s.texture =
            slotTextures[Math.floor(Math.random() * slotTextures.length)];
          s.scale.x = s.scale.y = Math.min(
            SYMBOL_SIZE / s.texture.width,
            SYMBOL_SIZE / s.texture.height
          );
          s.x = Math.round((SYMBOL_SIZE - s.width) / 2);
        }
      }
    }
  });

  function checkReels() {
    setTimeout(() => {
        console.clear();
        reels.forEach(element => {
            
            element.container.children.forEach(element => {
              console.log(element.texture.textureCacheIds);
            });
            console.log('-----------');
            
            //console.log(reels[i].container.children[0].texture.textureCacheIds);
        });
    }, 500);
  }

  // Very simple tweening utility function. This should be replaced with a proper tweening library in a real product.
  const tweening = [];
  function tweenTo(
    object,
    property,
    target,
    time,
    easing,
    onchange,
    oncomplete
  ) {
    const tween = {
      object,
      property,
      propertyBeginValue: object[property],
      target,
      easing,
      time,
      change: onchange,
      complete: oncomplete,
      start: Date.now(),
    };

    tweening.push(tween);
    return tween;
  }
  // Listen for animate update.
  app.ticker.add((delta) => {
    const now = Date.now();
    const remove = [];
    for (let i = 0; i < tweening.length; i++) {
      const t = tweening[i];
      const phase = Math.min(1, (now - t.start) / t.time);

      t.object[t.property] = lerp(
        t.propertyBeginValue,
        t.target,
        t.easing(phase)
      );
      if (t.change) t.change(t);
      if (phase === 1) {
        t.object[t.property] = t.target;
        if (t.complete) t.complete(t);
        remove.push(t);
      }
    }
    for (let i = 0; i < remove.length; i++) {
      tweening.splice(tweening.indexOf(remove[i]), 1);
    }
  });

  // Basic lerp funtion.
  function lerp(a1, a2, t) {
    return a1 * (1 - t) + a2 * t;
  }

  // Backout function from tweenjs.
  // https://github.com/CreateJS/TweenJS/blob/master/src/tweenjs/Ease.js
  function backout(amount) {
    return (t) => --t * t * ((amount + 1) * t + amount) + 1;
  }

  // Function to start playing.
  function startPlay() {
    if (spinning) return;
    spinning = true;

    for (let i = 0; i < reels.length; i++) {
      const r = reels[i];
      const extra = Math.floor(Math.random() * 3);
      const target = r.position + 10 + i * 5 + extra;
      const time = 2500 + i * 600 + extra * 600;
      tweenTo(
        r,
        "position",
        target,
        time,
        backout(0.1),
        null,
        i === reels.length - 1 ? reelsComplete : null
      );
    }
  }
}
