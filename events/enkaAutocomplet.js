const genshindb = require("genshin-db");

module.exports = {
    name: 'interactionCreate',
    async execute(interaction) {
        if (!interaction.isAutocomplete()) return;
        if (interaction.commandName == "enkaimg") {
            const focusedValue = interaction.options.getFocused();
            const choices = genshindb.characters("names", { matchCategories: true, resultLanguage: genshindb.Languages.French, });
            const regex = new RegExp(focusedValue, 'i');
            const filtered = choices.filter(choice => choice.match(regex));
            if (filtered.length <= 25) {
                await interaction.respond(
                    filtered.map(choice => ({ name: choice, value: choice }) )
                );
            }
        }
    }
}