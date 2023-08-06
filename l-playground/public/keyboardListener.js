function createKeyboardListener(document) {
    const state = {
        observers: []
    };

    function subscrive(observerFunction) {
        state.observers.push(observerFunction);
    }

    function notifyAll(command) {
        console.log(`Notifying ${state.observers.length} observers`);

        for (const observerFunction of state.observers) {
            observerFunction(command);
        }
    }

    document.addEventListener("keydown", handleKeydown);

    function handleKeydown(e) {
        const keyP = e.key;
        const command = {
            playerId: "player1",
            keyPressed: keyP
        }

        notifyAll(command);
    }

    return {
        subscrive
    }
}

export default createKeyboardListener;