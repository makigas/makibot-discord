import path from "path";

import Commando from "discord.js-commando";

import ConfigSchema from "./ConfigSchema";
import { getDatabase } from "./settings";
import PinService from "./hooks/pin";
import RosterService from "./hooks/roster";
import VerifyService from "./hooks/verify";
import WarnService from "./hooks/warn";

export default class Makibot extends Commando.CommandoClient {
  public constructor() {
    super({
      commandPrefix: "!",
      owner: ConfigSchema.owner,
      disableEveryone: true,
      unknownCommandResponse: false,
    });

    this.registry.registerDefaultTypes();
    this.registry.registerGroups([
      ["admin", "Administración"],
      ["moderation", "Moderación"],
      ["utiles", "Utilidad"],
    ]);
    this.registry.registerCommandsIn({
      dirname: path.join(__dirname, "commands"),
      filter: /^([^\.].*)\.[jt]s$/,
    });

    this.on("ready", () => console.log(`Logged in successfully as ${this.user.tag}.`));

    this.once("ready", () => {
      getDatabase()
        .then((db) => this.setProvider(new Commando.SQLiteProvider(db)))
        .then(() => {
          // Register hooks.
          new PinService(this);
          new RosterService(this);
          new VerifyService(this);
          new WarnService(this);
        })
        .catch(console.log);
    });

    this.on("shardDisconnect", () => {
      console.error(`The bot has been disconnected.`);
      this.shutdown(1);
    });

    this.login(ConfigSchema.token);
  }

  shutdown(exitCode = 0) {
    console.log("The bot was asked to shutdown.");
    this.destroy();
    console.log("Good night!");
    process.exit(exitCode);
  }
}
