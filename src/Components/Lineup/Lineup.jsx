import "./Lineup.css"

const Lineup = ({team, color = "#fff"}) => {
    const formationRows = team.formation.split("-").map(Number)
    const players = team.startXI.map(p => p.player)

    let playerIndex = 0

    return (
        <div className="pitch" style={{borderColor: color}}>
            <div className="goalkeeper">
                <div className="player">{players[playerIndex++].name}</div>
            </div>

            {formationRows.map((numPlayers, i) => (
                <div key={i} className="formation-row">
                    {Array.from({length: numPlayers}).map((_, j) => (
                        <div key={j} className="player">
                            {players[playerIndex] ? players[playerIndex++].name : "-"}
                        </div>
                    ))}
                </div>
            ))}
        </div>
    )
}

export default Lineup