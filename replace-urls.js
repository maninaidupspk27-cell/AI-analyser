const fs = require('fs');
const path = require('path');

const directory = path.join(__dirname, 'frontend', 'src');

function walk(dir) {
    let results = [];
    const list = fs.readdirSync(dir);
    list.forEach(function(file) {
        file = path.join(dir, file);
        const stat = fs.statSync(file);
        if (stat && stat.isDirectory()) { 
            results = results.concat(walk(file));
        } else { 
            if (file.endsWith('.jsx') || file.endsWith('.js')) {
                results.push(file);
            }
        }
    });
    return results;
}

const files = walk(directory);

files.forEach(file => {
    let content = fs.readFileSync(file, 'utf8');
    let original = content;

    // Replace string literals: 'http://localhost:5000/api...' -> `${import.meta.env.VITE_API_URL || 'http://localhost:5000'}/api...`
    content = content.replace(/'http:\/\/localhost:5000(.*?)'/g, "`${import.meta.env.VITE_API_URL || 'http://localhost:5000'}$1`");

    // Replace template literals: `http://localhost:5000/api...` -> `${import.meta.env.VITE_API_URL || 'http://localhost:5000'}/api...`
    content = content.replace(/`http:\/\/localhost:5000(.*?)`/g, "`${import.meta.env.VITE_API_URL || 'http://localhost:5000'}$1`");

    if (content !== original) {
        fs.writeFileSync(file, content);
        console.log(`Updated ${file}`);
    }
});
