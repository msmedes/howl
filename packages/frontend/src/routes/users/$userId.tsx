import { useSuspenseQuery } from "@tanstack/react-query";
import type { ErrorComponentProps } from "@tanstack/react-router";
import { createFileRoute, ErrorComponent } from "@tanstack/react-router";
import { Heart, MessageSquare, UserPlus } from "lucide-react";
import { z } from "zod";
import { NotFound } from "@/components/NotFound";
import {
	Card,
	CardDescription,
	CardHeader,
	CardTitle,
} from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { UserFollowingTabContent } from "@/components/users/UserFollowingTabContent";
import { UserHowlsTabContent } from "@/components/users/UserHowlsTabContent";
import { UserLikedHowlsTabContent } from "@/components/users/UserLikedHowlsTabContent";
import {
	userFollowingQueryOptions,
	userHowlsQueryOptions,
	userLikedHowlsQueryOptions,
	userQueryOptions,
} from "@/utils/users";

export const Route = createFileRoute("/users/$userId")({
	validateSearch: z.object({
		tab: z.enum(["howls", "liked", "following"]).optional().default("howls"),
	}),
	loader: async ({ context, params: { userId } }) => {
		await Promise.all([
			context.queryClient.ensureQueryData(userQueryOptions(userId)),
			context.queryClient.ensureQueryData(userHowlsQueryOptions(userId)),
			context.queryClient.ensureQueryData(userLikedHowlsQueryOptions(userId)),
			context.queryClient.ensureQueryData(userFollowingQueryOptions(userId)),
		]);
	},
	errorComponent: UserErrorComponent,
	component: UserComponent,
	notFoundComponent: () => {
		return <NotFound>User not found</NotFound>;
	},
});

function UserErrorComponent({ error }: ErrorComponentProps) {
	return <ErrorComponent error={error} />;
}

function UserComponent() {
	const params = Route.useParams();
	const { tab } = Route.useSearch();
	const navigate = Route.useNavigate();
	const userQuery = useSuspenseQuery(userQueryOptions(params.userId));
	const howlsQuery = useSuspenseQuery(userHowlsQueryOptions(params.userId));
	const likedHowlsQuery = useSuspenseQuery(
		userLikedHowlsQueryOptions(params.userId),
	);
	const followingQuery = useSuspenseQuery(
		userFollowingQueryOptions(params.userId),
	);

	const user = userQuery.data;
	const howls = howlsQuery.data ?? [];
	const likedHowls = likedHowlsQuery.data ?? [];
	const following = followingQuery.data ?? [];

	if (!user) {
		return <div>User not found</div>;
	}

	const handleTabChange = (newTab: string) => {
		navigate({
			to: "/users/$userId",
			params: { userId: params.userId },
			search: { tab: newTab as "howls" | "liked" | "following" },
		});
	};

	return (
		<div className="container mx-auto px-4 py-6 max-w-4xl">
			<Card className="mb-6">
				<CardHeader className="pb-4">
					<div className="flex items-start justify-between">
						<div className="flex items-center space-x-4">
							<div className="w-16 h-16 bg-gradient-to-br from-blue-500 to-purple-600 rounded-full flex items-center justify-center text-white text-2xl font-bold">
								{user.username?.[0]?.toUpperCase() || "U"}
							</div>
							<div>
								<CardTitle className="text-2xl font-bold">
									{user.username || "Unknown User"}
								</CardTitle>
								<CardDescription className="text-base mt-1">
									{user.bio || "No bio available"}
								</CardDescription>
							</div>
						</div>
					</div>
				</CardHeader>
			</Card>

			<Tabs value={tab} onValueChange={handleTabChange} className="w-full">
				<TabsList className="grid w-full grid-cols-3">
					<TabsTrigger value="howls" className="flex items-center space-x-2">
						<MessageSquare className="w-4 h-4" />
						<span>Howls ({howls.length})</span>
					</TabsTrigger>
					<TabsTrigger value="liked" className="flex items-center space-x-2">
						<Heart className="w-4 h-4" />
						<span>Liked ({likedHowls.length})</span>
					</TabsTrigger>
					<TabsTrigger
						value="following"
						className="flex items-center space-x-2"
					>
						<UserPlus className="w-4 h-4" />
						<span>Following ({following.length})</span>
					</TabsTrigger>
				</TabsList>

				<TabsContent value="howls" className="mt-6">
					<UserHowlsTabContent howls={howls} />
				</TabsContent>

				<TabsContent value="liked" className="mt-6">
					<UserLikedHowlsTabContent howls={likedHowls} />
				</TabsContent>

				<TabsContent value="following" className="mt-6">
					<UserFollowingTabContent following={following} />
				</TabsContent>
			</Tabs>
		</div>
	);
}
