import { createSlice } from '@reduxjs/toolkit';
import { PayloadAction } from '@reduxjs/toolkit';

const initialState = {
	text: '',
	selected: {
		line: -1,
		column: -1,
		content: '',
	},
};

const reducers = {
	setText: (state: typeof initialState, action: PayloadAction<string>) => {
		state.text = action.payload;
	},
	setSelected: (
		state: typeof initialState,
		action: PayloadAction<typeof initialState.selected>
	) => {
		state.selected = action.payload;
	},
};

const lifeAssistSlice = createSlice({
	name: 'lifeAssist',
	initialState,
	reducers,
});

export const { setText, setSelected } = lifeAssistSlice.actions;
export default lifeAssistSlice.reducer;
