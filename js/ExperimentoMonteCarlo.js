/**
 * ExperimentoMonteCarlo.js
 * repite la simulación varias veces (20 por default) y calcula promedio, máximo y mínimo del makespan.
 */


class ExperimentoMonteCarlo {
  constructor(parametros) {
    this.parametros = parametros;
  }

  ejecutar() {
    // 1 generador para todo el experimento, inicializado con la semilla
    const generador = new GeneradorLCG(this.parametros.semilla);
    const simulacion = new Simulacion(this.parametros, generador);

    const resultados = [];
    for (let i = 1; i <= this.parametros.numSimulaciones; i++) {
      resultados.push(simulacion.ejecutar(i));
    }

    return {
      parametros: this.parametros.resumen(),
      resultados,
      estadisticas: this.calcularEstadisticas(resultados)
    };
  }

  calcularEstadisticas(resultados) {
    const makespans = resultados.map(r => r.makespan);
    const n = makespans.length;

    const promedio = makespans.reduce((suma, x) => suma + x, 0) / n;
    const maximo = Math.max(...makespans);
    const minimo = Math.min(...makespans);

    // desviación estándar MUESTRAL!!! 
    const varianza = n > 1
      ? makespans.reduce((suma, x) => suma + (x - promedio) ** 2, 0) / (n - 1)
      : 0;

    return {
      promedio,
      maximo,
      minimo,
      desviacion: Math.sqrt(varianza),
      simulacionMaximo: resultados[makespans.indexOf(maximo)].numero,
      simulacionMinimo: resultados[makespans.indexOf(minimo)].numero
    };
  }
}