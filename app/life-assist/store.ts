import { configureStore } from '@reduxjs/toolkit';
import lifeAssistReducer from './slice';

const store = configureStore({
	reducer: {
		lifeAssist: lifeAssistReducer,
	},
});

export default store;
