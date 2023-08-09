function createKeyboardListener(document) {
    const state = {
        observers: [],
        playerId: null
    };

    function registerPlayerId(playerId){
        state.playerId = playerId
    }

    function subscribe(observerFunction) {
        state.observers.push(observerFunction);
    }

    function notifyAll(command) {
        for (const observerFunction of state.observers) {
            observerFunction(command);
        }
    }

    document.addEventListener("keydown", handleKeydown);

    function handleKeydown(e) {
        const keyP = e.key;
        const command = {
            type: "move-player",
            playerId: state.playerId,
            keyPressed: keyP
        }

        notifyAll(command);
    }

    return {
        subscribe,
        registerPlayerId
    }
}

export default createKeyboardListener;