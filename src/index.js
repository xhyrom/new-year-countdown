const EXPECTED_YEAR = 2025;
const NEW_YEAR_MESSAGE_THREAD_ID = "1323426582681092261";

import "dotenv/config";
import { Client } from "discord.js";
import { IntentsBitField } from "discord.js";
import getTimezoneOffset from "./getTimezoneOffset.js";
import moment from "moment-timezone";
import numberPad from "./numberPad.js";

const client = new Client({
  intents: [IntentsBitField.Flags.Guilds],
});

let oldMessage;

client.on("ready", () => {
  console.log(`Logged in as ${client.user.tag}!`);

  setInterval(async () => {
    const cooldowns = [];

    for (const timezone of timezones.values()) {
      const currentTime = moment().tz(timezone);
      const utcOffset = currentTime.utcOffset();
      const utcOffsetHours = Math.floor(utcOffset / 60);
      const utcOffsetMinutes = Math.abs(utcOffset % 60);

      let formattedUtcOffset = "UTC";
      if (utcOffset > 0) {
        formattedUtcOffset +=
          "+" + utcOffsetHours + ":" + numberPad(utcOffsetMinutes);
      } else {
        formattedUtcOffset +=
          "-" + Math.abs(utcOffsetHours) + ":" + numberPad(utcOffsetMinutes);
      }

      if (currentTime.year() === EXPECTED_YEAR) {
        client.channels.cache
          .get("1058696238444335154")
          .threads.cache.get(NEW_YEAR_MESSAGE_THREAD_ID)
          .send(
            `🎉🥂 Happy New Year 🥂🎉 to all our friends in **${timezone} (${formattedUtcOffset})**! May the coming year be filled with joy, prosperity, and happiness. 🌟🎆`,
          );
        timezones.delete(getTimezoneOffset(timezone));
        continue;
      }

      const newYearEve = moment().tz(timezone).endOf("year").format();

      const countdown = moment.duration(moment(newYearEve).diff(currentTime));
      const days = countdown.days();
      const hours = countdown.hours();
      const minutes = countdown.minutes();
      const seconds = countdown.seconds();

      cooldowns.push({
        timezone,
        offset: formattedUtcOffset,
        days,
        hours,
        minutes,
        seconds,
      });
    }

    if (cooldowns.length === 0) return;
    if (oldMessage != null) {
      oldMessage.edit(
        [
          "🎉 As we eagerly await the arrival of the New Year, let's check in on the countdown times across the globe! 🌍",
          "",
          cooldowns
            .map(
              ({ timezone, offset, days, hours, minutes, seconds }) =>
                `**${timezone}** (**${offset}**): ${
                  days > 0 ? `${days}d ` : ""
                }${hours}h ${minutes}m ${seconds}s`,
            )
            .join("\n"),
        ].join("\n"),
      );
      return;
    }

    oldMessage = await client.channels.cache
      .get("1058696238444335154")
      .send(
        [
          "🎉 As we eagerly await the arrival of the New Year, let's check in on the countdown times across the globe! 🌍",
          "",
          cooldowns
            .map(
              ({ timezone, offset, days, hours, minutes, seconds }) =>
                `**${timezone}** (**${offset}**): ${
                  days > 0 ? `${days}d ` : ""
                }${hours}h ${minutes}m ${seconds}s`,
            )
            .join("\n"),
        ].join("\n"),
      );
  }, 5000);
});

let timezones = new Map();
for (const timezone of [...Intl.supportedValuesOf("timeZone"), "Etc/GMT+12"]) {
  const currentTime = moment().tz(timezone);
  if (currentTime.year() === EXPECTED_YEAR) continue;

  timezones.set(getTimezoneOffset(timezone), timezone);
}

// sort timezones by offset
timezones = new Map([...timezones.entries()].sort((a, b) => a[0] - b[0]));

client.login(process.env.DISCORD_BOT_TOKEN);
