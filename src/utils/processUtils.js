// utils/processUtils.js

export const startProcess = (process, setProcesses, intervalTime) => {
    const interval = setInterval(() => {
        setProcesses((prevProcesses) =>
            prevProcesses.map((p) => {
                if (p.id === process.id) {
                    let newTime = p.time + 1;

                    switch (p.type) {
                        case 'cpu-bound':
                            if (newTime % 5 === 0) {
                                // Em um intervalo raro (por exemplo, múltiplos de 5), o processo entra em 'em espera'
                              
                                return { ...p, time: newTime, state: 'pronto' };
                            } else if (newTime % 10 === 0) {
                                // Em um intervalo ainda mais raro (por exemplo, múltiplos de 10), o processo entra em 'pronto'
                                return { ...p, time: newTime, state: 'em espera' };
                            } else {
                                // Na maior parte do tempo, o processo fica 'em execução'
                                return { ...p, time: newTime, state: 'em execução' };
                            }
                        
                        case 'i/o-bound':
                            if (newTime % 3 === 0) {
                                // Quando `newTime` é múltiplo de 3, o processo entra no estado 'em execução'
                                return { ...p, state: 'em execução', time: newTime };
                            } else if (newTime % 5 === 0) {
                                // Quando `newTime` é múltiplo de 5, o processo entra no estado 'em espera'
                                return { ...p, state: 'pronto', time: newTime };
                            } else {
                                // Caso contrário, o processo entra no estado 'pronto'
                                return { ...p, state: 'em espera', time: newTime };
                            };
                            
                            
                            case 'i/o-bound(fita)':
                                if (newTime % 3 === 0) {
                                    // Quando `newTime` é múltiplo de 3, o processo entra em 'em espera' (simulando espera pela E/S de fita)
                                    return { ...p, state: 'em espera', time: newTime };
                                } else if (newTime % 5 === 0) {
                                    // Ocasionalmente (múltiplos de 5), o processo entra no estado 'pronto'
                                    return { ...p, state: 'pronto', time: newTime };
                                } else {
                                    // Caso contrário, ele está 'em execução' momentaneamente
                                    return { ...p, state: 'em execução', time: newTime };
                                }
                            
                                case 'i/o-bound(terminal)':
                                    if (newTime % 4 === 0) {
                                        // Quando `newTime` é múltiplo de 4, o processo entra em 'em espera' (simulando espera pela interação com o terminal)
                                        return { ...p, state: 'em espera', time: newTime };
                                    } else if (newTime % 6 === 0) {
                                        // Ocasionalmente, o processo entra no estado 'pronto' para representar uma menor espera
                                        return { ...p, state: 'pronto', time: newTime };
                                    } else {
                                        // Na maior parte do tempo, ele está 'em execução' devido à interação rápida com o terminal
                                        return { ...p, state: 'em execução', time: newTime };
                                    }
                                
                                    case 'cpu e i/o-bound(disco)':
                                        if (newTime % 4 === 0) {
                                            // Quando `newTime` é múltiplo de 4, o processo entra em 'em espera' (simulando espera pela operação de I/O no disco)
                                            return { ...p, state: 'em espera', time: newTime };
                                        } else if (newTime % 8 === 0) {
                                            // Ocasionalmente, o processo entra no estado 'pronto' para representar que está pronto para ser executado
                                            return { ...p, state: 'pronto', time: newTime };
                                        } else {
                                            // Na maior parte do tempo, ele está 'em execução', pois está processando no CPU
                                            return { ...p, state: 'em execução', time: newTime };
                                        }
                                    
                                        case 'cpu e i/o-bound(fita)':
                                            if (newTime % 5 === 0) {
                                                // Quando `newTime` é múltiplo de 5, o processo entra em 'em espera' (simulando espera pela operação de E/S na fita)
                                                return { ...p, state: 'em espera', time: newTime };
                                            } else if (newTime % 10 === 0) {
                                                // Ocasionalmente, o processo entra no estado 'pronto' (representando um momento em que está pronto para execução)
                                                return { ...p, state: 'pronto', time: newTime };
                                            } else {
                                                // Na maior parte do tempo, o processo está 'em execução', utilizando o CPU para realizar o processamento
                                                return { ...p, time: newTime, state: 'em execução' };
                                            }
                        default:
                            return { ...p, state: 'pronto' }; // Muda para pronto se o tipo não for reconhecido
                    }
                }
                return p;
            })
        );
    }, intervalTime); // Usa o tempo dinâmico para o intervalo

    return interval;
};


// Função para parar todos os processos
export const stopAllProcesses = (setProcesses, setMemoryAllocations, setIntervals, intervals) => {
    // Limpa todos os intervalos
    Object.values(intervals).forEach(clearInterval);
  
    // Limpa os processos e alocações de memória
    setProcesses([]); // Remove todos os processos
    setMemoryAllocations([]); // Limpa as alocações de memória
    setIntervals({}); // Limpa os intervalos
  };
// Função para criar um novo processo
export const createNewProcess = (processes, setProcesses, type) => {
    const newProcess = {
        id: processes.length + 1,
        state: 'pronto', // Estado inicial como 'pronto'
        time: 0,
        isRunning: true,
        type, // Adiciona o tipo de processo
    };
    setProcesses([...processes, newProcess]);
};
