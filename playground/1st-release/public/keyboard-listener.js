export default function createKeyboardListener(document) {
    const state = {
        observers: [],
        playerId: null
    }

    let keysPressed = [];

    function registerPlayerId(playerId) {
        state.playerId = playerId
    }

    function subscribe(observerFunction) {
        state.observers.push(observerFunction)
    }

    function notifyAll(command) {
        for (const observerFunction of state.observers) {
            observerFunction(command)
        }
    }

    document.addEventListener('keydown', handleKeydown)
    document.addEventListener('keyup', handleKeyup)

    function handleKeydown(event) {
        const keyPressed = event.key
        if(!keysPressed[keyPressed])
            registerKeyPressed(keyPressed)
    }

    function handleKeyup(event) {
        const keyPressed = event.key
        const intervalId = keysPressed[keyPressed]
        if(intervalId){
            keysPressed[keyPressed] = false
            clearInterval(intervalId)
        }
    }
    function registerKeyPressed(key){
        function handleKeyFunction() {
            const command = {
                type: 'move-player',
                playerId: state.playerId,
                keyPressed: key
            }

            notifyAll(command)
        }
        keysPressed[key] = setInterval(handleKeyFunction, 1000/4)
        handleKeyFunction()
    }

    return {
        subscribe,
        registerPlayerId
    }
}