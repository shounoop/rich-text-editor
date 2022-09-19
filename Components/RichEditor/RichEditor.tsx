// TypeScript users only add this code
import { useCallback, useEffect, useMemo, useState } from 'react';
import { BaseEditor, createEditor, Descendant, Editor, Text, Transforms } from 'slate';
import { DefaultElement, Editable, ReactEditor, Slate, withReact } from 'slate-react';
import CodeElement from './CodeElement';
import Leaf from './Leaf';

type CustomElement = {
	bold: boolean | null;
	type: 'paragraph' | 'code' | null;
	children: CustomText[];
};
type CustomText = { text: string };

declare module 'slate' {
	interface CustomTypes {
		Editor: BaseEditor & ReactEditor;
		Element: CustomElement;
		Text: CustomText;
	}
}

// Define our own custom set of helpers.
const CustomEditor = {
	isBoldMarkActive(editor: any) {
		const [match]: any = Editor.nodes(editor, {
			match: (n: any) => n.bold === true,
			universal: true,
		});

		return !!match;
	},

	isCodeBlockActive(editor: any) {
		const [match]: any = Editor.nodes(editor, {
			match: (n: any) => n.type === 'code',
		});

		return !!match;
	},

	toggleBoldMark(editor: any) {
		const isActive = CustomEditor.isBoldMarkActive(editor);
		Transforms.setNodes(
			editor,
			{ bold: isActive ? null : true },
			{ match: (n) => Text.isText(n), split: true }
		);
	},

	toggleCodeBlock(editor: any) {
		const isActive = CustomEditor.isCodeBlockActive(editor);
		Transforms.setNodes(
			editor,
			{ type: isActive ? null : 'code' },
			{ match: (n) => Editor.isBlock(editor, n) }
		);
	},
};

const RichEditor = () => {
	const [editor] = useState(() => withReact(createEditor()));
	const initialValue = [
		{
			type: 'paragraph',
			children: [{ text: 'A line of text in a paragraph.' }],
		},
	] as Descendant[];

	const renderElement = useCallback((props: any) => {
		switch (props.element.type) {
			case 'code':
				return <CodeElement {...props} />;
			default:
				return <DefaultElement {...props} />;
		}
	}, []);

	// Define a leaf rendering function that is memoized with `useCallback`.
	const renderLeaf = useCallback((props: any) => {
		return <Leaf {...props} />;
	}, []);

	const handleOnKeyDown = (event: any) => {
		if (!event.ctrlKey) {
			return;
		}

		// Replace the `onKeyDown` logic with our new commands.
		switch (event.key) {
			case '`': {
				event.preventDefault();
				CustomEditor.toggleCodeBlock(editor);
				break;
			}

			case 'b': {
				event.preventDefault();
				CustomEditor.toggleBoldMark(editor);
				break;
			}
		}
	};

	return (
		// Add the editable component inside the context.
		<Slate editor={editor} value={initialValue}>
			<div>
				<button
					onMouseDown={(event) => {
						event.preventDefault();
						CustomEditor.toggleBoldMark(editor);
					}}
				>
					Bold
				</button>
				<button
					onMouseDown={(event) => {
						event.preventDefault();
						CustomEditor.toggleCodeBlock(editor);
					}}
				>
					Code Block
				</button>
			</div>

			<Editable renderElement={renderElement} onKeyDown={handleOnKeyDown} renderLeaf={renderLeaf} />
		</Slate>
	);
};

export default RichEditor;
