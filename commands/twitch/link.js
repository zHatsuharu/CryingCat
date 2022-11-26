const { get, insert } = require("../../sqlite");

module.exports = {
	/**
	 * 
	 * @param {import("discord.js").CommandInteraction} interaction
	 */
	async execute(interaction) {
		const url = interaction.options.getString('twitchurl');
		const message = interaction.options.getString('message');

		//`https://www.twitch.tv/username`

		await interaction.deferReply({ ephemeral: true });

		if (!await get('serverId', 'twitchServers', 'serverId', interaction.guildId)) {
			return await interaction.editReply({ content: "La fonctionnalité n'a pas été initialisée. Faites `/twitch init`." });
		}

		insert('twitchNotifs', ['serverID', 'url', 'message'], [interaction.guildId, url, message]);

		await interaction.editReply({ content: "L'utilisateur a bien été ajouté à la liste des notifications !" });
	}
}