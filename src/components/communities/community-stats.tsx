interface CommunityStatsProps {
  communityId: string;
  memberCount: number;
}

export async function CommunityStats({
  communityId,
  memberCount,
}: CommunityStatsProps) {
  // You'll implement these queries in your settings page
  return (
    <div className="border rounded-lg p-4">
      <h2 className="font-semibold mb-4">Community Statistics</h2>
      <div className="grid grid-cols-2 gap-4">
        <div className="p-3 bg-muted rounded-md">
          <p className="text-2xl font-bold">{memberCount}</p>
          <p className="text-sm text-muted-foreground">Total Members</p>
        </div>
        <div className="p-3 bg-muted rounded-md">
          <p className="text-2xl font-bold">-</p>
          <p className="text-sm text-muted-foreground">Total Posts</p>
        </div>
        <div className="p-3 bg-muted rounded-md">
          <p className="text-2xl font-bold">-</p>
          <p className="text-sm text-muted-foreground">Active Today</p>
        </div>
        <div className="p-3 bg-muted rounded-md">
          <p className="text-2xl font-bold">-</p>
          <p className="text-sm text-muted-foreground">Growth This Week</p>
        </div>
      </div>
    </div>
  );
}
