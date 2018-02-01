function fetchCurrentProfile() {
  return fetch(window.location.href + '/current')
    .then((response) => {
      if (response.status === 200) {
        response.json()
          .then((data) => {
            refreshProfile(JSON.parse(data.player));
          });
      };
    });
}

function refreshProfile(newTableHTML) {
  const table = document.getElementById('player');
  if (table) {
    table.innerHTML = newTableHTML;
  }
};

setInterval(fetchCurrentProfile, 2000);
