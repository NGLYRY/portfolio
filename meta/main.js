let data = [];
let commits = [];

async function loadData() {
  data = await d3.csv('loc.csv', (row) => ({
    ...row,
    line: Number(row.line), // or just +row.line
    depth: Number(row.depth),
    length: Number(row.length),
    date: new Date(row.date + 'T00:00' + row.timezone),
    datetime: new Date(row.datetime),
  }));

  // Process the commits data after the CSV is loaded.
  processCommits();
  displayStats();
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
        url: 'https://github.com/NGLYRY/portfolio/commit/' + commit, // Replace YOUR_REPO with your repository name
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

function updateTooltipContent(commit) {
  // If we passed an empty object, just return early
  if (!commit || Object.keys(commit).length === 0) return;

  // Grab the elements
  const link = document.getElementById('commit-link');
  const date = document.getElementById('commit-date');
  const time = document.getElementById('commit-time');
  const author = document.getElementById('commit-author');
  const lines = document.getElementById('commit-lines');

  // Populate them
  link.href = commit.url;
  link.textContent = commit.id;
  date.textContent = commit.datetime?.toLocaleDateString('en', {
    dateStyle: 'full',
  });
  time.textContent = commit.datetime?.toLocaleTimeString('en', {
    timeStyle: 'short',
  });
  author.textContent = commit.author;
  lines.textContent = commit.totalLines;
}

function updateTooltipVisibility(isVisible) {
  const tooltip = document.getElementById('commit-tooltip');
  tooltip.hidden = !isVisible;
}

function updateTooltipPosition(event) {
  const tooltip = document.getElementById('commit-tooltip');
  tooltip.style.left = `${event.clientX}px`;
  tooltip.style.top = `${event.clientY}px`;
}

function displayStats() {
  // Create the dl element
  const dl = d3.select('#stats').append('dl').attr('class', 'stats');

  // Add total LOC
  dl.append('dt').html('Total <abbr title="Lines of code">LOC</abbr>');
  dl.append('dd').text(data.length);

  // Add total commits
  dl.append('dt').text('Total commits');
  dl.append('dd').text(commits.length);

  // Add more stats as needed...
  // number of files
  dl.append('dt').text('Number of files');
  dl.append('dd').text(d3.group(data, d => d.file).size);

  dl.append('dt').text('Longest file');
  dl.append('dd').text(d3.max(data, d => d.length));

  dl.append('dt').text('Number of days work on site');
  dl.append('dd').text(d3.group(data, d => d.date).size);

  // for average file length
  const fileLengths = d3.rollups(
    data,
    (v) => d3.max(v, (v) => v.line),
    (d) => d.file
  );
  const averageFileLength = d3.mean(fileLengths, (d) => d[1]);
  dl.append('dt').text('Average file length');
  dl.append('dd').text(averageFileLength.toFixed(2));

  // Group commits by day period
  const workByPeriod = d3.rollups(
    data,
    (v) => v.length,
    (d) => new Date(d.datetime).toLocaleString('en', { dayPeriod: 'short' })
  );
  const maxPeriod = d3.greatest(workByPeriod, (d) => d[1])?.[0];
  dl.append('dt').text('Most active day period');
  dl.append('dd').text(maxPeriod);
}

async function createScatterplot() {
  const width = 1000;
  const height = 600;

  const svg = d3
    .select('#chart')
    .append('svg')
    .attr('viewBox', `0 0 ${width} ${height}`)
    .style('overflow', 'visible');

  const margin = { top: 10, right: 10, bottom: 30, left: 40 };

  const usableArea = {
    top: margin.top,
    right: width - margin.right,
    bottom: height - margin.bottom,
    left: margin.left,
    width: width - margin.left - margin.right,
    height: height - margin.top - margin.bottom,
  };

  const xScale = d3
    .scaleTime()
    .domain(d3.extent(commits, (d) => d.datetime))
    .range([usableArea.left, usableArea.right])
    .nice();

  const yScale = d3.scaleLinear().domain([0, 24]).range([usableArea.bottom, usableArea.top]);
  // Add gridlines BEFORE the axes
  const gridlines = svg
    .append('g')
    .attr('class', 'gridlines')
    .attr('transform', `translate(${usableArea.left}, 0)`);

  // Create gridlines as an axis with no labels and full-width ticks
  gridlines.call(d3.axisLeft(yScale).tickFormat('').tickSize(-usableArea.width));
  // Create axes
  const xAxis = d3.axisBottom(xScale);
  const yAxis = d3
    .axisLeft(yScale)
    .tickFormat((d) => String(d % 24).padStart(2, '0') + ':00');

  // Add X axis
  svg
    .append('g')
    .attr('transform', `translate(0, ${usableArea.bottom})`)
    .call(xAxis);

  // Add Y axis
  svg
    .append('g')
    .attr('transform', `translate(${usableArea.left}, 0)`)
    .call(yAxis);

  const dots = svg.append('g').attr('class', 'dots');

  dots
    .selectAll('circle')
    .data(commits)
    .join('circle')
    .attr('cx', (d) => xScale(d.datetime))
    .attr('cy', (d) => yScale(d.hourFrac))
    .attr('r', 5)
    .attr('fill', 'steelblue')
    .on('mouseenter', (event, commit) => {
      updateTooltipContent(commit);
      updateTooltipVisibility(true);
      updateTooltipPosition(event)
    })
    .on('mousemove', (event) => {
      // Update position on mouse move
      updateTooltipPosition(event);
    })
    .on('mouseleave', () => {
      updateTooltipContent({}); // Clear tooltip content
      updateTooltipVisibility(false);
    });  
}

document.addEventListener('DOMContentLoaded', async () => {
  await loadData();
  processCommits();
  createScatterplot();
});