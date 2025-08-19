import { type AnyFieldApi, useForm } from "@tanstack/react-form";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { type CreateHowlInput, createHowlSchema } from "@/schemas/howls";
import api from "@/utils/client";

export default function AddHowlForm() {
	const queryClient = useQueryClient();

	const mutation = useMutation({
		mutationFn: (data: CreateHowlInput) => {
			return api.howls.$post({ json: data });
		},
		onSuccess: () => {
			// Invalidate and refetch howls after successful creation
			queryClient.invalidateQueries({ queryKey: ["howls"] });
		},
	});

	const form = useForm({
		defaultValues: {
			content: "",
			userId: "Jf9dPzw5oy9_n5Fu5KWSs", // TODO: Get actual user ID from auth context
		},
		onSubmit: async ({ value }) => {
			try {
				// Validate with Zod before submission
				const validationResult = createHowlSchema.safeParse(value);
				if (!validationResult.success) {
					console.error("Validation failed:", validationResult.error);
					return;
				}
				console.log("cool");
				await mutation.mutateAsync(validationResult.data);
				// Reset form on success
				form.reset();
			} catch (error) {
				console.error("Failed to create howl:", error);
			}
		},
	});

	return (
		<div className="max-w-md mx-auto p-6 bg-white rounded-lg shadow-md">
			<h1 className="text-2xl font-bold mb-4 text-gray-800">Add Howl</h1>
			<form
				onSubmit={(e) => {
					e.preventDefault();
					e.stopPropagation();
					form.handleSubmit();
				}}
				className="space-y-4"
			>
				<form.Field
					name="content"
					children={(field) => {
						return (
							<div>
								<label
									htmlFor={field.name}
									className="block text-sm font-medium text-gray-700 mb-2"
								>
									Content
								</label>
								<textarea
									id={field.name}
									name={field.name}
									value={field.state.value}
									onBlur={field.handleBlur}
									onChange={(e) => field.handleChange(e.target.value)}
									className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
									rows={3}
									placeholder="What's happening?"
									maxLength={140}
								/>
								<div className="flex justify-between items-center mt-1">
									<FieldInfo field={field} />
									<span className="text-sm text-gray-500">
										{field.state.value.length}/140
									</span>
								</div>
							</div>
						);
					}}
				/>

				<form.Subscribe
					selector={(state) => [state.canSubmit, state.isSubmitting]}
					children={([canSubmit, isSubmitting]) => (
						<button
							type="submit"
							disabled={!canSubmit || isSubmitting}
							className="w-full bg-blue-600 text-white py-2 px-4 rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed"
						>
							{isSubmitting ? "Posting..." : "Post Howl"}
						</button>
					)}
				/>

				{mutation.isError && (
					<div className="text-red-600 text-sm bg-red-50 p-3 rounded-md">
						Failed to post howl. Please try again.
					</div>
				)}
			</form>
		</div>
	);
}

function FieldInfo({ field }: { field: AnyFieldApi }) {
	// Client-side validation using Zod
	const contentValidation = createHowlSchema.shape.content.safeParse(
		field.state.value,
	);
	const hasError = field.state.meta.isTouched && !contentValidation.success;

	return (
		<>
			{hasError && (
				<span className="text-red-600 text-sm">
					{contentValidation.error?.issues[0]?.message}
				</span>
			)}
			{field.state.meta.isValidating ? (
				<span className="text-blue-600 text-sm">Validating...</span>
			) : null}
		</>
	);
}
