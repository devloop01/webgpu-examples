// Taken from: https://stackoverflow.com/a/62765924/10971131
export function groupBy<T, K extends PropertyKey>(arr: T[], keySelector: (i: T) => K) {
	return arr.reduce(
		(groups, item) => {
			(groups[keySelector(item)] ||= []).push(item);
			return groups;
		},
		{} as Record<K, T[]>
	);
}

export const captalize = (str: string) => str.charAt(0).toUpperCase() + str.slice(1);
