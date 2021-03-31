export default function createCPU(game) {
	
	function start() {
		setInterval(() => {
			const removerId = 'remover_' + Math.floor(Math.random() * 80000)
			game.addRemover({ removerId: removerId })
			setTimeout(() => {
				game.removeRemover({ removerId: removerId })
			}, 30000);
		}, 60000)
	
		setInterval(() => {
			for (const removerId in game.state.removers) {
				const remover = game.state.removers[removerId]
				remover.targetId = game.getTargetFromRemover(removerId)
				const target = game.state.players[remover.targetId]
				
    			game.checkForRemoverCollision(removerId)
				
				if (target) {
	    			let direction;
	 				const coords = ['x','y'], index = Math.floor(Math.random() * 2)
	 				const followByXCoord = coords[index] === 'x'
	 				
	 				if (remover.y === target.y || followByXCoord) {
	    				direction = remover.x < target.x ? 'right' : 'left'
	    			}else {
	    				direction = remover.y < target.y ? 'down' : 'up'
	    			}
	    			
					game.moveRemover({
						type: 'move-remover',
						removerId: removerId,
						direction: direction
					})
				}
			}
		}, 500)
	}
	
	return {
		start
	}
}