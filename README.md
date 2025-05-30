# 🛠️ Gestionale Impianti

Web app gestionale per la gestione di **impianti**, **tecnici**, **commesse** e **ore lavorate**, con funzionalità avanzate per la pianificazione e il monitoraggio della produzione.

## 🚀 Funzionalità

- Gestione anagrafica impianti (cliente, nome, percentuale avanzamento, data avviamento)
- Assegnazione tecnici e gestione ore lavorate per commessa
- Creazione e modifica commesse
- Gestione anagrafica tecnici
- Livelli di accesso (admin, tecnico)
- Esportazione rapportini per commessa o per tecnico
- Dashboard grafica con:
  - Bar chart (impianti per tecnico)
  - Pie chart (impianti completati vs in lavorazione)
  - Percentuali medie per commessa
- Pianificazione attività con **calendario** e vista **Kanban stile Agile**
- Notifiche con sistema toast per messaggi di stato

## 🧱 Tecnologie utilizzate

- HTML + CSS (Bootstrap)
- JavaScript Vanilla
- [JSON Server](https://github.com/typicode/json-server) per backend mock
- [http-server](https://www.npmjs.com/package/http-server) per il frontend
- [PM2](https://pm2.keymetrics.io/) per la gestione dei processi
- Chart.js per grafici nella dashboard

## 📦 Installazione

1. Clona il repository:
   ```bash
   git clone https://github.com/tuo-utente/gestionale-impianti.git
   cd gestionale-impianti
   
2. Installa le dipendenze globali:
   ```
   npm install -g json-server http-server pm2
3. Avvia i servizi con PM2:
   ```
   pm2 start server/server.js --name json-server
   pm2 start "http-server frontend -p 8888 -a 0.0.0.0" --name http-server
5. Oppure lancia i servizi manualmente:
   ```
   \\cd server
   json-server --watch db.json --port 3000
   cd ../frontend
   http-server -p 8888 -a 0.0.0.0
6. Visita la web app da browser: http://localhost:8888

