/* 
 * To change this license header, choose License Headers in Project Properties.
 * To change this template file, choose Tools | Templates
 * and open the template in the editor.
 */

function Behavior_Ninja(game, posx, posy, key, tipo) {
    //Movimientos.call(this,game, posx, posy, key, 0,target);


    this.sprite = game.add.sprite(posx, posy, key)
    this.game = game;
    this.tipo=tipo;
    this.target=null;
    /*
     * agrega sprite al juego
     */
    this.game.physics.enable(this.sprite, Phaser.Physics.ARCADE);

    this.distancia_limite = 70;    
    /**
     *  Variables utiles para el comportamiento 
     */
    this.max_vel = 300;
    this.max_force = 80;
    
    this.esp_speed = 0;
    this.max_speed = 10.5;
    this.min_speed = 0;
    this.min_distance = 0;
    this.max_distance = 0;
    
    this.nopelea=1;
    
    //  this.sprite.body.gravity.y = 300;
    this.sprite.body.collideWorldBounds = true;
    //this.sprite.scale.setTo(0.1, 0.1);

    this.game.physics.arcade.enable(this.sprite);

    this.sprite.body.collideWorldBounds = true;

    this.puerta = new Phaser.Point(princes.sprite.body.position.x, princes.sprite.body.position.y + 96);
    
    this.posicionAnterior = new Phaser.Point(posx, posy);

//    this.sprite.animations.add('right', [3, 4, 5], 7, true);
//    this.sprite.animations.add('left', [0, 1, 2], 7, true);
    
    this.sprite.animations.add('right', [1], 7, true);
    this.sprite.animations.add('left', [0], 7, true);
    
    return this;
}
//Behavior_Cursor.prototype= Object.create(Behavior.prototype);//Degfino que es sub clase de Sprite.
Behavior_Ninja.prototype.constructor = Behavior_Ninja;

// Para que al frenar quede hacia donde iba.
var ultimo = 'right';
var ultimoA = 'left';
var llego_a_puerta = false;
var bloqueado = 0;
var desbloqueando = 0;

Behavior_Ninja.prototype.update = function () {

    this.sprite.body.velocity.x = 0;
    this.sprite.body.velocity.y = 0;

    // PERSECUCION
    var i=0;
    while (i<mongoles.length && mongoles[i].nopeleo === 0 )
        i++;

//    if(score[this.tipo] > 25){
//        this.target=princes;
//        console.log("Persiguiendo a la princesa.");   
//        
//        var invasor=this.invade_mi_area();
//        
//        // Si encuentra un mogol en un radio cercano lo tiene que evadir, sino va hacia la princesa
//        if(invasor != null){
//            console.log("evadiendo");
//            // tomar la posicion de la puerta para que no se trabe en las esquinas
//            this.seek(invasor.sprite.body.position,true);
//            
//        }
//        else{
//            if(!llego_a_puerta){
//                this.seek(this.puerta,false);
//                if(Phaser.Point.distance(this.sprite.body.position, this.puerta) <= 25){
//                    console.log("llego a puerta");
//                    llego_a_puerta=true; 
//                }
//            }
//            else{                
//                this.seek(this.target.sprite.body.position,false);                
//            }
//        }
//    }
//    else{
//        // Busca al primer mongol en movimiento que se encuentre en el arreglo
//        // this.target=mongoles[i];  
//        // Busca al primer mongol con mayor puntaje
//        this.target=this.buscaMayor();
//        console.log("Persiguiendo al mongol: "+this.target.getPosicion()+" que tiene "+this.target.getPuntaje()+" puntos");
//        this.seek(this.target.sprite.body.position,false);
//    }
   
   //verifica que no se mantenga en el mismo radio mucho tiempo
   if(Phaser.Point.distance(this.sprite.body.position, this.posicionAnterior) <= 25)
   {
       bloqueado++;
   }
   
   if(bloqueado > 30 || desbloqueando > 0)
   {
       console.log("entro a desbloquear "+bloqueado+" "+desbloqueando);
       //bloqueado = 0;
      if(bloqueado > 30){ 
            posX = game.rnd.between(0, game.world.width);
            posY = game.rnd.between(0, game.world.height);
            this.sprite.body.velocity = new Phaser.Point(posX,posY);
            desbloqueando=10;
      }
      else{          
          desbloqueando--;
          if(desbloqueando == 0){
              bloqueado = 0;
          }
      }
   }
   else
   {       
       console.log("moviendose");
       if(score[this.tipo] > 25){
        this.target=princes;
        console.log("Persiguiendo a la princesa.");   
        
        var invasor=this.invade_mi_area();
        
        // Si encuentra un mogol en un radio cercano lo tiene que evadir, sino va hacia la princesa
        if(invasor != null){
            console.log("evadiendo");
            // tomar la posicion de la puerta para que no se trabe en las esquinas
            this.seek(invasor.sprite.body.position,true);
            
        }
        else{
            if(!llego_a_puerta){
                this.seek(this.puerta,false);
                if(Phaser.Point.distance(this.sprite.body.position, this.puerta) <= 25){
                    console.log("llego a puerta");
                    llego_a_puerta=true; 
                }
            }
            else{                
                this.seek(this.target.sprite.body.position,false);                
            }
        }
    }
    else{
        // Busca al primer mongol en movimiento que se encuentre en el arreglo
        // this.target=mongoles[i];  
        // Busca al primer mongol con mayor puntaje
        this.target=this.buscaMayor();
        console.log("Persiguiendo al mongol: "+this.target.getPosicion()+" que tiene "+this.target.getPuntaje()+" puntos");
        this.seek(this.target.sprite.body.position,false);
    }
   }
   
    if(this.sprite.body.velocity.x > 0)
        this.sprite.animations.play('right');
    else
        this.sprite.animations.play('left');

}

Behavior_Ninja.prototype.invade_mi_area = function () {
//verifica si el compañero está dentro del área del personaje que invoca
    var invade = null;
    
    for(var k = 0; k < mongoles.length && invade===null;k++){
        //console.log("mongol " + mongoles[k]);
        if (Phaser.Point.distance(this.sprite.body.position, mongoles[k].sprite.body.position) <= this.distancia_limite) {
            invade = mongoles[k];
        }
    }
    //console.log("consultando invasor "+invade);
    return invade;
}

Behavior_Ninja.prototype.buscaMayor = function () {
    
    var mongol=mongoles[0];
    
    for(var j=1; j<mongoles.length; j++){
        if(mongoles[j].getNoPeleo() && mongol.getPuntaje() < mongoles[j].getPuntaje())
            mongol = mongoles[j];
    }
    
    return mongol;
}

// Seek que dependiendo del valor de la bandera (2º parametro) huye (flee) o busca (seek) el objetivo (1º parametro)
Behavior_Ninja.prototype.seek = function (futuro,flee) {

    // VELOCIDAD DESEADA --> normalize(target - position) * max_velocity
    if(flee)
        var velDeseada = Phaser.Point.subtract(this.sprite.position, futuro); //Flee
    else
        var velDeseada = Phaser.Point.subtract(futuro, this.sprite.position); // Seek
    
    // Se normaliza la velocidad deseada
    velDeseada.normalize();
    
    // Multiplica por maxima velocidad.
    velDeseada.multiply(this.max_vel, this.max_vel);    

    //steering = desired_velocity - velocity
    var vecSteering = Phaser.Point.subtract(velDeseada, this.sprite.body.velocity);
    
    // Verifico que no supere la fuerza máxima --> steering = truncate (steering, max_force)    
    if (vecSteering.getMagnitudeSq() > (this.max_force*this.max_force)){ // sin multiplicar no anduvo
        vecSteering.setMagnitude(this.max_force);
    }
    
    // No tomamos en cuenta la masa. steering = steering / mass
        
    // velocity = truncate (velocity + steering , max_speed)
    this.sprite.body.velocity.add(vecSteering.x, vecSteering.y); // hace la suma: velocity + steering
    
    // luego si, verifica que no supere la velocidad maxima
    if (this.sprite.body.velocity.getMagnitudeSq() > (this.max_vel * this.max_vel)) {
        this.sprite.body.velocity.setMagnitude(this.max_vel);
    }
}




;