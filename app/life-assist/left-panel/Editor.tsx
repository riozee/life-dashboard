import { useState } from 'react';
import { createEditor } from 'slate';

// Slate MODULE DECLARATION
import { BaseEditor } from 'slate';
import { ReactEditor, Slate, withReact } from 'slate-react';

type CustomElement = { type: 'paragraph'; children: CustomText[] };
type CustomText = { text: string };

declare module 'slate' {
	interface CustomTypes {
		Editor: BaseEditor & ReactEditor;
		Element: CustomElement;
		Text: CustomText;
	}
}
// END Slate MODULE DECLARATION

export default function Editor({ children }: { children: React.ReactNode }) {
	const [editor] = useState(() => withReact(createEditor()));

	return (
		<Slate editor={editor} initialValue={[{ type: 'paragraph', children: [{ text: '' }] }]}>
			{children}
		</Slate>
	);
}
