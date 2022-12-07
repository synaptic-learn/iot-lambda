import { IotData, MediaLive, config } from "aws-sdk";

import env from "./env";

config.update({ region: env["AWS_REGION"] });

const iot_data = new IotData({ endpoint: env.IOT_ENDPOINT });
const ml = new MediaLive();

function publishStarted() {
  return iot_data
    .publish({
      topic: env.IOT_TOPIC,
      payload: JSON.stringify({ action: "started" })
    })
    .promise();
}

export async function handler(event: any) {
  console.log(event);

  if (event.source === "aws.medialive") {
    if (event.detail.state === "RUNNING") {
      await publishStarted();
    }
    return;
  }

  switch (event.action) {
    case "start":
      const channel_description = await ml
        .describeChannel({ ChannelId: env.MEDIALIVE_CHANNEL_ID })
        .promise();

      switch (channel_description.State) {
        case "RUNNING":
          await publishStarted();
          return;
        case "IDLE":
          await ml
            .startChannel({ ChannelId: env.MEDIALIVE_CHANNEL_ID })
            .promise();
          return;
      }
      return;
    case "stop":
      await ml.stopChannel({ ChannelId: env.MEDIALIVE_CHANNEL_ID }).promise();
      return;
  }
}
