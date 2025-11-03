import { Link } from "@tanstack/react-router";
import { UserPlus } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

interface UserFollowingTabContentProps {
	following: any[];
}

export function UserFollowingTabContent({
	following,
}: UserFollowingTabContentProps) {
	if (following.length === 0) {
		return (
			<Card>
				<CardContent className="py-8 text-center text-muted-foreground">
					<UserPlus className="w-12 h-12 mx-auto mb-4 opacity-50" />
					<p>This user isn't following anyone yet.</p>
				</CardContent>
			</Card>
		);
	}

	return (
		<div className="space-y-4">
			{following.map((user: any) => (
				<Link
					key={user.id}
					to="/users/$userId"
					params={{ userId: user.id }}
					className="block transition-transform hover:scale-[1.02] hover:shadow-md"
				>
					<Card className="h-full">
						<CardHeader className="pb-3">
							<CardTitle className="text-lg">{user.username}</CardTitle>
						</CardHeader>
						{user.bio && (
							<CardContent>
								<p className="text-sm text-muted-foreground">{user.bio}</p>
							</CardContent>
						)}
					</Card>
				</Link>
			))}
		</div>
	);
}

