const puppeteer = require('puppeteer');
const { WebhookClient, EmbedBuilder } = require('discord.js');

require("dotenv").config();
const webhook = new WebhookClient({ url: process.env.WEBHOOK_DISCORD });

// Variable globale pour stocker les dernières données récupérées
let lastData = null;

const getDataAndRefresh = async () => {
  const browser = await puppeteer.launch({
    args: [
      "--disable-setuid-sandbox",
      "--no-sandbox",
      "--single-process",
      "--no-zygote",
    ],
    executablePath:
      process.env.NODE_ENV === "production"
        ? process.env.PUPPETEER_EXECUTABLE_PATH
        : puppeteer.executablePath(),
    headless: "true", // Utiliser headless en mode sans interface graphique
  });

  try {
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

      // Comparer les nouvelles données avec les dernières données
      if (JSON.stringify(data) !== JSON.stringify(lastData)) {
        lastData = data;

        // Créer un nouvel embed avec EmbedBuilder
        const embed = new EmbedBuilder()
          .setColor(0x0099FF)
          .setTitle('Nouveau listing')
          .setThumbnail('https://cdn.discordapp.com/attachments/1133046297172135977/1134498896022864002/pp_2.png')
          .setAuthor({ name: 'Listing MoneyTime', iconURL: 'https://cdn.discordapp.com/attachments/1133046297172135977/1134498917350920282/Logo_simple_rouge.png', url: 'https://discord.js.org' })
          .addFields(
            { name: 'Sport 🏅', value: data.sport, inline: true },
            { name: 'Date 📆', value: data.date, inline: true },
            { name: '\u200B', value: '\u200B' },
            { name: 'Match 🏟️', value: data.match, inline: true },
            { name: '\u200B', value: '\u200B' },
            { name: 'Compétition ⏱️', value: data.tournament, inline: true },
            { name: '\u200B', value: '\u200B' },
            { name: 'Cote 1', value: data.cote1, inline: true },
            { name: 'Cote 2', value: data.cote2, inline: true },
            { name: 'Cote 3', value: data.cote3, inline: true },
            { name: '\u200B', value: '\u200B' },
            { name: 'Pourcentage 📊', value: data.percentage, inline: true },
          )
          .setTimestamp();

        // Envoyer le message dans le channel Discord via le Webhook
        await webhook.send({
          username: 'Listing MoneyTime',
          avatarURL: 'https://exemple.com/avatar.png', // URL de l'avatar si vous en avez un, sinon mettez null
          embeds: [embed],
        });
        console.log('Données récupérées et envoyées à Discord ✅');
        console.log(new Date().toLocaleString());
      } else {
        console.log('Les données sont identiques, pas de nouvel envoi. ❌');
        console.log(new Date().toLocaleString());
      }
    } else {
      console.error('La première balise <tr> avec le sélecteur CSS spécifié n\'a pas été trouvée. ⁉️');
      console.log(new Date().toLocaleString());
    }

    await browser.close();
    
  } catch (error) {
    console.error('Une erreur s\'est produite : ', error);
  }
};

// Appeler la fonction getDataAndRefresh une fois après 5 minutes
setTimeout(async () => {
  try {
    await getDataAndRefresh();
    // Après l'exécution réussie, planifier le prochain appel dans 5 minutes
    setInterval(getDataAndRefresh, 1 * 60 * 1000);
  } catch (error) {
    console.error('Une erreur s\'est produite : ', error);
  }
}, 5 * 60 * 1000);

// Appeler la fonction pour la première fois immédiatement
getDataAndRefresh().catch(error => {
  console.error('Une erreur s\'est produite : ', error);
});
