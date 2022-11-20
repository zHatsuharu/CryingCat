const { SlashCommandBuilder, EmbedBuilder, Colors } = require("discord.js");
const fs = require('node:fs');
const path = require('node:path');

function makeEmbed(message, color) {
	const embed = new EmbedBuilder()
		.setColor(color)
		.setDescription(message);
	return embed;
}

module.exports = {
	data: new SlashCommandBuilder()
		.setName('twitch')
		.setDescription("Lie le compte twitch au serveur pour notifier les utilisateurs.")
		.addSubcommand(subcommand =>
			subcommand
			.setName('init')
			.setDescription('Initialise la fonctionnalité de twitch.')
			.addRoleOption(option =>
				option
				.setName('streamerrole')
				.setDescription("Le rôle qu'aurons les streamers.")
				.setRequired(true)
			)
			.addRoleOption(option =>
				option
				.setName('viewerrole')
				.setDescription("Le rôle qu'aurons les viewers. Les viewers seront ping à chaque message de notification.")
				.setRequired(true)
			)
			.addChannelOption(option =>
				option
				.setName('notifchannel')
				.setDescription("Le salon auquel les notifications vont être envoyer.")
				.addChannelTypes(0)
				.setRequired(true)
			)
		)
		.addSubcommand(subcommand =>
			subcommand
			.setName('link')
			.setDescription('Fait un lien avec la chaine twitch pour envoyer des notifications quand le streamer sera en live.')
			.addStringOption(option =>
				option
				.setName("twitchurl")
				.setDescription("L'URL de la chaine twitch.")
				.setRequired(true)
			)
			.addStringOption(option =>
				option
				.setName('message')
				.setDescription('Le message qui sera envoyé à chaque mention.')
			)
		),
	/**
	 * 
	 * @param {import("discord.js").CommandInteraction} interaction 
	 */
	async execute(interaction) {


		const subcommand = interaction.options.getSubcommand();

		const subcommandsPath = path.join(__dirname, 'twitch');
		const subcommandsFiles = fs.readdirSync(subcommandsPath).filter(file => file.endsWith('.js'));

		for (const file of subcommandsFiles) {
			if (file.startsWith(subcommand)) {
				return require(path.join(subcommandsPath, file)).execute(interaction);
			}
		}

		return interaction.reply({ embeds: [makeEmbed("Unexpected error.", Colors.Red)], ephemeral: true });

		/*
		if (!interaction.member.roles.cache.some(role => role.name === "Streamer")) {
			return interaction.reply({ embeds: [makeEmbed("Tu ne possède pas le rôle <@&1033742394165821460>", Colors.Red)], ephemeral: true });
		}

		const channel = interaction.options.getChannel('channel');
		const url = interaction.options.getString('url');
		const message = interaction.options.getString('message');

		insert('twitch', 'serverID, channelID, url, message', `${interaction.guildId}, ${channel.id}, ${url}, ${message}`);

		return interaction.reply({ embeds: [makeEmbed("L'url est bien sauvegardé !", Colors.Green)], ephemeral: true });
		*/
	}
}