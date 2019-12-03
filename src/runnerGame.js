class runnerGame extends Phaser.Scene{
    constructor() {
        super("RunnerGame")
        this.score = 0
        this.addedGround = 0
    }

    preload() {
        this.gameOptions = this.game.gameOptions
        if (!this.lives) {
            this.lives = this.gameOptions.playerStartLives
        }
        this.load.image("platform", "public/platform.png")
        // this.load.image("player", "public/player.png")
        this.load.spritesheet("player", "public/scottpilgrim_multiple.png", {
            frameWidth: 108,
            frameHeight: 120
        })
        this.load.spritesheet("fire", "public/fire.png", {
            frameWidth: 40,
            frameHeight: 70
        });
 
    }

    create(data) {
        if (data==="dead") {
            this.score = 0;
            this.lives = this.gameOptions.playerStartLives;
        }
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
        let groundPlatform = this.physics.add.sprite(this.game.config.width / 2, this.game.config.height * 0.8, 'platform')
        groundPlatform.setImmovable(true);
        groundPlatform.setVelocityX(this.gameOptions.platformStartSpeed * -1);
        groundPlatform.displayWidth = this.gameOptions.gameDisplayWidth;
        this.groundGroup.add(groundPlatform)
        
        // consec jumps
        this.playerJumps = 0

        // set up player
        this.player = this.physics.add.sprite(this.gameOptions.playerStartPosition, this.game.config.height / 2, "player")
        this.player.setGravityY(this.gameOptions.playerGravity);
        
        // set up score
        this.scoreText = this.add.text(16, 16, `Score: ${this.score}`, { fontSize: '32px', fill: '#000' });
        this.livesText = this.add.text(this.gameOptions.gameDisplayWidth - 170, 16, `Lives: ${this.lives}`, { fontSize: '32px', fill: '#000' });


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
            // this.game.time.events.add(Phaser.Timer.SECOND * 4, this.scene.restart(), this)
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
            ground.x = this.game.config.width;
            ground.y = this.game.config.height * 0.8;
            ground.active = true;
            ground.visible = true;
            this.groundPool.remove(ground);
            // let newRatio =  groundWidth / ground.displayWidth;
            ground.displayWidth = this.gameOptions.gameDisplayWidth;
            ground.tileScaleX = 1 / ground.scaleX;
        }
        else{
            ground = this.add.tileSprite(this.game.config.width, this.game.config.height * 0.8, this.game.config.width * 1.5, 32, "platform");
            this.physics.add.existing(ground);
            ground.body.setImmovable(true);
            ground.body.setVelocityX(- this.gameOptions.platformStartSpeed);
            ground.setDepth(2);
            this.groundGroup.add(ground);
        }
        // this.nextPlatformDistance = Phaser.Math.Between(this.gameOptions.spawnRange[0], this.gameOptions.spawnRange[1]);
 

        // let groundPlatform = this.physics.add.sprite(this.game.config.width * 1.5, this.game.config.height * 0.8, "platform");
        // groundPlatform.setImmovable(true);
        // groundPlatform.setVelocityX(this.gameOptions.platformStartSpeed * -1);
        // groundPlatform.displayWidth = this.gameOptions.gameDisplayWidth;
        // this.groundGroup.add(groundPlatform)


        if(this.addedGround > 1){
            if(Phaser.Math.Between(1, 100) <= this.gameOptions.firePercent){
                if(this.firePool.getLength()){
                    // debugger
                    let fire = this.firePool.getFirst()
                    fire.x = this.gameOptions.gameDisplayWidth
                    fire.y = this.game.config.height - 200
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
                        let fire = this.physics.add.sprite(this.gameOptions.gameDisplayWidth, this.game.config.height - 200 - (i * 40), "fire")
                        fire.setImmovable(true)
                        fire.setVelocityX(- this.gameOptions.platformStartSpeed)
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
        this.minDistance = this.game.config.width;
        this.groundGroup.getChildren().forEach(function(platform){
            let platformDistance = this.game.config.width - platform.x - platform.displayWidth / 2;
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
        if(this.player.body.touching.down || (this.playerJumps > 0 && this.playerJumps < this.gameOptions.jumps)){
            if(this.player.body.touching.down){
                this.playerJumps = 0
            }
            this.player.setVelocityY(this.gameOptions.jumpForce * -1)
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
        if(this.player.y > this.game.config.height){
            this.scene.start("RunnerGame","alive");
        }

        if (this.lives <= 0) {
            this.gameOver();
        }

        if (this.minDistance > 0) {
            this.addGround()
        }

        
        

        //have player stay in one position
        this.player.x = this.gameOptions.playerStartPosition

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

export default runnerGame