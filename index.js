const puppeteer = require('puppeteer');
const { WebhookClient, EmbedBuilder } = require('discord.js');

require("dotenv").config();
const webhook = new WebhookClient({ url: process.env.WEBHOOK_DISCORD });

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
    headless: "true",
  });

  try {
    const page = await browser.newPage();
    try {
      await page.goto('https://www.coteur.com/comparateur-de-cotes', { waitUntil: 'domcontentloaded' });
    } catch (navigationError) {
      console.error('Erreur de navigation :', navigationError);
      return;
    }

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

      if (parseFloat(data.percentage) >= 96 && JSON.stringify(data) !== JSON.stringify(lastData)) {
        lastData = data;

        const embed = new EmbedBuilder()
          .setColor(0x0099FF)
          .setTitle('Nouveau listing')
          .setThumbnail('https://cdn.discordapp.com/attachments/1133046297172135977/1134498896022864002/pp_2.png')
          .setAuthor({ name: 'Listing MoneyTime', iconURL: 'https://cdn.discordapp.com/attachments/1133046297172135977/1134498917350920282/Logo_simple_rouge.png', url: 'https://discord.js.org' })
          .addFields(
            // Reste du code inchangé...
          )
          .setTimestamp();

        await webhook.send({
          username: 'Listing MoneyTime',
          avatarURL: 'https://exemple.com/avatar.png',
          embeds: [embed],
        });

        console.log('Données récupérées et envoyées à Discord ✅');
        console.log(new Date().toLocaleString());
      } else {
        console.log('Les données sont identiques ou le pourcentage est trop bas. Pas d\'envoi. ❌');
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

setTimeout(async () => {
  try {
    await getDataAndRefresh();
    setInterval(getDataAndRefresh, 5 * 60 * 1000);
  } catch (error) {
    console.error('Une erreur s\'est produite : ', error);
  }
}, 5 * 60 * 1000);

getDataAndRefresh().catch(error => {
  console.error('Une erreur s\'est produite : ', error);
});
