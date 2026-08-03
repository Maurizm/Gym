const fs = require('fs');
const path = require('path');

const exercisesData = JSON.parse(fs.readFileSync(path.join(__dirname, 'src/data/exercises.json'), 'utf8'));

const names = exercisesData.map(e => e.name);
fs.writeFileSync('all_names.txt', names.join('\n'));
console.log('Total exercises:', names.length);
