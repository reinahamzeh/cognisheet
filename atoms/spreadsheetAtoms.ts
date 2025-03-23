import { atom } from 'recoil';

// Define atom for selected cell range to share with chat
export const selectedCellRangeState = atom<string | null>({
  key: 'selectedCellRangeState',
  default: null,
});

// Define atom for chat input focus state
export const isChatFocusedState = atom<boolean>({
  key: 'isChatFocusedState',
  default: false,
});

// Define atom for chat panel open state
export const isChatOpenState = atom<boolean>({
  key: 'isChatOpenState',
  default: false,
});

// Define atom for tracking if Cmd+K was just pressed
// This helps coordinate between spreadsheet and chat components
export const cmdKTriggeredState = atom<boolean>({
  key: 'cmdKTriggeredState',
  default: false,
}); 