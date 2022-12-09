import { IotData, MediaLive, config } from "aws-sdk";

import env from "./env";

config.update({ region: env["AWS_REGION"] });

const iot_data = new IotData({ endpoint: env.IOT_ENDPOINT });
const ml = new MediaLive();

export async function handler(event: any) {
  console.log(event);

  if (event.source === "aws.medialive") {
    await eventBridgeHandler(event.detail.state);
  } else if (event.action) {
    await iotHandler(event.action);
  } else if (event.Records?.[0]?.EventSource === "aws:sns") {
    await snsHandler(event.Records[0].Sns.Message);
  }
}

function eventBridgeHandler(state: MediaLive.ChannelState) {
  if (state === "RUNNING") {
    return publishStarted();
  }
}

async function iotHandler(action: string) {
  switch (action) {
    case "start":
      const channel_description = await ml
        .describeChannel({ ChannelId: env.MEDIALIVE_CHANNEL_ID })
        .promise();

      switch (channel_description.State) {
        case "RUNNING":
          await publishStarted();
          break;
        case "IDLE":
          await ml
            .startChannel({ ChannelId: env.MEDIALIVE_CHANNEL_ID })
            .promise();
          break;
      }
      break;
    case "stop":
      await ml.stopChannel({ ChannelId: env.MEDIALIVE_CHANNEL_ID }).promise();
      break;
  }
}

function snsHandler(message: string) {
  return publishMessage(message);
}

function publishStarted() {
  return iot_data
    .publish({
      topic: env.IOT_TOPIC,
      payload: JSON.stringify({ action: "started" })
    })
    .promise();
}

function publishMessage(message: string) {
  return iot_data
    .publish({
      topic: env.IOT_TOPIC,
      payload: JSON.stringify({ message })
    })
    .promise();
}
