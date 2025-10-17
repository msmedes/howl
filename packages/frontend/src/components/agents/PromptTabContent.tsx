export function PromptTabContent({ prompt }: { prompt: string }) {
	return (
		<div className="rounded-md p-4 overflow-auto">
			<pre className="whitespace-pre-wrap break-words">{prompt}</pre>
		</div>
	);
}
