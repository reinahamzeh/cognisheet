import { useEffect } from 'react';
import { useRecoilState } from 'recoil';
import { 
  selectedCellRangeState, 
  isChatFocusedState,
  isChatOpenState,
  cmdKTriggeredState
} from '../atoms/spreadsheetAtoms';

const KeyboardShortcutsHandler = () => {
  const [selectedCellRange, setSelectedCellRange] = useRecoilState(selectedCellRangeState);
  const [isChatFocused, setIsChatFocused] = useRecoilState(isChatFocusedState);
  const [isChatOpen, setIsChatOpen] = useRecoilState(isChatOpenState);
  const [cmdKTriggered, setCmdKTriggered] = useRecoilState(cmdKTriggeredState);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // Cmd+K - send selected cells to chat input
      if ((e.metaKey || e.ctrlKey) && e.key === 'k') {
        e.preventDefault();
        
        // Set the cmdKTriggered flag - this is now mainly handled in SpreadsheetComponent
        setCmdKTriggered(true);
        
        // If chat is not open, open it first
        if (!isChatOpen) {
          setIsChatOpen(true);
        }
        
        // Focus chat input if it exists
        setTimeout(() => {
          const chatInput = document.querySelector('.ai-chat-input') as HTMLInputElement;
          if (chatInput) {
            chatInput.focus();
            setIsChatFocused(true);
          }
          
          // Reset the cmdKTriggered flag after a short delay
          setTimeout(() => {
            setCmdKTriggered(false);
          }, 200);
        }, 100);
        
        // Note: The actual cell selection is now handled in SpreadsheetComponent and
        // is only sent to the chat when Cmd+K is explicitly pressed
      }
      
      // Escape - blur from chat if it's focused
      if (e.key === 'Escape' && isChatFocused) {
        const activeElement = document.activeElement as HTMLElement;
        if (activeElement) {
          activeElement.blur();
          setIsChatFocused(false);
        }
        
        // Return focus to the spreadsheet
        const spreadsheetContainer = document.querySelector('.spreadsheet-container') as HTMLElement;
        if (spreadsheetContainer) {
          spreadsheetContainer.focus();
        }
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => {
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, [isChatOpen, isChatFocused]);

  return null;
};

export default KeyboardShortcutsHandler; 