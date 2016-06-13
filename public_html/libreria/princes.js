/* 
 * To change this license header, choose License Headers in Project Properties.
 * To change this template file, choose Tools | Templates
 * and open the template in the editor.
 */


/**
 * Comportamiento para uso del cursor
 * 
 * @param {type} game
 * @param {type} posx
 * @param {type} posy
 * @param {type} key
 * @param {type} frame
 * @param {type} target
 * @param {type} cursors
 * @returns {Behavior_Cursor}
 */
function princes(game, posx, posy, key) {
//    Behavior.call(this,game, posx, posy, key, frame,target);


    this.sprite = game.add.sprite(posx+19, posy, key)
    this.game = game;

    /*
     * agrega sprite al juego
     */
    this.game.physics.enable(this.sprite, Phaser.Physics.ARCADE);


    /**
     *  Variables utiles para el comportamiento 
     */
    this.esp_speed = 0;
    this.max_speed = 1.5;
    this.min_speed = 0;
    this.min_distance = 0;
    this.max_distance = 0;
this.distancia_limite = 50;


//    return this;

this.sprite.scale.setTo(0.05,0.05);
    this.sprite.animations.add('movIzq',[0],7,false);
    this.sprite.animations.add('movDer',[1],7,false);

    //this.sprite.body.bounce.y = 0.2;
    //  this.sprite.body.gravity.y = 300;
    this.sprite.body.collideWorldBounds = true;
    //this.sprite.scale.setTo(0.1, 0.1);
    this.game.physics.arcade.enable(this.sprite);
    return this;
}
//Behavior_Cursor.prototype= Object.create(Behavior.prototype);//Degfino que es sub clase de Sprite.
princes.prototype.constructor = princes;

princes.prototype.update = function () {
for (var i = 0; i < ninjas.length; i++)
    {
        if(score[i]>25){
          capaPuerta.visible=false;
            map.setCollision(4066,false,"CapaColision",false);
            
            //console.log(termino);
           // termino=1;
        }

        if (this.invade_mi_area(ninjas[i])){
		    //console.log(termino);
			 if(score[i]>25){
                   game.add.text(200, 200, 'Termino' , {fontSize: '32px', fill: '#000'});
                   //console.log(termino);
                    termino=1;
            }    
		}
	}
    
};

princes.prototype.invade_mi_area= function (companero){
//verifica si el compañero está dentro del área del personaje que invoca
	var invade = false;
	
	if (Phaser.Point.distance(this.sprite.body.position,companero.sprite.body.position) <= this.distancia_limite){
		invade = true;
		}	
	return invade;
}