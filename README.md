# Obsidian Vim Reading View Navigation

This plugin allows to scroll with <kbd>j</kbd> and <kbd>k</kbd> in the Reading View.

It also lets you navigate with <kbd>gg</kbd> and <kbd>G</kbd> to the top or bottom of a note. (When embeds are present, you may need to press <kbd>G</kbd> more than once.)

## Known limitations

If the search or search/replace is opened, and then the settings are opened and/or somewhere else `Escape` is used without it closing the search modal, only clicking on the close button or toggling reading/edit mode will back bring back the vim navigation for reading view.

The same applies to opening multiple search or search/replace in multiple leaves and using `Escape` to close them because `Escape` is listened to per active window.

## Configuration

The scroll speed can be configured in the settings.

## Installation

It can be installed manually or via BRAT. It is not in the community plugins.

## Credits

Thank you to @pjeby for the [monkey-around](https://github.com/pjeby/monkey-around) library which is used for monkey-patching an internal method.

