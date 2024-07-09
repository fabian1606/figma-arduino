
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

const writeWhenReady = async (line) => {
    if (outputStream) {
        await writeToStream(line);
    } else {
        setTimeout(() => {
            writeWhenReady(line);
        }
        , 500);
    }
}

export function serialSendFrames(frames){
    const formattedFrames = frames.map(frame => {
        return {id: frame.id, name: frame.name}
    })
    const json = JSON.stringify({frameData: formattedFrames});
    writeWhenReady(json);
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
    console.log('[Serial] send: ', line);
    await writer.write(line + '\n');
    writer.releaseLock();
}

async function readLoop() {

    while (true) {
        const { value, done } = await reader.read();
        if (value) {
            textContent += value;
            if(value.includes('\n')) {
                console.log('[SERIAL] received: ', textContent);
                try{
                    const json = JSON.parse(textContent)
                    textContent = "";
                    if(json.frameId){
                        console.log('frameId', json.frameId, json.flowId);
                        if(callbackFunction){
                            callbackFunction(json.frameId,json.flowId);
                        }   
                    }
                    if(json.log){
                        console.log('[SERIAL] log: ', json.log);
                    }
                    if(json.error){
                        console.error('[SERIAL] error: ', json.error);
                    }
                }
                catch(e){
                    console.log('Error parsing JSON', e)
                    textContent = "";
                }
            }

        }
        if (done) {
            reader.releaseLock();
            break;
        }
    }
}