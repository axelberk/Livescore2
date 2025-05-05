import "./Lineup.css";

const Lineup = ({ team, color, isAway }) => {
  if (!team || !team.formation || !team.startXI) return null;

  const formationRows = team.formation.split("-").map(Number);
  const goalkeeper = team.startXI[0].player;
  const outfieldPlayers = team.startXI.slice(1).map(p => p.player);

  const players = isAway ? [...outfieldPlayers].reverse() : outfieldPlayers;
  let playerIndex = 0;

  const renderRow = (numPlayers, i) => {
    const row = players.slice(playerIndex, playerIndex + numPlayers);
    playerIndex += numPlayers;
    return (
      <div key={i} className="formation-row">
        {row.map((p, j) => (
          <div key={j} className="player">{p.name}</div>
        ))}
      </div>
    );
  };

  const orderedRows = isAway ? [...formationRows].reverse() : formationRows;

  return (
    <div className="pitch" style={{ borderColor: color }}>
      
      {!isAway && (
        <div className="goalkeeper">
          <div className="player">{goalkeeper.name}</div>
        </div>
      )}

      {orderedRows.map((num, i) => renderRow(num, i))}

      {isAway && (
        <div className="goalkeeper">
          <div className="player">{goalkeeper.name}</div>
        </div>
      )}
    </div>
  );
};

export default Lineup;
