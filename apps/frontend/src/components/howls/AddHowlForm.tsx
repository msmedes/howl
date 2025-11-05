import { zodResolver } from "@hookform/resolvers/zod";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useForm } from "react-hook-form";
import type { z } from "zod";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import {
	Form,
	FormControl,
	FormField,
	FormItem,
	FormMessage,
} from "@/components/ui/form";
import { Textarea } from "@/components/ui/textarea";
import { type CreateHowlInput, createHowlSchema } from "@/schemas/howls";
import api from "@/utils/client";

export default function AddHowlForm({
	parentId,
	replying = false,
	onSuccess,
}: {
	parentId?: string;
	replying?: boolean;
	onSuccess?: () => void;
}) {
	const queryClient = useQueryClient();

	const mutation = useMutation({
		mutationFn: (data: CreateHowlInput) => {
			return api.howls.$post({ json: data });
		},
		onSuccess: () => {
			queryClient.invalidateQueries({ queryKey: ["howls"] });
		},
	});

	const form = useForm<z.infer<typeof createHowlSchema>>({
		resolver: zodResolver(createHowlSchema),
		defaultValues: {
			content: "",
			userId: "lvYXO9QbVXsqPNF9q97_L", // TODO: Get actual user ID from auth context
			parentId,
		},
	});

	async function handleSubmit(values: z.infer<typeof createHowlSchema>) {
		try {
			await mutation.mutateAsync(values);
			form.reset();
			onSuccess?.();
		} catch (error) {
			console.error("Failed to create howl:", error);
		}
	}

	return (
		<Card className={`${replying ? "w-full" : "max-w-md mx-auto"}`}>
			<CardContent className="p-4">
				<Form {...form}>
					<form
						onSubmit={form.handleSubmit(handleSubmit)}
						className="space-y-3"
					>
						<FormField
							control={form.control}
							name="content"
							render={({ field }) => (
								<FormItem>
									<FormControl>
										<Textarea
											{...field}
											rows={2}
											placeholder={
												replying ? "Write your reply..." : "What's happening?"
											}
											maxLength={140}
											className="resize-none border-0 shadow-none focus-visible:ring-0 text-lg"
										/>
									</FormControl>
									<div className="flex justify-between items-center">
										<FormMessage />
										<span className="text-sm text-gray-500">
											{field.value?.length || 0}/140
										</span>
									</div>
								</FormItem>
							)}
						/>

						<div className="flex justify-end">
							<Button
								type="submit"
								disabled={mutation.isPending}
								className="shadow"
							>
								{mutation.isPending
									? "Posting..."
									: replying
										? "Reply"
										: "Post"}
							</Button>
						</div>

						{mutation.isError && (
							<div className="text-red-600 text-sm bg-red-50 p-2 rounded-md">
								Failed to post howl. Please try again.
							</div>
						)}
					</form>
				</Form>
			</CardContent>
		</Card>
	);
}
