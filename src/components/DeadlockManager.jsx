import React from 'react';

export const DeadlockManager = ({ processes }) => {
  // Função que simula a detecção de deadlock
  const checkDeadlock = () => {
    const waitingProcesses = processes.filter(process => process.state === 'em espera'); // Processos em espera

    // Deadlock ocorre quando há mais de um processo em espera
    if (waitingProcesses.length > 1) {
      return 'Deadlock detectado!';
    }

    return 'Nenhum deadlock detectado.';
  };

  const deadlockMessage = checkDeadlock();
  const alertClass = deadlockMessage === 'Deadlock detectado!' ? 'alert alert-danger text-center mt-3' : 'alert alert-info text-center mt-3';

  return (
    <div className="container p-3 mb-5 bg-white rounded">
      <h3 className="text-end">Gerenciador de Deadlock</h3> {/* Alinhamento à direita */}
      <div className={alertClass}>
        {deadlockMessage}
      </div>
    </div>
  );
};
