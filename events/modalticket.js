const { Permissions, MessageEmbed, MessageActionRow, MessageButton } = require("discord.js");
const generateUniqueId = require("generate-unique-id");

function ticketEmbed(object, text, id, user) {
	const embed = new MessageEmbed()
		.setAuthor({
			name: user.tag + ' ▴ ticket-' + id,
			iconURL: user.displayAvatarURL({ dynamic: true })
		})
		.setTitle(object)
		.setColor("#2f3136")
		.setDescription(text);

	return embed;
}

module.exports = {
	name: 'interactionCreate',
	async execute(interaction) {
		if (!interaction.isModalSubmit()) return;
		if (interaction.customId == "modalTicket") {
			const object = interaction.fields.getTextInputValue("modalObject");
			const text = interaction.fields.getTextInputValue("modalText");

			const id = generateUniqueId({ useLetters: false, length: 8 });

			const ticketChan = await (await interaction.guild.channels.fetch("993962837749792768")).createChannel('ticket-' + id, {
				permissionOverwrites: [
					{
						id: interaction.user.id,
						allow: [Permissions.FLAGS.VIEW_CHANNEL]
					},
					{
						id: interaction.guild.roles.everyone.id,
						deny: [Permissions.FLAGS.VIEW_CHANNEL, Permissions.FLAGS.CREATE_PRIVATE_THREADS, Permissions.FLAGS.CREATE_PUBLIC_THREADS]
					}
				]
			});

			await interaction.reply({ content: `Votre ticket est ouvert dans le salon ${ticketChan} !`, ephemeral: true });

			const row = new MessageActionRow()
				.addComponents(
					new MessageButton()
						.setCustomId('closeTicket')
						.setStyle('DANGER')
						.setLabel('Fermer le ticket')
				);

			ticketChan.send({ embeds: [ticketEmbed(object, text, id, interaction.user)], components: [row] });
		}
	}
}