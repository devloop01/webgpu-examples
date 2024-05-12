export function groupBy<T, K extends PropertyKey>(arr: T[], keySelector: (i: T) => K) {
	return arr.reduce(
		(groups, item) => {
			(groups[keySelector(item)] ||= []).push(item);
			return groups;
		},
		{} as Record<K, T[]>
	);
}
