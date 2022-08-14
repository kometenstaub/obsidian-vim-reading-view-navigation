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
	oldObserver: MutationObserver;
	observers: MutationObserver[] = [];

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

		app.workspace.on('active-leaf-change', (leaf) => {
			if (leaf.view.getViewType() === 'markdown') {
				if (this.oldObserver) {
					this.oldObserver.disconnect();
					this.observers.remove(this.oldObserver);
				}
				this.oldObserver = new MutationObserver(
					(mutations: MutationRecord[]) => {
						for (let j = 0; j < mutations.length; j++) {
							const el = mutations[j];
							const nodes = el.addedNodes;
							for (let i = 0; i < nodes.length; i++) {
								const node = nodes[i];
								if (
									node.classList?.value ===
									'document-search-container'
								) {
									app.keymap.popScope(this.navScope);
									const button =
										leaf.view.containerEl.getElementsByClassName(
											'document-search-close-button'
										)[0];
									if (!button) return;
									button.addEventListener(
										'click',
										() => {
											app.keymap.pushScope(this.navScope);
										},
										{ capture: false, once: true }
									);
									activeWindow.addEventListener(
										'keydown',
										listener,
										{ capture: false }
									);
									return;
								}
							}
						}
					}
				);
				this.oldObserver.observe(leaf.view.containerEl, {
					childList: true,
					subtree: true,
				});
				// disconnect all later
				this.observers.push(this.oldObserver);
			}
		});

		const listener = (event: KeyboardEvent) => {
			if (event.key === 'Escape') {
				app.keymap.pushScope(this.navScope);
				activeWindow.removeEventListener('keydown', listener, {
					capture: false,
				});
			}
		};
		console.log('Vim Reading View Navigation loaded.');
	}

	// Only needed when settings opened while search open and Esc didn't close it and
	// user wants to continue searching.
	// As long as the search is visible and the scope is still active because Esc didn't work
	// remove the scope.
	displayValue(leaf: MarkdownView): boolean {
		const exists = leaf.contentEl.getElementsByClassName(
			'document-search-container'
		)[0];
		if (exists) {
			app.keymap.popScope(this.navScope);
			return true;
		} else {
			return false;
		}
	}

	async onunload() {
		app.keymap.popScope(this.navScope);
		removeEventListener('keydown', this.jumpTopEvent);
		// at this point there should only be one
		for (const obs of this.observers) {
			obs.disconnect();
		}
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
