const { ModalBuilder, TextInputBuilder, ActionRowBuilder } = require("discord.js");

module.exports = {
    name: 'interactionCreate',
    async execute(interaction) {
        if (!interaction.isButton()) return;
        if (interaction.customId === "newTicket") {
            const modal = new ModalBuilder()
                .setCustomId('modalTicket')
                .setTitle('Nouveau ticket')
            
            const objectInput = new TextInputBuilder()
                .setCustomId('modalObject')
                .setLabel("Quel est l'objet de votre ticket ?")
                .setStyle("Short")
                .setMaxLength(100)
                .setRequired(true)
            
            const descriptionInput = new TextInputBuilder()
                .setCustomId('modalText')
                .setLabel("Expliquez nous votre problème.")
                .setStyle("Paragraph")
                .setMaxLength(1000)
                .setRequired(true)

            const firstRow = new ActionRowBuilder().addComponents(objectInput);
            const secondRow = new ActionRowBuilder().addComponents(descriptionInput);

            modal.addComponents(firstRow, secondRow);

            await interaction.showModal(modal);
        }
    }
}