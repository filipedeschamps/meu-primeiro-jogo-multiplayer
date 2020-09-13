export default function createKeyboardListener(){

    const state = {
        observers: [],
        playerId: null
    };

    function registerPlayerId(playerId){
        state.playerId = playerId;
    }

    function subscribe(observerFunction){
        state.observers.push(observerFunction);
    }

    function notifyAll(command){
        //console.log(`Notify ${state.observers.length} observers`);

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

        notifyAll(command);            
    }

    return {
        subscribe,
        registerPlayerId
    }
}