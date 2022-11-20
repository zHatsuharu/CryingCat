const { ActionRowBuilder, ButtonBuilder, EmbedBuilder, ButtonStyle, Colors } = require("discord.js");

module.exports = {
	name: 'interactionCreate',
	async execute(interaction) {
		if (!interaction.isButton()) return;
		if (interaction.customId == "closeTicket") {

			const newRow = new ActionRowBuilder()
				.addComponents(
					new ButtonBuilder()
						.setCustomId('reopenTicket')
						.setStyle(ButtonStyle.Primary)
						.setLabel('Rouvrir le ticket'),
					new ButtonBuilder()
						.setCustomId('stopTicket')
						.setStyle(ButtonStyle.Danger)
						.setLabel('Fin du ticket')
				)

			interaction.message.edit({ components: [newRow] });
			await interaction.channel.setParent("993962913331171398", { lockPermissions: false });
			interaction.channel.permissionOverwrites.edit(interaction.guild.roles.everyone.id, {
				"SendMessages": false
			});
			interaction.deferUpdate();

			const embed = new EmbedBuilder()
				.setDescription(`Le ticket a été clôturé par ${interaction.user}.`)
				.setColor(Colors.Red)

			interaction.channel.send({ embeds: [embed] });
		}
	}
}