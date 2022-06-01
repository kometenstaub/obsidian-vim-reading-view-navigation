import { Editor } from "obsidian";

function toIso8601 (date: Date): string {
	return date
		.toLocaleString("en-GB")
		.replace(/(\d{2})\/(\d{2})\/(\d{4}).*/, "$3-$2-$1");
}

function basicModifications(str: string): string {
	return str = str
		.replace(/(\S)-\s+\n?(?=\w)/g, "$1") // remove leftover hyphens when copying from PDFs
		.replace(/\n{3,}/g, "\n\n") // remove excessive blank lines
		.trim();
}

function fromTwitterModifications(str: string): string {
	// copypaste from Twitter Website
	const isFromTwitter = /\[.*@(\w+).*]\(https:\/\/twitter\.com\/\w+\)\n\n(.*)$/s.test(str);

	if (isFromTwitter) {
		str = str.replace(
			/\[.*@(\w+).*]\(https:\/\/twitter\.com\/\w+\)\n\n(.*)$/gs,
			//   (nick)                                    (tweet)
			"$2\n — [@$1](https://twitter.com/$1)"
		);
	}

	return str;
}

function fromDiscordModifications(str: string): string {

	// URL from any image OR pattern from the line containing username + time
	const isFromDiscord = str.includes("https://cdn.discordapp") || /^## .*? _—_ .*:.*$/m.test(str);

	if (isFromDiscord) {
		const today = new Date();
		const yesterday = new Date(new Date().setDate(new Date().getDate() - 1)); // JS, why u be like this? >:(
		const todayISO = toIso8601(today);
		const yesterdayISO = toIso8601(yesterday);

		str = str
			.replace( // reformat line with username + time
				/^(?:\d.)?\s*## (.*?)(?:!.*?\))? _—_ (.*)/gm,
				//  				(nick)(roleIcon)     (time)
				"__$1__ ($2)  " // two spaces for strict line breaks option
			)
			.replace(/^.*cdn\.discordapp\.com\/avatars.*?\n/gm, "") // avatars removed
			.replace(/\(Today at /g, `(${todayISO}, `) // replace relative w/ absolute date
			.replace(/\(Yesterday at /g, `(${yesterdayISO}, `)
			.replace(/^\s+/gm, "") // remove leading whitespaces
			.replace(/^\s*\n/gm, "") // remove blank lines
			.replace(/\n__/g, "\n\n__"); // add blank lines on speaker change
	}

	return str;
}

export default function clipboardModifications (editor: Editor, text: string): void {

	text = basicModifications(text);
	text = fromDiscordModifications(text);
	text = fromTwitterModifications(text);

	editor.replaceSelection(text);
}
