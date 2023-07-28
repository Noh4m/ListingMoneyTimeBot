const puppeteer = require('puppeteer');
const { WebhookClient, EmbedBuilder } = require('discord.js');

// Remplacez "WEBHOOK_URL" par l'URL de votre Webhook Discord
const webhook = new WebhookClient({ url: 'https://discord.com/api/webhooks/1134476448506335272/YGYQwha20PHVZMo1kE6lKfPdnG7KNi2SA3Hl5MABQz0qsbF7D1g3Sud7QVfSZRiJWxKp' });

(async () => {
  try {
    async function getDataAndRefresh() {
      const executablePath = process.env.PUPPETEER_EXECUTABLE_PATH || '/usr/bin/google-chrome'; 
      const browser = await puppeteer.launch({ executablePath, headless: true });
      const page = await browser.newPage();
      await page.goto('https://www.coteur.com/comparateur-de-cotes');

      const trSelector = 'div.table-responsive table tbody tr:first-child';
      const firstTR = await page.$(trSelector);

      if (firstTR) {
        const cells = await firstTR.$$('td');
        const data = {};
        data.sport = await cells[0].$eval('i', icon => icon.title);
        data.date = await cells[1].evaluate(cell => cell.textContent);
        data.match = await cells[2].$eval('a', link => link.textContent.trim());
        data.tournament = await cells[3].$eval('a', link => link.textContent.trim());

        data.cote1 = (await cells[4].$('div div div')) ? await cells[4].$eval('div div div', cell => cell.textContent) : 'N/A';
        data.cote2 = (await cells[5].$('div div div')) ? await cells[5].$eval('div div div', cell => cell.textContent) : 'N/A';
        data.cote3 = (await cells[6].$('div div div')) ? await cells[6].$eval('div div div', cell => cell.textContent) : 'N/A';
        data.percentage = (await cells[7].$('b.orange')) ? await cells[7].$eval('b.orange', percentage => percentage.textContent) : 'N/A';

         // Créer un nouvel embed avec EmbedBuilder
         const embed = new EmbedBuilder()
          .setColor(0x0099FF)
          .setTitle('Nouveau listing')
          .setThumbnail('https://cdn.discordapp.com/attachments/1133046297172135977/1134498896022864002/pp_2.png')
          .setAuthor({ name: 'Listing MoneyTime', iconURL: 'https://cdn.discordapp.com/attachments/1133046297172135977/1134498917350920282/Logo_simple_rouge.png', url: 'https://discord.js.org' })
          .addFields(
            { name: 'Sport 🏅', value: data.sport , inline: true },
            { name: 'Date 📆', value: data.date , inline: true },
            { name: '\u200B', value: '\u200B' },
            { name: 'Match 🏟️', value: data.match , inline: true },
            { name: '\u200B', value: '\u200B' },
            { name: 'Compétition ⏱️', value: data.tournament , inline: true },
            { name: '\u200B', value: '\u200B' },
            { name: 'Cote 1', value: data.cote1 , inline: true },
  
            { name: 'Cote 2', value: data.cote2 , inline: true },
           
            { name: 'Cote 3', value: data.cote3 , inline: true }
          
          )
          .setTimestamp();

        // Envoyer le message dans le channel Discord via le Webhook
        await webhook.send({
          username: 'Listing MoneyTime',
          avatarURL: 'https://exemple.com/avatar.png', // URL de l'avatar si vous en avez un, sinon mettez null
          embeds: [embed],
        });

        console.log('Données récupérées et envoyées à Discord :', data);
      } else {
        console.error('La première balise <tr> avec le sélecteur CSS spécifié n\'a pas été trouvée.');
      }

      await browser.close();
      console.log('Rafraîchissement des données terminé.');
    }

    setInterval(getDataAndRefresh, 5 * 60 * 1000); // Appeler la fonction getDataAndRefresh toutes les 5 minutes

    // Appeler la fonction pour la première fois immédiatement
    await getDataAndRefresh();
  } catch (error) {
    console.error('Une erreur s\'est produite : ', error);
  }
})();
