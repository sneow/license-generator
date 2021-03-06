#! /usr/bin/env node

const program = require('commander');
const fs = require('fs');

// Get version from package.json.
const version = require('./package.json').version;

// Get available licenses.
const licenses = [];
fs.readdirSync(__dirname + '/licenses').map((license) => {
  licenses.push(license.replace(/\.[0-9a-z]+$/i, ''));
});

// program
//   .version(version)
//   .option("-y, --year <year>", 'The year to use. Example: 2014.')
//   .option("-n, --fullname <fullname>", 'Your fullname.')

/**
 * Install command.
 * license-generator install [license]
 */
program
  .command('install [license]')
  .alias('i')
  .description('Use this command to generate a license file.')
  .option("-y, --year <year>", 'The year to use. Example: 2014.')
  .option("-n, --fullname <fullname>", 'Your fullname.')
  .option("-p, --project <project name>", "Project name.")
  .option("-e, --extension <extension>", 'The file extension for the license. Example: txt. Defaults to no extension.')
  .action((license, options) => {
    // Lowercase the provided license name
    license = license.toLowerCase();

    // Use provided year or default to current year.
    const year = options.year || new Date().getUTCFullYear();

    //read from package.json and infer variable if not given
    let packageJSON = {};
    try {
        packageJSON = JSON.parse(fs.readFileSync('./package.json', 'utf8'));
    } catch (err) {
        throw new Error(err);
    }

    // Use provided name or default to blank.
    const fullname = options.fullname || packageJSON.author || '';

    // Use the provided project or default to none
    const projectname = options.project || packageJSON.name || '';

    // Get file extension.
    const extension = options.extension || '';

    // Create a LICENSE file.
    const license_file = __dirname + '/licenses/' + license + '.txt';
    fs.readFile(license_file, 'utf8', (err, data) => {
      if (err) throw new Error(err);

      // Make replacements for year and fullname.
      const result = data
                    .replace(/\[year\]/g, year)
                    .replace(/\[fullname\]/g, fullname)
                    .replace(/\[project\]/g, projectname);

      const generated_license =  './LICENSE' + ((extension) ? '.' + extension : '');
      fs.writeFile(generated_license, result, 'utf8', (err) => {
         if (err) throw new Error(err);

         // Show a success message.
         console.log('Successfully added ' + license + ' license to ' + generated_license + ' file.');
      });
    });
  });

/**
 * View command.
 * license-generator view [license]
 */
program
  .command('view [license]')
  .description('Use this command to view the content of a license.')
  .action((license) => {
    // Lowercase the provided license name
    license = license.toLowerCase();

    if (!license) {
      console.error('Error: license name missing');
      program.help();
    }

    // Get license file.
    const license_file = __dirname + '/licenses/' + license + '.txt';

    // Show the license file.
    console.log(fs.readFileSync(license_file, 'utf8'));
  });

// Options.
program.on('--help', () => {
  console.log('    -y, --year The year to use. Example 2014.');
  console.log('    -n, --fullname The fullname to use in the license.');
  console.log('    -p, --project The name of the project to use in the license.');
  console.log('    -e, --extension The file extension for the license. Example: txt. Defaults to no extension.');
  console.log('');
});

// Available licenses.
program.on('--help', () => {
  console.log('  Available licenses:');
  console.log('');
  console.log('    ' + licenses.join("\n    "));
  console.log('');
});

// Examples.
program.on('--help', () => {
  console.log('  Examples:');
  console.log('');
  console.log('    $ license-generator install bsd -y 2014 -n "John Doe" -e txt');
  console.log('    $ license-generator i mit -y 2014 -n "John Doe"');
  console.log('    $ license-generator view bsd');
  console.log('');
});

program.parse(process.argv);

if (!program.args.length) {
  program.help();
}
