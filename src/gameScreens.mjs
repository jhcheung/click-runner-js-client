
let gemObj = {
    1: "rubies",
    2: "sapphires",
    3: "emeralds",
    4: "diamonds",
    5: "amethysts"
}

export class startScreen extends Phaser.Scene{
    constructor(){
        super("StartScreen");
    }
    preload(){
        this.load.spritesheet('plunder', 'public/plunder.png', {
            frameWidth: 300,
            frameHeight: 200
        });
        this.load.spritesheet('plunderPress', 'public/plunderpress.png', {
            frameWidth: 300,
            frameHeight: 200
        });
    }
    loadNewSpriteAndGame(){
        this.anims.stop();
        this.anims.play('press');
        // debugger;
        this.scene.scene.start('ClickGame');
    }
    create(){        
        const instructions = "You are an explorer seeking valuable treasures in an unnamed dungeon. In the first part of the game, put your plunde— mining skills to the test! \nClick the gems as they appear on the screen to mine them. \nOh no! After 30 seconds of mining, it seems that the dungeon has noticed you. It’s time to escape! \nUse the space bar in order to jump over obstacles as they appear on the screen. Luckily, you have the gems you gathered to help, as they will grant you magic powers! \n * Emeralds - Emeralds will grant you additional lives. Wow! \n * Sapphires - Sapphires will grant you a higher score multiplier. \n * Rubys - Rubies will ward off obstacles. You’ll encounter fewer obstacles as you run. \n\nGood luck!"
        const instructionsText = this.add.text(0, 0, instructions, { fontSize: "20px", fontFamily: 'Comic Sans MS', fill: 'whitesmoke', wordWrap: { width: 1300 },     padding: {
            left: 30,
            right: 30,
            top: 100,
            bottom: 100,
        }});
        const clickPlay = this.add.sprite(this.game.config.width/2, this.game.config.height/1.2, 'plunder');
        this.anims.create({
            key: 'plund',
            frames: this.anims.generateFrameNumbers('plunder', {
                start: 0,
                end: 0
            }),
            frameRate: 1,
            repeat: -1
        });
        this.anims.create({
            key: 'press',
            frames: this.anims.generateFrameNumbers('plunderPress', {
                start: 0,
                end: 0
            }),
            frameRate: 1,
            repeat: -1
        });

        // const resetButton = this.add.text(this.game.config.width/2, this.game.config.height/1.2, 'Click When Ready', { fontSize: "20px", fontFamily: 'Comic Sans MS', fill: '#0f0' });

        clickPlay.anims.play('plund');
        clickPlay.setInteractive();
        clickPlay.on('pointerdown', this.loadNewSpriteAndGame);

    
    }

}

export class transitionScreen extends Phaser.Scene{
    constructor(){
        super("TransitionScreen");
        this.clickScore = {};
    }
    preload(){
        this.load.spritesheet('run', 'public/run.png', {
            frameWidth: 300,
            frameHeight: 200
        });
        this.load.spritesheet('runPress', 'public/runpress.png', {
            frameWidth: 300,
            frameHeight: 200
        });
    }
    create(clickScore){
        console.log(clickScore);
        this.clickScore = clickScore;
        this.anims.create({
            key: 'runn',
            frames: this.anims.generateFrameNumbers('run', {
                start: 0,
                end: 0
            }),
            frameRate: 1,
            repeat: -1
        });
        this.anims.create({
            key: 'pressRun',
            frames: this.anims.generateFrameNumbers('runPress', {
                start: 0,
                end: 0
            }),
            frameRate: 1,
            repeat: -1
        });
        // debugger;
        let x = 1;
        let scoreheight = this.game.config.height;
        let scoreheightOffset = scoreheight/3.2;
        let game = this;
        Object.values(clickScore).forEach((value)=>{
            game.add.text(game.game.config.width/2.2, scoreheightOffset, `Total ${gemObj[x]}: ${value}`, {fill: '#0f0'});
            scoreheightOffset += 25;
            x+=1;
        });
        
        //const score1 = this.add.text(this.game.config.width/2.2, this.game.config.height/3.2, clickScore.gem1, {fill: '#0f0'});
        //const resetButton = this.add.text(this.game.config.width/2.2, this.game.config.height/1.2, 'Start running!', { fill: '#0f0' });
        const clickPlay = this.add.sprite(this.game.config.width/2, this.game.config.height/1.2, 'run');
        clickPlay.anims.play('runn');
        clickPlay.setInteractive();
        clickPlay.on('pointerdown', this.loadNewSpriteAndGame);
    }

    loadNewSpriteAndGame(){
        // debugger
        this.anims.stop();
        this.anims.play('pressRun');
        debugger
        this.scene.scene.start('RunnerGame',this.scene.clickScore);
    }

}

export class endScreen extends Phaser.Scene{
    constructor(){
        super("EndScreen");
    }
    create(data){
        console.log(data);
        console.log("here");
        this.add.text(this.game.config.width/2.5, this.game.config.height/2.2, 'Game Over', { fontSize: "64px", fontFamily: 'Comic Sans MS' });
        this.add.text(this.game.config.width/2.3, this.game.config.height/1.8, `Your Score : ${data}`, { fontSize: "32px", fontFamily: 'Comic Sans MS' });
        
        const helloButton = this.add.text(this.game.config.width/2.2, this.game.config.height/1.5, 'Hello Phaser!', { fontFamily: 'Comic Sans MS', fill: '#0f0' });
        const resetButton = this.add.text(this.game.config.width/2.2, this.game.config.height/1.2, 'Restart!', { fontFamily: 'Comic Sans MS', fill: '#0f0' });
        resetButton.setInteractive();
        resetButton.on('pointerdown', ()=>{
            this.sys.game.destroy(true);
            document.querySelector('canvas').remove();
            //passing in a string value to denote reset score
            //Probably not necessary when game is fully implemented
            // this.scene.start('RunnerGame',"dead")
            // let b = document.createElement('button');
            // b.innerText = "Start Game";
            // b.id = "start";
            // document.body.appendChild(b);
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
