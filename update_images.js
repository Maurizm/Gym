const fs = require('fs');
const path = require('path');

const routinePath = path.join(__dirname, 'src', 'data', 'routine.json');
const imagesDir = path.join(__dirname, 'public', 'assets', 'images');

const routineData = JSON.parse(fs.readFileSync(routinePath, 'utf8'));

routineData.days.forEach(day => {
  day.exercises.forEach(ex => {
    if (ex.imageUrl) {
      // The old format was e.g. "./assets/images/Curl martillo.gif"
      // We want to translate it to "/assets/images/..."
      let baseName = path.basename(ex.imageUrl, '.gif'); // e.g. "Curl martillo"
      let basePath = '/assets/images';
      
      let variants = [
        `${basePath}/${baseName}.gif`
      ];

      // Check for variants up to - 5
      for (let i = 1; i <= 5; i++) {
        let variantName = `${baseName} - ${i}.gif`;
        if (fs.existsSync(path.join(imagesDir, variantName))) {
          variants.push(`${basePath}/${variantName}`);
        }
      }

      ex.imageUrls = variants;
    }
  });
});

fs.writeFileSync(routinePath, JSON.stringify(routineData, null, 2));
console.log('routine.json updated with imageUrls arrays');
