import type { Howl as HowlType } from "@howl/db/schema";
import { useQueryClient } from "@tanstack/react-query";
import { Link } from "@tanstack/react-router";
import { formatRelative } from "date-fns";
import { useState } from "react";
import AddHowlForm from "@/components/howls/AddHowlForm";
import { Button } from "@/components/ui/button";
import {
	Card,
	CardContent,
	CardFooter,
	CardHeader,
	CardTitle,
} from "@/components/ui/card";
import api from "@/utils/client";

export default function Howl({ howl }: { howl: HowlType }) {
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
				queryClient.invalidateQueries({ queryKey: ["howls", howlId] });
			} catch (error) {
				console.error("Error deleting howl:", error);
			}
		}
	};

	return (
		<Card className="w-full max-w-md shadow-none">
			<CardHeader>
				<CardTitle>
					<Link to={`/users/$userId`} params={{ userId: String(howl.user.id) }}>
						{howl.user.username}
					</Link>
				</CardTitle>
			</CardHeader>
			<CardContent>
				<Link to={`/howls/$howlId`} params={{ howlId: howl.id }}>
					<p className="text-lg">{howl.content}</p>
					<p className="text-sm text-muted-foreground">
						{formatRelative(new Date(howl.createdAt), new Date())}
					</p>
				</Link>
			</CardContent>
			<CardFooter className="flex justify-between items-center">
				<Button
					className="shadow"
					onClick={() => setShowReplyForm(!showReplyForm)}
				>
					{showReplyForm ? "Cancel" : "Reply"}
				</Button>
				<Button
					className="shadow"
					variant="destructive"
					onClick={() => handleDeleteHowl(howl.id)}
				>
					Delete
				</Button>
				{showReplyForm && (
					<div className="mt-4 pt-4 border-t border-gray-200">
						<AddHowlForm
							parentId={howl.id}
							replying={true}
							onSuccess={handleReplySuccess}
						/>
					</div>
				)}
			</CardFooter>
		</Card>
	);
}
