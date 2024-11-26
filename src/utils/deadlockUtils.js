// deadlockUtils.js

// Função para verificar se há deadlock entre os processos
export const checkForDeadlock = (processes) => {
    if (processes.length > 1) {
      // Algoritmo básico para simular deadlock
      // Simulação simples: a probabilidade de deadlock é de 30%
      const deadlockProbability = Math.random();
      return deadlockProbability > 0.7; // 30% de chance de deadlock
    }
    return false;
  };
  
  // Função que simula a recuperação de um deadlock
  export const resolveDeadlock = (processes, setProcesses) => {
    const updatedProcesses = processes.map((process) =>
      process.state === 'stopped' ? { ...process, state: 'running' } : process
    );
    setProcesses(updatedProcesses);
  };
  