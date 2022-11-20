const { SlashCommandBuilder, EmbedBuilder, Colors } = require("discord.js");
const { get, insert } = require("../sqlite");
const puppeteer = require("puppeteer");

async function validUid(uid) {
	const browser = await puppeteer.launch({
		headless: true,
		executablePath: '/usr/bin/chromium-browser',
		args: ['--no-sandbox', '--disable-setuid-sandbox'],
		browserWSEndpoint: `ws://localhost:3000`
	});
	const page = await browser.newPage();
	await page.goto('https://enka.shinshin.moe/u/' + uid);
	let result = true;
	if (await page.$('div[class^="Error"]') != null) {
		result = false;
	}
	await browser.close();
	return result;
}

function makeEmbed(message, color) {
	const embed = new EmbedBuilder()
		.setColor(color)
		.setDescription(message);
	return embed;
}

module.exports = {
	data: new SlashCommandBuilder()
		.setName("enkalink")
		.setDescription("Lie un compte Genshin au bot pour la commande Enka.")
		.addStringOption(option => option
			.setName("uid")
			.setDescription("Genshin User ID")
			.setRequired(true)
		),
	async execute(interaction) {
		const uid = interaction.options.getString("uid");
		
		await interaction.deferReply();
		let isLinked = await get("dcUID", "enka", "dcUID", interaction.user.id);
		if (isLinked) {
			return await interaction.editReply({ embeds: [makeEmbed("Ton compte est déjà lié à un UID.", Colors.Red)] });
		}
		isLinked = await get("giUID", "enka", "giUID", uid);
		if (isLinked) {
			return await interaction.editReply({ embeds: [makeEmbed("Cet UID est déjà lié à un compte.", Colors.Red)] });
		}

		if (!await validUid(uid)) {
			return await interaction.editReply({ embeds: [makeEmbed("L'uid n'est pas valide.", Colors.Red)] });
		}

		insert("enka", "dcUID, giUID", `${interaction.user.id}, ${uid}`);

		await interaction.editReply({ embeds: [makeEmbed(`Votre compte Discord a été lié à cet uid : ${uid}`, Colors.Green)] });
	}
};