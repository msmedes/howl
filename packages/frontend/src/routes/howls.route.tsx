import { useQuery, useQueryClient } from "@tanstack/react-query";
import { createFileRoute } from "@tanstack/react-router";
import { formatRelative } from "date-fns";
import { useState } from "react";
import AddHowlForm from "@/components/howls/AddHowlForm";
import api from "@/utils/client";
import { howlsQueryOptions } from "@/utils/howls";

export const Route = createFileRoute("/howls")({
	component: RouteComponent,
	loader: async ({ context }) => {
		await context.queryClient.ensureQueryData(howlsQueryOptions());
	},
});

function RouteComponent() {
	const howlsQuery = useQuery(howlsQueryOptions());

	return (
		<div>
			<AddHowlForm replying={false} />
			{howlsQuery.data?.map((howl) => (
				<Howl
					key={howl.id}
					id={howl.id}
					content={howl.content}
					timestamp={howl.createdAt}
					username={howl.user?.username}
				/>
			))}
		</div>
	);
}

function Howl({
	id,
	content,
	timestamp,
	username,
}: {
	id: string;
	content: string;
	timestamp: string;
	username: string;
}) {
	const [showReplyForm, setShowReplyForm] = useState(false);
	const queryClient = useQueryClient();

	const handleReplySuccess = () => {
		setShowReplyForm(false);
	};

	const handleDeleteHowl = async (howlId: string) => {
		if (confirm("Are you sure you want to delete this howl?")) {
			try {
				const response = await api.howls[":id"].$delete({
					param: { id: howlId },
				});

				if (!response.ok) {
					throw new Error("Failed to delete howl");
				}

				// Invalidate and refetch howls after successful deletion
				queryClient.invalidateQueries({ queryKey: ["howls"] });
			} catch (error) {
				console.error("Error deleting howl:", error);
			}
		}
	};

	return (
		<div className="border border-gray-200 rounded-lg p-4 mb-4">
			<div className="flex items-center text-lg font-bold mb-2">{username}</div>
			<div className="mb-2">{content}</div>
			<div className="text-sm text-gray-500 mb-3">
				{formatRelative(new Date(timestamp), new Date())}
			</div>
			<div className="flex gap-2">
				<button
					type="button"
					onClick={() => setShowReplyForm(!showReplyForm)}
					className="bg-blue-600 text-white px-3 py-1 rounded text-sm hover:bg-blue-700"
				>
					{showReplyForm ? "Cancel Reply" : "Reply"}
				</button>
				<button
					type="button"
					onClick={() => handleDeleteHowl(id)}
					className="bg-red-600 text-white px-3 py-1 rounded text-sm hover:bg-red-700"
				>
					Delete
				</button>
			</div>

			{showReplyForm && (
				<div className="mt-4 pt-4 border-t border-gray-200">
					<AddHowlForm
						parentId={id}
						replying={true}
						onSuccess={handleReplySuccess}
					/>
				</div>
			)}
		</div>
	);
}
