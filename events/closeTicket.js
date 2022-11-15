const { MessageActionRow, MessageButton, MessageEmbed } = require("discord.js");

module.exports = {
	name: 'interactionCreate',
	async execute(interaction) {
		if (!interaction.isButton()) return;
		if (interaction.customId == "closeTicket") {

			const newRow = new MessageActionRow()
				.addComponents(
					new MessageButton()
						.setCustomId('reopenTicket')
						.setStyle('PRIMARY')
						.setLabel('Rouvrir le ticket'),
					new MessageButton()
						.setCustomId('stopTicket')
						.setStyle('DANGER')
						.setLabel('Fin du ticket')
				)

			interaction.message.edit({ components: [newRow] });
			await interaction.channel.setParent("993962913331171398", { lockPermissions: false });
			interaction.channel.permissionOverwrites.edit(interaction.guild.roles.everyone.id, {
				SEND_MESSAGES: false
			});
			interaction.deferUpdate();

			const embed = new MessageEmbed()
				.setDescription(`Le ticket a été clôturé par ${interaction.user}.`)
				.setColor("RED")

			interaction.channel.send({ embeds: [embed] });
		}
	}
}