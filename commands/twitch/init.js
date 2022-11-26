const { insert, get } = require("../../sqlite");

module.exports = {
	/**
	 * 
	 * @param {import("discord.js").CommandInteraction} interaction
	 */
	async execute(interaction) {

		const streamer = interaction.options.getRole('streamerrole');
		const viewer = interaction.options.getRole('viewerrole');
		const channel = interaction.options.getChannel('notifchannel');
		
		await interaction.deferReply({ ephemeral: true });

		if (await get('serverId', 'twitchServers', 'serverId', interaction.guildId)) {
			return await interaction.editReply({ content: "Le serveur possède déjà une configuration pour les notifications twitch." });
		}
		insert('twitchServers', ['serverID', 'channelID', 'streamerId', 'viewerId'], [interaction.guildId, channel.id, streamer.id, viewer.id]);

		await channel.send({ content: "Ce salon a été désigné pour les notifications twitch !" });

		await interaction.editReply({ content: "La fonctionnalité a bien été initialisée !" });
	}
}