import { EventEmitter } from "events";
import { getEventFromTopic, MQTT_HOST, MQTT_OPTIONS, MQTT_TOPICS, TopicItem } from "./mqtt";
import mqtt, { MqttClient } from "precompiled-mqtt";
import { parseMessage, WSStatus } from "./utils";
import { log } from "../../../utils/debug";

export enum MqState {
  IDLE,
  CONNECTING,
  CONNECTED,
  ERROR,
}

export type MQEmitData<D> = {
  topic: string;
  data: D;
};

class MQClient extends EventEmitter {
  client: MqttClient;
  constructor() {
    super();
    this.client = mqtt.connect(MQTT_HOST, MQTT_OPTIONS);
    this._setCallbacks();
  }

  emitState = (state: MqState) => {
    this.emit("mq_state", state);
  };

  _setCallbacks = () => {
    this.client.on(WSStatus.CONNECT, () => {
      this._subscribeAll();
      this.emitState(MqState.CONNECTED);
    });
    this.client.on(WSStatus.ERROR, (err) => {
      console.error("___ socket error:", err);
      this.client.end();
      this.emitState(MqState.ERROR);
      // todo add try reconnect
    });
    this.client.on(WSStatus.RECONNECT, () => this.emitState(MqState.CONNECTING));
    this.client.on(WSStatus.MESSAGE, this._processIncomeMessage);
  };

  _processIncomeMessage = (topic: string, message: string) => {
    const data = parseMessage(message);
    this.emit(getEventFromTopic(topic), { topic, data });
  };

  _subscribeAll = () => {
    MQTT_TOPICS.map((topic) => this._subscribe(topic));
  };

  _subscribe = ({ topic, qos }: TopicItem) => {
    this.client.subscribe(topic, { qos }, (error) => {
      log("subscribed to ", topic);

      if (error) {
        log("Subscribe to topics error: ", error);
        return;
      }
    });
  };

  _unsubscribeAll = () => {
    MQTT_TOPICS.map((topic) => this._unsubscribe(topic));
  };

  _unsubscribe = ({ topic }: TopicItem) => {
    this.client.unsubscribe(topic, (error: Error) => {
      log("unsubscribe: ", topic);

      if (error) {
        log("Unsubscribe error: ", error);
        return;
      }
    });
  };

  publish = ({ topic, qos }: TopicItem, data: any) => {
    this.client.publish(topic, data, { qos }, (error) => {
      if (error) {
        log("Publish error: ", error);
      }
    });
  };

  destroy = () => {
    this.client.end();
    this._unsubscribeAll();
  };
}

const mqClient = new MQClient();

export default mqClient;
