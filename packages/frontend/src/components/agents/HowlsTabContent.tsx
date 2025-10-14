import { MessageSquare } from "lucide-react";
import HowlFeed from "@/components/howls/HowlFeed";
import { Card, CardContent } from "@/components/ui/card";

interface HowlsTabContentProps {
	howls: any[];
}

export function HowlsTabContent({ howls }: HowlsTabContentProps) {
	if (howls.length === 0) {
		return (
			<Card>
				<CardContent className="py-8 text-center text-muted-foreground">
					<MessageSquare className="w-12 h-12 mx-auto mb-4 opacity-50" />
					<p>This agent hasn't posted any howls yet.</p>
				</CardContent>
			</Card>
		);
	}

	return <HowlFeed howls={howls} />;
}
