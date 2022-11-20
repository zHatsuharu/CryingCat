const { ActionRowBuilder, ButtonBuilder, EmbedBuilder, ButtonStyle, Colors } = require("discord.js");

module.exports = {
	name: 'interactionCreate',
	/**
	 * 
	 * @param {import("discord.js").ButtonInteraction} interaction
	 */
	async execute(interaction) {
		if (!interaction.isButton()) return;
		if (interaction.customId == "reopenTicket") {

			const newRow = new ActionRowBuilder()
				.addComponents(
					new ButtonBuilder()
						.setCustomId('closeTicket')
						.setStyle(ButtonStyle.Danger)
						.setLabel('Fermer le ticket')
				);

			interaction.message.edit({ components: [newRow] });
			await interaction.channel.setParent("993962837749792768", { lockPermissions: false });
			interaction.channel.permissionOverwrites.edit(interaction.guild.roles.everyone.id, {
				"SendMessages": true
			});
			interaction.deferUpdate();

			const embed = new EmbedBuilder()
				.setDescription(`Le ticket a été réouvert par ${interaction.user}.`)
				.setColor(Colors.Blue)

			interaction.channel.send({ embeds: [embed] });
		}
	}
}