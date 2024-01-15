export default function createKeyboardListener(document) {
  const state = {
    observers: []
  }

  function subscribe(observerFunction) {
    state.observers.push(observerFunction)
  }

  function notifyAll(command) {
    for (const observerFunction of state.observers) {
      observerFunction(command)
    }
  }

  document.addEventListener('keydown', handleKeyDown)

  function handleKeyDown(event) {
    const keyPressed = event.key;

    const command = {
      playerId: 'player1',
      keyPressed
    }

    notifyAll(command);

  }

  return {
    subscribe
  }
}
