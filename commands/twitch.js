const { SlashCommandBuilder } = require("@discordjs/builders");
const { insert } = require("../sqlite");

function makeEmbed(message, color) {
	const embed = new MessageEmbed()
		.setColor(color)
		.setDescription(message);
	return embed;
}

module.exports = {
	data: new SlashCommandBuilder()
		.setName('twitch')
		.setDescription("Lie le compte twitch au serveur pour notifier les utilisateurs.")
		.addChannelOption(option =>
			option.setName('channel')
				.setDescription('Le salon où le message va être envoyer.')
				.setRequired(true)
		)
		.addStringOption(option =>
			option.setName('url')
				.setDescription("L'url du stream.")
				.setRequired(true)	
		)
		.addStringOption(option =>
			option.setName('message')
				.setDescription("Le message qu'il y aura à chaque notification.")
				.setRequired(true)	
		),
	/**
	 * 
	 * @param {import("discord.js").CommandInteraction} interaction 
	 * @returns 
	 */
	async execute(interaction) {
		if (!interaction.member.roles.cache.some(role => role.name === "Streamer")) {
			return interaction.reply({ embeds: [makeEmbed("Tu ne possède pas le rôle <@&1033742394165821460>", "RED")], ephemeral: true });
		}

		const channel = interaction.options.getChannel('channel');
		const url = interaction.options.getString('url');
		const message = interaction.options.getString('message');

		insert('twitch', 'serverID, channelID, url, message', `${interaction.guildId}, ${channel.id}, ${url}, ${message}`);

		return interaction.reply({ embeds: [makeEmbed("L'url est bien sauvegardé !", "GREEN")], ephemeral: true });
	}
}