
function send() {
    const toSend = document.getElementById("input").value
    writeToStream(toSend)
    document.getElementById("input").value = ""

}

let reader;
let textContent = "";
let outputStream;

function handle(e) {
    if (e.keyCode === 13) {
        e.preventDefault();
        send();
    }
}

export async function connect() {
    const port = await navigator.serial.requestPort();
    console.log('Connect');
    await port.open({ baudRate: 115200 });
    console.log('Open');
    let decoder = new TextDecoderStream();
    const inputDone = port.readable.pipeTo(decoder.writable);
    const inputStream = decoder.readable;

    const encoder = new TextEncoderStream();
    const outputDone = encoder.readable.pipeTo(port.writable);
    outputStream = encoder.writable;
    
    reader = inputStream.getReader();
    readLoop();
}
export function frameChanged( frame ){
    writeToStream(JSON.stringify({frameId:frame}))
}
let callbackFunction = null;	

export function setCallbackFunction( callback ){
    callbackFunction = callback;
}

async function writeToStream(line) {
    if (!outputStream) {
        console.log('Not connected to a serial port.');
        return;
    }
    const writer = outputStream.getWriter();
    console.log('[SEND]', line);
    await writer.write(line + '\n');
    writer.releaseLock();
}

async function readLoop() {
    console.log('Readloop');

    while (true) {
        const { value, done } = await reader.read();
        if (value) {
            textContent += value;
            if(value.includes('\n')) {
                console.log('[readLoop] VALUE', textContent);
                try{
                    const json = JSON.parse(textContent)
                    textContent = "";
                    console.log('JSON', json);
                    if(json.frameId){
                        console.log('frameId', json.frameId);
                        if(callbackFunction){
                            callbackFunction(json.frameId);
                        }
                    }
                }
                catch(e){
                    console.log('Error parsing JSON', e)
                    textContent = "";
                }
            }

        }
        if (done) {
            console.log('[readLoop] DONE', done);
            reader.releaseLock();
            break;
        }
    }
}