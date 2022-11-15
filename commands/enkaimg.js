const { SlashCommandBuilder } = require("@discordjs/builders");
const { MessageEmbed } = require("discord.js");
const genshindb = require("genshin-db");
const request = require("request");
const { get, update } = require("../sqlite");
const fs = require("node:fs");
const puppeteer = require("puppeteer");

async function urlIsIMG(url) {
	return await new Promise((resolve, reject) => {
		request(url, (error, response, body) => {
			if (!error && response.statusCode == 200)
				resolve(true);
			else
				resolve(false);
		});
	});
}

const download = function (uri, filename) {
	request.head(uri, function (err, res, body) {
		request(uri).pipe(fs.createWriteStream(filename)).on('close', () => undefined);
	});
};

async function isImageNsfw(url) {
	const imageName = url.slice('https://'.length).replace(/\.|\//g, '') + `.${url.slice(-3)}`;
	download(url, `./images/${imageName}`);
	const browser = await puppeteer.launch({
		headless: true,
		executablePath: '/usr/bin/chromium-browser',
		args: ['--no-sandbox', '--disable-setuid-sandbox'],
		browserWSEndpoint: `ws://localhost:3000`
	});
	const page = await browser.newPage();
	try {
		await page.goto("https://www.cvisionlab.com/cases/nsfw/");
		const elementHandle = await page.$('input[type="file"]');
		await elementHandle.uploadFile(`./images/${imageName}`);
		await page.waitForFunction('document.querySelector(\'div[class="upload-disabler disabled"]\') == null');
		await page.waitForFunction('document.querySelector(\'div[class*="demo-image-cover"][style="display: flex;"]\') != null');
		await page.waitForFunction('getComputedStyle(document.querySelector(\'div[class*="demo-image-cover"][style="display: flex;"]\'), \':before\') != null');
		let result = await page.$eval('div[class*=\'demo-image-cover\'][style=\'display: flex;\']', el => ({
			type: el.getAttribute("data-confidence").match(/\w+(?=\:)/i)[0],
			percentage: parseFloat(el.getAttribute("data-confidence").match(/\d+\.\d+/i)[0])
		}));
		await browser.close();
		fs.unlinkSync(`./images/${imageName}`);
		if (result.type == "NSFW" && result.percentage >= 65) {
			return true;
		} else {
			return false;
		}
	} catch(e) {
		fs.unlinkSync(`./images/${imageName}`);
		await page.screenshot({ path: 'test.jpg', fullPage: true });
		await browser.close();
		console.error(e);
	}
}

function makeEmbed(message, color) {
	const embed = new MessageEmbed()
		.setColor(color)
		.setDescription(message);
	return embed;
}

module.exports = {
	data: new SlashCommandBuilder()
		.setName("enkaimg")
		.setDescription("Donne une image à un personnage Genshin pour la commande Enka.")
		.addStringOption(option => option
			.setName('personnage')
			.setDescription("Personnage Genshin")
			.setRequired(true)
			.setAutocomplete(true)
		)
		.addStringOption(option => option
			.setName('url')
			.setDescription("L'url de l'image. L'url doit rediriger vers une image ! (jpg, png seulement)")
			.setRequired(true)
		),
		/*.addBooleanOption(option => option
			.setName('force')
			.setDescription("Oblige l'upload de l'image.")
			.setRequired(false)),*/
	async execute(interaction) {
		const character = interaction.options.getString("personnage");
		let imgURL = interaction.options.getString("url");
		//const force = interaction.options.getBoolean("force");

		await interaction.deferReply();

		if (!await get("giUID", "enka", "dcUID", interaction.user.id)) {
			return interaction.editReply({ embeds: [makeEmbed("Vous n'avez pas relier votre compte discord à un uid Genshin.\nUtilise la commande `/link`", "RED")] });
		}

		const charName = genshindb.characters(character, {
			resultLanguage: genshindb.Language.French,
			queryLanguages: [genshindb.Language.French, genshindb.Language.English]
		}).name;

		if (!charName) {
			return interaction.editReply({ embeds: [makeEmbed("Le nom du personnage est invalide.\nPrenez compte que les voyageurs sont nommés : Aether / Lumine", "RED")] });
		}

		imgURL = imgURL.match(/[(http(s)?):\/\/(www\.)?a-zA-Z0-9@:%._\+~#=]{2,256}\.[a-z]{2,6}\b([-a-zA-Z0-9@:%_\+.~#?&//=]*)(\.jpg|.png)/i);

		if (!imgURL || !await urlIsIMG(imgURL[0])) {
			return interaction.editReply({ embeds: [makeEmbed("L'url est invalide.", "RED")] });
		}

		if (/*!force && */await isImageNsfw(imgURL[0])) {
			return interaction.editReply({ embeds: [
				makeEmbed("L'image est déclaré comme NSFW.\nVeuillez utiliser une autre image.\n\n**N**ot **S**afe **F**or **W**ork", "RED")
				.setFooter({ text: "Une future mise à jour permettra de rajouter une vérification manuelle sur l'image en cas de problème." })
			] });
		}

		update(
			"enka", 
			charName == "Aether" ? "Voyageur" : charName == "Lumine" ? "Voyageuse" : charName
			, imgURL[0], "dcUID", interaction.user.id
		);

		interaction.editReply({ embeds: [makeEmbed(`L'image a bien été liée pour **${charName}** !`, "GREEN")] });
	}
}