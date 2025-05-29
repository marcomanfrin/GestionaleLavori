const API_URL = "http://localhost:3000/impianti";
let data = [];
let editMode = false;
const TECNICI_API = "http://localhost:3000/tecnici";
let tecnici = [];
let sortKey = null;
let sortAsc = true;


document.addEventListener("DOMContentLoaded", () => {
  loadTecnici();
  loadTable();

  document.getElementById("searchInput").addEventListener("input", renderTable);
  document.getElementById("finitoFilter").addEventListener("change", renderTable);

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



  document.getElementById("editBtn").addEventListener("click", () => {
    editMode = true;
    renderTable();
  });

  document.getElementById("saveBtn").addEventListener("click", saveChanges);

  const addModal = new bootstrap.Modal(document.getElementById("addModal"));
  const addForm = document.getElementById("addForm");

  document.getElementById("addBtn").addEventListener("click", () => {
    addForm.reset();
    addModal.show();
  });

  addForm.addEventListener("submit", async (e) => {
    e.preventDefault();

    const formData = new FormData(addForm);
    const nuovo = {
      tecnicoId: parseInt(formData.get("tecnico")),
      cliente: formData.get("cliente"),
      nomeImpianto: formData.get("nomeImpianto"),
      schemiElettrici: parseInt(formData.get("schemiElettrici")),
      programmazione: parseInt(formData.get("programmazione")),
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
  dateFormat: "d-m-Y",
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

  const filtrati = data.filter(impianto => {
    const matchSearch =
      impianto.cliente.toLowerCase().includes(searchText) ||
      impianto.nomeImpianto.toLowerCase().includes(searchText);

    const matchFinito =
      finitoFilter === "all" ||
      (finitoFilter === "true" && impianto.finito) ||
      (finitoFilter === "false" && !impianto.finito);

    return matchSearch && matchFinito;
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

async function saveChanges() {
  const rows = document.querySelectorAll("#impiantiTable tbody tr");

  for (let i = 0; i < rows.length; i++) {
    const cells = rows[i].children;
    const updated = {
      tecnicoId: parseInt(cells[0].querySelector("select")?.value || cells[0].innerText),
      cliente: cells[1].innerText,
      nomeImpianto: cells[2].innerText,
      schemiElettrici: parseInt(cells[3].innerText),
      programmazione: parseInt(cells[4].innerText),
      dataAvviamento: cells[5].querySelector("input")?.value || cells[5].innerText,
      finito: cells[6].querySelector("input").checked
    };

    await fetch(`${API_URL}/${data[i].id}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(updated)
    });
  }

  editMode = false;
  loadTable();
}

async function loadTecnici() {
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
  const tecnico = tecnici.find(t => t.id === id);
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
