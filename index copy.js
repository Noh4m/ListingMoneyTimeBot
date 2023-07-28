const puppeteer = require('puppeteer');

(async () => {
  try {
    async function getDataAndRefresh() {
      const browser = await puppeteer.launch();
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

        // Vérifier si les éléments existent avant de récupérer les valeurs
        data.cote1 = (await cells[4].$('div div div')) ? await cells[4].$eval('div div div', cell => cell.textContent) : 'N/A';
        data.cote2 = (await cells[5].$('div div div')) ? await cells[5].$eval('div div div', cell => cell.textContent) : 'N/A';
        data.cote3 = (await cells[6].$('div div div')) ? await cells[6].$eval('div div div', cell => cell.textContent) : 'N/A';
        data.percentage = (await cells[7].$('b.orange')) ? await cells[7].$eval('b.orange', percentage => percentage.textContent) : 'N/A';

        console.log('Données récupérées :', data);
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
