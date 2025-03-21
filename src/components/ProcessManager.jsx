import React, { useState, useEffect } from 'react';
import { startProcess, stopAllProcesses } from '../utils/processUtils';
import { allocateMemory } from '../utils/memoryUtils';
import { Semaphore } from './Semaphore';
import { DeadlockManager } from './DeadlockManager';
import { MemoryManager, totalProcesses, totalMemoryAllocated } from './MemoryManager';
import './ProcessManager.css';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faPlus, faMinus } from '@fortawesome/free-solid-svg-icons';
import { jsPDF } from 'jspdf';
import 'jspdf-autotable'; // Para tabelas

const Timer = () => {
  const [timeElapsed, setTimeElapsed] = useState(0);

  useEffect(() => {
    const timer = setInterval(() => {
      setTimeElapsed((prev) => prev + 1);
    }, 1000); // Atualiza a cada segundo

    return () => clearInterval(timer); // Limpa o timer ao desmontar
  }, []);

  const formatTime = (seconds) => {
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = seconds % 60;
    return `${minutes}:${remainingSeconds < 10 ? '0' : ''}${remainingSeconds}`;
  };

  return <span>{formatTime(timeElapsed)}</span>;
};

export const ProcessManager = () => {
  const [processes, setProcesses] = useState([]);
  const [memoryAllocations, setMemoryAllocations] = useState({});
  const [intervals, setIntervals] = useState({});
  const [processType, setProcessType] = useState('cpu-bound');
  const [intervalTime, setIntervalTime] = useState(1000);
  const [threadCounts, setThreadCounts] = useState({});
  const [semaphoreStates, setSemaphoreStates] = useState({});
  const [totalProcessesCount, setTotalProcessesCount] = useState(0);
  const [totalMemoryAllocated, setTotalMemoryAllocated] = useState(0);

  const updateSemaphoreState = (process) => {
    return process.state !== 'em espera'; // Bloqueado se "em espera"
  };

  useEffect(() => {
    const updatedSemaphoreStates = {};
    processes.forEach((process) => {
      updatedSemaphoreStates[process.id] = updateSemaphoreState(process);
    });
    setSemaphoreStates(updatedSemaphoreStates);
  }, [processes]);

  const handleCreateProcess = () => {
  
    const newProcess = {
      id: processes.length + 1,
      state: 'pronto',
      type: processType,
      time: 0,
      isRunning: true,
      originalIntervalTime: intervalTime,
      
    };

    setProcesses((prevProcesses) => [...prevProcesses, newProcess]);
    setTotalProcessesCount((prevCount) => prevCount + 1);

    const interval = startProcess(newProcess, setProcesses, intervalTime);
    setIntervals((prevIntervals) => ({ ...prevIntervals, [newProcess.id]: interval }));
    if (!(newProcess.id in memoryAllocations)) {
      const memory = allocateMemory(); // Certifique-se de que isso retorna um número
      setMemoryAllocations((prevAllocations) => ({
        ...prevAllocations,
        [newProcess.id]: memory,
      }));
      setTotalMemoryAllocated((prevTotal) => prevTotal + memory);
    }

    setThreadCounts((prevCounts) => ({ ...prevCounts, [newProcess.id]: Math.floor(Math.random() * 5) + 1 }));
  };
  const handleSaveToPDF = () => {
    const confirmSave = window.confirm('Tem certeza que deseja salvar o relatório em PDF?');
  
    if (confirmSave) {
      const doc = new jsPDF();
  
      // Título
      doc.setFontSize(18);
      
      doc.text('Relatório de Processos', 13, 20);
      const lineYPosition = 45; // Posição Y da linha
      doc.line(14, lineYPosition, 200, lineYPosition);
      // Adicionando o tempo total decorrido no cabeçalho
      const timerActive = document.querySelector('.time')?.innerText.split(': ')[1] || '00:00';
      doc.text(`Tempo Ativo: ${timerActive}`, 14, 40);
  

      doc.text(`Total de Processos: ${totalProcessesCount}`, 12, 30);
      doc.line(14, lineYPosition, 200, lineYPosition);
      // Adicionando tabela com os processos
      const tableColumn = ["ID", "Tipo", "Estado", "Tempo Total (s)", "Fatia de Tempo (ms)", "Threads",
      
      ];
      const tableRows = [];
  
      processes.forEach((process) => {
        // Verificar e corrigir a memória alocada

        const memoryAllocated = MemoryManager.getMemoryForProcess 
        ? MemoryManager.getMemoryForProcess(process.id) // Método para pegar memória alocada de um processo
        : "0 B"; // Valor padrão se o método não existir ou falhar
        

        // Verificar e corrigir o número de threads
        const numThreads = threadCounts[process.id] || 0; // Forçar valor default (0) se ausente
        
        // Construir a linha de dados do processo
        const processData = [
          process.id,
          process.type,
          process.state,
          process.time,
          process.originalIntervalTime,
          numThreads,  // Threads agora sempre terá um valor
          //memoryAllocated , // Garante que a memória sempre tenha valor e unidade
        ];
      
        tableRows.push(processData);
      });
  
      // Adicionando a tabela
      doc.autoTable({
        head: [tableColumn],
        body: tableRows,
        startY: 50 // Ajuste para garantir que a tabela não sobreponha os textos anteriores
      });
  
      // Salvar o PDF
      doc.save('relatorio_processos.pdf');
    }
  };
  
  
  
  
  
  const handleStopAllProcesses = () => {
    const confirmStop = window.confirm('Tem certeza que deseja encerrar todos os processos?');
    
    if (confirmStop) {
      stopAllProcesses(setProcesses, setMemoryAllocations, setIntervals, intervals);
  
      // Reseta contagens ao parar todos os processos
      setTotalProcessesCount(0);
      setTotalMemoryAllocated(0);
  
      // Mensagem de sucesso opcional após encerrar os processos
      window.alert('Todos os processos foram encerrados com sucesso.');
    }
  };
  

  const handleAdjustInterval = (adjustment) => {
    setIntervalTime((prevTime) => Math.max(100, prevTime + adjustment)); // Mantém no mínimo 100ms
  };

  useEffect(() => {
    const stateRotationInterval = setInterval(() => {
      setProcesses((prevProcesses) =>
        prevProcesses.map((p) => {
          if (p.isRunning) {
            return { ...p, state: 'em espera', isRunning: false };
          } else if (p.state === 'em espera') {
            return { ...p, state: 'pronto', isRunning: false };
          } else if (p.state === 'pronto') {
            return { ...p, state: 'em execução', isRunning: true };
          }
          return p;
        })
      );
    }, intervalTime);

    return () => clearInterval(stateRotationInterval);
  }, [processes, intervalTime]);

  return (
    <div className="container">
       <div className='corpotime'>
<div className="d-flex justify-content-between align-items-left bg-white text-dark p-2 mb-3" style={{ width: '100%' }}>
 
  <div className="me-3" style={{ width: 'auto', padding: '10px' }}>
  <div className="me-3" style={{ width: 'auto', padding: '10px' }}>
    <div className='time'>Tempo ativo: <Timer /></div>
  </div>
  </div>


  <div className="me-3 dedlocktst" style={{  padding: '10px' }}>
  <DeadlockManager processes={processes} />
  <div className='totalpm'>
  <h5>Total de Processos Criados: {totalProcesses}</h5>


  </div>
  </div>
  <div className="me-3" style={{ width: 'auto', padding: '10px' }}>
  </div>
  </div>
</div>
<div className="col-md-3 shadow position-absolute" style={{ right: 0, top: 90, height: '48vh', overflowY: 'auto', backgroundColor: '#bababa;', borderRight: '1px solid #dee2e6' }}>
      <div className="shadow-sm rounded p-2" style={{ backgroundColor: '#f8f9fa' }}>
        <h4 className="text-center">Gerenciador de Memória</h4>
        <MemoryManager processes={processes} />
        
      </div>
 
    </div>
 



      <h2 className='titulogerenciadorprocesos'>Gerenciador de Processos</h2>

  <div className="form-group col-md-3 corpo">
  <label htmlFor="processType">Escolha o tipo de processo:</label>
  <select
  id="processType"
  value={processType}
  onChange={(e) => setProcessType(e.target.value)}
  className="form-control mb-2 select-highlight"
>
  <option value="cpu-bound">CPU-bound</option>
  <option value="i/o-bound">I/O-bound</option>
  <option value="i/o-bound(fita)">I/O-bound (Fita)</option>
  <option value="i/o-bound(terminal)">I/O-bound (Terminal)</option>
  <option value="cpu e i/o-bound(disco)">CPU e I/O-bound (Disco)</option>
  <option value="cpu e i/o-bound(fita)">CPU e I/O-bound (Fita)</option>
</select>

<hr></hr>
  <div className="d-flex justify-content-center align-items-center gap-1 mt-2">
    <button
      className="btn btn-secondary"
      style={{ fontSize: '0.8em', padding: '0.25rem 0.5rem' }}
      onClick={() => handleAdjustInterval(-100)}
    >
      <FontAwesomeIcon icon={faMinus} style={{ fontSize: '0.85em' }} />
    </button>
    <p className="text-center mb-0 fatia">Fatia de Tempo: {intervalTime}ms</p>
    <button
      className="btn btn-secondary"
      style={{ fontSize: '0.8em', padding: '0.25rem 0.5rem' }}
      onClick={() => handleAdjustInterval(100)}
    >
      <FontAwesomeIcon icon={faPlus} style={{ fontSize: '0.85em' }} />
    </button>
  </div>


  <div className="d-flex justify-content-center mt-3">
  <button className="btn btn-primary" onClick={handleCreateProcess}>
    Criar
  </button>
</div>


 
     </div><br></br>
     <div className="d-flex justify-content-between gap-1 butt" style={{ width: "300px" ,marginLeft:"10px"}}>
    <button className="btn btn-danger" onClick={handleStopAllProcesses}>Parar</button>
    <button className="btn btn-success" onClick={handleSaveToPDF}>Salvar</button>
</div>


<br></br>

      


  
    <h3 className="text-center">Processos</h3>
    <hr style={{ margin: '20px 0', borderTop: '2px solid #000000' }} />

      <div className="process-list mt-3">
  <div className="process-grid">
    {processes.map((process) => {
      const numThreads = threadCounts[process.id] || 0; // Recupera o número de threads fixo para o processo atual

      // Função para parar o processo específico
      const handleStopProcess = (processId) => {
        // Remover o processo da lista de processos
        setProcesses((prevProcesses) => prevProcesses.filter((p) => p.id !== processId));
        
        // Parar o intervalo associado a esse processo
        clearInterval(intervals[processId]);
        setIntervals((prevIntervals) => {
          const { [processId]: _, ...remainingIntervals } = prevIntervals;
          return remainingIntervals;
        });

       // Remove a alocação de memória associada e atualiza a memória total
    setMemoryAllocations((prevAllocations) => {
      const memory = prevAllocations[processId];
      const { [processId]: _, ...remainingAllocations } = prevAllocations;
      setTotalMemoryAllocated((prevTotal) => prevTotal - memory); // Subtrai a memória do total
      return remainingAllocations;
    });

        // Remover o contador de threads associado
        setThreadCounts((prevCounts) => {
          const { [processId]: _, ...remainingCounts } = prevCounts;
          return remainingCounts;
        });
        
        // Atualizar o estado do semáforo
        setSemaphoreStates((prevStates) => {
          const { [processId]: _, ...remainingStates } = prevStates;
          return remainingStates;
        });
      };
      
      return (
          
        <div key={process.id} className="process-card ">
          
        <div className="titulo-status">
            <span className={`status-${process.state.replace(' ', '-')}`}>{process.state}</span>
            <p className="titulo">Processo #{process.id} ({process.type})</p>
        </div>
        <p>Tempo Total: {process.time}s</p>
        <p>Fatia de tempo original: {process.originalIntervalTime}ms</p>
    
        <p className='threads'>
            {process.state === 'pronto'
                ? `Processo está pronto com ${numThreads} threads prontas, aguardando execução.`
                : process.state === 'em espera'
                ? `Processo está esperando (bloqueado) com ${numThreads} threads prontas, sem execução.`
                : process.state === 'em execução'
                ? `Processo está em execução com ${numThreads} threads em execução.`
                : `Processo está ${process.state} com ${numThreads} threads.`}
        </p>
    
        {/* Footer do card com o botão de fechar */}
        <div className="card-footer">
            <button className="btn btn-danger btn-sm" onClick={() => handleStopProcess(process.id)}>
                Fechar
            </button>
        </div>
    </div>
    
      );
    })}
  </div>
</div>
<br></br>


      <Semaphore processes={processes} semaphoreStates={semaphoreStates} />
      
    </div>
  );
};
