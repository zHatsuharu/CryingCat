const { MessageActionRow, MessageButton, MessageEmbed } = require("discord.js");

module.exports = {
	name: 'interactionCreate',
	async execute(interaction) {
		if (!interaction.isButton()) return;
		if (interaction.customId == "reopenTicket") {

			const newRow = new MessageActionRow()
				.addComponents(
					new MessageButton()
						.setCustomId('closeTicket')
						.setStyle('DANGER')
						.setLabel('Fermer le ticket')
				);

			interaction.message.edit({ components: [newRow] });
			await interaction.channel.setParent("993962837749792768", { lockPermissions: false });
			interaction.channel.permissionOverwrites.edit(interaction.guild.roles.everyone.id, {
				SEND_MESSAGES: true
			});
			interaction.deferUpdate();

			const embed = new MessageEmbed()
				.setDescription(`Le ticket a été réouvert par ${interaction.user}.`)
				.setColor("BLUE")

			interaction.channel.send({ embeds: [embed] });
		}
	}
}