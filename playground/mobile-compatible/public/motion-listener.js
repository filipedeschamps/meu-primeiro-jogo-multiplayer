export default function createMotionListener(document) {
    const state = {
        observers: [],
        playerId: null
    }

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
	
	if (document.body.getBoundingClientRect().width > 900) {
   	document.addEventListener('keydown', handleKeydown)
		
		function handleKeydown(event) {
        const keyPressed = event.key
        
        const command = {
            type: 'move-player',
            playerId: state.playerId,
            keyPressed
        }

        notifyAll(command)
   	}
	}else {
		 document.body.querySelectorAll('.button').forEach((button) => {
		 	button.addEventListener('click', handleButtonClick)
		 })
		 
   	function handleButtonClick(event) {
        const keyPressed = event.target.id
        
        const command = {
            type: 'move-player',
            playerId: state.playerId,
            keyPressed
        }

        notifyAll(command)
   	}
	}
	 
    return {
        subscribe,
        registerPlayerId
    }
}