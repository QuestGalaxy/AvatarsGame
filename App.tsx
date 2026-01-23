
import React from 'react';
import GameScene from './components/GameScene';
import UIOverlay from './components/UIOverlay';
import SplashScreen from './components/SplashScreen';
import LandingPage from './components/LandingPage';
import CharacterSelect from './components/CharacterSelect';
import WorldSelect from './components/WorldSelect';
import { useGameStore } from './store';
import { AppFlow } from './types';

const App: React.FC = () => {
  const appFlow = useGameStore(state => state.appFlow);

  return (
    <div className="relative w-full h-full overflow-hidden bg-[#f8fafc]">
      {/* 3D Content Container - Only render during Game to save performance and prevent conflicts */}
      {(appFlow === AppFlow.GAME || appFlow === AppFlow.LANDING || appFlow === AppFlow.SPLASH) && (
        <div className="absolute inset-0">
          <GameScene />
        </div>
      )}

      {/* Conditionally rendering UI based on App Flow */}
      {appFlow === AppFlow.SPLASH && <SplashScreen />}
      {appFlow === AppFlow.LANDING && <LandingPage />}
      {appFlow === AppFlow.CHARACTER_SELECT && <CharacterSelect />}
      {appFlow === AppFlow.WORLD_SELECT && <WorldSelect />}
      {appFlow === AppFlow.GAME && <UIOverlay />}
      
      {/* Mobile Orientation Hint (CSS Only) */}
      <div className="fixed inset-0 z-[200] bg-slate-900 text-white flex flex-col items-center justify-center p-10 text-center landscape:hidden sm:hidden hidden">
        <p className="text-xl font-bold mb-4">Please rotate your device to portrait mode!</p>
        <div className="w-12 h-20 border-4 border-white rounded-lg animate-bounce" />
      </div>
    </div>
  );
};

export default App;
