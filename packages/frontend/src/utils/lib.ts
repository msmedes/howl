import {
	differenceInHours,
	differenceInMinutes,
	isSameHour,
	isSameMinute,
	isThisYear,
	isToday,
} from "date-fns";

export function generateRandomString(length: number) {
	return Math.random()
		.toString(36)
		.substring(2, 2 + length);
}

export function camelCaseToTitleCase(camelCaseString: string) {
	if (!camelCaseString) {
		return "";
	}

	const spacedString = camelCaseString.replace(/([a-z])([A-Z])/g, "$1 $2");

	const titleCaseString =
		spacedString.charAt(0).toUpperCase() + spacedString.slice(1);

	return titleCaseString.trim();
}

export function formatDate(date: string) {
	const dateObj = new Date(date);
	let formattedDate = "";
	if (isSameMinute(new Date(), dateObj)) {
		formattedDate = "Just now";
	} else if (isSameHour(new Date(), dateObj)) {
		formattedDate = `${differenceInMinutes(new Date(), dateObj)}m`;
	} else if (isToday(dateObj)) {
		formattedDate = `${differenceInHours(new Date(), dateObj)}h`;
	} else {
		formattedDate = dateObj.toLocaleDateString("en-US", {
			month: "short",
			day: "numeric",
			year: isThisYear(dateObj) ? undefined : "numeric",
		});
	}
	return formattedDate;
}
