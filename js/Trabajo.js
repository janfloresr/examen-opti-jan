/**
 * Trabajo.js
 */
class Trabajo {
  constructor(id, cantidad, rates) {
    this.id = id;       
    this.idProducto = "P" + String(id).padStart(3, "0"); 
    this.cantidad = cantidad; 
    this.rates = rates;

    this.maquinaId = null;
    this.inicio = null;
    this.fin = null;
    this.orden = null;  // posición FIFO dentro de máquina
  }

  //tiempo tardado máquina
  duracionEn(indiceMaquina) {
    return this.cantidad / this.rates[indiceMaquina];
  }
}