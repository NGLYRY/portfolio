let data = [];

document.addEventListener('DOMContentLoaded', async () => {
  await loadData();
});

async function loadData() {
  data = await d3.csv('loc.csv', (row) => ({
    ...row,
    line: Number(row.line), // or just +row.line
    depth: Number(row.depth),
    length: Number(row.length),
    date: new Date(row.date + 'T00:00' + row.timezone),
    datetime: new Date(row.datetime),
  }));
}

function processCommits() {
  commits = d3.groups(data, (d) => d.commit)
    .map(([commit, lines]) => {
      // All lines in the commit share these values, so we extract from the first line.
      let first = lines[0];
      let { author, date, time, timezone, datetime } = first;

      // Create an object to represent the commit
      let ret = {
        id: commit,
        url: 'https://github.com/YOUR_REPO/commit/' + commit, // Replace YOUR_REPO with your repository name
        author,
        date,
        time,
        timezone,
        datetime, // Assuming datetime is already a Date object from your CSV conversion
        // Calculate the hour of the commit as a decimal (e.g., 2:30 PM becomes 14.5)
        hourFrac: datetime.getHours() + datetime.getMinutes() / 60,
        // Total number of lines modified in this commit
        totalLines: lines.length,
      };

      // Add the original lines array as a hidden property using Object.defineProperty.
      Object.defineProperty(ret, 'lines', {
        value: lines,
        writable: false,      // This property should not be overwritten.
        configurable: true,   // Allows future changes to the property descriptor if needed.
        enumerable: false     // Hides this property from enumeration (e.g., when logging the object).
      });

      return ret;
    });
}

async function loadData() {
  // Load and convert the CSV file
  data = await d3.csv('loc.csv', (row) => ({
    ...row,
    line: Number(row.line),
    depth: Number(row.depth),
    length: Number(row.length),
    date: row.date, // Already a string; you might convert it if needed.
    datetime: new Date(row.datetime), // Convert datetime to a Date object.
    // You can convert other properties as needed.
  }));

  // Process the commits data after the CSV is loaded.
  processCommits();

  // Print the commits array to verify its structure.
  console.log(commits);
}

document.addEventListener('DOMContentLoaded', async () => {
  await loadData();
});
