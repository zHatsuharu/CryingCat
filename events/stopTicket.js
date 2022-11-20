const { PermissionsBitField, EmbedBuilder, Colors } = require("discord.js");

module.exports = {
	name: 'interactionCreate',
	async execute(interaction) {
		if (!interaction.isButton()) return;
		if (interaction.customId == "stopTicket") {
            if (interaction.memberPermissions.has(PermissionsBitField.Flags.Administrator)) {
                interaction.message.edit({ components: [] });
                interaction.deferUpdate();
                
                const embed = new EmbedBuilder()
				.setDescription(`Le ticket a définitivement été clôturé par ${interaction.user}.`)
				.setColor(Colors.DarkRed)
                
                interaction.channel.send({ embeds: [embed] });
            } else {
                interaction.reply({ content: "Seul un administrateur pour clôturer définitivement un ticket.", ephemeral: true });
            }
		}
	}
}