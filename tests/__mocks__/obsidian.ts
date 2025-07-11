import type { App, CachedMetadata } from 'obsidian';

export {};

/**
 * Since we don't use the app object's method or properties directly,
 * and just treat it as an "opaque object" for markdown rendering, there is
 * not a lot to mock in particular.
 */
export const mockApp = {} as unknown as App;

export class MenuItem {
    public title: string | DocumentFragment = '';
    public callback: (evt: MouseEvent | KeyboardEvent) => any;
    public checked = false;

    constructor() {
        this.callback = (_evt: MouseEvent | KeyboardEvent) => console.log('callback not defined');
    }

    public setTitle(title: string | DocumentFragment): this {
        this.title = title;
        return this;
    }

    public onClick(callback: (evt: MouseEvent | KeyboardEvent) => any): this {
        this.callback = callback;
        return this;
    }
    public setChecked(checked: boolean | null): this {
        this.checked = checked ? checked : false;
        return this;
    }
}

export class Menu {
    public items: MenuItem[] = [];

    /**
     * Adds a menu item. Only works when menu is not shown yet.
     * @public
     */
    addItem(cb: (item: MenuItem) => any): this {
        const item = new MenuItem();
        cb(item);
        this.items.push(item);
        return this;
    }

    /**
     * Adds a separator. Only works when menu is not shown yet.
     */
    addSeparator(): this {
        const getMenuItemCallback = (item: MenuItem) => {
            item.setTitle('---');
        };
        return this.addItem(getMenuItemCallback);
    }
}

export class Notice {
    /**
     * @public
     */
    constructor(_message: string | DocumentFragment, _timeout?: number) {}

    /**
     * Change the message of this notice.
     * @public
     */
    setMessage(_message: string | DocumentFragment): this {
        return this;
    }

    /**
     * @public
     */
    hide(): void {}
}

interface SearchResult {
    score: number;
    matches: number[][];
}

/**
 * An implementation detail of our fake {@link prepareSimpleSearch} - see below.
 *
 * See https://docs.obsidian.md/Reference/TypeScript+API/prepareSimpleSearch
 * @param searchTerm
 * @param phrase
 */
function caseInsensitiveSubstringSearch(searchTerm: string, phrase: string): SearchResult | null {
    // Don't try and search for empty strings or just spaces:
    if (!searchTerm.trim()) {
        return null;
    }

    // Support multi-word search terms:
    const searchTerms = searchTerm.split(/\s+/);
    let matches: number[][] = [];

    for (const term of searchTerms) {
        const regex = new RegExp(term, 'gi');
        let match;
        let termFound = false;
        while ((match = regex.exec(phrase)) !== null) {
            matches.push([match.index, match.index + match[0].length]);
            termFound = true;
        }

        // We require all search terms to be found.
        if (!termFound) {
            return null;
        }
    }

    // Sort matches by start index and then by end index
    matches = matches.sort((a, b) => {
        if (a[0] === b[0]) {
            return a[1] - b[1];
        }
        return a[0] - b[0];
    });

    return matches.length > 0
        ? {
              score: 0, // this fake implementation does not support calculating scores.
              matches: matches,
          }
        : null;
}

let mockedFileData: any = {};

export function setCurrentCacheFile(mockData: any) {
    mockedFileData = mockData;
}

/**
 * Fake implementation of Obsidian's `getAllTags()`.
 *
 * See https://docs.obsidian.md/Reference/TypeScript+API/getAllTags
 *
 * @param cachedMetadata
 */
export function getAllTags(cachedMetadata: CachedMetadata): string[] {
    if (cachedMetadata !== mockedFileData.cachedMetadata) {
        throw new Error(
            'Inconsistent test data used in mock getAllTags(). Check setCurrentCacheFile() has been called with the correct {@link SimulatedFile} data.',
        );
    }
    return mockedFileData.getAllTags;
}

/**
 * Fake implementation of Obsidian's `parseFrontMatterTags()`.
 *
 * See https://docs.obsidian.md/Reference/TypeScript+API/parseFrontMatterTags
 *
 * @param frontmatter
 */
export function parseFrontMatterTags(frontmatter: any | null): string[] | null {
    if (frontmatter !== mockedFileData.cachedMetadata.frontmatter) {
        throw new Error(
            'Inconsistent test data used in mock parseFrontMatterTags(). Check setCurrentCacheFile() has been called with the correct {@link SimulatedFile} data.',
        );
    }
    return mockedFileData.parseFrontMatterTags;
}

/**
 * A fake implementation of prepareSimpleSearch(),
 * so we can write tests of code that calls that function.
 * Note that the returned score is always 0.
 *
 * See https://docs.obsidian.md/Reference/TypeScript+API/prepareSimpleSearch
 * @param query - the search term
 */
export function prepareSimpleSearch(query: string): (text: string) => SearchResult | null {
    return function (text: string): SearchResult | null {
        return caseInsensitiveSubstringSearch(query, text);
    };
}

type IconName = string;
export function setIcon(_parent: HTMLElement, _iconId: IconName): void {}
