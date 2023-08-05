import { createContext, ReactNode } from 'react';
import { useModal } from '../hooks/useModal';

interface ModalContextProps {
  isOpen: boolean;
  toggle: () => void;
}

interface ProviderProps {
  children: ReactNode;
}
const initialState: ModalContextProps = {
  isOpen: false,
  toggle: () => { },
};

export const SignUpModalContext = createContext<ModalContextProps>(initialState);

export const SignUpModalProvider = ({ children }: ProviderProps) => {
  const modal = useModal();

  return (
    <SignUpModalContext.Provider value={modal}>
      {children}
    </SignUpModalContext.Provider>
  );
};

export const SettingsModalContext = createContext<ModalContextProps>(initialState);

export const SettingsModalProvider = ({ children }: ProviderProps) => {
  const modal = useModal();

  return (
    <SettingsModalContext.Provider value={modal}>
      {children}
    </SettingsModalContext.Provider>
  );
};