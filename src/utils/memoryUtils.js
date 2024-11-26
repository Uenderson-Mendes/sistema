// memoryUtils.js

// Função para alocar memória a um processo de maneira simulada
export const allocateMemory = (processId) => {
    // Aloca de 20MB a 100MB para cada processo
    const memoryUsage = Math.floor(Math.random() * 80) + 20; // entre 20MB e 100MB
    return {
      processId,
      memoryUsage,
    };
  };
  
  // Função para liberar memória quando o processo é encerrado
  export const releaseMemory = (processId, memoryAllocations) => {
    return memoryAllocations.filter((allocation) => allocation.processId !== processId);
  };
  