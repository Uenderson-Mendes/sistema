import React from 'react';
import { ProcessManager } from './components/ProcessManager';

function App() {
  return (
    <div className="App">
      <header className="App-header text-center p-3 mb-4 bg-dark text-white">
        <h1>SimuVOS: Simulador para o Ensino de Sistemas Operacionais</h1>
      </header>
      <ProcessManager />
    </div>
  );
}

export default App;
