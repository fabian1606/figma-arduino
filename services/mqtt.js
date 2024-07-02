import mqtt from 'mqtt';

let client = null;
let isConnected = false;

export function connectMqtt() {
  console.log('Attempting to connect to MQTT Broker');
  client = mqtt.connect('mqtt://mqtt.hfg.design:1883');

  client.on('connect', () => {
    console.log('Connected to MQTT Broker');
    isConnected = true;
    client.publish("presence", "Hello mqtt", (error) => {
      if (error) {
        console.error('Initial publish error:', error);
      } else {
        console.log('Initial message published to "presence"');
      }
    });
  });

  client.on('error', (error) => {
    console.error('Connection error:', error);
    isConnected = false;
  });

  client.on('close', () => {
    console.log('Connection closed');
    isConnected = false;
  });

  client.on('reconnect', () => {
    console.log('Attempting to reconnect to MQTT Broker');
  });

  client.on('offline', () => {
    console.log('MQTT client is offline');
  });

  return client;
}

export function publishFrameId(topic, message) {
  console.log('Attempting to publish frameId');
  if (!isConnected) {
    console.error('Client not connected, attempting to reconnect');
    connectMqtt();
    return;
  }

  client.publish(topic, message, (error) => {
    if (error) {
      console.error('Publish error:', error);
    } else {
      console.log(`Message published to topic "${topic}"`);
    }
  });
}
