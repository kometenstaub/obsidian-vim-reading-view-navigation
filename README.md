# Pasta Copinara 🍝

![](https://img.shields.io/github/downloads/chrisgrieser/obsidian-smarter-paste/total?label=Total%20Downloads&style=plastic) ![](https://img.shields.io/github/v/release/chrisgrieser/obsidian-smarter-paste?label=Latest%20Release&style=plastic) [![](https://img.shields.io/badge/changelog-click%20here-FFE800?style=plastic)](Changelog.md)

Improved copypasting from PDFs and common websites into [Obsidian](https://obsidian.md/).

This plugin works by modifying the default paste function, meaning you do not have to use a separate paste function. You can simply use `cmd/ctrl + v` as you always do.

## Table of Contents"
<!-- MarkdownTOC levels="2" -->

- [General Modifications](#general-modifications)
- [Modifications for Specific Content Types](#modifications-for-specific-content-types)
- [Commands added](#commands-added)
- [Limitations](#limitations)
- [Installation](#installation)
- [Contribute](#contribute)
- [Credits](#credits)
- [About the Developer](#about-the-developer)

<!-- /MarkdownTOC -->

## General Modifications
- When pasting text with left-over hyphenation (e.g. when copying from a PDF), those hyphenations are removed. 
- Two or more consecutive blank lines are reduced to one blank line.
- Leading and Trailing whitespace is removed.

## Modifications for Specific Content Types
ℹ️ *Note that __Pasta Copinara__ respects the core Obsidian setting `Auto Convert HTML`, meaning that the following modifications will not take place if that setting is disabled.*
- Messages copypasted from the Discord app will be cleaned up. If the timestamp contains a relative date in English ("Today at…"), it will be replaced by the absolute date.
- Tweets copied from the Twitter website will be cleaned up.

## Commands added
- `Paste as Plain Text without Modifications`: Utility Command which pastes the clipboard content as plain text and without any modifications. Also circumvents pasting-modifications from other plugins like [Auto Link Title](https://obsidian.md/plugins?id=obsidian-auto-link-title).

## Limitations
The plugin only works with the standard pasting (`cmd/ctrl + v`), and not with the pasting in vim normal mode (`p`/`P`). Pasting with `cmd/ctrl + v` in normal or insert mode does work though.

## Installation
Right now, the plugin is still in beta. It can be installed with the [BRAT Plugin](https://github.com/TfTHacker/obsidian42-brat).

When published, it will be available in Obsidian's Community Plugin Browser via: `Settings` → `Community Plugins` → `Browse` → Search for *"Pasta Copinara"*

## Contribute
Adding to more pasting formatting to the `clipboardConversions` function should be fairly straightforward and self-contained; to add some formatting rules, basic JavaScript and Regex probably suffice.

Please use the [`.eslintrc` configuration located in the repository](.eslintrc) and run eslint before doing a pull request, and please do *not* use `prettier`. 🙂

```shell
# Run eslint fixing most common mistakes
eslint --fix *.ts
```

## Credits
Thanks to [@zolrath](https://github.com/zolrath) for the [Auto-Link Title Plugin](https://github.com/zolrath/obsidian-auto-link-title) which showed me how to modify paste events correctly.

## About the Developer
In my day job, I am a sociologist studying the social mechanisms underlying the digital economy. For my PhD project, I investigate the governance of the app economy and how software ecosystems manage the tension between innovation and compatibility. If you are interested in this subject, feel free to get in touch!

<!-- markdown-link-check-disable -->
### Profiles
- [Academic Website](https://chris-grieser.de/)
- [ResearchGate](https://www.researchgate.net/profile/Christopher-Grieser)
- [Discord](https://discordapp.com/users/462774483044794368/)
- [GitHub](https://github.com/chrisgrieser/)
- [Twitter](https://twitter.com/pseudo_meta)
- [LinkedIn](https://www.linkedin.com/in/christopher-grieser-ba693b17a/)

### Donate
<a href='https://ko-fi.com/Y8Y86SQ91' target='_blank'><img height='36' style='border:0px;height:36px;' src='https://cdn.ko-fi.com/cdn/kofi1.png?v=3' border='0' alt='Buy Me a Coffee at ko-fi.com' /></a>

If you feel very generous, you may also buy me something from my Amazon wish list. But please donate something to developers who still go to college, before you consider buying me an item from my wish list! 😊

[Amazon wish list](https://www.amazon.de/hz/wishlist/ls/2C7RIOJPN3K5F?ref_=wl_share)
