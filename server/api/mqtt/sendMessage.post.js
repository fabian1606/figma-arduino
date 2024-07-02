import mqtt from 'mqtt';

export default defineEventHandler(async (event) => {
    const body = await readBody(event)
    console.log(body, body.client, body.message, body.topic);
    if(! body.client || ! body.message || ! body.topic) return {error: 'missing client, message or topic'}
    console.log('newMqttEvent');
    const client = mqtt.connect(body.client);
    client.on('connect', () => {
        client.publish(body.topic, body.message, (error) => {
            if (error) {
                console.error('Publish error:', error);
            } else {
                console.log(`Message published to topic "${body.topic}"`);
            }
        });
    });
    return {success: 'message sent'}
});