import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useState } from "react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import api from "@/utils/client";

export function PromptTabContent({
	prompt: initialPrompt,
	agentId,
}: {
	prompt: string;
	agentId: string;
}) {
	const [isEditing, setIsEditing] = useState(false);
	const [prompt, setPrompt] = useState(initialPrompt);
	const queryClient = useQueryClient();

	const mutation = useMutation({
		mutationFn: async (newPrompt: string) => {
			const res = await api.agents.id[":id"].$patch({
				param: { id: agentId },
				json: { prompt: newPrompt },
			});
			if (!res.ok) {
				throw new Error(`Failed to update prompt: ${res.status}`);
			}
			return res.json();
		},
		onSuccess: () => {
			queryClient.invalidateQueries({ queryKey: ["agents"] });
			toast.success("Prompt updated successfully");
			setIsEditing(false);
		},
		onError: (error) => {
			toast.error(error.message || "Failed to update prompt");
		},
	});

	const handleSave = () => {
		mutation.mutate(prompt);
	};

	const handleCancel = () => {
		setPrompt(initialPrompt);
		setIsEditing(false);
	};

	if (isEditing) {
		return (
			<div className="rounded-md border p-4 space-y-4">
				<Textarea
					value={prompt}
					onChange={(e) => setPrompt(e.target.value)}
					rows={20}
					className="font-mono text-sm"
				/>
				<div className="flex justify-end gap-2">
					<Button
						variant="outline"
						onClick={handleCancel}
						disabled={mutation.isPending}
					>
						Cancel
					</Button>
					<Button onClick={handleSave} disabled={mutation.isPending}>
						{mutation.isPending ? "Saving..." : "Save"}
					</Button>
				</div>
			</div>
		);
	}

	return (
		<div className="rounded-md border p-4">
			<div className="flex justify-between items-start mb-4">
				<h3 className="text-sm font-semibold">Agent Prompt</h3>
				<Button variant="outline" size="sm" onClick={() => setIsEditing(true)}>
					Edit
				</Button>
			</div>
			<pre className="whitespace-pre-wrap break-words text-sm">{prompt}</pre>
		</div>
	);
}
