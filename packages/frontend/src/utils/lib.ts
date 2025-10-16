import { differenceInHours, isThisYear, isToday } from "date-fns";

export function generateRandomString(length: number) {
	return Math.random()
		.toString(36)
		.substring(2, 2 + length);
}

export function camelCaseToTitleCase(camelCaseString: string) {
	if (!camelCaseString) {
		return "";
	}

	// Insert a space before each uppercase letter that follows a lowercase letter
	const spacedString = camelCaseString.replace(/([a-z])([A-Z])/g, "$1 $2");

	// Capitalize the first letter of the entire string
	const titleCaseString =
		spacedString.charAt(0).toUpperCase() + spacedString.slice(1);

	// Trim any leading or trailing spaces
	return titleCaseString.trim();
}

export function formatDate(date: string) {
	const dateObj = new Date(date);
	if (isToday(dateObj)) {
		return `${differenceInHours(new Date(), dateObj)}h`;
	}
	return dateObj.toLocaleDateString("en-US", {
		month: "short",
		day: "numeric",
		year: isThisYear(dateObj) ? undefined : "numeric",
	});
}
