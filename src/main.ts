import {
    App,
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
    jumpTopEvent: (event: KeyboardEvent) => void;

    async onload() {
        await this.loadSettings();
        this.addSettingTab(new VimScrollSettingTab(this.app, this));
        this.navScope = new Scope(app.scope);

        // Scroll down
        this.navScope.register([], 'j', (evt: KeyboardEvent) => {
            const leaf = app.workspace.getActiveViewOfType(MarkdownView);
            keyArray = this.resetJumpTop();
            if (
                leaf.getMode() === 'preview' &&
                this.displayValue(leaf) === 'none'
            ) {
                this.scrollDown(leaf);
                return false;
            }
            return true;
        });

        // Scroll up
        this.navScope.register([], 'k', (evt: KeyboardEvent) => {
            const leaf = app.workspace.getActiveViewOfType(MarkdownView);
            keyArray = this.resetJumpTop();
            if (
                leaf.getMode() === 'preview' &&
                this.displayValue(leaf) === 'none'
            ) {
                this.scrollUp(leaf);
                return false;
            }
            return true;
        });

        // Jump to top
        let keyArray: string[] = [];
        this.jumpTopEvent = (event: KeyboardEvent) => {
            if (event.key != 'g') {
                keyArray = this.resetJumpTop();
            } else {
                const leaf = app.workspace.getActiveViewOfType(MarkdownView);
                leaf.previewMode.applyScroll(0);
                keyArray = this.resetJumpTop();
            }
        }
        this.navScope.register([], 'g', (evt: KeyboardEvent) => {
            const leaf = app.workspace.getActiveViewOfType(MarkdownView);
            if (
                leaf.getMode() === 'preview' &&
                this.displayValue(leaf) === 'none' &&
                evt.key === 'g'
            ) {
                if (keyArray.length === 0) {
                    addEventListener('keydown', this.jumpTopEvent);
                    keyArray.push(evt.key);
                    return false;
                }
            }
            return true;
        });

        // Jump to bottom
        //  1st evt registers g when CapsLock is on
        //  2nd evt registers Shift+g
        this.navScope.register([], 'g', (evt: KeyboardEvent) => {
            const leaf = app.workspace.getActiveViewOfType(MarkdownView);
            if (
                leaf.getMode() === 'preview' &&
                this.displayValue(leaf) === 'none' &&
                evt.key === 'G'
            ) {
                keyArray = this.resetJumpTop();
                this.jumpBottom(leaf);
                return false;
            }
            return true;
        });
        this.navScope.register(['Shift'], 'g', (evt: KeyboardEvent) => {
            const leaf = app.workspace.getActiveViewOfType(MarkdownView);
            keyArray = this.resetJumpTop();
            if (
                leaf.getMode() === 'preview' &&
                this.displayValue(leaf) === 'none'
            ) {
                this.jumpBottom(leaf);
                return false;
            }
            return true;
        });

        app.keymap.pushScope(this.navScope);
        console.log('Vim Reading View Navigation loaded.');
    }

    displayValue(leaf: MarkdownView): string {
        return leaf.contentEl
            .getElementsByClassName('markdown-reading-view')[0]
            .getElementsByClassName('document-search-container')[0]
            .getCssPropertyValue('display');
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
