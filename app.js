// ===== DATA =====
const mesas = [
  {id: "mesa1", nombre: "Mesa 1", capacidad: 4},
  {id: "mesa2", nombre: "Mesa 2", capacidad: 2},
  {id: "mesa3", nombre: "Mesa 3", capacidad: 6},
  {id: "mesa4", nombre: "Mesa 4", capacidad: 8},
  {id: "bar1", nombre: "Barra 1", capacidad: 2}
];

// Local Storage
function cargarReservas() {
  try {
    return JSON.parse(localStorage.getItem("reservasData") || "{}");
  } catch {
    return {};
  }
}

function guardarReservas(data) {
  localStorage.setItem("reservasData", JSON.stringify(data));
}

let reservasData = cargarReservas();
let mesaSeleccionada = null;

// ===== LOGIN =====
document.getElementById("login-form").addEventListener("submit", function(e) {
  e.preventDefault();
  const respuesta = document.getElementById("login-answer").value.trim().toLowerCase();
  
  if (respuesta === "luna") {
    document.getElementById("login-error").classList.add("hidden");
    document.getElementById("login-success").classList.remove("hidden");
    setTimeout(() => {
      document.getElementById("login-screen").classList.add("hidden");
      document.getElementById("main-app").classList.remove("hidden");
      renderFloorPlan();
    }, 400);
  } else {
    document.getElementById("login-error").textContent = "Respuesta incorrecta";
    document.getElementById("login-error").classList.remove("hidden");
    document.getElementById("login-success").classList.add("hidden");
  }
});

document.getElementById("btn-logout").onclick = () => {
  document.getElementById("main-app").classList.add("hidden");
  document.getElementById("login-screen").classList.remove("hidden");
  document.getElementById("login-form").reset();
  document.getElementById("login-error").classList.add("hidden");
  document.getElementById("login-success").classList.add("hidden");
};

// ===== FLOOR PLAN =====
function renderFloorPlan() {
  const fp = document.getElementById("floor-plan-inner");
  fp.innerHTML = mesas.map(mesa => {
    const r = reservasData[mesa.id];
    const estado = r ? "selected" : "";
    const llegado = r && r.llegado ? "llegado" : "";
    const statusEmoji = !r ? "⚪" : r.llegado ? "✓" : "🟢";
    const statusText = !r ? "Libre" : r.llegado ? "Llegado" : "Reservada";
    
    return `<div class="mesa-card ${estado} ${llegado}" onclick="selectTable('${mesa.id}')">
      <span class="title">${mesa.nombre}</span>
      <span class="cap">${mesa.capacidad} pax</span>
      <span>${statusEmoji} ${statusText}</span>
    </div>`;
  }).join("");
  
  document.getElementById("details-panel").innerHTML = mesaSeleccionada 
    ? renderMesaDetalle(mesaSeleccionada) 
    : "<p>Selecciona una mesa para ver/gestionar reserva.</p>";
}

window.selectTable = function(mesaId) {
  mesaSeleccionada = mesas.find(m => m.id === mesaId);
  renderFloorPlan();
  abrirModalReserva(mesaSeleccionada);
};

function renderMesaDetalle(mesa) {
  const r = reservasData[mesa.id];
  
  if (r && r.nombre) {
    return `<div class="detail-panel">
      <b>Mesa:</b> ${mesa.nombre}<br>
      <b>Cliente:</b> ${r.nombre}<br>
      <b>Comensales:</b> ${r.comensales}<br>
      <b>Hora:</b> ${r.desde} - ${r.hasta}<br>
      <b>Notas:</b> ${r.notas || "-"}<br>
      <b>Estado:</b> ${r.llegado ? "✓ Llegado" : "Pendiente"}<br>
      <button class="btn-primary" onclick="abrirModalReserva(mesaSeleccionada)">Editar reserva</button>
    </div>`;
  } else {
    return `<div class="detail-panel">
      <b>${mesa.nombre}</b><br>
      <span>Mesa libre</span><br>
      <button class="btn-primary" onclick="abrirModalReserva(mesaSeleccionada)">➕ Reservar</button>
    </div>`;
  }
}

// ===== MODAL =====
function abrirModalReserva(mesa) {
  document.getElementById("modalReserva").style.display = "flex";
  document.getElementById("modalMesaId").value = mesa.id;
  document.getElementById("modalMesaName").value = mesa.nombre;
  
  const r = reservasData[mesa.id] || {};
  document.getElementById("modalNombre").value = r.nombre || "";
  document.getElementById("modalComensales").value = r.comensales || "";
  document.getElementById("modalDesde").value = r.desde || "";
  document.getElementById("modalHasta").value = r.hasta || "";
  document.getElementById("modalNotas").value = r.notas || "";
  
  // Show/hide buttons based on state
  document.getElementById("btn-eliminar").style.display = r.nombre ? "inline-block" : "none";
  document.getElementById("btn-llegado").style.display = r.nombre && !r.llegado ? "inline-block" : "none";
}

document.getElementById("btn-close-modal").onclick = cerrarModal;
document.getElementById("btn-cancelar-modal").onclick = cerrarModal;

function cerrarModal() {
  document.getElementById("modalReserva").style.display = "none";
}

document.getElementById("btnCrearReserva").onclick = function() {
  const id = document.getElementById("modalMesaId").value;
  const nombre = document.getElementById("modalNombre").value.trim();
  const comensales = parseInt(document.getElementById("modalComensales").value);
  const desde = document.getElementById("modalDesde").value;
  const hasta = document.getElementById("modalHasta").value;
  const notas = document.getElementById("modalNotas").value.trim();
  
  if (!nombre || !comensales || !desde || !hasta || comensales < 1) {
    alert("Rellena todos los campos obligatorios.");
    return;
  }
  
  const mesa = mesas.find(m => m.id === id);
  if (comensales > mesa.capacidad) {
    alert(`Supera la capacidad máxima de la mesa (${mesa.capacidad}).`);
    return;
  }
  
  reservasData[id] = {nombre, comensales, desde, hasta, notas, llegado: false};
  guardarReservas(reservasData);
  cerrarModal();
  renderFloorPlan();
};

document.getElementById("btn-eliminar").onclick = function() {
  const id = document.getElementById("modalMesaId").value;
  if (confirm("¿Eliminar la reserva?")) {
    delete reservasData[id];
    guardarReservas(reservasData);
    cerrarModal();
    renderFloorPlan();
  }
};

// ===== LLEGADO BUTTON =====
document.getElementById("btn-llegado").onclick = function() {
  const id = document.getElementById("modalMesaId").value;
  reservasData[id].llegado = true;
  guardarReservas(reservasData);
  cerrarModal();
  renderFloorPlan();
};

// ===== LISTA RESERVAS =====
document.getElementById("btn-lista-reservas").onclick = () => {
  document.getElementById("screen-plano").classList.add("hidden");
  document.getElementById("reservas-lista-panel").classList.remove("hidden");
  renderListaReservas();
};

document.getElementById("btn-volver-plano").onclick = () => {
  document.getElementById("reservas-lista-panel").classList.add("hidden");
  document.getElementById("screen-plano").classList.remove("hidden");
  renderFloorPlan();
};

function renderListaReservas() {
  const lista = document.getElementById("reservas-lista");
  const reservas = Object.entries(reservasData)
    .map(([id, r]) => ({id, ...r}))
    .filter(r => r.nombre && r.comensales && r.desde && r.hasta);
  
  if (!reservas.length) {
    lista.innerHTML = "<p>No hay reservas activas.</p>";
    return;
  }
  
  lista.innerHTML = reservas.map(r => {
    const mesa = mesas.find(m => m.id === r.id);
    const statusClass = r.llegado ? "llegado" : "";
    const statusText = r.llegado ? "✓ Llegado" : "Pendiente";
    
    return `<div class="detail-item ${statusClass}">
      <b>${mesa.nombre}</b> — <span>${r.nombre}</span><br>
      <small>${r.comensales} pax | ${r.desde} - ${r.hasta}</small><br>
      <small><b>Estado:</b> ${statusText}</small><br>
      <small>${r.notas || ""}</small><br>
      <button class="btn-secondary" onclick="selectTable('${r.id}')">Editar</button>
    </div>`;
  }).join("");
}
