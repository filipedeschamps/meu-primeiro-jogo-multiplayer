// componente da camada de Input
// Implementação do padrão de design: Dependency Injection
export default function createKeyboardListener(forum, document) {
    // Ainda não recebe mensagens pelo forum, portanto, passa um objeto vazio
    const notifyForum = forum.subscribe('input', {})
    // Implementação do design pattern: Observer
    // O que isso faz, em termos abstratos, é criar uma lista de funções que vamos chamar sempre que o listener for invocado, para as quais vamos chamar o comando que o listener recebeu. Os outros elementos do jogo vão se "inscrever" nesse subject, o que significa adicionar uma função à lista. Na prática, no nosso jogo, como só uma função é adicionada, o movePlayer, isso dá no mesmo que simplesmente invocar movePlayer(command) em vez de chamar notifyAll() (mais para a frente o servidor também vai se inscrever na lista, na verdade). Mas essa maneira, apesar de ser mais complexa, é muito mais escalável, flexível, e estaticamente desacoplada!
    let playerId = null
    
    // document é um objeto que implementa EventListener. Essa interface garante um método que permite que ela anuncie objetos do tipo evento. O primeiro argumento especifica qual tipo de evento nós estamos esperando, e o segundo ou um outro objeto que tb implemente EventListener ou uma função.
    document.addEventListener('keydown', handleKeyDown)
    
    function handleKeyDown(event) {
        const keyPressed = event.key
    
        // console.log(playerId)
        notifyForum({
            type: 'move_player',
            playerId: playerId,
            keyPressed
        })
    }

    function registerPlayerId(receivedId) {
        playerId = receivedId
        // console.log('registered ' + playerId)
    }
    

    return {
        registerPlayerId
    }
}