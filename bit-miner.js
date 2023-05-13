document.addEventListener("DOMContentLoaded", function() {
    // your code here
  });
  
 //game variables
 let hasPower = false;

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

 //purchase power button
 const purchasePowerContainer = new PIXI.Container();
 const purchasePowerSprite = PIXI.Sprite.from(
   "assets/images/mine-button.png"
 );
 purchasePowerSprite.width = 189;
 purchasePowerSprite.height = 186;
 purchasePowerContainer.addChild(purchasePowerSprite);
 purchasePowerSprite.position.y = -30;
 controlsContainer.addChild(purchasePowerContainer);
 purchasePowerSprite.interactive = true;
 purchasePowerSprite.cursor = "pointer";

 purchasePowerSprite.addListener("pointerdown", () => {
   hasPower = !hasPower;
   setRackState();
 });

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

 const purchaseButtonText = new PIXI.Text("PURCHASE VOLTS", {
   fontSize: 24,
   fill: 0xc7d4ff,
   fontFamily: "Share Tech Mono",
 });
 purchaseButtonText.position.set(
   0,
   purchasePowerContainer.height - purchaseButtonText.height * 2
 );
 purchasePowerContainer.addChild(purchaseButtonText);

 //mine button ( a.k.a. spin)

 //game status text

 function setRackState() {
   if (!hasPower) {
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
   //   app.stage.addChild(rackContainer);
 }
