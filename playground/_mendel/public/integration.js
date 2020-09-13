export default function createForum() {
    const observers = {}

    function subscribe(observerId, observeMethod) {
        // Inscreve um observer e lhe fornece o canal para emitir suas próprias mensagens
        // Se receber um objeto em vez de função, trata como dicionário de tipo para funcionalidade
        if (typeof observeMethod === 'object') {
            console.log(`[forum]> Observer "${observerId}" subscribed to forum using a type dictionary`)
            observers[observerId] = commandFromType(observeMethod)  
        }
        else {
            console.log(`[forum]> Observer "${observerId}" subscribed to forum using a custom function `)
            observers[observerId] = observeMethod
        }

        return (command) => {
            notifyAll(observerId, command)
        }
    }

    function unsubscribe(observerId) {
        delete observers[observerId]
    }

    function notifyAll(emitterId, message) {
        console.log(`[forum]> Observer "${emitterId}" emitting to ${Object.keys(observers).length - 1} observers`)
        // Adiciona o emissor na mensagem
        message['emitter'] = emitterId
        
        for (const observerId in observers) {
            if (emitterId === observerId) continue
            observers[observerId](message)
        }
    }

    function unsubscribeAll() {
        observers = {}
    }

    // Cria uma função que já transforma o tipo da mensagem na própria função que executa a resposta
    // Usa um object fornecido como dicionário para a tradução
    function commandFromType(acceptableTypes) {
        return (message) => {
            const commandFunction = acceptableTypes[message.type]
            if(commandFunction != undefined) {
                commandFunction(message)
            }
        }
    }

    return {
        observers,
        subscribe,
        unsubscribe,
        unsubscribeAll
    }

}