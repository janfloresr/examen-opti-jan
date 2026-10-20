/**
 * GeneradorLCG.js
 * generador congruencial lineal (LCG),  X(n+1) = (a * X(n) + c) mod m
 * para lo aleatorio
 */
class GeneradorLCG {
  constructor(semilla = Date.now()) {
    // Numerical Recipes (sacado de Hull-Dobell)
    this.a = 1664525;
    this.c = 1013904223;
    this.m = 4294967296; // 2^32

    // semilla debe ser entero
    this.semilla = Math.abs(Math.floor(semilla)) % this.m;
    this.estado = this.semilla;
  }

  // devuelve un uniforme U(0,1), avanza el estado y normaliza dividiendo / m
  siguiente() {
    // a * estado < 2^53
    this.estado = (this.a * this.estado + this.c) % this.m;
    return this.estado / this.m;
  }

  // entero uniforme en min max
  enteroEnRango(min, max) {
    return Math.floor(this.siguiente() * (max - min + 1)) + min;
  }

  // elección elemento random
  elegir(lista) {
    return lista[this.enteroEnRango(0, lista.length - 1)];
  }

  // regresa a remilla inicial
  reiniciar() {
    this.estado = this.semilla;
  }
}