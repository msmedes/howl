import { useSuspenseQuery } from "@tanstack/react-query";
import type { ErrorComponentProps } from "@tanstack/react-router";
import { createFileRoute, ErrorComponent } from "@tanstack/react-router";
import HowlFeed from "@/components/howls/HowlFeed";
import { NotFound } from "@/components/NotFound";
import { userQueryOptions } from "@/utils/users";

export const Route = createFileRoute("/users/$userId")({
	loader: async ({ context, params: { userId } }) => {
		await context.queryClient.ensureQueryData(userQueryOptions(userId));
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
	const userQuery = useSuspenseQuery(userQueryOptions(params.userId));
	const user = userQuery.data;

	return (
		<div className="max-w-2xl mx-auto p-6 space-y-6">
			{/* User Profile Header */}
			<div className="text-center border-b border-gray-200 pb-6">
				<h1 className="text-3xl font-bold text-gray-900 mb-2">
					{user.username}
				</h1>
				{user?.bio && <p className="text-gray-600 text-lg">{user.bio}</p>}
			</div>

			<HowlFeed howls={user.howls ?? []} />
		</div>
	);
}
