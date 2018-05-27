import * as Commando from 'discord.js-commando';
import { Client, Guild, Role } from 'discord.js';

interface HelperCommandArguments {
    mode: string
}

export = class HelperCommand extends Commando.Command {

    constructor(client: Commando.CommandoClient) {
        super(client, {
            name: 'helper',
            group: 'utiles',
            memberName: 'helper',
            description: 'Te mete o te quita del rol de helpers.',
            examples: ['helper true', 'helper false'],
            args: [
                { key: 'mode', type: 'string', prompt: '¿Quieres entrar o salir del rol helpers?.', default: '' }
            ]
        });
    }

    async run(msg: Commando.CommandMessage, args: HelperCommandArguments) {
        // Get the helper role name from ENV.
        let roleName = process.env.HELPER_ROLE || 'helpers';
        if (!msg.guild.roles.find('name', roleName)) {
            let message = [
                'Oh, oh. Parece que este bot no está bien configurado.',
                `¿Hay algún admin que pueda crear un rol llamado "${roleName}"?`
            ].join('\n');
            return msg.channel.send(message);
        }

        let role = msg.guild.roles.find('name', roleName);

        // Act on behalf of what the user wants.
        switch (HelperCommand.opmode(args.mode)) {
            case 'yes':
                if (msg.member.roles.has(role.id)) {
                    return msg.reply(`Ya formabas parte del rol ${roleName}.`);
                } else {
                    return msg.member.addRole(role)
                        .then(member => msg.reply(`Ahora estás en el rol ${roleName}.`))
                        .catch(e => msg.reply(`No puedo satisfacer tu orden porque ${e}.`));
                }

            case 'no':
                // Remove the user from this role unless they're never in.
                if (msg.member.roles.has(role.id)) {
                    return msg.member.removeRole(role)
                        .then(member => msg.reply(`Ya no formas parte del rol ${roleName}.`))
                        .catch(e => msg.reply(`No puedo satisfacer tu orden porque ${e}.`));
                } else {
                    return msg.reply(`No formabas parte del rol ${roleName}.`);
                }

            case 'help':
                let roleStatus = msg.member.roles.has(role.id) ?
                    `**Formas parte del rol ${roleName}**.` :
                    `**No formas parte del rol ${roleName}**.`;
                let helpMessages: string[] = [
                    "Envía `!helper on` para unirte al grupo helper.",
                    "Envía `!helper off` para abandonar el grupo helper.",
                    "",
                    "Otros términos reconocidos como on: true, t, yes, y, on, enable, enabled, 1, +, si, s, aceptar, ok",
                    "Otros términos reconocidos como off: false, f, no, n, off, disable, disabled, 0, -, cancelar, cancel"
                ]
                return msg.reply([roleStatus].concat(helpMessages).join('\n'));

            case 'invalid':
                return msg.reply("Parámetro desconocido. Envía `!helper` para ver la ayuda.");
        }
    }

    private static opmode(mode: string): string {
        mode = mode.toLowerCase().trim();
        if (mode == '') {
            return 'help';
        } else if (HelperCommand.yes.has(mode)) {
            return 'yes';
        } else if (HelperCommand.no.has(mode)) {
            return 'no';
        } else {
            return 'invalid';
        }
    }

    private static yes = new Set([
        'true', 't', 'yes', 'y', 'on', 'enable', 'enabled', '1', '+',
        'si', 's', 'aceptar', 'ok'
    ]);
    private static no = new Set([
        'false', 'f', 'no', 'n', 'off', 'disable', 'disabled', '0', '-',
        'cancelar', 'cancel'
    ]);
}
