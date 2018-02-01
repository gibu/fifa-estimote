function fetchCurrentTable() {
  return fetch('/tournaments/table')
    .then((response) => {
      if (response.status === 200) {
        response.json()
          .then((data) => {
            refreshTable(JSON.parse(data.table));
          });
      };
    });
}

function refreshTable(newTableHTML) {
  const table = document.getElementById('table');
  if (table) {
    table.innerHTML = newTableHTML;
  }
};

setInterval(fetchCurrentTable, 5000);
