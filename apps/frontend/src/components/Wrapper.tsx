export default function Wrapper({ children }: { children: React.ReactNode }) {
	return (
		<div className="mx-auto w-full xs:px-0 sm:px-16 md:px-32 lg:px-40">
			{children}
		</div>
	);
}
