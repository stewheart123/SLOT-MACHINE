document.addEventListener("DOMContentLoaded", function() {
    // your code here
  });
  
 //game variables
 let hasWatts = false;
 let watts = 0;
 let funds = 1000;

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

 const bgSprite = PIXI.Sprite.from(
   "assets/images/background-server-room.jpg"
 );
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
 gameTitle.position.set(
   titleContainer.width / 2,
   titleContainer.height / 2
 );

 titleContainer.position.set(app.view.width / 2, 80);
 titleContainer.addChild(gameTitle);
 app.stage.addChild(titleContainer);

 //background rack
 const rackContainer = new PIXI.Container();
 rackContainer.width = 797;
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
  console.log(rackContainer.width);
  console.log(gameDisplayMonitor.width);
  //fixes monitor in incorrect position
  if(rackContainer.width < 2) {
      rackSprite.texture.baseTexture.on("loaded", () => {
            gameDisplayMonitor.position.set(
              rackContainer.width / 2 - gameDisplayMonitor.width / 2,
              150
            );
      });

    } else {
        gameDisplayMonitor.position.set(
            rackContainer.width / 2 - gameDisplayMonitor.width / 2,
            150
          );
    }
  
  gameDisplayMonitor.filters = [
    new PIXI.filters.DropShadowFilter({
      distance: 10,
      blur: 23,
      alpha: 0.9,
    }),
  ];
 
  rackContainer.addChild(gameDisplayMonitor);

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
 const purchaseWattsSprite = PIXI.Sprite.from(
   "assets/images/mine-button.png"
 );
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
  mineButtonSprite.position.x = controlsContainer.width - mineButtonSprite.width;
  mineButtonSprite.cursor = "pointer";
  mineButtonSprite.filters = [alphaFilterInactive];

  mineButtonSprite.addListener("pointerdown", () => {
    spin(); 
  });

  const playIcon = PIXI.Sprite.from(
    "assets/images/Polygon 1.png"
  );
  playIcon.position.y = (186 / 2) +  120;
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
    if(watts > 1) {
        hasWatts = true;
    }
    else {
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

function buyWatts(){
    if(funds >= 500) {
        funds -= 500;
        watts += 500
    }
    if(funds < 1) {
        purchaseWattsSprite.interactive = false;
        purchaseWattsSprite.filters = [alphaFilterInactive];
    }
    setGameInfoText();
    setRackState();
}

function spin(){
    console.log('spin called!');    
    if(watts >= 100) {
        spinning = true;
        watts -=100;
        setGameInfoText();      
        setRackState();
    }
    if(spinning) {
        mineButtonSprite.interactive = false;
        mineButtonSprite.filters = [alphaFilterInactive];
    }
}