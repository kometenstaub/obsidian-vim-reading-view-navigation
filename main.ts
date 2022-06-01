import { Editor, MarkdownView, Notice, Plugin, htmlToMarkdown } from "obsidian";
import clipboardModifications from "clipboardModification";

interface PasteFunction {
	(this: HTMLElement, ev: ClipboardEvent): void;
}

// add type safety for the undocumented methods
declare module "obsidian" {
	interface Vault {
		setConfig: (config: string, newValue: boolean) => void;
		getConfig: (config: string) => boolean;
	}
}

export default class SmarterPasting extends Plugin {
	pasteFunction: PasteFunction;

	async onload() {
		console.log("Pasta Copinara Plugin loaded.");

		this.pasteFunction = this.modifyPasteEvent.bind(this); // Listen to paste event

		this.registerEvent(
			this.app.workspace.on("editor-paste", this.pasteFunction)
		);

		this.addCommand({
			id: "paste-as-plain-text",
			name: "Paste as Plain Text & without Modifications",
			editorCallback: (editor) => this.pasteAsPlainText(editor),
		});


	}
	async onunload() { console.log("Pasta Copinara Plugin unloaded.") }

	private getEditor(): Editor {
		const activeLeaf = this.app.workspace.getActiveViewOfType(MarkdownView);
		if (!activeLeaf) return;
		return activeLeaf.editor;
	}

	async modifyPasteEvent (clipboardEv: ClipboardEvent): Promise<void> {

		const editor = this.getEditor();
		if (!editor) return; // pane isn't markdown editor

		// check for plain text, too, since getData("text/html") ignores plain-text
		const plainClipboard = clipboardEv.clipboardData.getData("text/plain");
		if (!plainClipboard) return; // e.g. when clipboard contains image

		// prevent conflict with Auto Title Link Plugin
		const linkRegex = /^((?:[a-z][\w-]+:(?:\/{1,3}|[a-z0-9%])|www\d{0,3}[.]|[a-z0-9.-]+[.][a-z]{2,4}\/)(?:[^\s()<>]+|\(([^\s()<>]+|(\([^\s()<>]+\)))*\))+(?:\(([^\s()<>]+|(\([^\s()<>]+\)))*\)|[^\s`!()[\]{};:'".,<>?«»“”‘’]))$/i;
		if (linkRegex.test(plainClipboard.trim())) {
			console.log("Pasta Copinara aborted due to being link to avoid conflict with the Auto Title Link Plugin.");
			return;
		}

		// prevent default pasting --> https://github.com/obsidianmd/obsidian-api/blob/master/obsidian.d.ts#L3801
		clipboardEv.stopPropagation();
		clipboardEv.preventDefault();

		// use Turndown via Obsidian API to emulate "Auto Convert HTML" setting
		let clipboardText;
		const convertHtmlEnabled = this.app.vault.getConfig("autoConvertHtml");
		const htmlClipboard = clipboardEv.clipboardData.getData("text/html");
		if (htmlClipboard && convertHtmlEnabled) clipboardText = htmlToMarkdown(htmlClipboard);
		else clipboardText = plainClipboard;

		if (clipboardEv.defaultPrevented) clipboardModifications(editor, clipboardText);
	}

	async pasteAsPlainText (editor: Editor): Promise<void> {
		const clipboardContent = await navigator.clipboard.readText();
		if (!clipboardContent) {
			new Notice ("There is no clipboard content.");
			return;
		}
		editor.replaceSelection(clipboardContent);
	}

}
