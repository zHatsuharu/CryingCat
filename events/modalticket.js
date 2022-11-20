const { PermissionsBitField, EmbedBuilder, ActionRowBuilder, ButtonBuilder, ButtonStyle } = require("discord.js");
const generateUniqueId = require("generate-unique-id");

function ticketEmbed(object, text, id, user) {
	const embed = new EmbedBuilder()
		.setAuthor({
			name: user.tag + ' ▴ ticket-' + id,
			iconURL: user.displayAvatarURL({ dynamic: true })
		})
		.setTitle(object)
		.setColor(0x2f3136)
		.setDescription(text);

	return embed;
}

module.exports = {
	name: 'interactionCreate',
	/**
	 * 
	 * @param {import("discord.js").ModalSubmitInteraction} interaction 
	 */
	async execute(interaction) {
		if (!interaction.isModalSubmit()) return;
		if (interaction.customId == "modalTicket") {
			const object = interaction.fields.getTextInputValue("modalObject");
			const text = interaction.fields.getTextInputValue("modalText");

			const id = generateUniqueId({ useLetters: false, length: 8 });

			const ticketChan = await (await interaction.guild.channels.fetch("993962837749792768")).children.create({
				name: 'ticket-' + id,
				permissionOverwrites: [
					{
						id: interaction.user.id,
						allow: [PermissionsBitField.Flags.ViewChannel]
					},
					{
						id: interaction.guild.roles.everyone.id,
						deny: [PermissionsBitField.Flags.ViewChannel, PermissionsBitField.Flags.CreatePrivateThreads, PermissionsBitField.Flags.CreatePublicThreads]
					}
				]
			});

			await interaction.reply({ content: `Votre ticket est ouvert dans le salon ${ticketChan} !`, ephemeral: true });

			const row = new ActionRowBuilder()
				.addComponents(
					new ButtonBuilder()
						.setCustomId('closeTicket')
						.setStyle(ButtonStyle.Danger)
						.setLabel('Fermer le ticket')
				);

			ticketChan.send({ embeds: [ticketEmbed(object, text, id, interaction.user)], components: [row] });
		}
	}
}