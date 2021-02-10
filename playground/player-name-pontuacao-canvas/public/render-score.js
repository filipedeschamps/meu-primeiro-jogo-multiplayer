function playersRanking(players, length = 10){       

    const playersInArray = [];
    for(let playerId in players){
        playersInArray.push(players[playerId]);
    }
    
    const sortedArrayOfPlayer = playersInArray.sort( ( a, b ) => b.score - a.score);

    
    return sortedArrayOfPlayer.slice( 0, length);
}

export default function renderScore(canvasScore, game, requestAnimationFrame, currentPlayerId){        
    
    const currentPlayer = game.state.players[currentPlayerId];

    const context = canvasScore.getContext('2d');
    context.fillStyle = 'white';
    context.clearRect( 0, 0, canvasScore.width, canvasScore.height );

    context.font = '20px Arial';
    context.textBaseline = 'hanging'; 
    context.fillStyle = "#000";
    context.fillText(`Minha Pontuação: ${currentPlayer?.score || 0}pts`, 1, 5);    
    
    context.fillText(`Ranking TOP 10 `, 1, 40);   
    context.fillText(`Posição - Jogador - Pontos`, 1, 70);
    
    const ranking = playersRanking(game.state.players, 10);

    let marginFactor = 100;

    for(let playerRanked in ranking){
        if(currentPlayer?.name){
            const position = Number(playerRanked)+1;

            context.fillStyle = currentPlayer.name === ranking[playerRanked].name ? "blue" : "#000";
            
            context.fillText(`${position} - ${ranking[playerRanked].name} - ${ranking[playerRanked].score}pts`, 1, marginFactor);           
            marginFactor += 30;
        }        
    }

    requestAnimationFrame(()=> renderScore(canvasScore, game, requestAnimationFrame, currentPlayerId))

}