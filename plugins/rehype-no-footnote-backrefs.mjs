// Removes the "back to reference" links that GFM footnotes generate.
//
// remark-rehype ends every footnote with an anchor back to each place it was
// cited: "↩", labelled "Back to reference 2", and "↩²", "↩³" when a note is
// cited more than once. Read visually they are a glyph. Read with a screen
// reader they are a link announced after every note, and a note cited four
// times ends in four of them, which makes the footnotes section worse to read
// than the text it is meant to support.
//
// A footnote is reached by following its marker, and the browser's back button
// already returns the reader to it. So the links are dropped rather than
// hidden: `display: none` would hide them from a screen reader too, but a link
// that exists only to be hidden is not worth shipping.

import { visit } from 'unist-util-visit';

export default function rehypeNoFootnoteBackrefs() {
	return (tree) => {
		visit(tree, 'element', (node) => {
			if (!Array.isArray(node.children)) return;
			const kept = node.children.filter(
				(child) => !(child.type === 'element' && child.tagName === 'a' && 'dataFootnoteBackref' in (child.properties ?? {})),
			);
			if (kept.length === node.children.length) return;
			// The last text node held the space before the removed link.
			const last = kept[kept.length - 1];
			if (last?.type === 'text') last.value = last.value.replace(/\s+$/, '');
			node.children = kept;
		});
	};
}
