import { EventRef, Events, MarkdownView, Notice, Plugin, PluginSettingTab, Setting } from "obsidian";
import { around } from "monkey-around";
import { Decoration, DecorationSet, EditorView, ViewPlugin, ViewUpdate } from "@codemirror/view";

// add type safety for the undocumented methods
declare module "obsidian" {
	interface Vault {
		setConfig: (config: string, newValue: boolean) => void;
		getConfig: (config: string) => boolean;
	}
}

interface YankSettings {
	timeout: number;
}

const DEFAULT_SETTINGS: YankSettings = { timeout: 2000 };

class YankEvent extends Events {
	on(name: "vim-yank", callback: (text: string) => void): EventRef;
	on(name: string, callback: (...data: any) => any, ctx?: any): EventRef {
		return super.on(name, callback, ctx);
	}
}

// cm6 view plugin
function matchHighlighter (evt: YankEvent, timeout: number) {
	return ViewPlugin.fromClass(
		class {
			decorations: DecorationSet;
			// highlightTime: number;

			constructor(view: EditorView) {
				this.decorations = Decoration.none;
				evt.on("vim-yank", (text) => {
					const [cursorFrom, cursorTo] = this.getPositions();
					this.decorations = this.makeYankDeco(view, cursorFrom, cursorTo);
					// timeout needs to be configured in settings
					window.setTimeout(() => this.decorations = Decoration.none, timeout);
				}
				);
			}
			// update unnecessary because highlight gets removed by timeout; otherwise it would never apply the classes
			// update(update: ViewUpdate) {
			//	if (update.selectionSet || update.docChanged || update.viewportChanged) {
			//		this.decorations = Decoration.none;
			//		// this.makeYankDeco(update.view);
			//
			// }

			getPositions() {
				// @ts-expect-error, not typed
				const { editor } = app.workspace.activeLeaf.view;
				const cursorFrom = editor.posToOffset(app.workspace.getActiveViewOfType(MarkdownView)
					.editor
					.getCursor("from"));
				const cursorTo = editor.posToOffset(app.workspace.getActiveViewOfType(MarkdownView)
					.editor
					.getCursor("to"));
				return [cursorFrom, cursorTo];
			}

			makeYankDeco(view: EditorView, posFrom: number, posTo: number) {
				const deco = [];
				const yankDeco = Decoration.mark({
					class: "yank-deco",
					attributes: { "data-contents": "string" },
				});
				deco.push(yankDeco.range(posFrom, posTo));
				return Decoration.set(deco);
			}
		},
		{ decorations: (v) => v.decorations }
	);
}


export default class YankHighlighter extends Plugin {
	yankEventUninstaller: any;
	uninstall = false;
	yank: YankEvent;
	settings: YankSettings;

	async onload() {
		await this.loadSettings();
		this.addSettingTab(new YankSettingTab(this.app, this));
		if (this.app.vault.getConfig("vimMode")) {
			const yank = new YankEvent();
			// @ts-ignore
			this.yankEventUninstaller = around(window.CodeMirrorAdapter?.Vim.getRegisterController(), {
				pushText(oldMethod: any) {
					return function (...args: any[]) {
						if (args.at(1) === "yank")
							yank.trigger("vim-yank", args.at(2));

						const result = oldMethod && oldMethod.apply(this, args);
						return result;
					};
				}
			});
			this.registerEditorExtension( matchHighlighter(yank, this.settings.timeout) );
			this.uninstall = true;
		}
		console.log("Yank Highlight plugin loaded.");

	}
	async onunload() {
		if (this.uninstall) 
			this.yankEventUninstaller();

		console.log("Yank Highlight plugin unloaded.");
	}
	async loadSettings() {
		this.settings = Object.assign(
			{},
			DEFAULT_SETTINGS,
			await this.loadData()
		);
	}

	async saveSettings() {
		await this.saveData(this.settings);
	}
}

class YankSettingTab extends PluginSettingTab {
	plugin: YankHighlighter;

	constructor(app: App, plugin: SKOSPlugin) {
		super(app, plugin);
		this.plugin = plugin;
	}

	display(): void {
		const { containerEl } = this;
		const { settings } = this.plugin;

		containerEl.empty();

		containerEl.createEl("h2", { text: "Yank Highligher settings" });

		new Setting(containerEl)
			.setName("Highlight timeout")
			.setDesc(
				"The timeout is in milliseconds."
			)
			.addText((text) => {
				text.setPlaceholder(
					"Enter a number greater than 0. Default: 2000"
				)
					.setValue(settings.timeout.toString())
					.onChange(async (value) => {
						const num = Number.parseInt(value);
						if (Number.isInteger(num) && num > 0) {
							settings.timeout = num;
							await this.plugin.saveSettings();
						} else {
							new Notice(
								"Please enter an integer greater than 0."
							);
						}
					});
			});
	}}
