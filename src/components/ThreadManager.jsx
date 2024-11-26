import React, { useState, useEffect } from 'react';

export const ThreadManager = ({ processes }) => {
  const [threadCounts, setThreadCounts] = useState({}); // Estado para armazenar o número fixo de threads para cada processo

  useEffect(() => {
    // Inicializa o número de threads apenas uma vez por processo
    const newThreadCounts = {};
    processes.forEach((process) => {
      if (!threadCounts[process.id]) {
        newThreadCounts[process.id] = Math.floor(Math.random() * 5) + 1; // Gera número fixo de threads
      }
    });
    setThreadCounts((prev) => ({ ...prev, ...newThreadCounts }));
  }, [processes, threadCounts]);

  return (
    <div>
      <h3>Thread em execução</h3>
      <ul>
        {processes.map((process) => {
          const numThreads = threadCounts[process.id] || 0; // Recupera o número de threads fixo para o processo atual

          return (
            <li key={process.id}>
              {process.state === 'running' ? (
                <>Processo Número ({process.id}) tem {numThreads} threads em execução.</>
              ) : process.state === 'waiting' ? (
                <>Processo Número ({process.id}) está esperando (bloqueado) com {numThreads} threads prontas, sem execução.</>
              ) : (
                <>Processo Número ({process.id}) está {process.state} com {numThreads} threads prontas, aguardando execução.</>
              )}
            </li>
          );
        })}
      </ul>
    </div>
  );
};
