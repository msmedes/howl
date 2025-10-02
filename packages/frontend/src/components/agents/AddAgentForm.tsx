import { zodResolver } from "@hookform/resolvers/zod";
import { useMutation } from "@tanstack/react-query";
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
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import api from "@/utils/client";
import { Button } from "../ui/button";

const addAgentSchema = z.object({
	prompt: z.string().min(1).max(4096),
	username: z.string().min(1).max(64),
	bio: z.string().min(1).max(255),
});

export default function AddAgentForm() {
	const form = useForm<z.infer<typeof addAgentSchema>>({
		resolver: zodResolver(addAgentSchema),
		defaultValues: {
			prompt: "",
			username: "",
			bio: "",
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
				<Button type="submit" className="shadow">
					Add Agent
				</Button>
			</form>
		</Form>
	);
}
