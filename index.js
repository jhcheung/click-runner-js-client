let game;
let flag = true;

let gameOptions = {
    platformStartSpeed: 400,
    gameDisplayWidth: 1337,
    playerGravity: 1000,
    jumpForce: 500,
    playerStartPosition: 200,
    playerStartLives: 2,
    jumps: 2,
    firePercent: 75
}
let b = document.createElement('button');
b.innerText = "Start Game";
b.id = "start";
document.body.appendChild(b);

document.addEventListener('click',(e)=>{
    if (e.target.id === "start")
    {
        e.target.remove();
        gameStart();
        
    }
});

class endScreen extends Phaser.Scene{
    constructor(){
        super("EndScreen");
    }
    create(data){
        console.log(data);
        console.log("here");
        this.add.text(game.config.width/2.5, game.config.height/2.2, 'Game Over', { fontSize: "64px", fontFamily: '"Roboto Condensed"' });
        this.add.text(game.config.width/2.3, game.config.height/1.8, `Your Score : ${data}`, { fontSize: "32px", fontFamily: '"Roboto Condensed"' });
        
        const helloButton = this.add.text(game.config.width/2.2, game.config.height/1.5, 'Hello Phaser!', { fill: '#0f0' });
        const resetButton = this.add.text(game.config.width/2.2, game.config.height/1.2, 'Restart!', { fill: '#0f0' });
        resetButton.setInteractive();
        resetButton.on('pointerdown', ()=>{
            this.sys.game.destroy(true);
            document.querySelector('canvas').remove();
            //passing in a string value to denote reset score
            //Probably not necessary when game is fully implemented
            // this.scene.start('RunnerGame',"dead")
            let b = document.createElement('button');
            b.innerText = "Start Game";
            b.id = "start";
            document.body.appendChild(b);
            //flag= false;

            // document.addEventListener('click',(e)=>{
            //     if (e.target.id === "start")
            //     {
            //         b.remove();
            //         gameStart();
            //     }
            // });
        });
        helloButton.setInteractive();
        helloButton.on('pointerdown', ()=>{
            //temporary
            document.querySelector('canvas').remove();
        })
        // debugger
    }

}


let gameStart = function() {
    let gameConfig = {
        type: Phaser.AUTO,
        width: gameOptions.gameDisplayWidth,
        height: 690,
        scene: [startScreen, clickGame, transitionScreen, runnerGame, endScreen],
        backgroundColor: 0x444444,
        physics: {
            default: "arcade"
        }
    }

    game = new Phaser.Game(gameConfig)
    window.focus();
    resize();
    window.addEventListener("resize", resize, false);
}

class startScreen extends Phaser.Scene{
    constructor(){
        super("StartScreen");
    }
    create(){
        const resetButton = this.add.text(game.config.width/2.2, game.config.height/1.2, 'Start Click!', { fill: '#0f0' });
        resetButton.setInteractive();
        resetButton.on('pointerdown', ()=>{
            //passing in a string value to denote reset score
            //Probably not necessary when game is fully implemented
            this.scene.start('ClickGame');
        });
    }
}

class clickGame extends Phaser.Scene{
    constructor(){
        super("ClickGame");
        this.text;
        this.timeEvent;
    }
    create(){
        let func = () => {this.scene.start("TransitionScreen");}
        this.text = this.add.text(32, 32);
        this.timeEvent = this.time.addEvent({delay: 10000, callback: func, callbackScope: this, repeat: 1, startAt:5000});
       
    } 
    update()
    {
        this.text.setText('Event.progress: ' + this.timeEvent.getProgress().toString().substr(0, 4) + '\nEvent.repeatCount: ' + this.timeEvent.repeatCount);
    }
}


class transitionScreen extends Phaser.Scene{
    constructor(){
        super("TransitionScreen");
    }
    create(){
        const resetButton = this.add.text(game.config.width/2.2, game.config.height/1.2, 'Start running!', { fill: '#0f0' });
        resetButton.setInteractive();
        resetButton.on('pointerdown', ()=>{
            //passing in a string value to denote reset score
            //Probably not necessary when game is fully implemented
            this.scene.start('RunnerGame',"alive")
        });
    }
}

class runnerGame extends Phaser.Scene{
    constructor() {
        super("RunnerGame")
        this.score = 0
        this.lives = gameOptions.playerStartLives
        this.addedGround = 0
    }

    preload() {
        this.load.image("platform", "platform.png")
        // this.load.image("player", "player.png")
        this.load.spritesheet("player", "scottpilgrim_multiple.png", {
            frameWidth: 108,
            frameHeight: 120
        })
        this.load.spritesheet("fire", "fire.png", {
            frameWidth: 40,
            frameHeight: 70
        });
 
    }

    create(data) {
        if (data==="dead") {
            this.score = 0;
            this.lives = gameOptions.playerStartLives;}
        //make group for floor sprites
        this.dying = false
        this.groundGroup = this.add.group({
 
            // once a platform is removed, it's added to the pool
            removeCallback: function(platform){
                platform.scene.groundPool.add(platform)
            }
        });
 
        // platform pool
        this.groundPool = this.add.group({
            // once a platform is removed from the pool, it's added to the active platforms group
            removeCallback: function(platform){
                platform.scene.groundGroup.add(platform)
            }
        });

        // make initial floor
        let groundPlatform = this.physics.add.sprite(game.config.width / 2, game.config.height * 0.8, 'platform')
        groundPlatform.setImmovable(true);
        groundPlatform.setVelocityX(gameOptions.platformStartSpeed * -1);
        groundPlatform.displayWidth = gameOptions.gameDisplayWidth;
        this.groundGroup.add(groundPlatform)
        
        // consec jumps
        this.playerJumps = 0

        // set up player
        this.player = this.physics.add.sprite(gameOptions.playerStartPosition, game.config.height / 2, "player")
        this.player.setGravityY(gameOptions.playerGravity);
        
        // set up score
        this.scoreText = this.add.text(16, 16, `Score: ${this.score}`, { fontSize: '32px', fill: '#000' });
        this.livesText = this.add.text(gameOptions.gameDisplayWidth - 170, 16, `Lives: ${this.lives}`, { fontSize: '32px', fill: '#000' });


        //set up animation
        this.anims.create({
            key: "run",
            frames: this.anims.generateFrameNumbers("player", {
                start: 0,
                end: 7
            }),
            frameRate: 8,
            repeat: -1
        });
        this.groundCollider = this.physics.add.collider(this.player, this.groundGroup, function() {
            if(!this.player.anims.isPlaying){
                this.player.anims.play("run");
            }
        }, null, this)

        this.anims.create({
            key: "burn",
            frames: this.anims.generateFrameNumbers("fire", {
                start: 0,
                end: 4
            }),
            frameRate: 15,
            repeat: -1
        });
 
        
        //copy pasted vv
        // group with all active firecamps.
        this.fireGroup = this.add.group({
            // once a firecamp is removed, it's added to the pool
            removeCallback: function(fire){
                fire.scene.firePool.add(fire)
            }
        });
 
        // fire pool
        this.firePool = this.add.group({
 
            // once a fire is removed from the pool, it's added to the active fire group
            removeCallback: function(fire){
                fire.scene.fireGroup.add(fire)
            }
        });

        // death by collision
        this.physics.add.overlap(this.player, this.fireGroup, function(player, fire){
            if (this.dying === false) {
                this.dying = true;
                this.player.anims.stop();
                this.player.setFrame(9);
                this.player.body.setVelocityY(-200);
                this.physics.world.removeCollider(this.groundCollider);
                this.lives = this.lives - 1
                this.livesText.setText(`Lives: ${this.lives}`)
            }
            // game.time.events.add(Phaser.Timer.SECOND * 4, this.scene.restart(), this)
        }, null, this);


        this.input.keyboard.on('keydown_SPACE', this.jump, this)
        
        //early game over keypress for testing
        this.input.keyboard.on('keydown_W', this.gameOver, this);

    }

    addGround(){
        this.addedGround ++;
        console.log(this.addedGround)

        let ground;
        if(this.groundPool.getLength()){
            ground = this.groundPool.getFirst();
            ground.x = game.config.width;
            ground.y = game.config.height * 0.8;
            ground.active = true;
            ground.visible = true;
            this.groundPool.remove(ground);
            // let newRatio =  groundWidth / ground.displayWidth;
            ground.displayWidth = gameOptions.gameDisplayWidth;
            ground.tileScaleX = 1 / ground.scaleX;
        }
        else{
            ground = this.add.tileSprite(game.config.width, game.config.height * 0.8, game.config.width * 1.5, 32, "platform");
            this.physics.add.existing(ground);
            ground.body.setImmovable(true);
            ground.body.setVelocityX(- gameOptions.platformStartSpeed);
            ground.setDepth(2);
            this.groundGroup.add(ground);
        }
        // this.nextPlatformDistance = Phaser.Math.Between(gameOptions.spawnRange[0], gameOptions.spawnRange[1]);
 

        // let groundPlatform = this.physics.add.sprite(game.config.width * 1.5, game.config.height * 0.8, "platform");
        // groundPlatform.setImmovable(true);
        // groundPlatform.setVelocityX(gameOptions.platformStartSpeed * -1);
        // groundPlatform.displayWidth = gameOptions.gameDisplayWidth;
        // this.groundGroup.add(groundPlatform)


        if(this.addedGround > 1){
            if(Phaser.Math.Between(1, 100) <= gameOptions.firePercent){
                if(this.firePool.getLength()){
                    // debugger
                    let fire = this.firePool.getFirst()
                    fire.x = gameOptions.gameDisplayWidth
                    fire.y = game.config.height - 200
                    fire.alpha = 1
                    fire.active = true
                    fire.visible = true
                    this.firePool.remove(fire)
                    console.log(this.firePool)
                    console.log(fire)
                    console.log("from pool")
                }
                else{
                    let num = Phaser.Math.Between(1, 3)
                    for (let i = 0; i < num; i++) {
                        let fire = this.physics.add.sprite(gameOptions.gameDisplayWidth, game.config.height - 200 - (i * 40), "fire")
                        fire.setImmovable(true)
                        fire.setVelocityX(- gameOptions.platformStartSpeed)
                        fire.setSize(8, 2, true)
                        fire.anims.play("burn")
                        fire.setDepth(2)
                        this.fireGroup.add(fire)    
                        console.log("new from group")
                    }
                    // debugger
                }
            }
        }
    }

    removeOldPlatforms() {
        this.minDistance = game.config.width;
        this.groundGroup.getChildren().forEach(function(platform){
            let platformDistance = game.config.width - platform.x - platform.displayWidth / 2;
            if(platformDistance < this.minDistance){
                this.minDistance = platformDistance;
            }
            if(platform.x < - platform.displayWidth / 2){
                this.groundGroup.killAndHide(platform);
                this.groundGroup.remove(platform);
            }
        }, this);
    }

    jump(event){
        console.log(event);
        if(event.code === "Space"){
        if(this.player.body.touching.down || (this.playerJumps > 0 && this.playerJumps < gameOptions.jumps)){
            if(this.player.body.touching.down){
                this.playerJumps = 0
            }
            this.player.setVelocityY(gameOptions.jumpForce * -1)
            this.playerJumps ++
            this.player.anims.setProgress(0.25)
            this.player.anims.stop();
        }
        }
    }

    gameOver = function() {
 
        // shake the camera
        this.cameras.main.shake(500);
    //    debugger;
        // end screen
        this.time.delayedCall(500, function() {
          this.scene.start("EndScreen", this.score+"");
        }, [], this);
      }
    

    update() {
        //extend ground with every update
        if(this.player.y > game.config.height){
            this.scene.start("RunnerGame","alive");
        }

        if (this.lives <= 0) {
            this.gameOver();
        }

        if (this.minDistance > 0) {
            this.addGround()
        }

        
        

        //have player stay in one position
        this.player.x = gameOptions.playerStartPosition

        //recycle old platforms
        this.removeOldPlatforms()

        this.fireGroup.getChildren().forEach(function(fire){
            if(fire.x < - fire.displayWidth / 2){
                console.log("inside if")
                console.log(this.fireGroup)
                this.fireGroup.killAndHide(fire);
                this.fireGroup.remove(fire);
                console.log(this.fireGroup)

                if (!this.dying) {
                    this.score += 1
                    this.scoreText.setText(`Score: ${this.score}`)    
                }
            }
        }, this);

    }
}



function resize(){
    let canvas = document.querySelector("canvas");
    // debugger;
    let windowWidth = window.innerWidth;
    let windowHeight = window.innerHeight;
    let windowRatio = windowWidth / windowHeight;
    let gameRatio = game.config.width / game.config.height;
    if(windowRatio < gameRatio){
        canvas.style.width = windowWidth + "px";
        canvas.style.height = (windowWidth / gameRatio) + "px";
    }
    else{
        canvas.style.width = (windowHeight * gameRatio) + "px";
        canvas.style.height = windowHeight + "px";
    }
}
