const screenWidth = window.innerWidth;
let isMobile = false;
let titleFontSize = 64;
let titleDistance = 80;
let rackContainerHeight = 721;
let rackContainerWidth = 796;
let rackContainerScale = 1;
let rackContainerYOffset = 120;
let gameDisplayMonitorWidth = 534;
let gameDisplayYOffset = 150;
let lineIndicatorYOffset = 110;
let lineIndicatorHeight = 100;
let maskGraphicsHeight = 310;
let controlsPanelWidth = 764;
let buttonDimensons = 189;
let buttonYOffset = -30;
let textInfoFontSize = 26;
let statusFontSize = 36;
let controlsPanelHeight = 170;
let fundsTextPosition = 70;

//responsie variables
if (screenWidth < 550) {
  isMobile = true;
  console.log("mobile mode");
  titleFontSize = 50;
  titleDistance = 30;
  rackContainerScale = 1;
  rackContainerHeight = window.innerHeight * 0.75;
  rackContainerWidth = window.innerWidth;
  rackContainerYOffset = window.innerHeight - rackContainerHeight;
  console.log(rackContainerYOffset);
  gameDisplayMonitorWidth = window.innerWidth - 50;
  gameDisplayYOffset = window.innerHeight / 8;
  lineIndicatorYOffset = 70;
  lineIndicatorHeight = 70;
  maskGraphicsHeight = 200;
  controlsPanelWidth = window.innerWidth;
  buttonDimensons = 140;
  buttonYOffset = -150;
  statusFontSize = 20;
  controlsPanelHeight = 100;
  fundsTextPosition = 20;
}

//game variables
let hasWatts = false;
let watts = 0;
let funds = 1000;
const reels = [];
let slotTextures = [];
let spinning = false;
let canPlayGameOver = false;

const app = new PIXI.Application({
  background: "#000",
  height: window.innerHeight,
  width: window.innerWidth,
});
document.body.appendChild(app.view);

// Loading bar
const loadingContainer = new PIXI.Container();

const loadingText = new PIXI.Text("NODE CONNECTING", {
  fontSize: 24,
  fill: 0xffffff,
  fontFamily: "Sigmar",
  dropShadow: true,
  dropShadowColor: "#51D5FF",
  dropShadowBlur: 16,
  textAlign: "center",
});
loadingText.anchor.set(0.5);
loadingText.position.set(app.screen.width / 2, app.screen.height / 2 - 20);

const loadingBar = new PIXI.Graphics();
loadingBar.lineStyle(2, 0x60ce7b, 1);
loadingBar.drawRect(0, 0, 300, 10);
loadingBar.position.set(app.screen.width / 2 - 150, app.screen.height / 2 + 10);
const progressBar = new PIXI.Graphics();
loadingBar.addChild(progressBar);
loadingContainer.addChild(loadingText);
loadingContainer.addChild(loadingBar);
app.stage.addChild(loadingContainer);
let progress = 0;

function updateProgress(delta) {
  progress += Math.random() * 0.01;
  if (progress > 1) {
    progress = 1;
  }

  // update the progress bar's width based on the progress
  progressBar.clear();
  progressBar.beginFill(0xffffff, 1);
  progressBar.drawRect(0, 0, progress * 300, 10);
  progressBar.endFill();

  if (progress === 1) {
    app.ticker.remove(updateProgress);
    app.stage.removeChild(loadingContainer);
  }
}
app.ticker.add(updateProgress);

//art variables
let colorMatrixPurchase = new PIXI.filters.ColorMatrixFilter();
let colorMatrixMine = new PIXI.filters.ColorMatrixFilter();

//new slot variables
const boxes = [];
for (let i = 0; i < 5; i++) {
  const reel = [
    Math.floor(Math.random() * 4),
    Math.floor(Math.random() * 4),
    Math.floor(Math.random() * 4),
    Math.floor(Math.random() * 4),
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

const assetPromise = PIXI.Assets.load([
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

assetPromise.then((loadedAsset) => {
  const serverRoomSound = new Audio("assets/sounds/server-room.mp3");
  serverRoomSound.volume = 0.18;
  serverRoomSound.loop = true;

  const mineSound = new Audio("assets/sounds/computer-boot.mp3");
  mineSound.volume = 0.6;
  mineSound.loop = true;

  const winSound = new Audio("assets/sounds/win.mp3");
  winSound.volume = 0.6;

  const offSound = new Audio("assets/sounds/turn-off.mp3");
  offSound.volume = 0.5;

  //silence sound mobile
  if (isMobile) {
    serverRoomSound.volume = 0;
    mineSound.volume = 0;
    winSound.volume = 0;
    offSound.volume = 0;
  }

  //game states
  const bgSprite = PIXI.Sprite.from(loadedAsset.background);
  bgSprite.width = app.screen.width;
  bgSprite.height = app.screen.height;

  // Add the sprite to the stage as the first child
  app.stage.addChildAt(bgSprite, 0);

  //Line indicator graphic
  const lineIndicator = new PIXI.Graphics();
  lineIndicator.lineStyle(5, 0x00ff49, 1);
  var blurFilter = new PIXI.filters.BlurFilter();
  lineIndicator.filters = [blurFilter];
  blurFilter.blur = 10;

  const lineIndicatorInner = new PIXI.Graphics();
  lineIndicatorInner.lineStyle(1, 0xffffff, 1);

  var blurFilterInner = new PIXI.filters.BlurFilter();
  lineIndicatorInner.filters = [blurFilterInner];
  blurFilterInner.blur = 0.5;

  //background rack
  const rackContainer = new PIXI.Container();
  rackContainer.height = rackContainerHeight;
  rackContainer.pivot.set(0.5, 1);
  rackContainer.width = rackContainerWidth;
  rackContainer.scale.set(rackContainerScale, rackContainerScale);
  if (!isMobile) {
    rackContainer.position.set(
      app.view.width / 2 - rackContainerWidth / 2,
      app.view.height - rackContainerHeight
    );
  } else {
    rackContainer.position.set(0, rackContainerYOffset);
  }

  //the on/off sprite for the foreground mining rack
  const rackSprite = new PIXI.Sprite();
  rackSprite.texture = loadedAsset.rackOff;
  app.stage.addChild(rackContainer);
  rackContainer.addChild(rackSprite);
  if (isMobile) {
    const scaleFactor = Math.min(
      window.innerWidth / rackSprite.width,
      window.innerHeight / rackSprite.height
    );
    rackContainer.scale.set(scaleFactor);
  }

  //game display
  const gameDisplayMonitor = new PIXI.Graphics();
  gameDisplayMonitor.beginFill("#000000");
  gameDisplayMonitor.drawRoundedRect(0, 0, gameDisplayMonitorWidth, 387, 21);
  gameDisplayMonitor.endFill();

  gameDisplayMonitor.position.set(
    app.view.width / 2 - gameDisplayMonitor.width / 2,
    rackContainer.position.y + gameDisplayYOffset
  );

  gameDisplayMonitor.filters = [
    new PIXI.filters.DropShadowFilter({
      distance: 10,
      blur: 23,
      alpha: 0.9,
    }),
  ];

  app.stage.addChild(gameDisplayMonitor);

  lineIndicator.drawRect(
    gameDisplayMonitor.position.x,
    gameDisplayMonitor.position.y + lineIndicatorYOffset,
    gameDisplayMonitor.width,
    lineIndicatorHeight
  );
  lineIndicatorInner.drawRect(
    gameDisplayMonitor.position.x,
    gameDisplayMonitor.position.y + lineIndicatorYOffset,
    gameDisplayMonitor.width,
    lineIndicatorHeight
  );
  
  app.stage.addChild(lineIndicator);
  app.stage.addChild(lineIndicatorInner);
  
  //title
  const titleContainer = new PIXI.Container();
  const gameTitle = new PIXI.Text("BIT-MINER", {
    fontSize: titleFontSize,
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

  titleContainer.position.set(app.view.width / 2, titleDistance);
  titleContainer.addChild(gameTitle);
  app.stage.addChild(titleContainer);

  //mask area for reels
  const maskGraphics = new PIXI.Graphics();
  maskGraphics.beginFill(0xff0000);
  maskGraphics.drawRect(0, 0, gameDisplayMonitor.width, maskGraphicsHeight);
  maskGraphics.endFill();
  maskGraphics.position.y = 0;
  gameDisplayMonitor.mask = maskGraphics;
  gameDisplayMonitor.addChild(maskGraphics);

  //controls container
  const controlsContainer = new PIXI.Container();
  const controlsPanel = new PIXI.Graphics();
  controlsPanel.lineStyle(2, 0x25ec5d, 0.4);
  controlsPanel.beginFill(0x000000, 0.5);
  controlsPanel.drawRect(0, 0, controlsPanelWidth, controlsPanelHeight);
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
  purchaseWattsSprite.texture = loadedAsset.wattsButton;
  purchaseWattsSprite.width = buttonDimensons;
  purchaseWattsSprite.height = buttonDimensons;
  purchaseWattsContainer.addChild(purchaseWattsSprite);
  purchaseWattsContainer.position.y = buttonYOffset;
  controlsContainer.addChild(purchaseWattsContainer);
  purchaseWattsSprite.interactive = true;
  purchaseWattsSprite.cursor = "pointer";

  purchaseWattsSprite.addListener("pointerdown", () => {
    buyWatts();
  });

  const purchaseButtonText = new PIXI.Text("PURCHASE WATTS", {
    fontSize: 24,
    fill: 0xc7d4ff,
    fontFamily: "Share Tech Mono",
  });
  purchaseButtonText.position.set(
    0,
    purchaseWattsContainer.height - purchaseButtonText.height * 0.8
  );
  purchaseWattsContainer.addChild(purchaseButtonText);

  //mine button ( a.k.a. spin)
  const mineButtonSprite = new PIXI.Sprite();
  mineButtonSprite.texture = loadedAsset.mineButton;
  mineButtonSprite.width = buttonDimensons;
  mineButtonSprite.height = buttonDimensons;
  controlsContainer.addChild(mineButtonSprite);
  mineButtonSprite.position.y = buttonYOffset;
  mineButtonSprite.position.x =
    controlsContainer.width - mineButtonSprite.width;
  mineButtonSprite.cursor = "pointer";
  mineButtonSprite.filters = [colorMatrixMine];
  colorMatrixMine.desaturate();

  mineButtonSprite.addListener("pointerdown", () => {
    spin();
  });

  const playIcon = new PIXI.Sprite();
  playIcon.texture = loadedAsset.polygon;
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
    fontSize: statusFontSize,
    fill: "#C7D4FF",
    fontFamily: "Share Tech Mono",
    padding: 20,
  });

  if (!isMobile) {
    textInfoContainer.position.x = purchaseWattsContainer.width + 30;
  } else {
    textInfoContainer.position.x = 30;
  }
  textInfoContainer.position.y = 30;
  textInfoContainer.addChild(wattsStatusText);

  //funds text
  let fundsText = new PIXI.Text("FUNDS : " + funds, {
    fontSize: statusFontSize,
    fill: "#C7D4FF",
    fontFamily: "Share Tech Mono",
    padding: 20,
  });
  fundsText.position.y = fundsTextPosition;
  textInfoContainer.addChild(fundsText);
  controlsContainer.addChild(textInfoContainer);
  // Create different slot symbols.
  slotTextures = [
    loadedAsset.red,
    loadedAsset.orange,
    loadedAsset.blue,
    loadedAsset.green,
  ];

  createBoxes(reels);

  function createBoxes(reels) {
    // Remove existing boxes
    boxes.forEach((box) => app.stage.removeChild(box));
    boxes.length = 0;

    // Create boxes for each reel value
    for (let i = 0; i < reels.length; i++) {
      for (let j = 0; j < reels[i].length; j++) {
        const box = new PIXI.Sprite(slotTextures[reels[i][j]]);
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
      rackSprite.texture = loadedAsset.rackOff;
      serverRoomSound.pause();
      serverRoomSound.currentTime = 0;
      lineIndicator.clear();
      lineIndicator.lineStyle(5, 0x00ff49, 1);
      lineIndicator.drawRect(
        gameDisplayMonitor.position.x,
        gameDisplayMonitor.position.y + lineIndicatorYOffset,
        gameDisplayMonitor.width,
        lineIndicatorHeight
      );
      if (canPlayGameOver) {
        offSound.play();
      }
    } else {
      rackSprite.texture = loadedAsset.rackOn;
      lineIndicator.clear();
      lineIndicator.lineStyle(15, 0xfc35ff, 1);
      lineIndicator.drawRect(
        gameDisplayMonitor.position.x,
        gameDisplayMonitor.position.y + lineIndicatorYOffset,
        gameDisplayMonitor.width,
        lineIndicatorHeight
      );
      serverRoomSound.play();
    }
  }

  function setGameInfoText() {
    wattsStatusText.text = "WATTS : " + watts;
    fundsText.text = "FUNDS : " + funds;
  }

  function buyWatts() {
    if (!spinning) {
      if (funds >= 500) {
        funds -= 500;
        watts += 500;
        mineButtonSprite.filters = [colorMatrixMine];
        colorMatrixMine.reset();
        mineButtonSprite.interactive = true;
        canPlayGameOver = true;
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
            reels[i].unshift(Math.floor(Math.random() * 4));
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

  function reelsComplete() {
    spinning = false;
    setMineButtonState();
    setRackState();
    mineSound.pause();
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
        if (sum === 0) {
          sum = 1;
        }
        funds += sum * 100;
        setGameInfoText();
        winSound.play();
      }
    }
  }

  function startPlay() {
    if (spinning) return;
    spinning = true;
    mineSound.play();
    rebuildReels();
  }
});
