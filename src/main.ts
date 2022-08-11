import {
	App,
	MarkdownView,
	Notice,
	Plugin,
	PluginSettingTab,
	Scope,
	Setting,
	WorkspaceLeaf,
} from 'obsidian';

interface VimScrollSetting {
	scrollDifference: number;
}

const DEFAULT_SETTINGS: VimScrollSetting = { scrollDifference: 1 };

const registerScopes = (scope: Scope, plugin: VimReadingViewNavigation) => {
	const self = plugin;
	// Scroll down
	scope.register([], 'j', (evt: KeyboardEvent) => {
		const leaf = app.workspace.getActiveViewOfType(MarkdownView);
		self.keyArray = self.resetJumpTop();
		if (leaf.getMode() === 'preview' && !self.displayValue(leaf)) {
			self.scrollDown(leaf);
			return false;
		}
		return true;
	});

	// Scroll up
	scope.register([], 'k', (evt: KeyboardEvent) => {
		const leaf = app.workspace.getActiveViewOfType(MarkdownView);
		self.keyArray = self.resetJumpTop();
		if (leaf.getMode() === 'preview' && !self.displayValue(leaf)) {
			self.scrollUp(leaf);
			return false;
		}
		return true;
	});
	scope.register([], 'g', (evt: KeyboardEvent) => {
		const leaf = app.workspace.getActiveViewOfType(MarkdownView);
		if (
			leaf.getMode() === 'preview' &&
			!self.displayValue(leaf) &&
			evt.key === 'g'
		) {
			if (self.keyArray.length === 0) {
				addEventListener('keydown', self.jumpTopEvent);
				self.keyArray.push(evt.key);
				return false;
			}
		}
		return true;
	});

	// Jump to bottom
	//  1st evt registers g when CapsLock is on
	//  2nd evt registers Shift+g
	scope.register([], 'g', (evt: KeyboardEvent) => {
		const leaf = app.workspace.getActiveViewOfType(MarkdownView);
		if (
			leaf.getMode() === 'preview' &&
			!self.displayValue(leaf) &&
			evt.key === 'G'
		) {
			self.keyArray = self.resetJumpTop();
			self.jumpBottom(leaf);
			return false;
		}
		return true;
	});
	scope.register(['Shift'], 'g', (evt: KeyboardEvent) => {
		const leaf = app.workspace.getActiveViewOfType(MarkdownView);
		self.keyArray = self.resetJumpTop();
		if (leaf.getMode() === 'preview' && !self.displayValue(leaf)) {
			self.jumpBottom(leaf);
			return false;
		}
		return true;
	});
};

export default class VimReadingViewNavigation extends Plugin {
	settings: VimScrollSetting;
	navScope: Scope;
	jumpTopEvent: (event: KeyboardEvent) => void;
	keyArray: string[] = [];

	async onload() {
		await this.loadSettings();
		this.addSettingTab(new VimScrollSettingTab(this.app, this));

		// Jump to top
		this.jumpTopEvent = (event: KeyboardEvent) => {
			if (event.key != 'g') {
				this.keyArray = this.resetJumpTop();
			} else {
				const leaf = app.workspace.getActiveViewOfType(MarkdownView);
				leaf.previewMode.applyScroll(0);
				this.keyArray = this.resetJumpTop();
			}
		};

		this.navScope = new Scope(app.scope);
		registerScopes(this.navScope, this);
		app.keymap.pushScope(this.navScope);

		console.log('Vim Reading View Navigation loaded.');
	}

	displayValue(leaf: MarkdownView): boolean {
		const exists = leaf.contentEl.getElementsByClassName(
			'document-search-container'
		)[0];
		if (exists) {
			return true;
		} else {
			return false;
		}
	}

	async onunload() {
		app.keymap.popScope(this.navScope);
		removeEventListener('keydown', this.jumpTopEvent);
		console.log('Vim Reading View Navigation unloaded.');
	}

	resetJumpTop(): string[] {
		removeEventListener('keydown', this.jumpTopEvent);
		return [];
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

	jumpBottom(leaf: MarkdownView) {
		let scroll = this.getScroll(leaf);
		leaf.previewMode.applyScroll(scroll + 5);
		let newScroll = this.getScroll(leaf);

		while (newScroll != scroll) {
			scroll = newScroll;
			leaf.previewMode.applyScroll(scroll + 5);
			newScroll = this.getScroll(leaf);
		}
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

		containerEl.createEl('h2', { text: 'Vim Reading View Navigation' });

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
