
import { useState, useEffect } from 'react';

function useLocalStorage<T,>(key: string, initialValue: T): [T, React.Dispatch<React.SetStateAction<T>>] {
  const [storedValue, setStoredValue] = useState<T>(() => {
    try {
      const item = window.localStorage.getItem(key);
      return item ? JSON.parse(item) : initialValue;
    } catch (error) {
      console.error(`Error reading localStorage key "${key}":`, error);
      return initialValue;
    }
  });

  useEffect(() => {
    try {
      const valueToStore = storedValue;
      window.localStorage.setItem(key, JSON.stringify(valueToStore));
    } catch (error) {
      if (error instanceof DOMException && (error.name === 'QuotaExceededError' || error.name === 'NS_ERROR_DOM_QUOTA_REACHED')) {
        const errorMessageDetails = error instanceof Error ? error.message : String(error);
        console.warn(
          `INFO: LocalStorage Quota Exceeded for key "${key}". User has been alerted. Data not saved. Details: ${errorMessageDetails}`
        );
        
        let userMessage = `Storage Limit Reached for "${key}"!\n\nYour browser's local storage is full. ` +
          `This usually happens if you have many recordings with photos or long audio notes. ` +
          `The latest changes to "${key}" (e.g., new recordings, photos, or voice notes) could not be saved.\n\n` +
          "To free up space, please try:\n" +
          "1. Deleting older projects or recordings, especially those with large media files.\n" +
          "2. Reducing the number of photos or the length of audio notes in new recordings.\n\n" +
          "After freeing up space, you may need to try your last action again.";
        
        alert(userMessage);
      } else {
        console.error(`Error setting localStorage key "${key}":`, error);
      }
    }
  }, [key, storedValue]);

  return [storedValue, setStoredValue];
}

export default useLocalStorage;