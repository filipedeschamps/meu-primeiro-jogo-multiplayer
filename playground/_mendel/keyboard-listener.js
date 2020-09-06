// componente da camada de Input
// Implementação do padrão de design: Dependency Injection
export default function createKeyboardListener(document) {
    // Implementação do design pattern: Observer
    // O que isso faz, em termos abstratos, é criar uma lista de funções que vamos chamar sempre que o listener for invocado, para as quais vamos chamar o comando que o listener recebeu. Os outros elementos do jogo vão se "inscrever" nesse subject, o que significa adicionar uma função à lista. Na prática, no nosso jogo, como só uma função é adicionada, o movePlayer, isso dá no mesmo que simplesmente invocar movePlayer(command) em vez de chamar notifyAll() (mais para a frente o servidor também vai se inscrever na lista, na verdade). Mas essa maneira, apesar de ser mais complexa, é muito mais escalável, flexível, e estaticamente desacoplada!
    const state = {
        observers: []
    }

    function subscribe(observerFunction) {
        state.observers.push(observerFunction)
    }

    function notifyAll(command) {
        console.log(`Notifying ${state.observers.length} observers`)
        
        for (const observerFunction of state.observers) {
            observerFunction(command)
        }
    }
    
    // document é um objeto que implementa EventListener. Essa interface garante um método que permite que ela anuncie objetos do tipo evento. O primeiro argumento especifica qual tipo de evento nós estamos esperando, e o segundo ou um outro objeto que tb implemente EventListener ou uma função.
    document.addEventListener('keydown', handleKeyDown)

    function handleKeyDown(event) {
        const keyPressed = event.key

        const command = {
            playerId: 'player1',
            keyPressed
        }

        notifyAll(command)
    }

    return {
        subscribe
    }
}