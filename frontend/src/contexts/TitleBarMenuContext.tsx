import React, { useContext, useState } from "react";

// interface MenuCard {
//   label: string;
//   title: string;
//   progressBarSection: React.JSX.Element;
//   detailsSection: React.JSX.Element;
// }
export interface MenuCard {
  label: string;
  value: string;
  tooltipIcon?: React.ReactNode;
  spinnerIcon?: React.ReactNode;
  spinnerIconText?: string;
  dot?: boolean;
  id?: string;
  percentage?: number;
  timeRemaining?: string;
}

interface TitleBarContextState {
  actions: {
    addMenuCard: (card: MenuCard, place: number) => void;
    removeMenuCard: (id: string) => void;
  };

  values: {
    menuCards: MenuCard[];
  };
}

const TitleBarContext = React.createContext<TitleBarContextState | null>(null);

interface TitleBarContextProviderProps {
  children: React.ReactNode;
}

export function TitleBarContextProvider(props: TitleBarContextProviderProps): React.ReactElement {
  const { children } = props;
  const [menuCards, setMenuCards] = useState<MenuCard[]>([]);

  const addMenuCard = (menuCard: MenuCard, place?: number) => {
    if (place !== undefined) {
      const updatedMenuCards = [...menuCards];
      updatedMenuCards.splice(place, 0, menuCard);
      setMenuCards(updatedMenuCards);
      return;
    }
    setMenuCards([...menuCards, menuCard]);
  };

  const removeMenuCard = (id: string) => {
    setMenuCards(menuCards.filter((m) => m.id !== id));
  };

  return (
    <TitleBarContext.Provider
      value={{
        actions: {
          addMenuCard,
          removeMenuCard,
        },
        values: {
          menuCards,
        },
      }}
    >
      {children}
    </TitleBarContext.Provider>
  );
}

export function useTitleBarContextProvider(): TitleBarContextState {
  const context = useContext(TitleBarContext);
  if (!context) {
    throw new Error("useTitleBarContextProvider must be used within a TitleBarContextProvider");
  }
  return context;
}
