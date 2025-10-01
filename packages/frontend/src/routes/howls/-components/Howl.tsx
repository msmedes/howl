import type { Howl as HowlType } from "@howl/db/schema";
import { useQueryClient } from "@tanstack/react-query";
import { Link } from "@tanstack/react-router";
import { formatRelative } from "date-fns";
import { useState } from "react";
import AddHowlForm from "@/components/howls/AddHowlForm";
import api from "@/utils/client";

export default function Howl({ howl }: { howl: HowlType }) {
	console.log(howl);
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
		<li className="border border-gray-200 rounded-lg p-4 mb-4">
			<div className="flex gap-2 mb-3">
				<Link
					to={`/howls/$howlId`}
					params={{ howlId: String(howl.id) }}
					className="block"
				>
					<Link
						to={`/users/$userId`}
						params={{ userId: String(howl.user.id) }}
						className="flex items-center text-lg font-bold mb-2"
					>
						{howl.user.username}
					</Link>
					<div className="mb-2">{howl.content}</div>
					<div className="text-sm text-gray-500">
						{formatRelative(new Date(howl.createdAt), new Date())}
					</div>
				</Link>
			</div>
			<button
				type="button"
				onClick={() => setShowReplyForm(!showReplyForm)}
				className="bg-blue-600 text-white px-3 py-1 rounded text-sm hover:bg-blue-700"
			>
				{showReplyForm ? "Cancel Reply" : "Reply"}
			</button>
			<button
				type="button"
				onClick={() => handleDeleteHowl(howl.id)}
				className="bg-red-600 text-white px-3 py-1 rounded text-sm hover:bg-red-700"
			>
				Delete
			</button>

			{showReplyForm && (
				<div className="mt-4 pt-4 border-t border-gray-200">
					<AddHowlForm
						parentId={howl.id}
						replying={true}
						onSuccess={handleReplySuccess}
					/>
				</div>
			)}
		</li>
	);
}
