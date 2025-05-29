const API_URL = "http://localhost:3000/impianti";

let data = [];
let editMode = false;

document.addEventListener("DOMContentLoaded", () => {
  loadTable();

  document.getElementById("editBtn").addEventListener("click", () => {
    editMode = true;
    renderTable();
  });

  document.getElementById("saveBtn").addEventListener("click", saveChanges);

  document.getElementById("addBtn").addEventListener("click", async () => {
    const nuovo = {
      tecnico: prompt("Tecnico:"),
      cliente: prompt("Cliente:"),
      nomeImpianto: prompt("Nome Impianto:"),
      schemiElettrici: parseInt(prompt("Schemi elettrici (%)")),
      programmazione: parseInt(prompt("Programmazione (%)")),
      dataAvviamento: prompt("Data Avviamento (DD-MM-YYYY):"),
      finito: false
    };
    await fetch(API_URL, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(nuovo)
    });
    loadTable();
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

  data.forEach((impianto, i) => {
    const row = document.createElement("tr");

    row.innerHTML = `
      <td contenteditable="${editMode}">${impianto.tecnico}</td>
      <td contenteditable="${editMode}">${impianto.cliente}</td>
      <td contenteditable="${editMode}">${impianto.nomeImpianto}</td>
      <td contenteditable="${editMode}">${impianto.schemiElettrici}</td>
      <td contenteditable="${editMode}">${impianto.programmazione}</td>
      <td contenteditable="${editMode}">${impianto.dataAvviamento}</td>
      <td>
        <input type="checkbox" ${impianto.finito ? "checked" : ""} ${editMode ? "" : "disabled"}>
      </td>
    `;

    tbody.appendChild(row);
  });
}

async function saveChanges() {
  const rows = document.querySelectorAll("#impiantiTable tbody tr");

  for (let i = 0; i < rows.length; i++) {
    const cells = rows[i].children;
    const updated = {
      tecnico: cells[0].innerText,
      cliente: cells[1].innerText,
      nomeImpianto: cells[2].innerText,
      schemiElettrici: parseInt(cells[3].innerText),
      programmazione: parseInt(cells[4].innerText),
      dataAvviamento: cells[5].innerText,
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
