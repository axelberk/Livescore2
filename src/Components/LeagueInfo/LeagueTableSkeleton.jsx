import { Skeleton } from "@mui/material";

const LeagueTableSkeleton = ({ rows = 10 }) => {
  return (
    <div className="league-table-skeleton">
      <table className="league-table">
        <thead>
          <tr>
            <th>#</th>
            <th>Team</th>
            <th>GP</th>
            <th>W</th>
            <th>D</th>
            <th>L</th>
            <th>GF</th>
            <th>GA</th>
            <th>GD</th>
            <th>PTS</th>
          </tr>
        </thead>
        <tbody>
          {Array.from({ length: rows }).map((_, i) => (
            <tr key={i}>
              <td>
                <Skeleton variant="text" width={20} />
              </td>
              <td className="team-cell">
                <Skeleton
                  variant="circular"
                  width={24}
                  height={24}
                  style={{ marginRight: 8 }}
                />
                <Skeleton variant="text" width={100} />
              </td>
              <td><Skeleton variant="text" width={20} /></td>
              <td><Skeleton variant="text" width={20} /></td>
              <td><Skeleton variant="text" width={20} /></td>
              <td><Skeleton variant="text" width={20} /></td>
              <td><Skeleton variant="text" width={20} /></td>
              <td><Skeleton variant="text" width={20} /></td>
              <td><Skeleton variant="text" width={20} /></td>
              <td><Skeleton variant="text" width={30} /></td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

export default LeagueTableSkeleton;
