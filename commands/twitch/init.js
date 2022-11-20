module.exports = {
	/**
	 * 
	 * @param {import("discord.js").CommandInteraction} interaction
	 */
	async execute(interaction) {
		console.log(interaction.options);
	}
}