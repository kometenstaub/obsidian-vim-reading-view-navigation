import {
	MarkdownView,
	Notice,
	Plugin,
	PluginSettingTab,
	Scope,
	Setting,
} from 'obsidian';

interface VimScrollSetting {
	scrollDifference: number;
}

const DEFAULT_SETTINGS: VimScrollSetting = { scrollDifference: 1 };

export default class VimReadingViewNavigation extends Plugin {
	settings: VimScrollSetting;
	navScope: Scope;

	async onload() {
		await this.loadSettings();
		this.addSettingTab(new VimScrollSettingTab(this.app, this));

		this.navScope = new Scope(app.scope);
		const downScroll = this.navScope.register(
			[],
			'j',
			(evt: KeyboardEvent) => {
				const leaf = app.workspace.getActiveViewOfType(MarkdownView);
				if (leaf.getMode() === 'preview') {
					this.scrollDown(leaf);
					return false;
				}
				return true;
			}
		);
		const upScroll = this.navScope.register(
			[],
			'k',
			(evt: KeyboardEvent) => {
				const leaf = app.workspace.getActiveViewOfType(MarkdownView);
				if (leaf.getMode() === 'preview') {
					this.scrollUp(leaf);
					return false;
				}
				return true;
			}
		);
		app.keymap.pushScope(this.navScope);

		console.log('Vim Reading View Navigation loaded.');
	}
	async onunload() {
		app.keymap.popScope(this.navScope);
		console.log('Vim Reading View Navigation unloaded.');
	}

	getScroll(leaf: MarkdownView): number {
		return leaf.previewMode.getScroll();
	}

	scrollDown(leaf: MarkdownView) {
		const scroll = this.getScroll(leaf);
		leaf.previewMode.applyScroll(scroll + this.settings.scrollDifference);
	}

	scrollUp(leaf: MarkdownView) {
		const scroll = this.getScroll(leaf);
		leaf.previewMode.applyScroll(scroll - this.settings.scrollDifference);
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
			.setName('Scroll amount')
			.setDesc('It must be greater than 0.')
			.addText((text) => {
				text.setPlaceholder('Enter a number greater than 0. Default: 1')
					.setValue(settings.scrollDifference.toString())
					.onChange(async (value) => {
						const num = Number.parseInt(value);
						if (Number.isInteger(num) && num > 0) {
							settings.scrollDifference = num;
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
