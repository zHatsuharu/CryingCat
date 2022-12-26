const { Message, EmbedBuilder, Colors } = require("discord.js");
const { guildId, logChan } = require("../config.json");

// this regex is from : https://regex101.com/library/QNPk9U?page=3
const regex = /(https:\/\/)?(www\.)?(((discord(app)?)?\.com\/invite)|((discord(app)?)?\.gg))\/(?<invite>\S+)/gm

module.exports = {
	name: 'messageCreate',
	/**
	 * 
	 * @param {Message} message 
	 */
	async execute(message) {
		if (message.guildId != guildId) return;
		if (message.author.bot) return;
		const match = message.content.match(regex);
		const channel = message.guild.channels.cache.get(logChan);

		if (match && match.length != 0) {
			if (message.deletable) {
				await message.delete();
				const embed = new EmbedBuilder()
					.setColor(Colors.Red)
					.setTitle("Anti-lien")
					.setDescription(`${message.author}, ton message contient un lien d'invitation discord.`);
				message.channel.send({ embeds: [embed] });


				const infosEmbed = new EmbedBuilder()
					.setColor(Colors.Yellow)
					.setAuthor({ name: message.author.tag, iconURL: message.author.displayAvatarURL() })
					.setTitle("Anti-lien")
					.setDescription(`Contenu du message :\n${message.content.replace(regex, '`$&`')}`);
				channel.send({ embeds: [infosEmbed] });
			} else {
				const infosEmbed = new EmbedBuilder()
					.setColor(Colors.Yellow)
					.setAuthor({ name: message.author.tag, iconURL: message.author.displayAvatarURL() })
					.setTitle("Anti-lien")
					.setDescription(`Contenu du message :\n${message.content.replace(regex, '`$&`')}\n\nLe message n'a pas pu être supprimer (manque de droit).`);
				channel.send({ embeds: [infosEmbed] });
			}
		}
	}
}