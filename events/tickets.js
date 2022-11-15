const { Modal, TextInputComponent, MessageActionRow } = require("discord.js");

module.exports = {
    name: 'interactionCreate',
    async execute(interaction) {
        if (!interaction.isButton()) return;
        if (interaction.customId === "newTicket") {
            const modal = new Modal()
                .setCustomId('modalTicket')
                .setTitle('Nouveau ticket')
            
            const objectInput = new TextInputComponent()
                .setCustomId('modalObject')
                .setLabel("Quel est l'objet de votre ticket ?")
                .setStyle("SHORT")
                .setMaxLength(100)
                .setRequired(true)
            
            const descriptionInput = new TextInputComponent()
                .setCustomId('modalText')
                .setLabel("Expliquez nous votre problème.")
                .setStyle("PARAGRAPH")
                .setMaxLength(1000)
                .setRequired(true)

            const firstRow = new MessageActionRow().addComponents(objectInput);
            const secondRow = new MessageActionRow().addComponents(descriptionInput);

            modal.addComponents(firstRow, secondRow);

            await interaction.showModal(modal);
        }
    }
}