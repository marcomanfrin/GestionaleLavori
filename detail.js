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
        document.getElementById("salvaBtn").style.display = "inline-block";
        document.getElementById("salvaBtn").disabled = false;
        document.getElementById("annullaBtn").style.display = "inline-block";
    });

    document.getElementById("salvaBtn").addEventListener("click", async () => {
        await salvaModifiche();
            disattivaModifica();
    });

    document.getElementById("annullaBtn").addEventListener("click", () => {
        disattivaModifica();
    });

    document.getElementById("eliminaBtn").addEventListener("click", eliminaImpianto);
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
        <input type="date" class="form-control" id="dataAvviamento" value="${new Date(impianto.dataAvviamento).toISOString().split('T')[0]}">

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
  const tecnicoId = parseInt(document.getElementById("tecnico").value);
  const cliente = document.getElementById("cliente").value.trim();
  const nomeImpianto = document.getElementById("nomeImpianto").value.trim();
  const schemiElettrici = parseInt(document.getElementById("schemiElettrici").value);
  const programmazione = parseInt(document.getElementById("programmazione").value);
  const dataAvviamento = document.getElementById("dataAvviamento").value;
  const note = document.getElementById("note").value;
  const finito = document.getElementById("finito").checked;

  // === Validazione ===
  if (!cliente || !nomeImpianto) {
    //alert("Cliente e nome impianto sono obbligatori.");
    mostraToast("Cliente e nome impianto sono obbligatori.", "danger");

    return;
  }

  if (
    isNaN(schemiElettrici) || schemiElettrici < 0 || schemiElettrici > 100 ||
    isNaN(programmazione) || programmazione < 0 || programmazione > 100
  ) {
    //alert("Le percentuali devono essere numeri tra 0 e 100.");
    mostraToast("Le percentuali devono essere numeri tra 0 e 100.", "danger");
    return;
  }

  if (!dataAvviamento) {
    //alert("La data di avviamento è obbligatoria.");
    mostraToast("La data di avviamento è obbligatoria.", "danger");
    return;
  }

  // === Salvataggio ===
  const updated = {
    tecnicoId,
    cliente,
    nomeImpianto,
    schemiElettrici,
    programmazione,
    dataAvviamento,
    note,
    finito
  };

  try {
    const res = await fetch(`${API_URL}/${id}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(updated)
    });

    if (!res.ok) throw new Error("Errore nella risposta del server.");

    impianto = updated;
    document.getElementById("salvaBtn").style.display = "none";
    document.getElementById("modificaBtn").style.display = "inline-block";
    renderDettagli();
  } catch (err) {
    //alert("Errore durante il salvataggio.");
    mostraToast("Errore durante il salvataggio.", "danger");
    console.error(err);
  }
}

async function salvaModificheOld() {
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
    //alert("Errore durante il salvataggio.");
    mostraToast("Errore durante il salvataggio.", "error");
    console.error(err);
  }
}

function disattivaModifica() {
  renderDettagli(); // ripristina la visualizzazione originale
  document.getElementById("modificaBtn").style.display = "inline-block";
  document.getElementById("salvaBtn").style.display = "none";
  document.getElementById("salvaBtn").disabled = true;
  document.getElementById("annullaBtn").style.display = "none";
}

async function eliminaImpianto() {
  const conferma = confirm("Sei sicuro di voler eliminare questo impianto?");
  if (!conferma) return;

  try {
    const response = await fetch(`${API_URL}/${id}`, {
      method: "DELETE"
    });

    if (response.ok) {
      //alert("Eliminato");
      mostraToast("Impianto eliminato con successo.", "success");
      window.location.href = "index.html";  // <-- questo dovrebbe eseguire il redirect
    } else {
      //alert("Errore: la risposta non è OK");
      mostraToast("Errore durante l'eliminazione dell'impianto.", "error");
    }
  } catch (err) {
    //alert("Errore nella fetch");
    mostraToast("Errore nella fetch", "error");
    console.error(err);
  }
}

function mostraToast(messaggio, tipo = "success") {
  const container = document.getElementById("toastContainer");
  const id = `toast-${Date.now()}`;

  // Mappa tipo → classe Bootstrap
  const colori = {
    success: "bg-success",
    danger: "bg-danger",
    error: "bg-danger",
    warning: "bg-warning",
    info: "bg-info"
  };

  const colore = colori[tipo] || "bg-secondary";

  container.insertAdjacentHTML("beforeend", `
    <div id="${id}" class="toast align-items-center text-white ${colore} border-0 mb-2" role="alert" aria-live="assertive" aria-atomic="true">
      <div class="d-flex">
        <div class="toast-body">${messaggio}</div>
        <button type="button" class="btn-close btn-close-white me-2 m-auto" data-bs-dismiss="toast"></button>
      </div>
    </div>
  `);

  const toastElement = new bootstrap.Toast(document.getElementById(id), { delay: 3000 });
  toastElement.show();

  document.getElementById(id).addEventListener("hidden.bs.toast", () => {
    document.getElementById(id)?.remove();
  });
}

