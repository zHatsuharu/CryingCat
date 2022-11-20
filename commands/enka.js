const { SlashCommandBuilder, EmbedBuilder, AttachmentBuilder, ActionRowBuilder, ButtonBuilder, Colors, ButtonStyle, ComponentType } = require("discord.js");
const puppeteer = require("puppeteer");
const fs = require("fs");
const https = require("https");
const { get, getByQuery } = require("../sqlite.js");
const genshindb = require("genshin-db");

const minimal_args = [
	'--no-sandbox',
	'--disable-setuid-sandbox',
	'--disable-dev-shm-usage',
	'--disable-accelerated-2d-canvas',
	'--no-first-run',
	'--no-zygote',
	'--single-process',
	'--disable-gpu'
];

const typeObject = {
	"Wind": "#03F1CE",
	"Rock": "#FFC256",
	"Ice": "#B9EFEF",
	"Electric": "#BD84E0",
	"Fire": "#FEA76E",
	"Water": "#08E4FE"
};

const emote = "<a:loading:985185838432399360>";

function embedLoader(status, message, times) {
	const embed = new EmbedBuilder()
		.addFields(
			[
				{ name: '\u200b', value: `
- Vérification UID
- Disponniblités des infos
- Personnage dans la vitrine
- Obtention des infos
		`, inline: true },
				{ name: '\u200b', value: `
${status <= 0 ? emote : "✅"}
${status == 1 ? emote : status < 1 ? "⬛" : "✅"}
${status == 2 ? emote : status < 2 ? "⬛" : "✅"}
${status == 3 ? emote : status < 3 ? "⬛" : "✅"}
		`, inline: true },
				{ name: '\u200b', value: times[0] ? `${times[0]}\n${times[1]}\n${times[2]}\n${times[3]}` : '\u200b', inline: true }
			]
		)
		.setColor(Colors.Grey)
		.setFooter({ text: "Enka.Network", iconURL: "https://enka.shinshin.moe/favicon.png" });

	if (message)
		embed.addFields([{name: '\u200b', value: message, inline: false}, {name: '\u200b', value: '\u200b', inline: false}]);
	else
		embed.addFields([{name: '\u200b', value: '\u200b', inline: false}]);

	return embed;
}

function embedErr(status, times) {
	const embed = new EmbedBuilder()
		.addFields(
			[
				{ name: '\u200b', value: `
- Vérification UID
- Disponniblités des infos
- Personnage dans la vitrine
- Obtention des infos
		`, inline: true
				},
				{ name: '\u200b', value: `
${status == 0 ? "❌" : "✅"}
${status == 1 ? "❌" : status < 1 ? "⬛" : "✅"}
${status == 2 ? "❌" : status < 2 ? "⬛" : "✅"}
${status == 3 ? "❌" : status < 3 ? "⬛" : "✅"}
		`, inline: true },
				{name: '\u200b', value: times[0] ? `${times[0]}\n${times[1]}\n${times[2]}\n${times[3]}` : '\u200b', inline: true},
				{name: '\u200b', value: '\u200b', inline: false}
			]
		)
		.setColor(Colors.Red)
		.setFooter({ text: "Enka.Network", iconURL: "https://enka.shinshin.moe/favicon.png" });

	if (status == 0) {
		embed.setDescription("L'UID ne semble pas correcte. Veuillez vérifier l'UID avant de refaire la commande.");
	} else if (status == 1) {
		embed.setDescription("L'utilisateur ne laisse pas l'accès à ses informations.\nVeuillez activer l'option `Afficher les infos de personnages` dans les paramètres de votre vitrine depuis le jeu s'il s'agit de votre compte.");
	} else if (status == 2) {
		embed.setDescription("Aucun personnage n'est disponnible sur la vitrine du joueur.");
	} else if (status == 3) {
		embed.setDescription("Une erreur est survenue pendant la collecte de données.");
	};

	return embed;
}

async function downloadImage(url, filepath) {
	return await new Promise((resolve, reject) => {
		https.get(url, (res) => {
			if (res.statusCode === 200) {
				res.pipe(fs.createWriteStream(filepath))
					.on('error', reject)
					.once('close', () => resolve(filepath));
			} else {
				res.resume();
				reject(new Error(`Request Failed With a Status Code: ${res.statusCode}`));
			}
		});
	});
}

function timeFormat(s) {
	function pad(n, z) {
		z = z || 2;
		return ('00' + n).slice(-z);
	}
	let ms = s % 1000;
	s = (s - ms) / 1000;
	let secs = s % 60;
	s = (s - secs) / 60;
	let mins = s % 60;
  
	return [pad(mins), pad(secs), pad(ms)];
}

/**
 * 
 * @param {puppeteer.Browser} browser
 * @param {string} imageurl 
 * @param {[]} buffers
 */
async function downloadBlob(browser, imageurl, buffers) {
	const blobPage = await browser.newPage();
	const response = await blobPage.goto(imageurl);
	buffers.push(await response.buffer());
	await blobPage.close();
}

async function getInfo(uid, interaction) {
	let times = ["", "", "", ""];
	await interaction.editReply({
		embeds: [
			new EmbedBuilder()
				.setDescription("Chargement de la commande " + emote)
				.setColor(Colors.Grey)
		]
	});
	const start = Date.now();
	const browser = await puppeteer.launch({
		headless: true,
		executablePath: '/usr/bin/chromium-browser',
		args: minimal_args,

	});
	const page = await browser.newPage();
	await page.goto('https://enka.shinshin.moe/u/' + uid, { waitUntil: 'domcontentloaded' });
	await interaction.editReply({ embeds: [embedLoader(0, null, times)] });
	let begin = Date.now();
	if (await page.$('div[class^="Error"]') != null) {
		await browser.close();
		await interaction.editReply({ embeds: [embedErr(0, times)] });
		return;
	}
	let end = Date.now();
	times[0] = `${timeFormat(end-begin)[0]}m${timeFormat(end-begin)[1]}.${timeFormat(end-begin)[2]}s`;
	begin = Date.now();
	await interaction.editReply({ embeds: [embedLoader(1, null, times)] });
	if (await page.$('div[class^="Message"]') != null) {
		await browser.close();
		await interaction.editReply({ embeds: [embedErr(1, times)] });
		return;
	}
	end = Date.now();
	times[1] = `${timeFormat(end-begin)[0]}m${timeFormat(end-begin)[1]}.${timeFormat(end-begin)[2]}s`;
	begin = Date.now();
	await interaction.editReply({ embeds: [embedLoader(2, null, times)] });
	if (await page.$('div[class^="UID"]') == null) {
		await browser.close();
		await interaction.editReply({ embeds: [embedErr(2, times)] });
		return;
	}
	end = Date.now();
	times[2] = `${timeFormat(end-begin)[0]}m${timeFormat(end-begin)[1]}.${timeFormat(end-begin)[2]}s`;
	begin = Date.now();
	await interaction.editReply({ embeds: [embedLoader(3, null, times)] });

	const buffers = [];

	try {
		const username = await page.evaluate('document.getElementsByClassName("details")[0].getElementsByTagName("h1")[0].innerText');
		const avatarUrl = 'https://enka.shinshin.moe' + await page.evaluate('document.getElementsByClassName("avatar-icon")[0].getElementsByTagName("img")[0].getAttribute("src")');
		let arwl = await page.evaluate('document.getElementsByClassName("ar")[0].innerText');
		const signature = await page.evaluate('document.querySelector(\'div[class^="signature"]\').innerText');
		const characters = await page.$$('div[class^="avatar"]:not(.s)');
		await interaction.editReply({ embeds: [embedLoader(3, `Récupération de ${characters.length + 1} personnages... [0/${characters.length + 1}]`, times)] });
		let charName = await page.evaluate('document.querySelector(\'div[class^="name"]\').innerText');
		charName = genshindb.characters(charName.match(/^(\w|\s(?:\w))+/i)[0], { queryLanguages: [genshindb.Language.English, genshindb.Language.French], resultLanguage: genshindb.Language.French }).name;
		let customImgUrl = await getByQuery(`SELECT "${charName}" FROM "enka" WHERE "giUID" = "${uid}"`);
		if (customImgUrl && customImgUrl[charName]) {
			await downloadImage(customImgUrl[charName], `./images/${uid}_${charName.replace(/ /g, "_")}.${customImgUrl[charName].slice(-3)}`);
			while (!fs.existsSync(`./images/${uid}_${charName.replace(/ /g, "_")}.${customImgUrl[charName].slice(-3)}`)) {
				continue;
			}
			const elementHandle = await page.$('input[type="file"]');
			await elementHandle.uploadFile(`./images/${uid}_${charName.replace(/ /g, "_")}.${customImgUrl[charName].slice(-3)}`);
		}
		await page.click('div[class^=toolbar] button');
		await page.waitForFunction('document.querySelector(\'img[src*="blob:"]\') != null');

		const imageSRC = await page.$eval('img[src*="blob:"]', img => img.getAttribute('src'));

		await downloadBlob(browser, imageSRC, buffers);

		await page.click('button[class="svelte-1w58zic"]');
		
		await interaction.editReply({ embeds: [embedLoader(3, `Récupération de ${characters.length + 1} personnages... [1/${characters.length + 1}]`, times)] });
		const type = [(await page.evaluate('document.querySelector(\'div[class^=card-host]\').getAttribute("class")')).match(/(?<= )\w+(?= )/)[0]];
		for (const [index, button] of characters.entries()) {
			await button.click();
			await page.waitForFunction('document.querySelector(\'div[class^="DraggableCanvas"][class$="loader"]\') === null');
			charName = await page.evaluate('document.querySelector(\'div[class^="name"]\').innerText');
			console.log(charName.match(/^(\w|\s(?:\w))+/i)[0]);
			charName = genshindb.characters(charName.match(/^(\w|\s(?:\w))+/i)[0], { queryLanguages: [genshindb.Language.English, genshindb.Language.French], resultLanguage: genshindb.Language.French }).name;
			customImgUrl = await getByQuery(`SELECT "${charName}" FROM "enka" WHERE "giUID" = "${uid}"`);
			if (customImgUrl && customImgUrl[charName]) {
				await downloadImage(customImgUrl[charName], `./images/${uid}_${charName.replace(/ /g, "_")}.${customImgUrl[charName].slice(-3)}`);
				while (!fs.existsSync(`./images/${uid}_${charName.replace(/ /g, "_")}.${customImgUrl[charName].slice(-3)}`)) {
					continue;
				}
				const elementHandle = await page.$('input[type="file"]');
				await elementHandle.uploadFile(`./images/${uid}_${charName.replace(/ /g, "_")}.${customImgUrl[charName].slice(-3)}`);
			}
			await page.click('div[class^=toolbar] button');
			await page.waitForFunction('document.querySelector(\'img[src*="blob:"]\') != null');

			const imageSRC = await page.$eval('img[src*="blob:"]', img => img.getAttribute('src'));

			await downloadBlob(browser, imageSRC, buffers);

			await page.click('button[class="svelte-1w58zic"]');

			type.push((await page.evaluate('document.querySelector(\'div[class^=card-host]\').getAttribute("class")')).match(/(?<= )\w+(?= )/)[0]);
			await interaction.editReply({ embeds: [embedLoader(3, `Récupération de ${characters.length + 1} personnages... [${index + 2}/${characters.length + 1}]`, times)] });
		}
		end = Date.now();
		times[3] = `${timeFormat(end-begin)[0]}m${timeFormat(end-begin)[1]}.${timeFormat(end-begin)[2]}s`;
		await interaction.editReply({ embeds: [embedLoader(4, null, times)] });

		await browser.close();

		arwl = arwl.match(/AR \d+/)[0] + ' ▴ ' + arwl.match(/WL \d+/)[0];

		const imagesToDelete = fs.readdirSync('./images').filter(fn => fn.startsWith(uid + '_'));
		for (const img of imagesToDelete)
			fs.unlinkSync('./images/' + img);

		return {
			avatar: avatarUrl,
			username: username,
			images: buffers,
			types: type,
			ARWL: arwl,
			signature: signature,
			timetaken: Date.now() - start
		}
	} catch (e) {
		console.log(e);
		await interaction.editReply({ embeds: [embedErr(3, times)] });
		await page.screenshot({path: "./images/SCREEN.jpeg", fullPage: true});
		await browser.close();
		return;
	}
}

function makeEmbed(infos, uid, color, img, footer) {
	const time = timeFormat(infos.timetaken);
	const embed = new EmbedBuilder()
		.setTitle(`${infos.username} (UID : ${uid})`)
		.setURL("https://enka.shinshin.moe/u/" + uid)
		.setDescription(infos.ARWL + '\n\n' + (infos.signature != '' ? infos.signature + '\n\nFait en : ' + `${time[0]} min ${time[1]} sec` : 'Fait en : ' + `${time[0]} min ${time[1]} sec`))
		.setThumbnail(infos.avatar)
		.setImage(`attachment://${img.name}`)
		.setColor(color)
		.setFooter({ text: "Enka.Network    ■    " + footer, iconURL: "https://enka.shinshin.moe/favicon.png" });

	return embed;
}

function chunkMaxLength(arr, chunkSize, maxLength) {
	arr = Array.from(arr);
	return Array.from({ length: maxLength }, () => arr.splice(0, chunkSize));
}

function allImgEmbed(images, url) {
	const embeds = [];
	for (const image of images) {
		const embed = new EmbedBuilder()
			.setColor("#2f3136")
			.setURL(url)
			.setImage(`attachment://${image.name}`)
		embeds.push(embed);
	}
	return embeds;
}

module.exports = {
	data: new SlashCommandBuilder()
		.setName("enka")
		.setDescription("Donne les informations vitrine d'un joueur Genshin.")
		.addStringOption(option => option
			.setName("uid")
			.setDescription("User ID")
			.setRequired(false)),
	/**
	 * 
	 * @param {import("discord.js").CommandInteraction} interaction
	 */
	async execute(interaction) {
		let uid = interaction.options.getString("uid");

		const row = new ActionRowBuilder()
			.addComponents(
				new ButtonBuilder()
					.setCustomId('prev')
					.setStyle(ButtonStyle.Secondary)
					.setEmoji('◀️'),
				new ButtonBuilder()
					.setCustomId('next')
					.setStyle(ButtonStyle.Secondary)
					.setEmoji('▶️'),
				new ButtonBuilder()
					.setCustomId('getimgs')
					.setStyle(ButtonStyle.Secondary)
					.setLabel('Images')
			);

		await interaction.deferReply();

		if (!uid) {
			uid = await get("giUID", "enka", "dcUID", interaction.user.id);
			if (!uid) {
				return interaction.editReply({
					embeds: [
						new EmbedBuilder().setColor(Colors.Red).setDescription("Veuillez donner un UID ou lier votre uid Genshin avec `/enkalink`")
					]
				});
			}
			uid = uid["giUID"];
		}

		const infos = await getInfo(uid, interaction);
		if (!infos) return;

		let index = 0;
		const files = [];
		for (const [index, image] of infos.images.entries()) {
			const file = new AttachmentBuilder(Buffer.from(image), { name: `${uid}_${index}.png`},);
			files.push(file);
		}

		interaction.editReply({ embeds: [makeEmbed(infos, uid, typeObject[infos.types[index]], files[index], `${index + 1}/${files.length}`)], files: [files[index]], components: [row] })
			.then(message => {
				function nav() {
					const filter = (i) => i.user.id === interaction.user.id;
					const collector = message.createMessageComponentCollector({ componentType: ComponentType.Button, max: 1, time: 60000 });

					collector.on('end', async collected => {
						collected = collected.first();

						if (!collected) {
							return message.edit({ components: [] });
						} else {
							if (collected.customId == "prev" && filter(collected))
								index <= 0 ? index = infos.images.length - 1 : index -= 1;
							else if (collected.customId == "next" && filter(collected))
								index >= infos.images.length - 1 ? index = 0 : index += 1;
							else if (collected.customId == "getimgs") {
								const imageSet = chunkMaxLength(files, 4, 2);
								let embeds = [];
								for (const [index, set] of imageSet.entries()) {
									index == 0 ? embeds.push(allImgEmbed(set, 'https://discord.com'))
										: embeds.push(allImgEmbed(set, 'https://discord.js.org'));
								}
								await collected.deferReply({ ephemeral: true });
								for (const [index, embed] of embeds.entries()) {
									if (embed.length != 0)
										collected.followUp({ embeds: embed, files: imageSet[index], ephemeral: true });
								}
								return nav();
							} else {
								return nav();
							}
						}
						collected.deferUpdate();
						message.edit({
							embeds: [makeEmbed(infos, uid, typeObject[infos.types[index]], files[index], `${index + 1}/${files.length}`)],
							files: [files[index]],
							components: collected.message.components
						})
							.then(() => nav());
					});
				}
				nav();
			});
	}
}