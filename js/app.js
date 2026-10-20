/**
 * app.js
 * Interfaz de usuario, lee parámetros del formulario, ejecuta experimento
 * Monte Carlo y muestra resultados, diagrama de Gantt, secuenciación y descargas
 */

// buscar elementos por id
const $ = (id) => document.getElementById(id);

// crea elemento html y clases
function crear(etiqueta, clase = "", texto = "") {
  const el = document.createElement(etiqueta);
  if (clase) el.className = clase;
  if (texto !== "") el.textContent = texto;
  return el;
}

class Interfaz {
  constructor() {
    this.parametros = null; // parámetros de la última corrida
    this.experimento = null; // resultados de la última corrida
    this.simulacionActual = 1; // simulación mostrada en el detalle
    this.conectarEventos();
    this.ponerFechaActual();
  }

  // eventos y formulario !! ------ 

  conectarEventos() {
    $("formulario").addEventListener("submit", (e) => {
      e.preventDefault(); // para evitar que el navegador recargue la página
      this.ejecutar();
    });
    $("btnRestaurar").addEventListener("click", () => this.restaurar());
    $("selectorSimulacion").addEventListener("change", (e) =>
      this.mostrarDetalle(Number(e.target.value)));
    $("btnCsvResultados").addEventListener("click", () => this.descargarResultados());
    $("btnCsvTodas").addEventListener("click", () => this.descargarTodas());
    $("btnCsvUna").addEventListener("click", () => this.descargarUna());
  }

  // campo datetime-local con el formato "AAAA-MM-DDTHH:MM"
  ponerFechaActual() {
    const ahora = new Date();
    ahora.setSeconds(0, 0);
    $("fechaInicio").value = Exportador.formatoFecha(ahora).slice(0, 16).replace(" ", "T");
  }

  restaurar() {
    $("formulario").reset(); // regresa a los valores escritos en el HTML
    this.ponerFechaActual();
    this.mostrarErrores([]);
  }

  // lee el formulario y arma un objeto Parametros, devuelve también los errores encontrados
  leerParametros() {
    const errores = [];

    // número del campo
    const numero = (id) => {
      const v = $(id).value.trim();
      return v === "" ? NaN : Number(v);
    };
    // Lista de números separados por comas
    const lista = (id) => $(id).value.split(",")
      .map((s) => s.trim())
      .filter((s) => s !== "")
      .map(Number);

    // semilla opcional
    const textoSemilla = $("semilla").value.trim();
    let semilla = null;
    if (textoSemilla !== "") {
      semilla = Number(textoSemilla);
      if (!Number.isInteger(semilla) || semilla < 0) {
        errores.push("La semilla debe ser un entero mayor o igual a 0 (o déjala vacía).");
      }
    }

    const parametros = new Parametros({
      minTrabajos: numero("minTrabajos"),
      maxTrabajos: numero("maxTrabajos"),
      minMaquinas: numero("minMaquinas"),
      maxMaquinas: numero("maxMaquinas"),
      tamanosPosibles: lista("tamanos"),
      ratesPosibles: lista("rates"),
      numSimulaciones: numero("numSimulaciones"),
      semilla: semilla,
      fechaInicio: new Date($("fechaInicio").value)
    });

    return { parametros, errores: errores.concat(parametros.validar()) };
  }

  mostrarErrores(errores) {
    const caja = $("errores");
    caja.innerHTML = "";
    if (errores.length === 0) {
      caja.hidden = true;
      return;
    }
    caja.hidden = false;
    caja.appendChild(crear("strong", "", "Revisa los datos:"));
    const ul = crear("ul");
    errores.forEach((e) => ul.appendChild(crear("li", "", e)));
    caja.appendChild(ul);
  }

  // ejecutar

  ejecutar() {
    const { parametros, errores } = this.leerParametros();
    this.mostrarErrores(errores);
    if (errores.length > 0) return;   // si hay errores, no se simula

    this.parametros = parametros;
    this.experimento = new ExperimentoMonteCarlo(parametros).ejecutar();
    this.mostrarResultados();
  }

  // RESULTADOSO

  mostrarResultados() {
    const { estadisticas, resultados } = this.experimento;

    $("seccion-resultados").hidden = false;
    $("seccion-detalle").hidden = false;

    this.mostrarResumenParametros();
    this.mostrarEstadisticas(estadisticas);
    this.mostrarTablaResultados(resultados, estadisticas);
    this.llenarSelector(resultados.length);
    this.mostrarDetalle(1);

    $("seccion-resultados").scrollIntoView({ behavior: "smooth" });
  }

  // parámetros con los que se corrió el experimento
  mostrarResumenParametros() {
    const r = this.experimento.parametros;
    $("resumenParametros").textContent =
      `Parámetros · Trabajos: ${r.trabajos} · Tamaños: ${r.tamanos} · Máquinas: ${r.maquinas}` +
      ` · Rates: ${r.rates} · Simulaciones: ${r.simulaciones} · Semilla: ${r.semilla}` +
      ` · Inicio: ${Exportador.formatoFecha(this.parametros.fechaInicio)}`;
  }

  mostrarEstadisticas(e) {
    const tarjetas = [
      ["prom", "Makespan promedio", `${e.promedio.toFixed(2)} h`],
      ["max", `Makespan máximo (simulación ${e.simulacionMaximo})`, `${e.maximo.toFixed(2)} h`],
      ["min", `Makespan mínimo (simulación ${e.simulacionMinimo})`, `${e.minimo.toFixed(2)} h`],
      ["", "Desviación estándar", `${e.desviacion.toFixed(2)} h`]
    ];
    const caja = $("estadisticas");
    caja.innerHTML = "";
    for (const [tipo, etiqueta, valor] of tarjetas) {
      const dato = crear("div", "dato " + tipo);
      dato.appendChild(crear("div", "valor", valor));
      dato.appendChild(crear("div", "etiqueta", etiqueta));
      caja.appendChild(dato);
    }
  }

  // fila por simulación, sus factores sorteados y makespan
  mostrarTablaResultados(resultados, est) {
    const tamanos = [...new Set(this.parametros.tamanosPosibles)].sort((a, b) => a - b);
    const cuerpo = $("cuerpoResultados");
    cuerpo.innerHTML = "";

    for (const r of resultados) {
      const fila = crear("tr", "clicable");
      if (r.numero === est.simulacionMaximo) fila.classList.add("fila-max");
      if (r.numero === est.simulacionMinimo) fila.classList.add("fila-min");

      // cuántos trabajos salieron de cada tamaño
      const porTamano = tamanos
        .map((s) => `${s}: ${r.trabajos.filter((t) => t.cantidad === s).length}`)
        .join(" · ");

      [r.numero, r.numTrabajos, r.numMaquinas, porTamano, r.makespan.toFixed(2)]
        .forEach((valor) => fila.appendChild(crear("td", "", valor)));

      fila.title = "Clic para ver el detalle de esta simulación";
      fila.addEventListener("click", () => {
        this.mostrarDetalle(r.numero);
        $("seccion-detalle").scrollIntoView({ behavior: "smooth" });
      });
      cuerpo.appendChild(fila);
    }
  }

  llenarSelector(cantidad) {
    const selector = $("selectorSimulacion");
    selector.innerHTML = "";
    for (let i = 1; i <= cantidad; i++) {
      const opcion = crear("option", "", `Simulación ${i}`);
      opcion.value = i;
      selector.appendChild(opcion);
    }
  }

  // detalles de cada simulación

  mostrarDetalle(numero) {
    this.simulacionActual = numero;
    const r = this.experimento.resultados[numero - 1];
    $("selectorSimulacion").value = numero;
    $("infoSimulacion").textContent =
      `Simulación ${numero}: ${r.numTrabajos} trabajos, ${r.numMaquinas} máquinas, ` +
      `makespan = ${r.makespan.toFixed(2)} horas.`;
    this.dibujarGantt(r);
    this.mostrarSecuenciacion(r);
  }

  // diagrama de Gantt !!!!!! 
  // posición y ancho son porcentajes y representan información, visualización con causa
  dibujarGantt(r) {
    const gantt = $("gantt");
    gantt.innerHTML = "";
    const total = r.makespan;
    const f0 = this.parametros.fechaInicio;

    for (const maquina of r.maquinas) {
      const fila = crear("div", "gantt-fila");
      fila.appendChild(crear("div", "gantt-etiqueta", `M${maquina.id}`));
      const pista = crear("div", "gantt-pista");

      for (const t of maquina.trabajos) {
        const bloque = crear("div", "gantt-bloque", t.id);
        bloque.style.left = `${(t.inicio / total) * 100}%`;
        bloque.style.width = `${((t.fin - t.inicio) / total) * 100}%`;
        bloque.style.background = `hsl(${(t.id * 47) % 360}, 60%, 72%)`; // un color por trabajo
        bloque.title =
          `Trabajo ${t.id} (${t.idProducto}) · ${t.cantidad} elementos\n` +
          `Inicio: ${Exportador.formatoFecha(Exportador.sumarHoras(f0, t.inicio))}\n` +
          `Fin: ${Exportador.formatoFecha(Exportador.sumarHoras(f0, t.fin))}`;
        pista.appendChild(bloque);
      }
      fila.appendChild(pista);
      gantt.appendChild(fila);
    }

    // eje del tiempo
    const paso = [1, 2, 5, 10, 20, 50, 100, 200, 500].find((p) => total / p <= 10) || 1000;
    const eje = crear("div", "gantt-eje");
    for (let h = 0; h <= total; h += paso) {
      const marca = crear("span", "gantt-marca", `${h} h`);
      marca.style.left = `${(h / total) * 100}%`;
      eje.appendChild(marca);
    }
    gantt.appendChild(eje);
    gantt.appendChild(crear("div", "gantt-nota",
      "Horas desde el arranque. Cada color es un trabajo (el número es su idTrabajo)."));
  }

  // tabla con las mismas columnas que el CSV de secuenciación
  mostrarSecuenciacion(r) {
    const cuerpo = $("cuerpoSecuenciacion");
    cuerpo.innerHTML = "";
    const f0 = this.parametros.fechaInicio;

    for (const maquina of r.maquinas) {
      for (const t of maquina.trabajos) {
        const fila = crear("tr");
        [
          maquina.id,
          t.id,
          Exportador.formatoFecha(Exportador.sumarHoras(f0, t.inicio)),
          Exportador.formatoFecha(Exportador.sumarHoras(f0, t.fin)),
          t.orden,
          t.idProducto
        ].forEach((valor) => fila.appendChild(crear("td", "", valor)));
        cuerpo.appendChild(fila);
      }
    }
  }

  //DESCARGAS

  descargarResultados() {
    Exportador.descargar("resultados_simulaciones.csv",
      Exportador.resultadosCSV(this.experimento));
  }

  descargarTodas() {
    Exportador.descargar("secuenciacion_todas_las_simulaciones.csv",
      Exportador.secuenciacionCSV(this.experimento.resultados, this.parametros.fechaInicio, true));
  }

  descargarUna() {
    const n = this.simulacionActual;
    Exportador.descargar(`secuenciacion_simulacion_${n}.csv`,
      Exportador.secuenciacionCSV([this.experimento.resultados[n - 1]], this.parametros.fechaInicio));
  }
}

// arrancador de interfaz ... 
document.addEventListener("DOMContentLoaded", () => {
  new Interfaz();
});