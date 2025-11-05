import { zodResolver } from "@hookform/resolvers/zod";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import type { InferResponseType } from "hono/client";
import { useForm } from "react-hook-form";
import { toast } from "sonner";
import { z } from "zod";
import {
	Form,
	FormControl,
	FormField,
	FormItem,
	FormLabel,
	FormMessage,
} from "@/components/ui/form";
import { HoverButton } from "@/components/ui/HoverButton";
import { HoverInput } from "@/components/ui/HoverInput";
import { HoverSelect, SelectItem } from "@/components/ui/HoverSelect";
import { HoverTextarea } from "@/components/ui/HoverTextarea";
import api from "@/utils/client";

type Models = InferResponseType<typeof api.models.$get>;

const addAgentSchema = z.object({
	prompt: z.string().min(1).max(65536),
	username: z.string().min(1).max(64),
	bio: z.string().min(1).max(255),
	modelId: z.string().min(10).max(10),
});

export default function AddAgentForm({ models }: { models: Models }) {
	const queryClient = useQueryClient();
	const form = useForm<z.infer<typeof addAgentSchema>>({
		resolver: zodResolver(addAgentSchema),
		defaultValues: {
			prompt: "",
			username: "",
			bio: "",
			modelId: models.find((model) => model.name === "claude-sonnet-4-0")?.id,
		},
	});

	const mutation = useMutation({
		mutationFn: (values: z.infer<typeof addAgentSchema>) => {
			return api.agents.$post({ json: values });
		},
		onSuccess: async () => {
			toast.success("Agent added successfully");
			await queryClient.invalidateQueries({ queryKey: ["agents"] });
		},
		onError: () => {
			toast.error("Failed to add agent");
		},
	});

	async function handleSubmit(values: z.infer<typeof addAgentSchema>) {
		try {
			await mutation.mutateAsync(values);
			form.reset();
		} catch (error) {
			console.error("Failed to add agent:", error);
		}
	}

	return (
		<Form {...form}>
			<form
				onSubmit={form.handleSubmit(handleSubmit)}
				className="w-2/3 mx-auto space-y-4 mt-10"
			>
				<FormField
					control={form.control}
					name="prompt"
					render={({ field }) => (
						<FormItem>
							<FormLabel>Prompt</FormLabel>
							<FormControl>
								<HoverTextarea {...field} />
							</FormControl>
							<FormMessage />
						</FormItem>
					)}
				/>
				<FormField
					control={form.control}
					name="username"
					render={({ field }) => (
						<FormItem>
							<FormLabel>Username</FormLabel>
							<FormControl>
								<HoverInput {...field} />
							</FormControl>
							<FormMessage />
						</FormItem>
					)}
				/>
				<FormField
					control={form.control}
					name="bio"
					render={({ field }) => (
						<FormItem>
							<FormLabel>Bio</FormLabel>
							<FormControl>
								<HoverTextarea {...field} />
							</FormControl>
							<FormMessage />
						</FormItem>
					)}
				/>
				<FormField
					control={form.control}
					name="modelId"
					render={({ field }) => (
						<FormItem>
							<FormLabel>Model</FormLabel>
							<FormControl>
								<HoverSelect
									{...field}
									onValueChange={(value) => field.onChange(value)}
									defaultValue={field.value}
								>
									{models.map((model) => (
										<SelectItem key={model.id} value={model.id}>
											{model.name}
										</SelectItem>
									))}
								</HoverSelect>
							</FormControl>
							<FormMessage />
						</FormItem>
					)}
				/>
				<HoverButton type="submit">Add Agent</HoverButton>
			</form>
		</Form>
	);
}
