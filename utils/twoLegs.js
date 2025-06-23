export default function groupTwoLeggedTies(fixtures) {
  const grouped = {};

  fixtures.forEach((fixture) => {
    const round = fixture.league.round || "Unknown Round";
    const homeId = fixture.teams.home.id;
    const awayId = fixture.teams.away.id;

    const key = `${round}-${[homeId, awayId].sort().join("-")}`;

    if (!grouped[key]) {
      grouped[key] = {
        round,
        fixtures: [],
        homeTeam: fixture.teams.home,
        awayTeam: fixture.teams.away,
      };
    }

    grouped[key].fixtures.push(fixture);
  });

  return Object.values(grouped);
}
