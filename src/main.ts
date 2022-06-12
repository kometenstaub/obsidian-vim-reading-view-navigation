import { around } from "monkey-around";
import {
	MarkdownPreviewView,
	MarkdownView,
	Notice,
	Plugin,
	PluginSettingTab, Scope,
	Setting,
	View,
	WorkspaceLeaf,
} from "obsidian";

/*
// add type safety for the undocumented methods
declare module 'obsidian' {
	interface Vault {
		setConfig: (config: string, newValue: boolean) => void;
		getConfig: (config: string) => boolean;
	}
}
*/

interface VimScrollSetting {
	scrollDifference: number;
}

const DEFAULT_SETTINGS: VimScrollSetting = { scrollDifference: 1 };


export default class VimReadingViewNavigation extends Plugin {
	//vimNavUninstaller: any;
	uninstall = false;
	settings: VimScrollSetting;

	async onload() {

		await this.loadSettings();
		this.addSettingTab(new VimScrollSettingTab(this.app, this));

		this.registerEvent(app.workspace.on("layout-change", () => {
			const leaf = app.workspace.getActiveViewOfType(MarkdownView)
			const navScope = new Scope(app.scope)
			const downScroll = navScope.register([], "j", (evt: KeyboardEvent) => {
				if (leaf.getMode() === 'preview') {
					this.scrollDown();
					return false;
				}
				return true
			})
			const upScroll = navScope.register([], "k", (evt: KeyboardEvent) => {
				if (leaf.getMode() === 'preview') {
					this.scrollUp();
					return false;
				}
				return true
			})
			app.keymap.pushScope(navScope)

		}))

/*
			this.app.workspace.onLayoutReady(() => {

				this.vimNavUninstaller = around(
					View.prototype,
					{
						onOpen(oldMethod: any) {
							return function (...args: any[]) {
								//const { view } = args.at(0)
								console.log(args)
								//const { register } = view.leaf.workspace.scope
								const view = app.workspace.getActiveViewOfType(MarkdownView)
								console.log(view)
								const { register } = view.leaf.workspace.scope
								console.log(register)
								//const { register } = vi
								register([], "j", (evt: KeyboardEvent) => {
									scrollDown();
									return false;
								})
								register([], "k", (evt: KeyboardEvent) => {
									scrollUp();
									return false;
								})

								const result =
									oldMethod.apply(this, args);
								return result;
							};
						},
					}
				);
				this.uninstall = true;
			})
*/
		console.log('Vim Reading View Navigation loaded.');
	}
	async onunload() {
/*
		if (this.uninstall) this.vimNavUninstaller();
*/

		console.log('Vim Reading View Navigation unloaded.');
	}

	getScroll(): [leaf: MarkdownView, scroll: number] | null{
		const leaf = app.workspace.getActiveViewOfType(MarkdownView)
		if (leaf.getMode() === 'preview') {
			return [leaf, leaf.previewMode.getScroll()]
		} else {
			return null
		}
	}

	scrollDown(){
		const [leaf, scroll] = this.getScroll()
		leaf.previewMode.applyScroll(scroll + this.settings.scrollDifference)
	}

	scrollUp(){
		const [leaf, scroll] = this.getScroll()
		leaf.previewMode.applyScroll(scroll - this.settings.scrollDifference)
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

class VimScrollSettingTab extends PluginSettingTab {
	plugin: VimReadingViewNavigation;

	constructor(app: App, plugin: VimReadingViewNavigation) {
		super(app, plugin);
		this.plugin = plugin;
	}

	display(): void {
		const { containerEl } = this;
		const { settings } = this.plugin;

		containerEl.empty();

		containerEl.createEl('h2', { text: 'Yank Highlighter settings' });

		new Setting(containerEl)
			.setName('Highlight timeout')
			.setDesc('The timeout is in milliseconds.')
			.addText((text) => {
				text.setPlaceholder(
					'Enter a number greater than 0. Default: 2000'
				)
					.setValue(settings.timeout.toString())
					.onChange(async (value) => {
						const num = Number.parseInt(value);
						if (Number.isInteger(num) && num > 0) {
							settings.timeout = num;
							await this.plugin.saveSettings();
						} else {
							new Notice(
								'Please enter an integer greater than 0.'
							);
						}
					});
			});
	}
}

class Scroll {
	plugin: VimReadingViewNavigation;

	constructor(plugin: VimReadingViewNavigation) {
		this.plugin = plugin;
	}

}
