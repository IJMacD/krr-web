/**
 * Doesn't support self-nested tags
 * e.g.
 *  <b>Hello <b>World</b>!</b>
 * is not allowed.
 */
export function forumFormat(text: string): string {
    const tags = [
        { start: "[b]", end: "[/b]", replace: (content: string) => `<b>${content}</b>` },
        { start: "[underline]", end: "[/underline]", replace: (content: string) => `<u>${content}</u>` },
    ];

    const matchers = [
        { regex: /https?:\/\/[^\s<>]*/g, replace: (content: string) => `<a href="${encodeURI(content)}">${content}</a>` },
    ];

    let output = text;

    for (const tag of tags) {
        const [head, ...taggedStrings] = output.split(tag.start);

        const outputStrings = taggedStrings.map(taggedString => {
            const endIndex = taggedString.indexOf(tag.end);
            const replaced = tag.replace(taggedString.substring(0, endIndex));
            const segmentTail = taggedString.substring(endIndex + tag.end.length);
            return `${replaced}${segmentTail}`;
        });

        output = `${head}${outputStrings.join("")}`;
    }

    for (const matcher of matchers) {
        output = output.replace(matcher.regex, matcher.replace);
    }

    return output;
}