import Phaser from 'phaser';
import logoImg from './assets/logo.png';
import mapPNG from './assets/assetsmap.png'//ADDED
import mapJSON from './assets/map.json'//ADDED
import waterPNG from './assets/water.png' //ADDED
import playerPNG from './assets/Ghost_Sheet.png' //ADDED
import enemyPNG from './assets/slime.png' //ADDED
import Enemies from './Enemies'
var player
var cursors
var enemies
class MyGame extends Phaser.Scene
{
    constructor ()
    {
        super();
    }
    preload ()
    {
        //this.load.image('logo', logoImg);
        this.load.image('water', waterPNG);
        //ADDED
        this.load.image('tiles', mapPNG)//---CARREGANDO A IMAGEM DO MAPA COM O NOME 'TILES'
        this.load.tilemapTiledJSON("map", mapJSON)//---
        this.load.spritesheet("player", playerPNG,
        {   frameWidth:32,
            frameHeight:32
        })//---
        this.load.image("slime", enemyPNG);
    }
      
    create ()
    {
         //ADDED
        const water = this.add.image(400, 150, 'water');
        const map = this.make.tilemap({key:"map"})//---
        const tileset = map.addTilesetImage("assets", "tiles")//---
        const ground = map.createLayer("ground", tileset, 0, 0)//---
        const above = map.createLayer("above", tileset,0, 0)//---
        
        const objectCollider = map.createLayer("object collide", tileset, 0, 0)//---
        objectCollider.setCollisionByProperty({"collider": true})

        //SPAWN
        const spawnPoint = map.findObject(
            'player',
            objects=>objects.name === 'spawning point'
        )

        //PLAYER
        player = this.physics.add.sprite(spawnPoint.x,spawnPoint.y,"player")
        
        player.setScale(2)

        this.physics.add.collider(player, objectCollider)//adiciona o player a lista de objetos que colidem

        above.setDepth(10)

        enemies = map.createFromObjects('enemy',{})

        this.enemiesGroup = new Enemies(this.physics.world, this,[],enemies)
        
        this.physics.add.collider(this.enemiesGroup, objectCollider)

        this.physics.add.collider(this.enemiesGroup, player, hitEnemy, null, this)

        //ANIMACOES
        const anims = this.anims
        anims.create(
        {
            key: "front",
            frames: anims.generateFrameNames("player", {frames:[0,1,2]}),
            frameRate: 20,
            repeat:-1
        })
        anims.create({
            key: "back",
            frames: anims.generateFrameNames("player", {frames:[36,37,38]}),
            frameRate: 20,
            repeat:-1
        })
        anims.create({
            key: "right",
            frames: anims.generateFrameNames("player", {frames:[24,25,26]}),
            frameRate: 20,
            repeat:-1
        })
        anims.create({
            key: "left",
            frames: anims.generateFrameNames("player", {frames:[12,13,14]}),
            frameRate: 10,
            repeat: -1,
        })
        const camera = this.cameras.main
        camera.startFollow(player)
        camera.setBounds(0,0, map.widthInPixels, map.heightInPixels)
        /*
        const logo = this.add.image(400, 150, 'logo');
        this.tweens.add({
            targets: logo,
            y: 450,
            duration: 2000,
            ease: "Power2",
            yoyo: true,
            loop: -1
        });
        */        
    }


    //ADDED
    update () //---
    {
        const prevVelocity = player.body.velocity.clone()
        player.body.setVelocity(0)
        cursors = this.input.keyboard.createCursorKeys()

        if(cursors.left.isDown){
            player.body.setVelocityX(-100)
            player.anims.play("left", true)
        }
        else if(cursors.right.isDown){
            player.body.setVelocityX(100)
            player.anims.play("right", true)
        }
        else if(cursors.up.isDown){
            player.body.setVelocityY(-100)
            player.anims.play("back", true)
        }
        else
            if(cursors.down.isDown){
            player.body.setVelocityY(100)
            player.anims.play("front", true)
        }
        else{
            player.anims.stop()
            if (prevVelocity.x < 0)
                player.setTexture("player", 12);
            else if (prevVelocity.x > 0)
                player.setTexture("player", 24);
            else if (prevVelocity.y < 0)
                player.setTexture("player", 36);
            else if (prevVelocity.y > 0)
                player.setTexture("player", 0);
        }
    }
}

const config = {
    type: Phaser.AUTO,
    parent: 'phaser-example',
    width: 650,
    height: 650,
    physics:{
        default:"arcade",
        arcade:{
            gravity:{y:0}
        }
    },
    scene: MyGame
};

const game = new Phaser.Game(config);

function hitEnemy(player, enemyGroup){
    this.scene.restart()
}