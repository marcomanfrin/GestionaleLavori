const API_URL = "http://localhost:3000/impianti";
const TECNICI_URL = "http://localhost:3000/tecnici";

const params = new URLSearchParams(window.location.search);
const id = params.get("id");

let impianto;
let tecnici = [];

document.addEventListener("DOMContentLoaded", async () => {
  await caricaDettagli();

  document.getElementById("modificaBtn").addEventListener("click", () => {
    renderForm();
    document.getElementById("modificaBtn").style.display = "none";
    const salvaBtn = document.getElementById("salvaBtn");
    salvaBtn.style.display = "inline-block";
    salvaBtn.disabled = false; // 🔓 Abilita il bottone
  });
  document.getElementById("salvaBtn").addEventListener("click", async () => {
    await salvaModifiche();
    document.getElementById("salvaBtn").style.display = "none";
    document.getElementById("salvaBtn").disabled = true; // 🔒 Disabilita di nuovo
    document.getElementById("modificaBtn").style.display = "inline-block";
  });
  document.getElementById("salvaBtn").addEventListener("click", salvaModifiche);
});

async function caricaDettagli() {
  try {
    const [impiantoRes, tecniciRes] = await Promise.all([
      fetch(`${API_URL}/${id}`),
      fetch(TECNICI_URL)
    ]);

    impianto = await impiantoRes.json();
    tecnici = await tecniciRes.json();
    renderDettagli();
  } catch (err) {
    document.getElementById("dettagliImpianto").innerHTML =
      "<div class='alert alert-danger'>Errore nel caricamento dei dati.</div>";
    console.error(err);
  }
}

function renderDettagli() {
  const tecnico = tecnici.find(t => t.id === impianto.tecnicoId);
  const container = document.getElementById("dettagliImpianto");

  container.innerHTML = `
    <ul class="list-group">
      <li class="list-group-item"><strong>Tecnico:</strong> ${tecnico?.nome || "Sconosciuto"}</li>
      <li class="list-group-item"><strong>Cliente:</strong> ${impianto.cliente}</li>
      <li class="list-group-item"><strong>Nome Impianto:</strong> ${impianto.nomeImpianto}</li>
      <li class="list-group-item"><strong>Schemi Elettrici (%):</strong> ${impianto.schemiElettrici}</li>
      <li class="list-group-item"><strong>Programmazione (%):</strong> ${impianto.programmazione}</li>
      <li class="list-group-item"><strong>Data Avviamento:</strong> ${impianto.dataAvviamento}</li>
      <li class="list-group-item"><strong>Note:</strong> ${impianto.note || "—"}</li>
      <li class="list-group-item"><strong>Finito:</strong> ${impianto.finito ? "Sì" : "No"}</li>
    </ul>
  `;
}

function renderForm() {
  const container = document.getElementById("dettagliImpianto");

  container.innerHTML = `
    <div class="row g-3">
      <div class="col-12">
        <label class="form-label">Tecnico</label>
        <select class="form-select" id="tecnico">
          ${tecnici
            .map(t => `<option value="${t.id}" ${t.id === impianto.tecnicoId ? "selected" : ""}>${t.nome}</option>`)
            .join("")}
        </select>
      </div>
      <div class="col-12">
        <label class="form-label">Cliente</label>
        <input type="text" class="form-control" id="cliente" value="${impianto.cliente}">
      </div>
      <div class="col-12">
        <label class="form-label">Nome Impianto</label>
        <input type="text" class="form-control" id="nomeImpianto" value="${impianto.nomeImpianto}">
      </div>
      <div class="col-12">
        <label class="form-label">Schemi Elettrici (%)</label>
        <input type="number" class="form-control" id="schemiElettrici" value="${impianto.schemiElettrici}">
      </div>
      <div class="col-12">
        <label class="form-label">Programmazione (%)</label>
        <input type="number" class="form-control" id="programmazione" value="${impianto.programmazione}">
      </div>
      <div class="col-12">
        <label class="form-label">Data Avviamento</label>
        <input type="date" class="form-control" id="dataAvviamento" value="${impianto.dataAvviamento}">
      </div>
      <div class="col-12">
        <label class="form-label">Note</label>
        <textarea class="form-control" id="note">${impianto.note || ""}</textarea>
      </div>
      <div class="col-12 form-check mt-2">
        <input type="checkbox" class="form-check-input" id="finito" ${impianto.finito ? "checked" : ""}>
        <label class="form-check-label" for="finito">Finito</label>
      </div>
    </div>
  `;
}

async function salvaModifiche() {
  const updated = {
    tecnicoId: parseInt(document.getElementById("tecnico").value),
    cliente: document.getElementById("cliente").value,
    nomeImpianto: document.getElementById("nomeImpianto").value,
    schemiElettrici: parseInt(document.getElementById("schemiElettrici").value),
    programmazione: parseInt(document.getElementById("programmazione").value),
    dataAvviamento: document.getElementById("dataAvviamento").value,
    note: document.getElementById("note").value,
    finito: document.getElementById("finito").checked
  };

  try {
    await fetch(`${API_URL}/${id}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(updated)
    });

    impianto = updated;
    document.getElementById("salvaBtn").style.display = "none";
    document.getElementById("modificaBtn").style.display = "inline-block";
    renderDettagli();
  } catch (err) {
    alert("Errore durante il salvataggio.");
    console.error(err);
  }
}
