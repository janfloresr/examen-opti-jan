/**
 * Maquina.js
 * máquina que atiende trabajos en orden FIFO..
 */
class Maquina {
  constructor(indice) {
    this.indice = indice; 
    this.id = indice + 1;      
    this.trabajos = [];  // cola FIFO en orden de llegada
    this.tiempoLibre = 0; 
  }

  // recibe un trabajo
  asignar(trabajo) {
    trabajo.maquinaId = this.id;
    trabajo.inicio = this.tiempoLibre;
    trabajo.fin = trabajo.inicio + trabajo.duracionEn(this.indice);
    trabajo.orden = this.trabajos.length + 1;

    this.tiempoLibre = trabajo.fin;
    this.trabajos.push(trabajo);
  }

  // máquina termina todo el trabajo
  get tiempoFinalizacion() {
    return this.tiempoLibre;
  }
}