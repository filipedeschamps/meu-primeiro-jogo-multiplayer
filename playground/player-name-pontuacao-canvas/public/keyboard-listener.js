export default function createKeyboardListener(){

    const state = {
        observers: [],
        commands: [
            "ArrowUp",
            "ArrowRight",
            "ArrowDown",
            "ArrowLeft",
        ],
        playerId: null
    };

    function registerPlayerId(playerId){
        state.playerId = playerId;
    }

    function subscribe(observerFunction){
        state.observers.push(observerFunction);
    }

    function notifyAll(command){
        for( const observerFunction of state.observers){
            observerFunction(command);
        }
    }

    document.addEventListener('keydown', handleKeyDown);

    function handleKeyDown(event){                            
        const keyPressed = event.key;
        
        const command = {
            type: 'move-player',
            playerId: state.playerId,
            keyPressed
        }

        if(state.commands.includes(keyPressed)){
            notifyAll(command);                        
        }

    }

    return {
        subscribe,
        registerPlayerId
    }
}