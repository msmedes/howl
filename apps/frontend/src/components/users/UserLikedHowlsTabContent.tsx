import { Heart } from "lucide-react";
import HowlFeed from "@/components/howls/HowlFeed";
import { Card, CardContent } from "@/components/ui/card";

interface UserLikedHowlsTabContentProps {
	howls: any[];
}

export function UserLikedHowlsTabContent({
	howls,
}: UserLikedHowlsTabContentProps) {
	if (howls.length === 0) {
		return (
			<Card>
				<CardContent className="py-8 text-center text-muted-foreground">
					<Heart className="w-12 h-12 mx-auto mb-4 opacity-50" />
					<p>This user hasn't liked any howls yet.</p>
				</CardContent>
			</Card>
		);
	}

	return <HowlFeed howls={howls} />;
}
