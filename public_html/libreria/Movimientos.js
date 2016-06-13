/**
 * Reune los Comportamientos individuales "evade" y "arrive" hacia el target
 * 
 * agregar el wander
 * 
 * @param {type} game
 * @param {type} posx
 * @param {type} posy
 * @param {type} key
 * @param {type} frame
 * @param {type} target
 * @returns {Movimientos}
 */

var t=10;

function Movimientos(game, posx, posy, key, frame, target){
    Behavior.call(this, game, posx, posy, key, frame, target);
  
    this.sprite.body.collideWorldBounds = true;
    this.vecReference = new Phaser.Point(0, 0);

	this.sentido=1;
    this.max_speed = 2;
    this.max_force=5;//10 para evade, 4 para el resto de los movimientos
    this.min_speed = 0;
    this.min_distance = 50;
    this.max_distance = 200;          //inicia el AREA de arrival 
   
    this.max_vel = 150;
    
    //para wander
    this.CIRCLE_DISTANCE = 10;
    this.CIRCLE_RADIUS = 3;//menor que la distancia anterior
    this.ANGLE_CHANGE = 1;
    //this.max_force = 5;
    this.wanderAngle = 10;
    this.wanderDate = new Date();
    this.tiempoEspera = 200;

    return this;
}
Movimientos.prototype = Object.create(Behavior.prototype);//Defino que es sub clase de Sprite.
Movimientos.prototype.constructor = Movimientos;

Movimientos.prototype.update = function () {}

Movimientos.prototype.evade = function(){
	
	// Calcular predicción   
        console.log("evadiendo");
       // Cambia la velocidad del objetivo a la predicción... 
   //ESTO SE EJECUTA SIEMPRE PORQUE EN EL follow_leader() YA SE VERIFICO QUE DEBE EVADIR 
       velocity_x=this.target.sprite.body.velocity.x*t;
       velocity_y=this.target.sprite.body.velocity.y*t;      
       var puntoFuturo = Phaser.Point.add(this.target.sprite.body.position, new Phaser.Point(velocity_x,velocity_y));
       
 //COPIADO DEL seek(futuro,flee)
		var velDeseada = Phaser.Point.subtract(this.sprite.position, puntoFuturo); //Flee
		velDeseada.normalize();
		// Multiplica por maxima velocidad.
		velDeseada.multiply(this.max_vel, this.max_vel);    
		//steering = desired_velocity - velocity
		var vecSteering = Phaser.Point.subtract(velDeseada, this.sprite.body.velocity);
		// Verifico que no supere la fuerza máxima --> steering = truncate (steering, max_force)    
		if (vecSteering.getMagnitudeSq() > (this.max_force*this.max_force)){ // sin multiplicar no anduvo
			vecSteering.setMagnitude(this.max_force);
		}
 //////
       
       return vecSteering;   
}

// Seek que dependiendo del valor de la bandera (2º parametro) huye (flee) o busca (seek) el objetivo (1º parametro)
Movimientos.prototype.seek = function (futuro,flee) {

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
    if (this.sprite.body.velocity.getMagnitudeSq() > (this.vel * this.vel)) {
        this.sprite.body.velocity.setMagnitude(this.vel);
    }
}

Movimientos.prototype.arrive=function(punto, radio_de_arribo){//AGREGAR COMO USA radio_de_arribo

    //Obtengo la desired velocity
    var vectorDesired;
    vectorDesired = this.calcularDesiredVelocity(punto);

    //Obtengo el vector de fuerza
    var vectorSteeringForce;
    vectorSteeringForce = this.calcularSteeringForce(vectorDesired);
    
	return vectorSteeringForce;  
}

Movimientos.prototype.calcularDesiredVelocity=function (punto) {
    // Calculo el vector deseado = normalizado(POSICION TARGET - POSICION this.sprite) * maximaVelocidad
    
    var distancia=this.distanciaEntre(punto);
    
    var angle = this.angleBetween(punto);
    var vectorDesired;
    if(distancia<this.max_distance){
        //aca tiene q reducir
        vectorDesired = ((Phaser.Point.subtract(punto, this.sprite.position)).normalize()).multiply(distancia, distancia);
    }
    else{
        vectorDesired = ((Phaser.Point.subtract(punto, this.sprite.position)).normalize()).multiply(this.max_speed, this.max_speed);
    }
    return vectorDesired;
}

Movimientos.prototype.calcularSteeringForce=function(vectorDesired){

    //Calculo el vector de fueza = vector deseado - velocidad actual del this.sprite
    var vectorSteeringForce;
    vectorSteeringForce = Phaser.Point.subtract(vectorDesired, this.sprite.body.velocity);
        
        //limito la magnitud del vector, es decir la fuerza que se le va a aplicar
        if (vectorSteeringForce.getMagnitudeSq() > (this.max_force*this.max_force))
        {
            vectorSteeringForce.setMagnitude(this.max_force);
        }       
    return vectorSteeringForce;
}

Movimientos.prototype.aplicarVectorDeFuerza=function(vectorSteeringForce) {

    //Calculo la nueva velocidad y posicion del this.sprite sumando la posicion con el vector de fuerza
    this.sprite.body.velocity.add(vectorSteeringForce.x, vectorSteeringForce.y);

    //si la velocidad nueva es mayor a la maxima velocidad determinada, se deja la maxima.
    if (this.sprite.body.velocity.getMagnitudeSq() > (this.max_speed * this.max_speed)) {
        this.sprite.body.velocity.setMagnitude(this.sentido*this.max_speed);
    }
}

Movimientos.prototype.distanciaEntre=function(punto){
	
    var dx = punto.x - this.sprite.x;
    var dy = punto.y - this.sprite.y;
    return Math.sqrt((dx * dx) + (dy * dy));
}

Movimientos.prototype.angleBetween=function(punto){
	
    var dx = punto.x - this.sprite.x;
    var dy = punto.y - this.sprite.y;
    return Math.atan2(dy, dx);
}

Movimientos.prototype.wander = function () {

   // console.log(this.sprite.body.position);
    var ahora = new Date();
    var tiempoTranscurrido = ahora - this.wanderDate;
    
    if (tiempoTranscurrido > this.tiempoEspera){

    //se determina el punto del círculo en la misma dirección de la velocidad del personaje	
    var circleCenter = this.sprite.body.velocity.clone();
    circleCenter.normalize();
    this.scaleBy(circleCenter,this.CIRCLE_DISTANCE);//multiplica el vector por la constante que se pasa como argumento
    
    //se determina la fuerza de desplazamiento, responsable del giro hacia la izquierda o derecha
    var abcisa = game.rnd.between(-1, 1);
    var ordenada = game.rnd.between(-1, 1);
    var desplazamiento = new Phaser.Point(abcisa,ordenada);
    this.scaleBy(desplazamiento,this.CIRCLE_RADIUS);
    
    //se desplaza el ángulo del personaje
    this.setAngle(desplazamiento,this.wanderAngle);
    
    this.wanderAngle += (Math.random() * this.ANGLE_CHANGE) - (this.ANGLE_CHANGE * 0.5);

    var wanderForce = circleCenter.add(desplazamiento.x,desplazamiento.y);//punto al cual se desplaza el personaje, vector de desplazamiento
    
    this.truncate(wanderForce,this.max_force);
    //wanderForce = wanderForce / mass;
    this.sprite.body.velocity.add(wanderForce.x,wanderForce.y);
    this.truncate(this.sprite.body.velocity, this.max_speed);    
	}
	this.sprite.body.position.add(this.sprite.body.velocity.x,this.sprite.body.velocity.y);
    this.loopWalls(this.sprite.body.position,this.game.world);
}

Movimientos.prototype.scaleBy = function(punto, constante) {
	
	punto = punto.multiply(constante,constante);
}

Movimientos.prototype.setAngle = function(vector, valor) {
	
	var longitud_actual = vector.getMagnitude();
	var punto = new Phaser.Point(Math.cos(valor) * longitud_actual, Math.sin(valor) * longitud_actual);
	var longitud_deseada = punto.getMagnitude();
	vector.setMagnitude(longitud_deseada);
	
}

Movimientos.prototype.truncate = function(vector, maximo) {
//trunca un punto		
        if (vector.getMagnitude() > maximo){
			vector.setMagnitude(maximo);
		}
}
Movimientos.prototype.loopWalls = function(vector, bounds){
	
    if (vector.x < 0)
    {
      vector.x = bounds.width;
    }
    else if (vector.x > bounds.width)
    {
      vector.x = 0;
    }
    if (vector.y < 0)
    {
      vector.y = bounds.height
    }
    else if (vector.y > bounds.height)
    {
      vector.y = 0
    }
}
;