const API_URL = `http://${location.hostname}:3000/impianti`;
const TECNICI_API = `http://${location.hostname}:3000/tecnici`;
let data = [];
let editMode = false;
let tecnici = [];
let sortKey = null;
let sortAsc = true;


document.addEventListener("DOMContentLoaded", () => {
  loadTecnici();
  loadTable();

  document.getElementById("searchInput").addEventListener("input", renderTable);
  document.getElementById("finitoFilter").addEventListener("change", renderTable);
  document.getElementById("tecnicoFilter").addEventListener("change", renderTable);

  document.getElementById("tableHeader").addEventListener("click", e => {
    if (e.target.tagName === "TH" && e.target.dataset.key) {
      const newKey = e.target.dataset.key;

      if (sortKey === newKey) {
        sortAsc = !sortAsc;
      } else {
        sortKey = newKey;
        sortAsc = true;
      }

      updateHeaderIcons();
      renderTable();
    }
  });

  const addModal = new bootstrap.Modal(document.getElementById("addModal"));
  const addForm = document.getElementById("addForm");

  document.getElementById("addBtn").addEventListener("click", () => {
    addForm.reset();
    addModal.show();
  });

  addForm.addEventListener("submit", async (e) => {
    e.preventDefault();

    const formData = new FormData(addForm);

    const percentualeSchemi = parseInt(formData.get("schemiElettrici"));
    const percentualeProgrammazione = parseInt(formData.get("programmazione"));

    if (
      isNaN(percentualeSchemi) || percentualeSchemi < 0 || percentualeSchemi > 100 ||
      isNaN(percentualeProgrammazione) || percentualeProgrammazione < 0 || percentualeProgrammazione > 100
    ) {
      //alert("Le percentuali devono essere numeri tra 0 e 100.");
      mostraToast("Le percentuali devono essere numeri tra 0 e 100.", "warning");
      return;
    }

    const nuovo = {
      tecnicoId: parseInt(formData.get("tecnico")),
      cliente: formData.get("cliente"),
      nomeImpianto: formData.get("nomeImpianto"),
      schemiElettrici: percentualeSchemi,
      programmazione: percentualeProgrammazione,
      dataAvviamento: formData.get("dataAvviamento"),
      note: formData.get("note"),
      finito: formData.get("finito") === "on"
    };

    await fetch(API_URL, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(nuovo)
    });

    addModal.hide();
    loadTable();
  });

  flatpickr("#dataAvviamentoInput", {
  dateFormat: "Y-m-d",
  defaultDate: new Date()
});

});

async function loadTable() {
  const res = await fetch(API_URL);
  data = await res.json();
  renderTable();
}

function renderTable() {
  const tbody = document.querySelector("#impiantiTable tbody");
  tbody.innerHTML = "";

  const searchText = document.getElementById("searchInput").value.toLowerCase();
  const finitoFilter = document.getElementById("finitoFilter").value;
  const tecnicoFilter = document.getElementById("tecnicoFilter").value;

  const filtrati = data.filter(impianto => {
    const matchSearch =
      impianto.cliente.toLowerCase().includes(searchText) ||
      impianto.nomeImpianto.toLowerCase().includes(searchText);

    const matchFinito =
      finitoFilter === "all" ||
      (finitoFilter === "true" && impianto.finito) ||
      (finitoFilter === "false" && !impianto.finito);
      
    const matchTecnico = tecnicoFilter === "all" || parseInt(tecnicoFilter) === impianto.tecnicoId;

    return matchSearch && matchFinito && matchTecnico;
  });

  if (sortKey) {
    filtrati.sort((a, b) => {
      let valA = a[sortKey];
      let valB = b[sortKey];

      // Tecnico: confronta su nome
      if (sortKey === "tecnicoId") {
        valA = getTecnicoNameById(valA).toLowerCase();
        valB = getTecnicoNameById(valB).toLowerCase();
      }

      // Booleano: true > false
      if (typeof valA === "boolean") {
        return sortAsc ? (valA === valB ? 0 : valA ? -1 : 1) : (valA === valB ? 0 : valA ? 1 : -1);
      }

      // Data: confronta come Date
      if (sortKey === "dataAvviamento") {
        valA = new Date(valA);
        valB = new Date(valB);
      }

      // Stringa
      if (typeof valA === "string") {
        return sortAsc ? valA.localeCompare(valB) : valB.localeCompare(valA);
      }

      // Numerico
      return sortAsc ? valA - valB : valB - valA;
    });
  }

  // Contatori
  const totale = filtrati.length;
  const finiti = filtrati.filter(i => i.finito).length;
  const nonFiniti = totale - finiti;

  // Mostra nel box
  document.getElementById("totalCount").textContent = totale;
  document.getElementById("finitiCount").textContent = finiti;
  document.getElementById("nonFinitiCount").textContent = nonFiniti;


  filtrati.forEach((impianto, i) => {
    const row = document.createElement("tr");

    if (!editMode) {
      row.addEventListener("click", () => {
        window.location.href = `detail.html?id=${impianto.id}`;
      });
    }

    row.innerHTML = `
      <td>${editMode ? dropdownTecnico(impianto.tecnicoId) : getTecnicoNameById(impianto.tecnicoId)}</td>
      <td contenteditable="${editMode}">${impianto.cliente}</td>
      <td contenteditable="${editMode}">${impianto.nomeImpianto}</td>
      <td contenteditable="${editMode}">${impianto.schemiElettrici}</td>
      <td contenteditable="${editMode}">${impianto.programmazione}</td>
      <td>${editMode ? `<input type="text" class="form-control flatpickr" value="${impianto.dataAvviamento}" />` : impianto.dataAvviamento}</td>
      <td>
        <input type="checkbox" ${impianto.finito ? "checked" : ""} ${editMode ? "" : "disabled"}>
      </td>
    `;

    tbody.appendChild(row);
  });

  if (editMode) {
    flatpickr(".flatpickr", {
      dateFormat: "Y-m-d"
    });
  }
}

async function loadTecnici() {
  const res = await fetch(TECNICI_API);
  tecnici = await res.json();

  // Dropdown nel modal (aggiunta impianto)
  const tecnicoSelect = document.getElementById("tecnicoSelect");
  if (tecnicoSelect) {
    tecnicoSelect.innerHTML = "";
    tecnici.forEach(t => {
      const option = document.createElement("option");
      option.value = t.id;
      option.textContent = t.nome;
      tecnicoSelect.appendChild(option);
    });
  }

  // Filtro tecnico
  const tecnicoFilter = document.getElementById("tecnicoFilter");
  if (tecnicoFilter) {
    tecnicoFilter.innerHTML = `<option value="all">Tutti i tecnici</option>`;
    tecnici.forEach(t => {
      const option = document.createElement("option");
      option.value = t.id;
      option.textContent = t.nome;
      tecnicoFilter.appendChild(option);
    });
  }
}

async function loadTecniciOld() {
  const res = await fetch(TECNICI_API);
  tecnici = await res.json();

  const tecnicoSelect = document.getElementById("tecnicoSelect");
  tecnicoSelect.innerHTML = ""; // pulisce eventuali vecchie opzioni
  tecnici.forEach(t => {
    const option = document.createElement("option");
    option.value = t.id;
    option.textContent = t.nome;
    tecnicoSelect.appendChild(option);
  });
}

function getTecnicoNameById(id) {
  const tecnico = tecnici.find(t => t.id == id);
  return tecnico ? tecnico.nome : "Sconosciuto";
}

function updateHeaderIcons() {
  const ths = document.querySelectorAll("#tableHeader th");
  ths.forEach(th => {
    const key = th.dataset.key;
    if (key === sortKey) {
      const arrow = sortAsc ? " ▲" : " ▼";
      th.textContent = th.dataset.label + arrow;
    } else {
      th.textContent = th.dataset.label;
    }
  });
}

document.getElementById("resetFiltersBtn").addEventListener("click", () => {
  document.getElementById("searchInput").value = "";
  document.getElementById("finitoFilter").value = "all";
  document.getElementById("tecnicoFilter").value = "all";
  renderTable();
});

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
