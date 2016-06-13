/**
 * Comportamiento que inicialmente deambula por el escenario del juego hasta que esté próximo
 * a un Ninja, cuando eso pasa, su comportamiento cambia a persuit o arrive hacia ese Ninja
 * para combatir con él
 * El combate se extiende por "x" segundos y gana el Ninja, por lo que éste obtiene "x" puntos
 * @param {type} game
 * @param {type} posx
 * @param {type} posy
 * @param {type} key
 * @param {type} frame
 * @param {type} target
 * @returns {Behavior_FormacionV}
 * 
 * http://gamedevelopment.tutsplus.com/tutorials/understanding-steering-behaviors-leader-following--gamedev-10810
 */

var grupo = [];
var cant_Integrantes = 0;



function Behavior_Mongoles(game, posx, posy, keys, frame, target) {
    
    /* Según el puntaje es el tipo de mongol que se mostrara: 
    1 a 4: mongol simple 
    5 a 7: mongol con escudo
    8 a 10: mongol con hacha
    */
    this.puntaje = game.rnd.between(1, 10);
    console.log("Puntaje mongol "+cant_Integrantes+" "+this.puntaje);
    
    if(this.puntaje <= 4){
		key = keys[0];
	}
    else{
        if(this.puntaje >= 5 && this.puntaje <= 7)
            key = keys[1];
        else
            key = keys[2];
    }
    
    Movimientos.call(this, game, posx, posy, key, frame, target);


    this.LEADER_BEHIND_DIST = 100;//verificar valor
    this.max_force = 500;//5;
    this.distancia_limite = 50;

    this.id=cant_Integrantes;
    
    grupo[cant_Integrantes] = this;
    this.mi_posicion = cant_Integrantes;
    cant_Integrantes += 1;

    this.MAX_SEPARATION = 100;
    this.RADIO_ARRIVO = 50;//valor??
    this.LEADER_SIGHT_RADIUS = 50;//valor??

    //this.NINJA_DIST = 100;
    this.puntaje = game.rnd.between(1, 10);
    console.log(this.puntaje);

    this.auxNinjaPelea;
    this.luchaSprite;
    this.nopeleo = 1;
    this.timerpelea;
    this.t;
    //this.sprite.scale.setTo(0.05,0.05);

    this.sprite.animations.add('right', [4, 5, 6,7], 7, true);
    this.sprite.animations.add('left', [0, 1, 2,3], 7, true);
    return this;
}
Behavior_Mongoles.prototype = Object.create(Movimientos.prototype);//Defino que es sub clase de Sprite.
Behavior_Mongoles.prototype.constructor = Behavior_Mongoles;

Behavior_Mongoles.prototype.update = function () {

    //this.formacion_V();
    //mejor quitar del array
    if (this.nopeleo)
    {
        var wander=1;
//Verifica si tiene un ninja cerca
//si es así, se dirije hacia él para luchar
        for (var i = 0; i < ninjas.length; i++)
        {
            
            if (wander&&this.invade_mi_area(ninjas[i])) {
                
                if (ninjas[i].nopelea)
                {
                    wander=0;
                    this.auxNinjaPelea = ninjas[i];
                    this.auxNinjaPelea.nopelea=0;
                    
                    this.nopeleo=0;

                    //vectorSteeringForce = this.arrive(ninjas[i].sprite.body.position, this.RADIO_ARRIVO);
                    //this.aplicarVectorDeFuerza(vectorSteeringForce);
                    //console.log(ninjas[i]);
                    this.luchar(i);        //aca mando ninjas mejor
                    
                }
            }
            
        }
        if(wander) {
            this.wander();
            if(this.sprite.body.velocity.x > 0)
                this.sprite.animations.play('right');
            else
                this.sprite.animations.play('left');
            
        }

    }
}

Behavior_Mongoles.prototype.getPuntaje = function () {
    return this.puntaje;
}
Behavior_Mongoles.prototype.getNoPeleo = function () {
    return this.nopeleo;
}
Behavior_Mongoles.prototype.getPosicion = function () {
    return this.mi_posicion;
}

Behavior_Mongoles.prototype.luchar = function (ninja) {
//Cobaten el ninja y el mongol durante unos "x" segundos
//luego el mongol muere y el ninja gana "x" puntos
    this.esperar();//se retienen el mongol y el ninja unos segundos igual al puntaje del mongol
    score[ninja] += this.puntaje;


    //TODO:animaciòn
}

Behavior_Mongoles.prototype.esperar = function () {
    this.sprite.kill();
    this.luchaSprite = game.add.sprite(this.auxNinjaPelea.sprite.x, this.auxNinjaPelea.sprite.y, 'lucha');
    
    this.luchaSprite.animations.add('pelea', [0, 1, 2,3,4], 7, true);
    //console.log(this.luchaSprite);
    this.luchaSprite.animations.play('pelea');
    
    this.luchaSprite.anchor.x=0.5;
    this.luchaSprite.anchor.y=0.5;
    this.auxNinjaPelea.sprite.kill();
    //500 seria el tiempo propio del mongol
    
   var t=game.time.events.add(Phaser.Timer.SECOND * this.puntaje, this.habilitaNinja, this);
//    console.log(t);
//    console.log(this.id);

    //timerpelea = game.time.create(false);    timerpelea.add(4000, this.habilitaNinja, this);    timerpelea.start();
}
Behavior_Mongoles.prototype.habilitaNinja = function () {
    this.luchaSprite.kill();
    this.auxNinjaPelea.nopelea=1;
    this.auxNinjaPelea.sprite.revive();
    //console.log(game.time.events);

}


Behavior_Mongoles.prototype.formacion_V = function () {

    this.target.sprite.rotation = game.physics.arcade.angleToPointer(this.target.sprite) + 89.5;
    this.sprite.rotation = game.physics.arcade.angleToPointer(this.sprite) + 89.5;
    this.seguir_y_llegar();
}

Behavior_Mongoles.prototype.seguir_y_llegar = function () {

    var fuerza_al_punto_behind = this.follow_leader();
    var steering = new Phaser.Point(0, 0);

    steering.add(fuerza_al_punto_behind.x, fuerza_al_punto_behind.y);
    this.truncate(steering, this.max_force);
    //steering /= mass;
    this.sprite.body.velocity.add(steering.x, steering.y);
    this.truncate(this.sprite.body.velocity, this.max_speed);
    this.sprite.body.position.add(this.sprite.body.velocity.x, this.sprite.body.velocity.y);
}

Behavior_Mongoles.prototype.follow_leader = function () {

    var fuerza_de_seguimiento = new Phaser.Point(0, 0);
    var ahead = this.punto_ahead(this.target);
    var behind = this.punto_behind(this.target);//MEJORAR punto_behind(...) y/o arrive(...) PUESTO QUE SE SITUA SOBRE EL LEADER

    if (this.isOnLeaderSight(this.target, ahead)) {
        vector_evasion = this.evade();//MEJORAR!!!!
        fuerza_de_seguimiento.add(vector_evasion.x, vector_evasion.y);
    }

    vector_arrive = this.arrive(behind, this.RADIO_ARRIVO);//this.RADIO_ARRIVO tiene que truncar el vector que calcula el arrive(...)???
    fuerza_de_seguimiento.add(vector_arrive.x, vector_arrive.y);

    vector_separacion = this.separation();
    fuerza_de_seguimiento.add(vector_separacion.x, vector_separacion.y);

    return fuerza_de_seguimiento;
}

Behavior_Mongoles.prototype.punto_behind = function (leader) {

    var vector_al_punto_b = leader.sprite.body.velocity.clone();

    vector_al_punto_b.multiply(-1, -1);
    vector_al_punto_b.normalize();
    vector_al_punto_b.multiply(this.LEADER_BEHIND_DIST, this.LEADER_BEHIND_DIST);
    behind = leader.sprite.body.position.add(vector_al_punto_b.x, vector_al_punto_b.y);
//DIFERENCIAS CON Behavior_Columna.js
//AGREGA LO SGTE:
    /*if (leader.sprite.body.velocity.x === -0 && leader.sprite.body.velocity.y === -0) { //???
     }*/
    return behind;
}

/*Behavior_Mongoles.prototype.truncate = function (vector, maximo) {
 //trunca un punto		
 if (vector.getMagnitude() > maximo){
 vector.setMagnitude(maximo);
 }
 }*/

Behavior_Mongoles.prototype.separation = function () {//mover a Movimientos.js??

    var vector_alejamiento = new Phaser.Point(0, 0);
    var cant_invasores = 0;

    for (var i = 0; i < cant_Integrantes; i++)
    {
        if (i != this.mi_posicion) {//si no es el mismo personaje al que se le ejecutó update()
            if (this.invade_mi_area(grupo[i])) {
                toAgent = Phaser.Point.subtract(grupo[i].sprite.body.position, this.sprite.body.position)
                vector_alejamiento.add(toAgent.x, toAgent.y);
                cant_invasores += 1;
            }
        }
    }
    if (cant_invasores != 0) {
        //DIFERENCIAS CON Behavior_Columna.js
        //	vector_alejamiento.multiply(0, -1);		//HACE SOLO ESTO Y DIRECTAMENTE VA A: return vector_alejamiento;
        vector_alejamiento.x /= cant_invasores;
        vector_alejamiento.y /= cant_invasores;
        vector_alejamiento.multiply(-1, -1);
    }
    vector_alejamiento.normalize();
    vector_alejamiento.multiply(this.MAX_SEPARATION, this.MAX_SEPARATION);

    return vector_alejamiento;
}

Behavior_Mongoles.prototype.invade_mi_area = function (companero) {
//verifica si el compañero está dentro del área del personaje que invoca
    var invade = false;

    if (Phaser.Point.distance(this.sprite.body.position, companero.sprite.body.position) <= this.distancia_limite) {
        invade = true;
    }
    return invade;
}

Behavior_Mongoles.prototype.punto_ahead = function (leader) {

    var vector_al_punto_a = leader.sprite.body.velocity.clone();

    vector_al_punto_a.normalize();
    vector_al_punto_a.multiply(this.LEADER_BEHIND_DIST, this.LEADER_BEHIND_DIST);
    ahead = leader.sprite.body.position.add(vector_al_punto_a.x, vector_al_punto_a.y);

    return ahead;
}

Behavior_Mongoles.prototype.isOnLeaderSight = function (leader, punto_ahead) {

    return (this.distance(punto_ahead, this.sprite.body.position) <= this.LEADER_SIGHT_RADIUS) || (this.distance(leader.sprite.body.position, this.sprite.body.position) <= this.LEADER_SIGHT_RADIUS);
}

Behavior_Mongoles.prototype.distance = function (punto_a, punto_b) {

    return Math.sqrt((punto_a.x - punto_b.x) * (punto_a.x - punto_b.x) + (punto_a.y - punto_b.y) * (punto_a.y - punto_b.y));
}
;