//game variables
let hasWatts = false;
let watts = 0;
let funds = 1000;
const reels = [];
let slotTextures = [];
let spinning = false;

const app = new PIXI.Application({
  background: "#000",
  height: window.innerHeight,
  width: window.innerWidth,
});

document.body.appendChild(app.view);

//art variables
let colorMatrixPurchase = new PIXI.filters.ColorMatrixFilter();
let colorMatrixMine = new PIXI.filters.ColorMatrixFilter();

//new slot variables
  const boxWidth = 60;
  const boxHeight = 60;
  const boxSpacing = 10;
  const boxes = [];
      for (let i = 0; i < 5; i++) {
        const reel = [
          Math.floor(Math.random() * 4) ,
          Math.floor(Math.random() * 4),
          Math.floor(Math.random() * 4) ,
          Math.floor(Math.random() * 4) ,
        ];

        reels.push(reel);
      }

//asset variables
PIXI.Assets.add("red", "assets/images/red.png");
PIXI.Assets.add("orange", "assets/images/orange.png");
PIXI.Assets.add("blue", "assets/images/blue.png");
PIXI.Assets.add("green", "assets/images/green.png");
PIXI.Assets.add("background", "assets/images/background-server-room.jpg");
PIXI.Assets.add("rackOff", "assets/images/rack off.png");
PIXI.Assets.add("rackOn", "assets/images/rack on.png");
PIXI.Assets.add("mineButton", "assets/images/mine-button-blue.png");
PIXI.Assets.add("polygon", "assets/images/Polygon 1.png");
PIXI.Assets.add("wattsButton", "assets/images/mine-button.png");

const texturesPromise = PIXI.Assets.load([
  "red",
  "orange",
  "blue",
  "green",
  "background",
  "rackOff",
  "rackOn",
  "mineButton",
  "polygon",
  "wattsButton",
]);

texturesPromise.then((textures) => {

  //game states
  const bgSprite = PIXI.Sprite.from(textures.background);
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
  const rackSprite = new PIXI.Sprite();
  rackSprite.texture = textures.rackOff;
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
  const purchaseWattsSprite = new PIXI.Sprite();
  purchaseWattsSprite.texture = textures.wattsButton;
  purchaseWattsSprite.width = 189;
  purchaseWattsSprite.height = 186;
  purchaseWattsContainer.addChild(purchaseWattsSprite);
  purchaseWattsSprite.position.y = -30;
  controlsContainer.addChild(purchaseWattsContainer);
  purchaseWattsSprite.interactive = true;
  purchaseWattsSprite.cursor = "pointer";

  purchaseWattsSprite.addListener("pointerdown", () => {
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
  const mineButtonSprite = new PIXI.Sprite();
  mineButtonSprite.texture = textures.mineButton;

  mineButtonSprite.width = 189;
  mineButtonSprite.height = 186;
  controlsContainer.addChild(mineButtonSprite);
  mineButtonSprite.position.y = -30;
  mineButtonSprite.position.x =
    controlsContainer.width - mineButtonSprite.width;
  mineButtonSprite.cursor = "pointer";
  mineButtonSprite.filters = [colorMatrixMine];
  colorMatrixMine.desaturate();

  mineButtonSprite.addListener("pointerdown", () => {
    spin();
  });

  const playIcon = new PIXI.Sprite();
  playIcon.texture = textures.polygon;
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
    // Create different slot symbols.
    slotTextures = [
      textures.red,
      textures.orange,
      textures.blue,
      textures.green    
    ];

  createBoxes(reels);

  function createBoxes(reels) {
    // Remove existing boxes
    boxes.forEach((box) => app.stage.removeChild(box));
    boxes.length = 0;

    // Create boxes for each reel value
    for (let i = 0; i < reels.length; i++) {
      for (let j = 0; j < reels[i].length; j++) {

        const box = new PIXI.Sprite(
            slotTextures[reels[i][j]]
        );
        box.width = gameDisplayMonitor.width / 5;
        box.height = gameDisplayMonitor.width / 5;
        box.x = i * (gameDisplayMonitor.width / 5);
        box.y = j * (gameDisplayMonitor.width / 5);
        gameDisplayMonitor.addChild(box);
        boxes.push(box);
      }
    }    
  }

  function setRackState() {
    if (watts > 1) {
      hasWatts = true;
    } else {
      hasWatts = false;
    }
    if (!hasWatts) {
      rackSprite.texture = textures.rackOff;
    } else {
      rackSprite.texture = textures.rackOn;
    }
  }

  function setGameInfoText() {
    wattsStatusText.text = "WATTS : " + watts;
    fundsText.text = "FUNDS :" + funds;
  }

  function buyWatts() {
    if (!spinning) {
      if (funds >= 500) {
        funds -= 500;
        watts += 500;
        mineButtonSprite.filters = [colorMatrixMine];
        colorMatrixMine.reset();
        mineButtonSprite.interactive = true;
      }
      if (funds < 1) {
        purchaseWattsSprite.interactive = false;
        purchaseWattsSprite.filters = [colorMatrixPurchase];
        colorMatrixPurchase.desaturate();
      }
      setGameInfoText();
      setRackState();
    }
  }

  function spin() {
    if (watts >= 100) {
      //  spinning = true;
      watts -= 100;
      startPlay();
      setGameInfoText();
    }
    if (spinning) {
      mineButtonSprite.interactive = false;
      mineButtonSprite.filters = [colorMatrixMine];
      colorMatrixMine.desaturate();
    }
  }
  function setMineButtonState() {
    if (watts < 1) {
      mineButtonSprite.interactive = false;
      mineButtonSprite.filters = [colorMatrixMine];
      colorMatrixMine.desaturate();
    } else {
      mineButtonSprite.interactive = true;
      mineButtonSprite.filters = [colorMatrixMine];
      colorMatrixMine.reset();
    }
  }
  
function rebuildReels() {
  let count = 0;
  let isActive = true;

  const tickerFunction = () => {
    const interval = 10; // generate random interval between 15 and 35 frames
    if (isActive && count < 10 * interval) {
      // run 10 times or until count reaches 10 * interval
      count++;
      if (count % interval === 0) {
        // run every `interval` frames
        for (let i = 0; i < reels.length; i++) {
          reels[i].pop();
          reels[i].unshift(Math.floor(Math.random() * 4) );
        }
        createBoxes(reels);
      }
    } else {
      isActive = false;
      app.ticker.remove(tickerFunction); // stop the ticker
      checkForMatchingColors(reels);
      reelsComplete();
    }
  };

  app.ticker.add(tickerFunction);
}
  // Reels done handler.
  function reelsComplete() {
    spinning = false;
    setMineButtonState();
    setRackState();    
  }

  function checkForMatchingColors(arr) {
    let resultsArray = [];
    for (let i = 0; i < arr.length; i++) {
      for (let j = 0; j < arr[i].length; j++) {
        if (j === 1) {
          let result = arr[i][j];
          resultsArray.push(result);
        }
      }
    }
    sumMatchingNumbers(resultsArray);
  }

  // logic to check sequence
  function sumMatchingNumbers(numbers) {
    let sum = 0;

    for (let i = 0; i < numbers.length; i++) {
      let count = 1;
      let currentSum = numbers[i];

      for (let j = i + 1; j < numbers.length; j++) {
        if (numbers[j] === numbers[i]) {
          count++;
          currentSum += numbers[j];
        } else {
          break;
        }
      }

      if (count >= 3) {
        sum += currentSum;
        i += count - 1;
        console.log(sum + " winner with " + count);
        funds += sum * 100;
        setGameInfoText();        
      }
    }
  }  

  function startPlay() {
    if (spinning) return;
    spinning = true;
    rebuildReels();
  }
});
