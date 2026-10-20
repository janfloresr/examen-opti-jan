/**
 * Exportador.js
 * Convierte resultados a texto CSV y permite descargarlos !
 * Los tiempos de la simulación están en horas desde el arranque, y en el exportador
 *  se convierten a fecha y hora reales sumándolos a la fecha de inicio
 */
class Exportador {
  static dosDigitos(n) {
    return String(n).padStart(2, "0");
  }

  // Formato legible
  static formatoFecha(f) {
    const d = Exportador.dosDigitos;
    return `${f.getFullYear()}-${d(f.getMonth() + 1)}-${d(f.getDate())} ` +
           `${d(f.getHours())}:${d(f.getMinutes())}:${d(f.getSeconds())}`;
  }

  // suma horas
  static sumarHoras(fecha, horas) {
    return new Date(fecha.getTime() + horas * 3600 * 1000);
  }

  // CSV de secuenciación 
  static secuenciacionCSV(resultados, fechaInicio, incluirSimulacion = false) {
    const encabezado = ["Maquina", "idTrabajo", "fechaHoraInicio", "fechaHoraFin",
                        "OrdenSecuenciacion", "IdProducto"];
    if (incluirSimulacion) encabezado.unshift("Simulacion");

    const filas = [encabezado.join(",")];
    for (const r of resultados) {
      for (const maquina of r.maquinas) {
        for (const t of maquina.trabajos) { 
          const fila = [
            maquina.id,
            t.id,
            Exportador.formatoFecha(Exportador.sumarHoras(fechaInicio, t.inicio)),
            Exportador.formatoFecha(Exportador.sumarHoras(fechaInicio, t.fin)),
            t.orden,
            t.idProducto
          ];
          if (incluirSimulacion) fila.unshift(r.numero);
          filas.push(fila.join(","));
        }
      }
    }
    return filas.join("\n");
  }

  // csv factores sorteados y makespan
  static resultadosCSV(experimento) {
    const filas = ["Simulacion,NumTrabajos,NumMaquinas,MakespanHoras"];
    for (const r of experimento.resultados) {
      filas.push([r.numero, r.numTrabajos, r.numMaquinas, r.makespan.toFixed(4)].join(","));
    }
    return filas.join("\n");
  }

  // exportar descargar
  static descargar(nombreArchivo, contenido) {
    const blob = new Blob(["\uFEFF" + contenido], { type: "text/csv;charset=utf-8;" });
    const enlace = document.createElement("a");
    enlace.href = URL.createObjectURL(blob);
    enlace.download = nombreArchivo;
    enlace.click();
    URL.revokeObjectURL(enlace.href);
  }
}