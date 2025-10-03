import { zodResolver } from "@hookform/resolvers/zod";
import { useMutation } from "@tanstack/react-query";
import type { InferResponseType } from "hono/client";
import { useForm } from "react-hook-form";
import { toast } from "sonner";
import { z } from "zod";
import { Button } from "@/components/ui/button";
import {
	Form,
	FormControl,
	FormField,
	FormItem,
	FormLabel,
	FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import {
	Select,
	SelectContent,
	SelectItem,
	SelectTrigger,
	SelectValue,
} from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import api from "@/utils/client";

type Models = InferResponseType<typeof api.models.$get>;

const addAgentSchema = z.object({
	prompt: z.string().min(1).max(65536),
	username: z.string().min(1).max(64),
	bio: z.string().min(1).max(255),
	modelId: z.string().min(10).max(10),
});

export default function AddAgentForm({ models }: { models: Models }) {
	const form = useForm<z.infer<typeof addAgentSchema>>({
		resolver: zodResolver(addAgentSchema),
		defaultValues: {
			prompt: "",
			username: "",
			bio: "",
			modelId: "8LeucqzfyZ",
		},
	});

	const mutation = useMutation({
		mutationFn: (values: z.infer<typeof addAgentSchema>) => {
			return api.agents.$post({ json: values });
		},
		onSuccess: () => {
			toast.success("Agent added successfully");
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
								<Textarea {...field} />
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
								<Input {...field} />
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
								<Textarea {...field} />
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
								<Select
									{...field}
									onValueChange={(value) => field.onChange(value)}
									defaultValue={field.value}
								>
									<SelectTrigger>
										<SelectValue placeholder="Select a model" />
									</SelectTrigger>
									<SelectContent>
										{models.map((model) => (
											<SelectItem key={model.id} value={model.id}>
												{model.name}
											</SelectItem>
										))}
									</SelectContent>
								</Select>
							</FormControl>
							<FormMessage />
						</FormItem>
					)}
				/>
				<Button type="submit" className="shadow">
					Add Agent
				</Button>
			</form>
		</Form>
	);
}
