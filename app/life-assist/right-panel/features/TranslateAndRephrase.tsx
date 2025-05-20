'use client';

import React, { useState, useEffect, useCallback } from 'react';
import { useSlate } from 'slate-react';
import { Range, Editor, Text } from 'slate';
import { cn } from '@/lib/utils';
import { Checkbox } from '@/components/ui/checkbox';
import {
	Select,
	SelectContent,
	SelectItem,
	SelectTrigger,
	SelectValue,
} from '@/components/ui/select';
import { Loader2 } from 'lucide-react';

// Types for text selection logic
interface TextSelectionState {
	selectedText: string;
	showPrompt: boolean;
	autoSelectEnabled: boolean;
	toggleAutoSelect: () => void;
}

const REPHRASE_PROMPT = `As an expert linguist and translator, create 10 different variations of the following text translated into {lang}:

Sentence: "{text}"

Requirements for each variation:
1. Preserve the EXACT same meaning as the original
2. Employ distinctly different grammatical structures and sentence patterns
3. Maintain the original tone (formal/informal/technical/conversational)
4. Keep all specialized terminology and key concepts intact
5. Ensure each version sounds natural and idiomatic in {lang}

For each variation:
- Number them 1-10
- Prioritize structural variety over simple synonym substitution
- Rearrange sentence elements when possible (passive/active voice, conditional structures, etc.)
- Vary sentence length and complexity while maintaining meaning
- Use different discourse markers and connectors between ideas

The goal is to showcase the linguistic flexibility of {lang} while preserving the complete message and nuance of the original text.

IMPORTANT: Respond ONLY with the numbered list of variations. Do not include any explanations, introductions, or other text.

REFERENCE (Original Text):
"{text}"`;

// Custom hook to handle text selection logic
const useTextSelection = (): TextSelectionState => {
	const editor = useSlate();
	const [selectedText, setSelectedText] = useState<string>('');
	const [showPrompt, setShowPrompt] = useState<boolean>(true);
	const [autoSelectEnabled, setAutoSelectEnabled] = useState<boolean>(false);

	// Helper function to check if a character is a sentence ending punctuation
	const isSentenceEnd = (char: string): boolean => {
		return ['.', '!', '?', '。', '！', '？'].includes(char);
	};

	// Function to select the entire sentence the cursor is currently in
	const selectCurrentSentence = useCallback(() => {
		const { selection } = editor;

		if (!selection) return;

		// Get the current point (cursor position)
		const currentPoint = selection.focus;

		// Find the text node at the current position
		const [node, path] = Editor.node(editor, currentPoint);

		if (!Text.isText(node)) return;

		const text = node.text;
		const offset = currentPoint.offset;

		// Find the start of the sentence (searching backward)
		let startOffset = 0;
		for (let i = offset - 1; i >= 0; i--) {
			if (isSentenceEnd(text[i])) {
				// For western languages, require a space after punctuation
				// For Japanese, no space is required after sentence endings
				if (
					(text[i] === '.' || text[i] === '!' || text[i] === '?') &&
					i + 1 < text.length &&
					text[i + 1] === ' '
				) {
					startOffset = i + 2; // Position after the space
					break;
				}
				// For Japanese punctuation, no space check needed
				else if (text[i] === '。' || text[i] === '！' || text[i] === '？') {
					startOffset = i + 1; // Position right after the punctuation
					break;
				}
			}
		}

		// Find the end of the sentence (searching forward)
		let endOffset = text.length;
		for (let i = offset; i < text.length; i++) {
			if (isSentenceEnd(text[i])) {
				// For western punctuation, check for space or end of text
				if (
					(text[i] === '.' || text[i] === '!' || text[i] === '?') &&
					(i + 1 === text.length || text[i + 1] === ' ')
				) {
					endOffset = i + 1; // Include the punctuation
					break;
				}
				// For Japanese punctuation, no space check needed
				else if (text[i] === '。' || text[i] === '！' || text[i] === '？') {
					endOffset = i + 1; // Include the punctuation
					break;
				}
			}
		}

		// Create a new range for the sentence
		const sentenceRange = {
			anchor: { path, offset: startOffset },
			focus: { path, offset: endOffset },
		};

		// Apply the selection
		editor.selection = sentenceRange;

		// Update the selected text
		const sentenceText = Editor.string(editor, sentenceRange);
		setSelectedText(sentenceText);
		setShowPrompt(false);

		return sentenceText;
	}, [editor]);

	// Function to get the currently selected text from the editor using Slate's API
	const getSelectedText = useCallback(() => {
		const { selection } = editor;

		if (selection && !Range.isCollapsed(selection)) {
			// Use Editor.string to get text from a range
			const text = Editor.string(editor, selection);

			if (text) {
				setSelectedText(text);
				setShowPrompt(false);
			}
		} else {
			// If auto-select is enabled and the cursor is positioned (collapsed selection)
			if (autoSelectEnabled && selection && Range.isCollapsed(selection)) {
				// Auto-select the current sentence
				selectCurrentSentence();
			} else {
				setSelectedText('');
				setShowPrompt(true);
			}
		}
	}, [editor, autoSelectEnabled, selectCurrentSentence]);

	// Watch for selection changes in the Slate editor
	useEffect(() => {
		// Update whenever the component rerenders and selection might have changed
		getSelectedText();
	}, [editor.selection, getSelectedText]);

	const toggleAutoSelect = () => setAutoSelectEnabled(!autoSelectEnabled);

	return {
		selectedText,
		showPrompt,
		autoSelectEnabled,
		toggleAutoSelect,
	};
};

const useTextTranslation = () => {
	const editor = useSlate();
	const [targetLanguage, setTargetLanguage] = useState('Japanese');
	const [translatedText, setTranslatedText] = useState('');
	const [isFetching, setIsFetching] = useState(false);
	const [autoFetchEnabled, setAutoFetchEnabled] = useState(true);

	const fetchTranslation = useCallback(
		async (text: string) => {
			setIsFetching(true);
			// Clear previous translation when starting a new one
			setTranslatedText('');

			try {
				// Get the entire document text as context from the Slate editor
				const nodes = editor.children;
				const fullText = nodes
					.map(node => Editor.string(editor, [editor.children.indexOf(node)]))
					.join('\n');
				const sourceContext = fullText;

				const response = await fetch('/api/openai', {
					method: 'POST',
					headers: { 'Content-Type': 'application/json' },
					body: JSON.stringify({
						prompt: REPHRASE_PROMPT.replaceAll('{text}', text)
							.replaceAll('{source}', sourceContext)
							.replaceAll('{lang}', targetLanguage),
					}),
				});

				if (!response.ok) {
					throw new Error(`API returned status code ${response.status}`);
				}

				// Handle streaming response
				const reader = response.body?.getReader();

				if (!reader) {
					throw new Error('Response body stream not available');
				}

				// Initialize for accumulating the response
				let accumulatedResponse = '';
				const decoder = new TextDecoder();

				while (true) {
					const { done, value } = await reader.read();

					if (done) {
						break;
					}

					// Decode the stream chunk and append to accumulated response
					const chunk = decoder.decode(value, { stream: true });
					accumulatedResponse += chunk;

					// Update UI directly with the accumulated text
					setTranslatedText(accumulatedResponse);
				}
			} catch (error) {
				console.error('Error fetching translation:', error);
				// Add an error message to the UI if needed
				setTranslatedText('Error: Failed to fetch translation.');
			} finally {
				setIsFetching(false);
			}
		},
		[targetLanguage, editor]
	);

	return {
		targetLanguage,
		setTargetLanguage,
		translatedText,
		isFetching,
		autoFetchEnabled,
		setAutoFetchEnabled,
		fetchTranslation,
	};
};

// UI Components
// =============================================================================

// Helper components
// -----------------

// Component to display the selected text and control buttons
const TextSelectionDisplay = ({
	selectedText,
	showPrompt,
	autoSelectEnabled,
	toggleAutoSelect,
}: TextSelectionState) => {
	return (
		<div>
			<div className="min-h-[4rem] rounded-md border p-4 bg-muted/20">
				{showPrompt ? (
					<div className="text-muted-foreground text-center h-full flex items-center justify-center">
						<p>Select text in the editor to see it here</p>
					</div>
				) : (
					<div className="prose">
						<p className={cn('text-sm')}>{selectedText}</p>
					</div>
				)}
			</div>
			<div className="mt-3 flex justify-center items-center text-xs">
				<Checkbox
					id="auto-select-sentence"
					checked={autoSelectEnabled}
					onCheckedChange={toggleAutoSelect}
					aria-label="Toggle auto-select"
				/>
				<label htmlFor="auto-select-sentence" className="ml-2">
					Auto-select sentence in current cursor position
				</label>
			</div>
		</div>
	);
};

// Main component using the hook and the UI component
const Rephrase: React.FC = () => {
	const textSelectionState = useTextSelection();
	const {
		targetLanguage,
		setTargetLanguage,
		translatedText,
		isFetching,
		autoFetchEnabled,
		setAutoFetchEnabled,
		fetchTranslation,
	} = useTextTranslation();

	useEffect(() => {
		if (textSelectionState.selectedText && autoFetchEnabled) {
			const timeout = setTimeout(() => {
				fetchTranslation(textSelectionState.selectedText);
			}, 2000);
			return () => clearTimeout(timeout);
		}
	}, [textSelectionState.selectedText, autoFetchEnabled, fetchTranslation]);

	return (
		<div>
			<TextSelectionDisplay {...textSelectionState} />

			<div className="mt-4">
				<label
					htmlFor="language-select"
					className="block text-sm font-medium text-gray-700"
				>
					Target Language
				</label>
				<Select onValueChange={setTargetLanguage} value={targetLanguage}>
					<SelectTrigger className="w-[180px]">
						<SelectValue placeholder="Select Language" />
					</SelectTrigger>
					<SelectContent>
						<SelectItem value="Japanese">Japanese</SelectItem>
						<SelectItem value="English">English</SelectItem>
						<SelectItem value="Indonesian">Indonesian</SelectItem>
					</SelectContent>
				</Select>
			</div>

			<div className="mt-3 flex items-center">
				<Checkbox
					id="auto-fetch"
					checked={autoFetchEnabled}
					onCheckedChange={() => setAutoFetchEnabled(!autoFetchEnabled)}
					aria-label="Toggle auto-fetch"
				/>
				<label htmlFor="auto-fetch" className="ml-2 text-sm">
					Auto-fetch translation
				</label>
			</div>

			{isFetching && (
				<div className="mt-4 flex justify-center">
					<Loader2 className="animate-spin" />
				</div>
			)}

			{translatedText && (
				<div className="mt-4 p-4 border rounded-md bg-muted/20">
					<h3 className="text-sm font-medium">Translated & Rephrased Text:</h3>
					<div className="mt-2 text-sm">
						{translatedText.split(/\n+/).map((line, index) => {
							// Extract number pattern at the beginning of the line (e.g., "1.", "2:", etc.)
							const match = line.match(/^\s*(\d+)[.:]?\s*(.*)/);
							if (match) {
								return (
									<div key={index} className="mb-2 flex">
										<span className="font-medium text-primary mr-2">
											{match[1]}.
										</span>
										<span>{match[2]}</span>
									</div>
								);
							}
							// For lines without numbers, display them normally
							return line ? (
								<p key={index} className="mb-2">
									{line}
								</p>
							) : null;
						})}
					</div>
				</div>
			)}
		</div>
	);
};

export default Rephrase;
