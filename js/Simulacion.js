/**
 * Simulacion.js
 * una muestra de monte carlo por run.
 * sortea factores, crea trabajos, asigna al azar a las máquinas,
 * secuencia(FIFO) y calcula el makespan
 */
class Simulacion {
  constructor(parametros, generador) {
    this.parametros = parametros;
    this.generador = generador; 
  }

  ejecutar(numero = 1) {
    const p = this.parametros;
    const g = this.generador;

    // Factores aleatorios de run
    const numTrabajos = g.enteroEnRango(p.minTrabajos, p.maxTrabajos);
    const numMaquinas = g.enteroEnRango(p.minMaquinas, p.maxMaquinas);

    // se crean máquinas
    const maquinas = [];
    for (let i = 0; i < numMaquinas; i++) {
      maquinas.push(new Maquina(i));
    }

    // se crean trabajos
    const trabajos = [];
    for (let id = 1; id <= numTrabajos; id++) {
      const cantidad = g.elegir(p.tamanosPosibles);
      const rates = [];
      for (let i = 0; i < numMaquinas; i++) {
        rates.push(g.elegir(p.ratesPosibles));
      }
      trabajos.push(new Trabajo(id, cantidad, rates));
    }

    // asingación aleatoria + FIFO
    for (const trabajo of trabajos) {
      const indiceMaquina = g.enteroEnRango(0, numMaquinas - 1);
      maquinas[indiceMaquina].asignar(trabajo);
    }

    // makespan
    const makespan = Math.max(...maquinas.map(m => m.tiempoFinalizacion));

    return {
      numero,
      numTrabajos,
      numMaquinas,
      makespan,
      maquinas,
      trabajos
    };
  }
}