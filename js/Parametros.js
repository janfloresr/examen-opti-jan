/**
 * Parametros.js
 * Guarda los factores de la simulación y los rangos en los que varían.
 * para fijar un factor se escribe min y max iguales
 */
class Parametros {
  constructor({
    minTrabajos = 20,
    maxTrabajos = 30,
    tamanosPosibles = [10, 20, 30],  
    minMaquinas = 3,
    maxMaquinas = 5,
    ratesPosibles = [5, 10, 15],
    numSimulaciones = 20,
    semilla = null,
    fechaInicio = new Date()
  } = {}) {
    this.minTrabajos = minTrabajos;
    this.maxTrabajos = maxTrabajos;
    this.tamanosPosibles = tamanosPosibles;
    this.minMaquinas = minMaquinas;
    this.maxMaquinas = maxMaquinas;
    this.ratesPosibles = ratesPosibles;
    this.numSimulaciones = numSimulaciones;
    this.semilla = semilla === null ? Date.now() : semilla;
    this.fechaInicio = fechaInicio;
  }

  // # VALIDACIÓN para que no se rompa nada
  validar() {
    const errores = [];
    if (![this.minTrabajos, this.maxTrabajos].every(Number.isInteger) || this.minTrabajos < 1)
      errores.push("Los mínimos y máximos de trabajos deben ser enteros, con mínimo mayor o igual a 1.");
    if (this.minTrabajos > this.maxTrabajos)
      errores.push("El mínimo de trabajos no puede ser mayor que el máximo.");
    if (![this.minMaquinas, this.maxMaquinas].every(Number.isInteger) || this.minMaquinas < 1)
      errores.push("Los mínimos y máximos de máquinas deben ser enteros, con mínimo mayor o igual a 1.");
    if (this.minMaquinas > this.maxMaquinas)
      errores.push("El mínimo de máquinas no puede ser mayor que el máximo.");
    if (this.tamanosPosibles.length === 0 || this.tamanosPosibles.some(t => !(t > 0)))
      errores.push("Los tamaños de trabajo deben ser números positivos.");
    if (this.ratesPosibles.length === 0 || this.ratesPosibles.some(r => !(r > 0)))
      errores.push("Los rates deben ser números positivos.");
    if (!Number.isInteger(this.numSimulaciones) || this.numSimulaciones < 1 || this.numSimulaciones > 1000)
      errores.push("El número de simulaciones debe ser un entero entre 1 y 1000.");
    if (!(this.fechaInicio instanceof Date) || isNaN(this.fechaInicio))
      errores.push("La fecha de inicio no es válida.");
    return errores;
  }

  // resumen
  resumen() {
    return {
      trabajos: `${this.minTrabajos}-${this.maxTrabajos}`,
      tamanos: this.tamanosPosibles.join("/"),
      maquinas: `${this.minMaquinas}-${this.maxMaquinas}`,
      rates: this.ratesPosibles.join("/"),
      simulaciones: this.numSimulaciones,
      semilla: this.semilla,
      fechaInicio: this.fechaInicio.toISOString()
    };
  }
}