const { Client, GatewayIntentBits, GuildMember, Collection } = require("discord.js");
const client = new Client({ intents: [GatewayIntentBits.Guilds, GatewayIntentBits.GuildMessages, GatewayIntentBits.GuildMessageReactions, GatewayIntentBits.GuildIntegrations] });
const { token, chanTab, msgTab, roleTab, banCards, banMuda } = require("./config.json");
const fs = require('node:fs');
const path = require('node:path');

client.once("ready", () => {
	console.log("READY TO CRYYYYYYYYYYYYYYYYYYYYYY MIAOU.");
	chanTab.forEach(async (chanId, index) => {
		const chan = await client.channels.fetch(chanId);
		await chan.messages.fetch(msgTab[index]);
	})
});

/**
 * 
 * @param {GuildMember} member the member object
 * @param {Object} Array array with banned role id
 */
function hasRole(member, obj) {
	let haveit = false;
	obj.forEach(roleId => {
		if (member.roles.cache.has(roleId)) haveit = true;
	});
	return haveit;
}

// Don't touch that, it's kinda trash code.

client.on('messageReactionAdd', async (messageReaction, user) => {
	if (!msgTab.includes(messageReaction.message.id)) return;
	if (messageReaction.message.id == msgTab[0]) {
		const member = await messageReaction.message.guild.members.fetch(user.id);
		const role = await messageReaction.message.guild.roles.fetch(roleTab[0]);
		await member.roles.add(role);
	} else if (messageReaction.message.id == msgTab[1]) {
		const member = await messageReaction.message.guild.members.fetch(user.id);
		if (hasRole(member, banMuda)) return messageReaction.users.remove(member.id);
		const role = await messageReaction.message.guild.roles.fetch(roleTab[1]);
		await member.roles.add(role);
	} else if (messageReaction.message.id == msgTab[2]) {
		const member = await messageReaction.message.guild.members.fetch(user.id);
		if (hasRole(member, banCards)) return messageReaction.users.remove(member.id);
		const role = await messageReaction.message.guild.roles.fetch(roleTab[2]);
		await member.roles.add(role);
	}

});

client.on('messageReactionRemove', async (messageReaction, user) => {
	if (!msgTab.includes(messageReaction.message.id)) return;
	if (messageReaction.message.id == msgTab[0]) {
		const member = await messageReaction.message.guild.members.fetch(user.id);
		const role = await messageReaction.message.guild.roles.fetch(roleTab[0]);
		await member.roles.remove(role);
	} else if (messageReaction.message.id == msgTab[1]) {
		const member = await messageReaction.message.guild.members.fetch(user.id);
		if (hasRole(member, banMuda)) return;
		const role = await messageReaction.message.guild.roles.fetch(roleTab[1]);
		await member.roles.remove(role);
	} else if (messageReaction.message.id == msgTab[2]) {
		const member = await messageReaction.message.guild.members.fetch(user.id);
		if (hasRole(member, banCards)) return;
		const role = await messageReaction.message.guild.roles.fetch(roleTab[2]);
		await member.roles.remove(role);
	}
	
});

client.commands = new Collection();
const commandsPath = path.join(__dirname, 'commands');
const commandFiles = fs.readdirSync(commandsPath).filter(file => file.endsWith('.js'));

for (const file of commandFiles) {
	const filePath = path.join(commandsPath, file);
	const command = require(filePath);
	client.commands.set(command.data.name, command);
}

client.on('interactionCreate', async interaction => {
	if (!interaction.isCommand()) return;
	const command = client.commands.get(interaction.commandName);
	if (!command) return;
	try {
		await command.execute(interaction);
	} catch (error) {
		console.error(error);
		await interaction.reply({ content: "Error occured.", ephemeral: true });
	}
});

const eventsPath = path.join(__dirname, 'events');
const eventFiles = fs.readdirSync(eventsPath).filter(file => file.endsWith('.js'));

for (const file of eventFiles) {
	const filePath = path.join(eventsPath, file);
	const event = require(filePath);
	if (event.once) {
		client.once(event.name, (...args) => event.execute(...args));
	} else {
		client.on(event.name, (...args) => event.execute(...args));
	}
}

client.login(token);