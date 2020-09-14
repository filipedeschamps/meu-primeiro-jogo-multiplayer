// componente da camada de Input
// Implementação do padrão de design: Dependency Injection
export default function createKeyboardListener(forum, document) {
    // Ainda não recebe mensagens pelo forum, portanto, passa um objeto vazio
    const notifyForum = forum.subscribe('input', {})
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