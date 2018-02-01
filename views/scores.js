function saveResults(e) {
  const player1Goals = parseInt(document.getElementById('player1goals').value, 10);
  const player2Goals = parseInt(document.getElementById('player2goals').value, 10);
  fetch('/tournaments/save_match', {
    method: 'POST',
    body: JSON.stringify({
      "player_1_id": player1Id,
      "player_2_id": player2Id,
      "player_1_goals": player1Goals,
      "player_2_goals": player2Goals
    }),
    headers: new Headers({
      'Content-Type': 'application/json'
    })
  }).then((response) => {
    if (response.status === 200) {
      window.location.reload();
    }
  });
};
